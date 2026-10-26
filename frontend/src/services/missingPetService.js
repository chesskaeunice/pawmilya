import api from "./api.js";

/* ----- public (guests and citizens) ----- */

// All reports, newest first (the pages filter them on the client)
export const listMissingPets = (params) =>
  api.get("/api/missing-pets", { params }).then((res) => res.data.data);

export const getMissingPet = (id) =>
  api.get(`/api/missing-pets/${id}`).then((res) => res.data.data);

// Open to guests. formData carries the photos (multipart). A logged-in
// citizen's token is sent automatically and links the report to the account.
export const submitMissingPetReport = (formData) =>
  api.post("/api/missing-pets", formData).then((res) => res.data.data);


/* ----- citizen ----- */

export const listMyMissingReports = () =>
  api.get("/api/my/missing-pets").then((res) => res.data.data);

// The owner found the pet
export const markMyReportReunited = (id) =>
  api.post(`/api/my/missing-pets/${id}/reunited`).then((res) => res.data.data);


/* ----- staff ----- */

// Includes the reporter's contact details
export const listStaffReports = () =>
  api.get("/api/missing-pet-reports").then((res) => res.data.data);

export const getStaffReport = (id) =>
  api.get(`/api/missing-pet-reports/${id}`).then((res) => res.data.data);

export const updateReportStatus = (id, status) =>
  api
    .patch(`/api/missing-pet-reports/${id}/status`, { status })
    .then((res) => res.data.data);

// A Found report: register the pet as an animal in the pound (returns the new animal)
export const registerAnimalFromReport = (id) =>
  api.post(`/api/missing-pets/${id}/register-animal`).then((res) => res.data.data);

// Animals in the pound that could be this pet
export const getReportMatches = (id) =>
  api.get(`/api/missing-pet-reports/${id}/matches`).then((res) => res.data.data);
