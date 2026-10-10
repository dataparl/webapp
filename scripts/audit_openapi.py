#!/usr/bin/env python3
"""Audit du contrat OpenAPI de l'API DataParl' (+ tests HTTP optionnels en lecture seule).

Usage :
    python scripts/audit_openapi.py                       # audit statique du fichier local
    python scripts/audit_openapi.py --fetch               # récupère la spec en ligne puis l'audite
    DATAPARL_API_KEY=dp_… python scripts/audit_openapi.py --live   # + tests GET authentifiés

Les tests --live consomment le quota (quelques requêtes). Clé à garder hors du code source.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.request

BASE = "https://api.dataparl.fr"
SPEC_URL = BASE + "/v1/openapi.json"

CONSTATS: list[tuple[str, str, str]] = []  # (gravité, constat, recommandation)


def constat(grav: str, msg: str, reco: str) -> None:
    CONSTATS.append((grav, msg, reco))


def audit(spec: dict) -> None:
    if not spec.get("openapi", "").startswith("3."):
        constat("P1", f"version OpenAPI inattendue : {spec.get('openapi')}", "Passer en OpenAPI 3.1")
    info = spec.get("info", {})
    for champ in ("contact", "license"):
        if champ not in info:
            constat("P2", f"info.{champ} absent", f"Ajouter info.{champ}")
    if not info.get("description"):
        constat("P2", "description absente", "Décrire l'API, sa couverture et sa licence de données")

    schemas = spec.get("components", {}).get("schemas", {})
    for nom in ("Mouvement",):
        s = schemas.get(nom)
        if not s:
            constat("P0", f"schéma {nom} absent", f"Définir components.schemas.{nom}")
            continue
        if not s.get("required"):
            constat("P1", f"{nom} : aucune propriété requise", "Déclarer required selon les garanties réelles de la source")
        for prop, p in s.get("properties", {}).items():
            if isinstance(p.get("type"), list) and "null" in p["type"] and prop not in (s.get("required") or []):
                pass  # nullable et facultatif : cohérent
    if "Erreur" not in schemas:
        constat("P1", "pas de schéma d'erreur réutilisable", "Définir components.schemas.Erreur et le référencer dans les réponses 4xx/5xx")

    for chemin, item in spec.get("paths", {}).items():
        for verbe, op in item.items():
            if verbe not in ("get", "post", "put", "patch", "delete"):
                continue
            if not op.get("operationId"):
                constat("P1", f"{chemin} : pas d'operationId", "Ajouter un operationId stable pour les SDK")
            if not op.get("tags"):
                constat("P2", f"{chemin} : pas de tag", "Organiser les opérations par tags")
            rep = op.get("responses", {})
            for code in ("400", "401"):
                if code not in rep:
                    constat("P1", f"{chemin} : réponse {code} non documentée", f"Documenter {code} avec le schéma Erreur")
            if "429" not in rep and op.get("security") != []:
                constat("P1", f"{chemin} : réponse 429 non documentée", "Documenter le quota et l'erreur 429")
            for code, r in rep.items():
                if code.startswith(("4", "5")) and "content" not in r:
                    constat("P2", f"{chemin} : {code} sans corps décrit", "Référencer le schéma Erreur")

    # Pagination
    op = spec.get("paths", {}).get("/v1/mouvements", {}).get("get", {})
    params = {p["name"]: p for p in op.get("parameters", [])}
    lim = params.get("limit", {}).get("schema", {})
    if not (lim.get("minimum") == 1 and lim.get("maximum")):
        constat("P1", "bornes de pagination incomplètes", "limit : minimum 1, maximum explicite")
    if "offset" not in params:
        constat("P1", "offset non décrit", "Documenter offset et le comportement hors bornes")
    if "total" in json.dumps(schemas) and "null" not in json.dumps(schemas.get("ReponseMouvements", {})):
        constat("P2", "total possiblement null non précisé", "Typer total comme integer|null et documenter son caractère estimé")


def live_tests(cle: str) -> None:
    def get(url: str, cle_api: str | None = None, attendu: int = 200) -> None:
        req = urllib.request.Request(url)
        if cle_api:
            req.add_header("Authorization", f"Bearer {cle_api}")
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                corps = json.loads(r.read())
                ok = r.status == attendu
                print(f"  [{'OK ' if ok else '!! '} {r.status}] {url[:100]}")
                return corps
        except urllib.error.HTTPError as e:
            ok = e.code == attendu
            print(f"  [{'OK ' if ok else '!! '} {e.code}] {url[:100]} (attendu {attendu})")
            return None

    print("\nTests en lecture seule sur l'API réelle :")
    st = get(SPEC_URL.replace("/v1/openapi.json", "/v1/status"))
    if st and st.get("statut") != "ok":
        constat("P2", "status != ok", "Vérifier la collecte du jour")
    # sans clé : 401 attendu
    get(f"{BASE}/v1/mouvements?limit=1", attendu=401)
    # paramètre invalide : 400 attendu
    get(f"{BASE}/v1/mouvements?chambre=liege&limit=1", cle, attendu=400)
    # requête valide
    corps = get(f"{BASE}/v1/mouvements?limit=2", cle)
    if corps:
        ids = {m["id"] for m in corps.get("mouvements", [])}
        if len(ids) != len(corps.get("mouvements", [])):
            constat("P1", "doublons d'id dans une même page", "Vérifier la clé de tri secondaire")
        dates = [m["date_event"] for m in corps.get("mouvements", [])]
        if dates != sorted(dates, reverse=True):
            constat("P1", "tri non respecté", "Vérifier l'ordre date_event desc, id asc")
    # cohérence d'une deuxième page
    p2 = get(f"{BASE}/v1/mouvements?limit=2&offset=2", cle)
    if corps and p2:
        ids1 = {m["id"] for m in corps.get("mouvements", [])}
        ids2 = {m["id"] for m in p2.get("mouvements", [])}
        if ids1 & ids2:
            constat("P1", "chevauchement entre pages 1 et 2", "Vérifier la pagination")


def main() -> None:
    args = sys.argv[1:]
    live = "--live" in args
    fetch = "--fetch" in args
    chemin = next((a for a in args if not a.startswith("--")), None)

    if fetch:
        with urllib.request.urlopen(SPEC_URL, timeout=30) as r:
            spec = json.loads(r.read())
    else:
        if not chemin:
            print(__doc__)
            sys.exit(2)
        with open(chemin, encoding="utf-8") as f:
            spec = json.load(f)

    audit(spec)
    if live:
        cle = os.environ.get("DATAPARL_API_KEY")
        if not cle:
            print("DATAPARL_API_KEY manquante pour --live")
            sys.exit(2)
        live_tests(cle)

    if not CONSTATS:
        print("Aucun constat. Le contrat respecte les contrôles de cet audit.")
        return
    ordre = {"P0": 0, "P1": 1, "P2": 2}
    for grav, msg, reco in sorted(CONSTATS, key=lambda c: ordre[c[0]]):
        print(f"[{grav}] {msg}\n      → {reco}")
    sys.exit(1 if any(c[0] == "P0" for c in CONSTATS) else 0)


if __name__ == "__main__":
    main()
