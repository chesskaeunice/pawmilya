import { useMemo, useRef, useState } from "react";

import SearchBar from "../../../components/common/SearchBar.jsx";
import FilterDropdown from "../../../components/common/FilterDropdown.jsx";
import Pagination from "../../../components/common/Pagination.jsx";
import ArticleCard from "../../../components/landing/ArticleCard.jsx";

import { getAllArticles } from "../../../services/previewService.js";
import { matchesArticleSearch } from "../../../utils/liveSearch.js";
import {
  defaultFilters,
  matchesDateRange,
} from "../../../utils/filterHelpers.js";

import "./Articles.css";

const ARTICLES_PER_PAGE = 6;

const allArticles = getAllArticles();

function Articles() {
  const listRef = useRef(null);

  // live search: the grid filters on every keystroke
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return allArticles.filter((article) => {
      // title or category
      return (
        matchesArticleSearch(article, query) &&
        matchesDateRange(article.dateAdded, filters)
      );
    });
  }, [query, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const visible = filtered.slice(
    (currentPage - 1) * ARTICLES_PER_PAGE,
    currentPage * ARTICLES_PER_PAGE
  );

  const changeQuery = (value) => {
    setQuery(value);
    setPage(1);
  };

  const clearSearch = () => {
    setQuery("");
    setPage(1);
  };

  const changePage = (next) => {
    setPage(next);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="articles-page">

      <header className="articles-page__header">
        <p className="articles-page__eyebrow">Learn</p>
        <h1>Pet Care Corner</h1>
        <p>
          Guides for pet owners, adopters and anyone who cares for animals.
        </p>
      </header>

      <section
        className="articles-page__container"
        ref={listRef}
        style={{ scrollMarginTop: 90 }}
      >

        <div className="list-toolbar">
          <SearchBar
            value={query}
            onChange={changeQuery}
            onClear={clearSearch}
            placeholder="Search articles by title or topic"
            label="Search articles"
          />

          <FilterDropdown
            value={filters}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
            fields={["dateRange"]}
          />
        </div>

        <p className="articles-page__count">
          {filtered.length} {filtered.length === 1 ? "article" : "articles"} found
        </p>

        {visible.length > 0 ? (
          <div className="articles-page__grid">
            {visible.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="articles-page__empty" role="status">
            <h2>No articles match your search</h2>
            <p>Try a different title or topic.</p>

            <button type="button" onClick={clearSearch}>
              Clear search
            </button>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onChange={changePage}
          label="Articles pages"
        />

      </section>

    </div>
  );
}

export default Articles;
