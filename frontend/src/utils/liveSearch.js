// Live search matching (case-insensitive "contains"). Works on the mock data
// now; later these checks can be replaced by an API call.

const toText = (value) => (value == null ? "" : String(value)).toLowerCase();

function containsQuery(values, query) {
  const q = toText(query).trim();
  if (!q) return true;
  return values.some((value) => toText(value).includes(q));
}

// Pets and missing pet reports: name, breed or species
export function matchesPetSearch(pet, query) {
  return containsQuery([pet.name, pet.breed, pet.type], query);
}

// Articles: title or category (tags)
export function matchesArticleSearch(article, query) {
  return containsQuery([article.title, ...(article.tags || [])], query);
}
