import { ChevronLeft, ChevronRight } from "lucide-react";

import "./Pagination.css";

const WINDOW_SIZE = 5;

// Numbered pagination: [<] [1] [2] [3] [4] [5] … [>]
// summary (optional): "Showing 1-10 of 42 animals", puts the pages in a bar under a table.
function Pagination({ currentPage, totalPages, onChange, label = "Pages", summary }) {
  const showPages = totalPages > 1;

  if (!showPages && !summary) return null;

  const start = Math.min(
    Math.max(currentPage - Math.floor(WINDOW_SIZE / 2), 1),
    Math.max(totalPages - WINDOW_SIZE + 1, 1)
  );
  const end = Math.min(start + WINDOW_SIZE - 1, totalPages);

  const pages = [];
  for (let page = start; page <= end; page += 1) pages.push(page);

  return (
    <div className={summary ? "pagination pagination--bar" : "pagination"}>

      {summary && <span className="pagination__summary">{summary}</span>}

      {showPages && (
        <nav className="pagination__pages" aria-label={label}>

          <button
            type="button"
            className="pagination__step"
            onClick={() => onChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>

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
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>

        </nav>
      )}

    </div>
  );
}

export default Pagination;
