// Landing page data helpers. They read mock data now; replace the bodies with
// API calls later and keep the same return shapes.
import { listPets } from "./animalService.js";
import { ADOPTABLE_STATUS } from "../config/animalStatus.js";
import { listMissingPets } from "./missingPetService.js";
import articles from "../data/articles.js";

const newestFirst = (field) => (a, b) =>
  new Date(b[field]).getTime() - new Date(a[field]).getTime();

// pets.js uses the paper status "Available for Adoption"; the UI calls it "Adoptable".

export function getAdoptableStatus(status) {
  return status === ADOPTABLE_STATUS ? "Adoptable" : status;
}

// Citizen pages only show animals that are open for adoption.
export function isAdoptable(pet) {
  return pet?.status === ADOPTABLE_STATUS;
}

// Newest adoptable pets from the API (a promise)
export function getLatestAdoptablePets(limit = 6) {
  return listPets({ per_page: limit }).then((result) => result.data);
}

// Newest missing pet reports from the API (a promise)
export function getLatestMissingReports(limit = 6) {
  return listMissingPets({ per_page: limit });
}

export function getAllArticles() {
  return getLatestArticles(Infinity);
}

export function getLatestArticles(limit = 6) {
  return [...articles].sort(newestFirst("dateAdded")).slice(0, limit);
}

export function getArticleById(id) {
  return articles.find((article) => article.id === id) || null;
}
