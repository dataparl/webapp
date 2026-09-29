import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "API DataParl'",
    version: "1.0.0",
    description: "Mouvements des collaborateurs parlementaires français. Données sous licence ODbL 1.0.",
    termsOfService: "https://www.cavaparlement.eu/informations-legales/cgu-api",
  },
  servers: [{ url: "https://api.cavaparlement.eu" }],
  security: [{ cle: [] }],
  components: {
    securitySchemes: { cle: { type: "http", scheme: "bearer", description: "Clé personnelle dp_… (une par compte)" } },
    schemas: {
      Mouvement: {
        type: "object",
        properties: {
          id: { type: "string", description: "Identifiant stable du mouvement" },
          date_event: { type: "string", format: "date", description: "Date à laquelle le changement a été constaté" },
          chambre: { type: "string", enum: ["assemblee", "senat", "europarl"] },
          type: { type: "string", enum: ["arrivee", "depart", "transfert"] },
          collab_nom: { type: "string" }, collab_prenom: { type: "string" }, collab_civilite: { type: "string" },
          elu_cle: { type: "string" }, elu_id: { type: "string", description: "PA… (AN), matricule (Sénat), identifiant PE" },
          elu_nom: { type: "string" }, elu_groupe: { type: "string" },
          elu_origine_nom: { type: "string", description: "Pour un transfert : l'élu quitté" }, elu_origine_groupe: { type: "string" },
          fonction: { type: "string" },
          contexte: { type: "string", enum: ["", "elu_sortant", "elu_entrant"] },
          source: { type: "string", enum: ["suivi", "archives"] },
          confiance: { type: "string", enum: ["bot", "faible", "moyen", "fort", "manuel"] },
        },
      },
    },
  },
  paths: {
    "/v1/mouvements": {
      get: {
        summary: "Rechercher des mouvements",
        parameters: [
          { name: "chambre", in: "query", schema: { type: "string", enum: ["assemblee", "senat", "europarl"] } },
          { name: "type", in: "query", schema: { type: "string", enum: ["arrivee", "depart", "transfert"] } },
          { name: "source", in: "query", schema: { type: "string", enum: ["suivi", "archives"] } },
          { name: "depuis", in: "query", schema: { type: "string", format: "date" } },
          { name: "jusqua", in: "query", schema: { type: "string", format: "date" } },
          { name: "elu", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 500, default: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
        ],
        responses: {
          "200": {
            description: "Liste paginée, du plus récent au plus ancien",
            headers: {
              "X-RateLimit-Limit": { schema: { type: "integer" } },
              "X-RateLimit-Remaining": { schema: { type: "integer" } },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    total: { type: ["integer", "null"] }, limit: { type: "integer" }, offset: { type: "integer" },
                    mouvements: { type: "array", items: { $ref: "#/components/schemas/Mouvement" } },
                    licence: { type: "string" }, attribution: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "Paramètre invalide" },
          "401": { description: "Clé absente, invalide ou révoquée" },
          "429": { description: "Quota du jour atteint" },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec, { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, s-maxage=86400" } });
}
