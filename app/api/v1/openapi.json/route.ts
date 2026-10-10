import { NextResponse } from "next/server";

// Contrat OpenAPI 3.1 de l'API DataParl'. Version 1.2.0.
// Principes : décrire le comportement réel du serveur, jamais un comportement
// idéal — un contrat plus strict que la réalité serait pire qu'un contrat
// permissif. Le format d'erreur actuel ({ error: "message" }) est donc
// documenté tel quel.

const ERREUR_EXEMPLES: Record<string, { description: string; exemple: Record<string, string> }> = {
  "400": { description: "Paramètre invalide (le message indique lequel)", exemple: { error: "paramètre invalide : limit" } },
  "401": { description: "Clé absente, invalide ou révoquée", exemple: { error: "clé API invalide ou révoquée" } },
  "429": { description: "Quota du jour atteint (1 000 requêtes par clé), remis à zéro à minuit, heure de Paris", exemple: { error: "quota du jour atteint, remise à zéro à minuit (heure de Paris)" } },
  "500": { description: "Erreur interne du serveur", exemple: { error: "erreur interne" } },
  "503": { description: "Données momentanément indisponibles, réessaie plus tard", exemple: { error: "données indisponibles" } },
};

const spec = {
  openapi: "3.1.0",
  info: {
    title: "API DataParl'",
    version: "1.2.0",
    description:
      "Mouvements des collaborateurs parlementaires français (Assemblée nationale, Sénat, Parlement européen), " +
      "collectés chaque matin dans les publications officielles. Historique : Sénat depuis mai 2015, Assemblée depuis février 2017.\n\n" +
      "Les **données** sont sous licence ODbL 1.0 : cite la source, partage à l'identique toute base dérivée. " +
      "L'attribution attendue figure dans chaque réponse. Les **conditions d'utilisation de l'API** sont distinctes.\n\n" +
      "Quota : 1 000 requêtes par jour, comptées par clé, remises à zéro à minuit (heure de Paris). " +
      "Les réponses portent les en-têtes X-RateLimit-Limit et X-RateLimit-Remaining. Aucun Retry-After n'est envoyé actuellement.",
    termsOfService: "https://www.dataparl.fr/informations-legales/cgu-api",
    contact: { name: "Support DataParl'", url: "https://www.dataparl.fr/", email: "support@dataparl.fr" },
    license: { name: "ODbL 1.0 (données)", url: "https://opendatacommons.org/licenses/odbl/1-0/" },
  },
  servers: [{ url: "https://api.dataparl.fr" }],
  tags: [
    { name: "mouvements", description: "Recherche dans les mouvements de collaborateurs parlementaires" },
    { name: "meta", description: "Fraîcheur et volumes, sans clé" },
  ],
  security: [{ cle: [] }],
  components: {
    securitySchemes: { cle: { type: "http", scheme: "bearer", description: "Clé personnelle dp_… (une par compte), à demander sur /request-access. Acceptée aussi via l'en-tête X-API-Key." } },
    schemas: {
      Erreur: {
        type: "object",
        required: ["error"],
        description: "Format réel des erreurs de l'API.",
        properties: {
          error: { type: "string", description: "Message lisible indiquant la cause (en français)" },
        },
      },
      Mouvement: {
        type: "object",
        description:
          "Un mouvement de collaborateur. La date est celle à laquelle le mouvement a été constaté, pas celle du contrat de travail.",
        required: ["id", "date_event", "chambre", "type", "collab_nom", "collab_prenom", "elu_id", "elu_nom", "elu_groupe", "source", "confiance"],
        properties: {
          id: { type: "string", description: "Identifiant stable du mouvement ; sert à dédoublonner entre deux synchronisations. En cas de correction ou de fusion, l'id ne change pas : la ligne est réécrite." },
          date_event: { type: "string", format: "date", description: "Date à laquelle le changement a été constaté. Approximative si confiance=faible (période sans archive)." },
          chambre: { type: "string", enum: ["assemblee", "senat", "europarl"] },
          type: { type: "string", enum: ["arrivee", "depart", "transfert"] },
          collab_nom: { type: "string", description: "Nom du collaborateur (majuscules)" },
          collab_prenom: { type: "string" },
          collab_civilite: { type: ["string", "null"], description: "Civilité (M., Mme…), null si inconnue" },
          elu_cle: { type: ["string", "null"], description: "Clé normalisée de l'élu (sans accents), null si inconnue" },
          elu_id: { type: "string", description: "Identifiant de l'élu selon la chambre : PA… (Assemblée nationale), matricule Sénat (ex. 21093M), identifiant du Parlement européen" },
          elu_nom: { type: "string", description: "Nom d'affichage de l'élu (ex. Julien DIVE)" },
          elu_groupe: { type: "string", description: "Code du groupe parlementaire de l'élu rejoint (ex. LR, GEST) ; vide si inconnu" },
          elu_origine_nom: { type: ["string", "null"], description: "Pour un transfert : l'élu quitté. null sinon" },
          elu_origine_groupe: { type: ["string", "null"] },
          fonction: { type: ["string", "null"], description: "Fonction du collaborateur dans l'équipe, null si non publiée" },
          contexte: { type: "string", enum: ["", "elu_sortant", "elu_entrant"], description: "elu_sortant : le mouvement accompagne le départ d'un élu (fin de mandat, renouvellement). elu_entrant : l'élu arrive et son équipe se constitue." },
          source: { type: "string", enum: ["suivi", "archives"], description: "suivi : constaté par la collecte quotidienne des publications officielles. archives : reconstitué a posteriori (Regards citoyens, Wayback Machine) — dates souvent approximatives (confiance=faible)." },
          confiance: { type: "string", enum: ["bot", "faible", "moyen", "fort", "manuel"], description: "fiabilité de la date : bot = collecte automatisée du jour ; faible = période sans archive, date approximative ; moyen = archive partielle ; fort = publication officielle explicite ; manuel = vérifié à la main" },
        },
      },
      ReponseMouvements: {
        type: "object",
        required: ["total", "limit", "offset", "mouvements", "licence", "attribution"],
        properties: {
          total: { type: ["integer", "null"], description: "Nombre total de résultats. ESTIMATION (comptage PostgREST) : peut être null ou légèrement imprécise sur les grands ensembles. Ne pas s'appuyer dessus pour bortrer la pagination : s'arrêter quand la réponse contient moins de limit mouvements." },
          limit: { type: "integer" },
          offset: { type: "integer" },
          mouvements: { type: "array", items: { $ref: "#/components/schemas/Mouvement" } },
          licence: { type: "string" },
          attribution: { type: "string", description: "Attribution ODbL attendue dans les réutilisations" },
        },
      },
      ReponseStatus: {
        type: "object",
        required: ["statut", "version", "jour"],
        properties: {
          statut: { type: "string", enum: ["ok", "degrade"] },
          version: { type: "string" },
          jour: { type: "string", format: "date", description: "Date du jour, heure de Paris" },
          derniere_collecte: { type: ["string", "null"], format: "date", description: "Date du dernier mouvement constaté (suivi quotidien)" },
          mouvements_du_jour: { type: ["integer", "null"], description: "Nombre de mouvements constatés aujourd'hui, null si le compteur n'est pas disponible" },
          mouvements_total: { type: ["integer", "null"], description: "Estimation du nombre total de mouvements" },
          affectations_actives: { type: "object", additionalProperties: { type: "integer" }, description: "Affectations en cours, par chambre" },
          documentation: { type: "string" },
          licence: { type: "string" },
          attribution: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/v1/mouvements": {
      get: {
        operationId: "rechercherMouvements",
        tags: ["mouvements"],
        summary: "Rechercher des mouvements",
        description:
          "Tous les filtres se combinent (ET). Résultats triés du plus récent au plus ancien : date_event décroissante, puis id croissante comme critère secondaire (plusieurs mouvements peuvent partager une même date).\n\n" +
          "Pagination par limit/offset : si offset dépasse le nombre de résultats, la réponse contient une liste vide. " +
          "Les données sont mises à jour chaque matin : pendant une pagination, de nouveaux mouvements peuvent s'insérer en tête — " +
          "des doublons ou omissions sont alors possibles. Pour une synchronisation fiable, paginate depuis la fin (offset décroissant) " +
          "ou dédoublonne par id (recommandé). Une pagination par curseur est à l'étude.",
        parameters: [
          { name: "chambre", in: "query", schema: { type: "string", enum: ["assemblee", "senat", "europarl"] } },
          { name: "type", in: "query", schema: { type: "string", enum: ["arrivee", "depart", "transfert"] } },
          { name: "source", in: "query", schema: { type: "string", enum: ["suivi", "archives"] }, description: "suivi = collecte quotidienne ; archives = historique reconstitué" },
          { name: "depuis", in: "query", schema: { type: "string", format: "date" }, description: "Date de début, borne incluse" },
          { name: "jusqua", in: "query", schema: { type: "string", format: "date" }, description: "Date de fin, borne incluse" },
          { name: "elu", in: "query", schema: { type: "string" }, description: "Identifiant de l'élu : PA… (AN), matricule Sénat, identifiant PE. La recherche porte sur l'identifiant ET la clé normalisée de l'élu (elu_id ou elu_cle)" },
          { name: "collab", in: "query", schema: { type: "string" }, description: "Nom ou prénom du collaborateur, correspondance partielle (insensible à la casse) ; les accents sont facultatifs : la clé normalisée sans accents est aussi comparée" },
          { name: "groupe", in: "query", schema: { type: "string" }, description: "Code(s) de groupe politique, séparés par des virgules (ex. GEST,LR) ; cible (elu_groupe) ou origine (elu_origine_groupe)" },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 500, default: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
        ],
        responses: {
          "200": {
            description: "Liste paginée, du plus récent au plus ancien",
            headers: {
              "X-RateLimit-Limit": { schema: { type: "integer" }, description: "Quota journalier de la clé (1 000)" },
              "X-RateLimit-Remaining": { schema: { type: "integer" }, description: "Requêtes restantes aujourd'hui (minuit, heure de Paris)" },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReponseMouvements" },
                examples: {
                  ok: {
                    summary: "Quelques mouvements",
                    value: {
                      total: 1284, limit: 100, offset: 0,
                      mouvements: [
                        {
                          id: "3f9c2a71b0d4e8a1", date_event: "2026-10-02", chambre: "senat", type: "transfert",
                          collab_nom: "MARTIN", collab_prenom: "Léa", collab_civilite: "Mme",
                          elu_cle: "jadot_yannick", elu_id: "21093M", elu_nom: "Yannick JADOT", elu_groupe: "GEST",
                          elu_origine_nom: "…", elu_origine_groupe: "SOC",
                          fonction: null, contexte: "", source: "suivi", confiance: "bot",
                        },
                      ],
                      licence: "ODbL 1.0",
                      attribution: "DataParl' (dataparl.fr), d'après les publications de l'Assemblée nationale et du Sénat",
                    },
                  },
                },
              },
            },
          },
          ...Object.fromEntries(
            Object.entries(ERREUR_EXEMPLES).map(([code, e]) => [
              code,
              {
                description: e.description,
                content: { "application/json": { schema: { $ref: "#/components/schemas/Erreur" }, examples: {exemple: { value: e.exemple } } } },
              },
            ]),
          ),
        },
      },
    },
    "/v1/status": {
      get: {
        operationId: "etatDonnees",
        tags: ["meta"],
        summary: "Fraîcheur et volumes des données",
        description: "Public, sans clé. Pour synchroniser (dernière collecte) ou afficher l'état de la collecte.",
        security: [],
        responses: {
          "200": {
            description: "État de la collecte",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReponseStatus" },
                examples: {
                  ok: {
                    summary: "État nominal",
                    value: {
                      statut: "ok", version: "v1", jour: "2026-10-10",
                      derniere_collecte: "2026-10-10",
                      mouvements_du_jour: 38, mouvements_total: 128400,
                      affectations_actives: { assemblee: 1250, senat: 410, europarl: 96 },
                      documentation: "https://api.dataparl.fr/docs",
                      licence: "ODbL 1.0",
                      attribution: "DataParl' (dataparl.fr), d'après les publications de l'Assemblée nationale et du Sénat",
                    },
                  },
                },
              },
            },
          },
          "503": {
            description: "Données momentanément indisponibles",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Erreur" }, examples: { exemple: { value: { statut: "degrade", version: "v1", jour: "2026-10-10" } } } } },
          },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=86400" } });
}
