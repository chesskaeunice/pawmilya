import useFetch from "./useFetch.js";
import { listPetCareArticles } from "../services/articleService.js";

// Real pet care articles from the API. `failed` is true when the request
// failed or returned nothing (nothing is shown while `loading`).
function usePetCareArticles() {
  const { data, error, loading } = useFetch(listPetCareArticles, []);
  const articles = data ?? [];

  return {
    articles,
    loading,
    failed: !loading && (Boolean(error) || articles.length === 0),
  };
}

export default usePetCareArticles;
