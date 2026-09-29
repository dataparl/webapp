import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      nom: "API DataParl'",
      version: "v1",
      description: "Mouvements des collaborateurs parlementaires (Assemblée nationale, Sénat, Parlement européen).",
      endpoints: {
        "/v1/mouvements": "Arrivées, départs, transferts. Filtres : chambre, type, source (suivi|archives), depuis, jusqua, elu, limit (max 500), offset.",
        "/v1/openapi.json": "Description OpenAPI 3.1 de l'API.",
      },
      authentification: "Clé gratuite obligatoire, en-tête Authorization: Bearer <clé>. Demande : https://api.cavaparlement.eu/request-access",
      quota: "1 000 requêtes par jour",
      documentation: "https://api.cavaparlement.eu/docs",
      conditions: "https://www.cavaparlement.eu/informations-legales/cgu-api",
      licence: "ODbL 1.0",
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
