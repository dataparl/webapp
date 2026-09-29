import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      nom: "API CavaParlement",
      description: "Mouvements des collaborateurs parlementaires (Assemblée nationale, Sénat, Parlement européen).",
      endpoints: {
        "/mouvements": "Arrivées, départs, transferts. Filtres : chambre, type, source, depuis, jusqua, elu, limit (max 500), offset.",
      },
      exemple: "https://api.cavaparlement.eu/mouvements?chambre=senat&type=arrivee&depuis=2026-01-01",
      source: "https://github.com/dataparl/collaborateurs",
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
