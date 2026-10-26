import api from "./api.js";

// The staff lists that the dashboards and Reports read. A role only loads what it may view
// (the API refuses the rest), and each list has the shape the pages already use.
export async function fetchAdminLists(allowed) {
  const empty = Promise.resolve([]);

  const [animals, applications, missingPets, vaccinations] = await Promise.all([
    allowed.animals
      ? api.get("/api/animals", { params: { per_page: 500 } }).then((res) => res.data.data)
      : empty,
    allowed.applications
      ? api.get("/api/adoption-applications", { params: { per_page: 200 } }).then((res) => res.data.data)
      : empty,
    allowed.missingPets
      ? api.get("/api/missing-pet-reports").then((res) => res.data.data)
      : empty,
    allowed.vaccinations
      ? api.get("/api/vaccinations").then((res) => res.data.data)
      : empty,
  ]);

  return { animals, applications, missingPets, vaccinations };
}


// The data behind the Reports tabs. Each report is checked by its own permission on the server,
// so only the ones the role may read are requested; the others come back empty.
export async function fetchReportLists(allowed) {
  const empty = Promise.resolve([]);
  const get = (path) => api.get(`/api/reports/${path}`).then((res) => res.data.data);

  const [animals, applications, missingPets, vaccinations, health] = await Promise.all([
    allowed.animals ? get("animals") : empty,
    allowed.adoptions ? get("adoptions") : empty,
    allowed.missingPets ? get("missing-pets") : empty,
    allowed.vaccinations ? get("vaccinations") : empty,
    allowed.health ? get("health") : empty,
  ]);

  return { animals, applications, missingPets, vaccinations, health };
}


/* ----- staff accounts (kennel manager) ----- */

export const listStaffAccounts = () =>
  api.get("/api/users").then((res) => res.data.data);

export const createStaffAccount = (payload) =>
  api.post("/api/users", payload).then((res) => res.data.data);

// changes: { name?, role?, is_active? }
export const updateStaffAccount = (id, changes) =>
  api.patch(`/api/users/${id}`, changes).then((res) => res.data.data);


/* ----- audit log (kennel manager) ----- */

// Returns { data, meta }
export const listAuditLogs = (params) =>
  api.get("/api/audit-logs", { params }).then((res) => res.data);
