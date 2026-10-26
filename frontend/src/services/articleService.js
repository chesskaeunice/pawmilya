import api from "./api.js";

/* ----- public (guests and citizens) ----- */

// Pet care articles from outside pet care websites (RSS, cached by the API).
// `tags` (the source name) and `dateAdded` keep the search and date filter working.
export const listPetCareArticles = () =>
  api.get("/api/pet-care-articles").then((res) =>
    res.data.data.map((article, index) => ({
      ...article,
      tags: [article.source],
      dateAdded: article.publishedAt,
      imageIndex: index,
    }))
  );
