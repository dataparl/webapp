"use client";

export default function Pagination({ page, total, parPage, onPage }: { page: number; total: number; parPage: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / parPage);
  if (pages <= 1) return null;
  return (
    <p className="pagination">
      <button className="lien" disabled={page === 0} onClick={() => onPage(page - 1)}>Précédent</button>
      <span className="meta">page {page + 1} / {pages}</span>
      <button className="lien" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}>Suivant</button>
    </p>
  );
}
