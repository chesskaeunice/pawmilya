// Animal status (paper enum) and the separate staff-only health status.
export const ANIMAL_STATUSES = [
  "Rescued",
  "Available for Adoption",
  "Pending Adoption",
  "Adopted",
  "Reunited with Owner",
];

export const HEALTH_STATUSES = [
  "Under Observation",
  "Under Treatment",
  "Cleared",
];

// "Limited" status changes for roles without animals.edit (the API enforces the same list)
const STATUS_LIMITS = {
  "animals.adoptionUpdate": ["Available for Adoption", "Pending Adoption", "Adopted"],
  "animals.healthUpdate": ["Rescued", "Available for Adoption"],
};

// Statuses a role may choose; `can` is the permission check from useAuth
export function allowedStatuses(can) {
  if (can("animals.edit")) return ANIMAL_STATUSES;

  return ANIMAL_STATUSES.filter((status) =>
    Object.entries(STATUS_LIMITS).some(([permission, list]) => can(permission) && list.includes(status))
  );
}

// A pet can only be listed for adoption once it is cleared.
export const ADOPTABLE_STATUS = "Available for Adoption";
export const CLEARED = "Cleared";
export const DEFAULT_STATUS = "Rescued";
export const DEFAULT_HEALTH_STATUS = "Under Observation";

export const ADOPTION_NEEDS_CLEARED_MESSAGE =
  'An animal can only be set to "Available for Adoption" when its health status is "Cleared".';

export function canBeAdoptable(status, healthStatus) {
  return status !== ADOPTABLE_STATUS || healthStatus === CLEARED;
}

// Badge classes already used by the staff pages
export function statusClass(status) {
  if (status === ADOPTABLE_STATUS) return "staff-status--available";
  if (status === "Adopted" || status === "Reunited with Owner") {
    return "staff-status--approved";
  }
  return "staff-status--pending";
}

export function healthStatusClass(healthStatus) {
  if (healthStatus === CLEARED) return "staff-status--available";
  if (healthStatus === "Under Treatment") return "staff-status--rejected";
  return "staff-status--pending";
}
