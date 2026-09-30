// Domaine du site et domaine parent des cookies partagés entre sous-domaines
// (www, api, admin, webmail). Sans dépendance : serveur et navigateur.
export const DOMAINE = "dataparl.fr";

export function domaineCookie(hote: string): string {
  const h = hote.split(":")[0].toLowerCase();
  return h === DOMAINE || h.endsWith(`.${DOMAINE}`) ? `; Domain=.${DOMAINE}` : "";
}
