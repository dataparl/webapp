// Marques de la famille DataParl' : VigiParl' (rouge), MixiParl' (violet),
// avec la signature « par DataParl' ».
export function ParDataParl() {
  return <span className="par">par <b>Data<span className="surligne">Parl&apos;</span></b></span>;
}

export default function Marque({ prefixe, couleur, titre = false }: { prefixe: "Vigi" | "Mixi"; couleur: "vigi" | "mixi"; titre?: boolean }) {
  const nom = <>{prefixe}<span style={{ background: `var(--${couleur})` }}>Parl&apos;</span></>;
  return (
    <span className="lockup">
      {titre ? <h1 className="marque" style={{ margin: 0 }}>{nom}</h1> : <span className="marque">{nom}</span>}
      <ParDataParl />
    </span>
  );
}
