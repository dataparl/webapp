// Noms complets des partis et groupes politiques derrière les sigles du
// référentiel. C'est ce qui permet aux pages /parti/<sigle> de répondre aux
// recherches « élus Rassemblement National » ou « députés RN » : le sigle
// seul ne suffit pas. Les sigles absents de la table retombent sur le sigle.
// Groupes de l'Assemblée nationale et du Sénat (appellations officielles),
// puis groupes du Parlement européen (appellations françaises).
export const NOMS_COMPLETS: Record<string, string> = {
  // Assemblée nationale
  "EPR": "Ensemble pour la République",
  "Dem": "Groupe Démocrate",
  "LFI-NFP": "La France insoumise - Nouveau Front populaire",
  "EcoS": "Groupe Écologiste - Nouveau Front populaire",
  "GDR": "Gauche démocrate et républicaine - NFP",
  "HOR": "Horizons",
  "LIOT": "Libertés, Indépendants, Outre-mer et Territoires",
  "INDEP": "Les Indépendants",
  "DR": "Droite républicaine",
  "RN": "Rassemblement National",
  "LR": "Les Républicains",
  "NI": "Non inscrits",
  // Sénat
  "CRCE-K": "Communiste, Républicain, Citoyen et Écologiste - Kanaky",
  "RDSE": "Rassemblement démocrate, social et européen",
  "RDPI": "Rassemblement des démocrates, progressistes et indépendants",
  "GEST": "Groupe Écologiste - Solidarité des Territoires",
  "UNT": "Union pour les territoires",
  // Parlement européen
  "PPE": "Parti populaire européen",
  "S&D": "Socialistes et Démocrates",
  "Renew": "Renew Europe",
  "PfE": "Patriots for Europe",
  "GUE/NGL": "Gauche unitaire européenne / Gauche verte nordique",
  "ESN": "Europe des Nations Souveraines",
  "ECR": "Conservateurs et Réformistes européens",
};

// Nom complet du parti si connu, sinon le sigle.
export function nomCompletParti(sigle: string): string {
  return NOMS_COMPLETS[sigle] ?? sigle;
}

// Libellé complet avec sigle, pour les titres : « Rassemblement National (RN) ».
export function libelleParti(sigle: string): string {
  const complet = NOMS_COMPLETS[sigle];
  return complet ? complet + " (" + sigle + ")" : sigle;
}
