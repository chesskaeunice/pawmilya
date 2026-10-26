import { useState } from "react";
import { Clock } from "lucide-react";

import { articlePlaceholders } from "../../assets/images/placeholders/index.js";
import { formatDate } from "../../utils/formatDateTime.js";

import "./PreviewCards.css";

// Full-bleed image, dark gradient overlay, text on top. Opens the original article.
function ArticleCard({ article }) {
  const [imageFailed, setImageFailed] = useState(false);

  const placeholder =
    articlePlaceholders[article.imageIndex % articlePlaceholders.length];
  const image = article.image && !imageFailed ? article.image : placeholder;

  return (
    <article className="article-card">

      <img
        className="article-card__image"
        src={image}
        alt=""
        loading="lazy"
        onError={() => setImageFailed(true)}
      />

      <div className="article-card__overlay" />

      <div className="article-card__content">

        <p className="article-card__tags">
          {article.source}
        </p>

        <h3 className="article-card__title">
          {/* Stretched link: the whole card opens the article */}
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            {article.title}
          </a>
        </h3>

        {article.excerpt && (
          <p className="article-card__excerpt">{article.excerpt}</p>
        )}

        {article.publishedAt && (
          <p className="article-card__time">
            <Clock size={13} aria-hidden="true" />
            {formatDate(article.publishedAt)}
          </p>
        )}

      </div>

    </article>
  );
}

export default ArticleCard;
