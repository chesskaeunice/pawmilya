import { ChevronLeft, ChevronRight } from "lucide-react";

import "./Pagination.css";

const WINDOW_SIZE = 5;

// Numbered pagination: [1] [2] [3] [4] [5] … [Next]
function Pagination({ currentPage, totalPages, onChange, label = "Pages" }) {
  if (totalPages <= 1) return null;

  const start = Math.min(
    Math.max(currentPage - Math.floor(WINDOW_SIZE / 2), 1),
    Math.max(totalPages - WINDOW_SIZE + 1, 1)
  );
  const end = Math.min(start + WINDOW_SIZE - 1, totalPages);

  const pages = [];
  for (let page = start; page <= end; page += 1) pages.push(page);

  return (
    <nav className="pagination" aria-label={label}>

      {currentPage > 1 && (
        <button
          type="button"
          className="pagination__step"
          onClick={() => onChange(currentPage - 1)}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Previous
        </button>
      )}

      {pages.map((page) => (
        <button
          type="button"
          key={page}
          className={
            page === currentPage
              ? "pagination__page pagination__page--active"
              : "pagination__page"
          }
          onClick={() => onChange(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <span className="pagination__dots" aria-hidden="true">…</span>
      )}

      <button
        type="button"
        className="pagination__step"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRight size={16} aria-hidden="true" />
      </button>

    </nav>
  );
}

export default Pagination;
