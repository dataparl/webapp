import { FEUILLES } from "@/lib/sheets";

export const revalidate = 3600;

export default async function IndexSheets() {
  return (
    <>
      <h1>Le tableur de <span className="surligne">DataParl&apos;</span></h1>
      <p className="lead">
        Les données du Parlement, feuille par feuille — lues en direct sur l&apos;API DataParl&apos; (Supabase),
        sans export ni copie. Trie, filtre, copie ou télécharge ; la feuille reflète toujours la base.
      </p>
      <ul className="sommaire">
        {FEUILLES.map((f) => (
          <li key={f.id}>
            <a href={`/sheets/${f.id}`}>
              <strong>{f.titre}</strong>
              <span>{f.description}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="meta">
        Logiciel libre (MIT) · données sous licence ODbL · nouvelles feuilles ajoutées au fil des chantiers.
      </p>
    </>
  );
}
