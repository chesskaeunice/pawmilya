export const ROLES = {
  KENNEL_MANAGER: "kennel_manager",
  ADOPTION_COUNSELOR: "adoption_counselor",
  VET_TECH: "vet_tech",
  POUND_STAFF: "pound_staff",
};


// Logged-in public user; no staff permissions
export const CITIZEN = "citizen";


export const ROLE_LABELS = {
  [CITIZEN]:
    "Citizen",

  [ROLES.KENNEL_MANAGER]:
    "Kennel Manager",

  [ROLES.ADOPTION_COUNSELOR]:
    "Adoption Counselor",

  [ROLES.VET_TECH]:
    "Veterinary Technician",

  [ROLES.POUND_STAFF]:
    "Pound Staff",
};


export const rolePermissions = {

  [CITIZEN]: [],


  /* =========================================
     KENNEL MANAGER
  ========================================= */

  [ROLES.KENNEL_MANAGER]: [
    "dashboard.view",

    "animals.view",
    "animals.create",
    "animals.edit",
    "animals.delete",

    "adoptionApplications.view",
    "adoptionApplications.review",
    "adoptionApplications.approve",
    "adoptionApplications.reject",
    "adoptionApplications.export",

    "missingPets.view",
    "missingPets.edit",
    "missingPets.updateStatus",

    "vaccinations.view",
    "vaccinations.create",
    "vaccinations.edit",
    "vaccinations.delete",

    "reports.view",
    "reports.all",

    "settings.view",
    "settings.system",
  ],


  /* =========================================
     ADOPTION COUNSELOR
  ========================================= */

  [ROLES.ADOPTION_COUNSELOR]: [
    "dashboard.view",

    "animals.view",
    "animals.adoptionUpdate",

    "adoptionApplications.view",
    "adoptionApplications.review",
    "adoptionApplications.approve",
    "adoptionApplications.reject",

    "missingPets.view",
    "missingPets.edit",
    "missingPets.updateStatus",

    "vaccinations.view",

    "reports.view",
    "reports.adoption",
    "reports.missingPets",

    "settings.view",
    "settings.ownAccount",
  ],


  /* =========================================
     VET TECH
  ========================================= */

  [ROLES.VET_TECH]: [
    "dashboard.view",

    "animals.view",
    "animals.healthUpdate",

    "missingPets.view",

    "vaccinations.view",
    "vaccinations.create",
    "vaccinations.edit",
    "vaccinations.delete",

    "reports.view",
    "reports.health",
    "reports.vaccinations",

    "settings.view",
    "settings.ownAccount",
  ],


  /* =========================================
     POUND STAFF
  ========================================= */

  [ROLES.POUND_STAFF]: [
    "dashboard.view",

    "animals.view",
    "animals.husbandryUpdate",

    "adoptionApplications.view",

    "missingPets.view",

    "vaccinations.view",

    "settings.view",
    "settings.ownAccount",
  ],
};


export function hasPermission(
  role,
  permission
) {
  const permissions =
    rolePermissions[role] || [];

  return permissions.includes(
    permission
  );
}