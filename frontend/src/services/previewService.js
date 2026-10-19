// Landing page data helpers. They read mock data now; replace the bodies with
// API calls later and keep the same return shapes.
import pets from "../data/pets.js";
import missingPets from "../data/missingPets.js";
import articles from "../data/articles.js";

const newestFirst = (field) => (a, b) =>
  new Date(b[field]).getTime() - new Date(a[field]).getTime();

// pets.js currently uses "Available"; the UI calls it "Adoptable".
export function getAdoptableStatus(status) {
  return status === "Available" ? "Adoptable" : status;
}

export function getLatestAdoptablePets(limit = 6) {
  return pets
    .filter((pet) => getAdoptableStatus(pet.status) === "Adoptable")
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
