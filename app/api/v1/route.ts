import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      nom: "API DataParl'",
      description: "Mouvements des collaborateurs parlementaires (Assemblée nationale, Sénat, Parlement européen).",
      endpoints: {
        "/mouvements": "Arrivées, départs, transferts. Filtres : chambre, type, source, depuis, jusqua, elu, limit (max 500), offset.",
      },
      authentification: "Clé gratuite obligatoire : en-tête Authorization: Bearer <clé>. Créer une clé : https://www.cavaparlement.eu/api",
      quota: "1 000 requêtes par jour et par clé",
      exemple: "curl -H 'Authorization: Bearer dp_…' 'https://api.cavaparlement.eu/mouvements?chambre=senat&type=arrivee&depuis=2026-01-01'",
      conditions: "https://www.cavaparlement.eu/informations-legales/cgu-api",
      licence: "ODbL 1.0",
      source: "https://github.com/dataparl/collaborateurs",
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
