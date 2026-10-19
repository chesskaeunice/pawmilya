// Landing page data helpers. They read mock data now; replace the bodies with
// API calls later and keep the same return shapes.
import pets from "../data/pets.js";
import { ADOPTABLE_STATUS } from "../config/animalStatus.js";
import missingPets from "../data/missingPets.js";
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

export function getLatestAdoptablePets(limit = 6) {
  return pets
    .filter(isAdoptable)
    .sort(newestFirst("dateAdded"))
    .slice(0, limit);
}

// All adoptable pets, newest first (used by the Adoptable Pets page)
export function getAllAdoptablePets() {
  return getLatestAdoptablePets(Infinity);
}

export function getLatestMissingReports(limit = 6) {
  return [...missingPets].sort(newestFirst("reportedAt")).slice(0, limit);
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
