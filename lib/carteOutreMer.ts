// Formes simplifiées des DROM et COM (carte des sénatoriales 2026) : chaque
// territoire est dessiné dans un repère local de 100×70 (unités du viewBox
// « 0 0 1000 1400 » de la carte), puis placé dans le bandeau sous la
// métropole via transform="translate(x,y) scale(s)". Ce sont des tracés
// stylisés — volontairement simplifiés, comme les cartes institutionnelles.
// Les territoires non renouvelés en 2026 (Saint-Martin, Saint-Barthélemy,
// Wallis-et-Futuna) sont affichés en gris, non cliquables.

export type TerritoireOm = {
  code: string;
  nom: string;        // libellé complet (affiché sous la forme)
  court: string;      // libellé court (étiquette sur la carte)
  slug: string | null; // slug d'un scrutin 2026, null si pas de renouvellement
  x: number;
  y: number;
  s: number;
  d: string; // forme(s), repère local 100×70
  cy: number; // hauteur de l'étiquette dans le repère local
};

export const OUTRE_MER_CARTE: TerritoireOm[] = [
  {
    code: "971", nom: "Guadeloupe", court: "Guadeloupe", slug: "guadeloupe",
    x: 15, y: 1085, s: 1.4, cy: 66,
    d: "M28,14 Q12,20 10,34 Q14,46 24,42 Q30,30 28,14 M34,12 Q56,18 60,34 Q56,50 42,50 Q32,44 34,30 Q36,18 34,12 M46,54 Q52,50 54,56 Q50,62 45,59 Z",
  },
  {
    code: "972", nom: "Martinique", court: "Martinique", slug: "martinique",
    x: 180, y: 1085, s: 1.4, cy: 66,
    d: "M42,8 Q60,16 68,34 Q64,54 44,58 Q22,52 18,30 Q24,12 42,8 M46,60 L52,66 M40,60 L38,68",
  },
  {
    code: "973", nom: "Guyane", court: "Guyane", slug: "guyane",
    x: 345, y: 1085, s: 1.4, cy: 66,
    d: "M8,20 Q30,6 52,10 Q76,22 78,40 Q72,58 48,62 Q24,60 12,44 Q4,30 8,20 Z",
  },
  {
    code: "974", nom: "La Réunion", court: "La Réunion", slug: "la-reunion",
    x: 510, y: 1085, s: 1.4, cy: 66,
    d: "M50,6 Q72,12 78,32 Q74,52 54,60 Q30,58 22,40 Q18,18 34,10 Q42,6 50,6 Z",
  },
  {
    code: "976", nom: "Mayotte", court: "Mayotte", slug: "mayotte",
    x: 675, y: 1085, s: 1.4, cy: 66,
    d: "M30,10 Q48,16 50,32 Q44,50 28,48 Q16,38 22,22 Q24,14 30,10 M54,34 Q64,30 66,42 Q60,52 52,46 Z",
  },
  {
    code: "975", nom: "Saint-Pierre-et-Miquelon", court: "St-Pierre-et-Miquelon", slug: "saint-pierre-et-miquelon",
    x: 840, y: 1085, s: 1.4, cy: 66,
    d: "M20,30 Q32,18 44,30 Q40,44 26,42 Q16,38 20,30 M52,14 Q66,8 70,22 Q62,32 50,26 Q46,18 52,14 Z",
  },
  {
    code: "978", nom: "Saint-Martin et Saint-Barthélemy", court: "St-Martin · St-Barth.", slug: null,
    x: 15, y: 1235, s: 1.4, cy: 66,
    d: "M28,18 Q44,10 54,24 Q48,40 30,38 Q20,30 28,18 M60,42 Q72,36 76,48 Q68,58 58,52 Z",
  },
  {
    code: "986", nom: "Wallis-et-Futuna", court: "Wallis-et-Futuna", slug: null,
    x: 180, y: 1235, s: 1.4, cy: 66,
    d: "M24,22 Q32,16 34,26 Q28,34 22,28 Z M46,14 Q54,10 56,20 Q50,26 44,20 Z M60,36 Q68,32 70,42 Q64,48 58,42 Z",
  },
  {
    code: "987", nom: "Polynésie française", court: "Polynésie française", slug: "polynesie-francaise",
    x: 345, y: 1235, s: 1.4, cy: 66,
    d: "M18,16 Q30,10 34,20 Q26,28 16,22 Z M44,30 Q58,24 62,38 Q52,48 40,40 Q36,32 44,30 M70,12 Q78,8 80,18 Q72,24 66,18 Z M20,46 Q28,42 30,50 Q24,56 18,50 Z M56,56 Q64,52 66,60 Q60,66 54,60 Z",
  },
  {
    code: "988", nom: "Nouvelle-Calédonie", court: "Nouvelle-Calédonie", slug: "nouvelle-caledonie",
    x: 510, y: 1235, s: 1.4, cy: 66,
    d: "M10,34 Q26,14 48,20 Q70,28 80,42 Q66,52 46,46 Q26,48 10,34 M84,50 Q90,46 92,54 Q86,60 80,54 Z M64,58 Q70,54 72,62 Q66,68 60,62 Z",
  },
];
