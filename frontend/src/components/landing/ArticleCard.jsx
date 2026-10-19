import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

import { articlePlaceholders } from "../../assets/images/placeholders/index.js";

import "./PreviewCards.css";

// Full-bleed image, dark gradient overlay, text on top.
function ArticleCard({ article }) {
  const image =
    article.image ||
    articlePlaceholders[article.imageIndex % articlePlaceholders.length];

  return (
    <article className="article-card">

      <img
        className="article-card__image"
        src={image}
        alt=""
        loading="lazy"
      />

      <div className="article-card__overlay" />

      <div className="article-card__content">

        <p className="article-card__tags">
          {article.tags.join(" · ")}
        </p>

        <h3 className="article-card__title">
          {/* Stretched link: the whole card opens the article */}
          <Link to={`/articles/${article.id}`}>
            {article.title}
          </Link>
        </h3>

        <p className="article-card__excerpt">{article.excerpt}</p>

        <p className="article-card__time">
          <Clock size={13} aria-hidden="true" />
          {article.readingTime}
        </p>

      </div>

    </article>
  );
}

export default ArticleCard;
