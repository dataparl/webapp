// Profil de configuration Apple (.mobileconfig) : ajoute la messagerie
// DataParl' sur l'écran d'accueil de l'iPhone, de l'iPad ou du Mac, comme une
// application (Web Clip). Sans dépendance (testé).
//
// Un compte dans l'app Mail d'Apple exigerait un serveur IMAP et SMTP : la
// messagerie DataParl' (réception par Resend) n'en a pas, d'où le Web Clip.
const x = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);

export type OptionsWebClip = { email: string; url: string; libelle?: string; iconeBase64?: string; uuid: () => string };

export function profilWebClip(o: OptionsWebClip): string {
  const id = `fr.dataparl.messagerie.${o.email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const libelle = o.libelle ?? "DataParl' Mail";
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>PayloadType</key><string>com.apple.webClip.managed</string>
      <key>PayloadVersion</key><integer>1</integer>
      <key>PayloadIdentifier</key><string>${x(id)}.webclip</string>
      <key>PayloadUUID</key><string>${o.uuid()}</string>
      <key>PayloadDisplayName</key><string>${x(libelle)}</string>
      <key>Label</key><string>${x(libelle)}</string>
      <key>URL</key><string>${x(o.url)}</string>
      <key>FullScreen</key><true/>
      <key>IsRemovable</key><true/>
      <key>Precomposed</key><true/>${o.iconeBase64 ? `
      <key>Icon</key><data>${o.iconeBase64}</data>` : ""}
    </dict>
  </array>
  <key>PayloadDisplayName</key><string>Messagerie DataParl' (${x(o.email)})</string>
  <key>PayloadDescription</key><string>Ajoute la messagerie DataParl' à l'écran d'accueil.</string>
  <key>PayloadOrganization</key><string>DataParl'</string>
  <key>PayloadIdentifier</key><string>${x(id)}</string>
  <key>PayloadType</key><string>Configuration</string>
  <key>PayloadUUID</key><string>${o.uuid()}</string>
  <key>PayloadVersion</key><integer>1</integer>
  <key>PayloadRemovalDisallowed</key><false/>
</dict>
</plist>
`;
}
