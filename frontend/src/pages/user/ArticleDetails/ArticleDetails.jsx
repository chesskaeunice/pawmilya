import { Link, useParams } from "react-router-dom";
import { Clock } from "lucide-react";

import BackButton from "../../../components/common/BackButton.jsx";
import { articlePlaceholders } from "../../../assets/images/placeholders/index.js";
import { getArticleById } from "../../../services/previewService.js";
import { formatDate } from "../../../utils/formatDateTime.js";

import "./ArticleDetails.css";

function ArticleDetails() {
  const { articleId } = useParams();

  const article = getArticleById(articleId);

  const backButton = <BackButton fallback="/articles" />;

  if (!article) {
    return (
      <div className="article-page">
        {backButton}

        <h1>Article not found</h1>
        <p>
          We could not find that article.{" "}
          <Link to="/#articles">See all articles</Link>
        </p>
      </div>
    );
  }

  const image =
    article.image ||
    articlePlaceholders[article.imageIndex % articlePlaceholders.length];

  return (
    <article className="article-page">

      {backButton}

      <p className="article-page__tags">{article.tags.join(" · ")}</p>

      <h1>{article.title}</h1>

      <p className="article-page__meta">
        <span>{formatDate(article.dateAdded)}</span>
        <span>
          <Clock size={14} aria-hidden="true" />
          {article.readingTime}
        </span>
      </p>

      <img
        className="article-page__image"
        src={image}
        alt=""
      />

      <div className="article-page__body">
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

    </article>
  );
}

export default ArticleDetails;
