// Shared helpers for the Filter dropdown on list pages.

export const defaultFilters = {
  animalType: "All",
  dateRange: "All", // All | 24hours | week | custom
  customFrom: "",
  customTo: "",
  status: "All",
};

export const animalTypeOptions = ["Dog", "Cat", "Others"];

export const statusOptions = [
  "Lost",
  "Sighted",
  "Found",
  "Reunited",
  "Adopted",
  "Transfer",
  "Adoptable",
];

export function hasActiveFilters(filters) {
  return (
    filters.animalType !== "All" ||
    filters.dateRange !== "All" ||
    filters.status !== "All"
  );
}

// "Others" means any animal that is not a Dog or Cat.
export function matchesAnimalType(type, selected) {
  if (selected === "All") return true;
  if (selected === "Others") return !["Dog", "Cat"].includes(type);
  return type === selected;
}

export function matchesDateRange(value, filters) {
  if (filters.dateRange === "All") return true;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  if (filters.dateRange === "24hours") return date.getTime() >= now - DAY;
  if (filters.dateRange === "week") return date.getTime() >= now - 7 * DAY;

  if (filters.dateRange === "custom") {
    if (filters.customFrom) {
      const from = new Date(`${filters.customFrom}T00:00:00`);
      if (date < from) return false;
    }
    if (filters.customTo) {
      const to = new Date(`${filters.customTo}T23:59:59`);
      if (date > to) return false;
    }
  }

  return true;
}
