// Signature email et fiche contact (vCard) d'un membre de l'équipe.
// Sans dépendance (testé).
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function signatureHtml(nom: string, fonction: string, email: string): string {
  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#071A41">
  <tr>
    <td style="padding-right:14px;border-right:3px solid #FFD23F">
      <div style="font-family:Georgia,'Times New Roman',serif;font-weight:bold;font-size:20px;line-height:1">Data<span style="background:#FFD23F;padding:0 2px">Parl'</span></div>
    </td>
    <td style="padding-left:14px">
      <div style="font-weight:bold;font-size:15px">${esc(nom)}</div>
      <div style="color:#4A5670">${esc(fonction)}</div>
      <div style="margin-top:6px"><a href="mailto:${esc(email)}" style="color:#164DFF;text-decoration:none">${esc(email)}</a> · <a href="https://www.dataparl.fr" style="color:#164DFF;text-decoration:none;font-weight:bold">dataparl.fr</a></div>
    </td>
  </tr>
</table>`;
}

const v = (s: string) => s.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

export function vcard(nom: string, fonction: string, email: string): string {
  return [
    "BEGIN:VCARD", "VERSION:3.0",
    `FN:${v(nom)}`, `N:${v(nom)};;;;`,
    `ORG:DataParl'`, `TITLE:${v(fonction)}`,
    `EMAIL;TYPE=INTERNET,WORK:${email}`,
    "URL:https://www.dataparl.fr",
    "END:VCARD", "",
  ].join("\r\n");
}
