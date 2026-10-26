import api from "./api.js";

// Records come back in the shape the Vaccinations page uses:
// { id, petId, petName, petType, vaccine, date, nextDue, status }

// params: { animal_id? } limits the list to one animal
export const listVaccinations = (params) =>
  api.get("/api/vaccinations", { params }).then((res) => res.data.data);

// The vaccines to choose from: [{ id, name, species: "Dog" | "Cat" | "All", intervalDays }]
// (the vaccination form shows the ones that fit the animal's species, then "Others")
export const listVaccines = () =>
  api.get("/api/vaccines").then((res) => res.data.data);

// One animal, one to five vaccines. Each record is { vaccine_id, administered_at, next_due_date?, notes? }
// or, for "Others", { vaccine_id: null, other_vaccine_name, administered_at, ... }
export const addVaccinations = (animalId, records) =>
  api
    .post("/api/vaccinations", { animal_id: animalId, records })
    .then((res) => res.data.data);

// changes: { vaccine_id?, other_vaccine_name?, administered_at?, next_due_date?, notes? }
export const updateVaccination = (id, changes) =>
  api.patch(`/api/vaccinations/${id}`, changes).then((res) => res.data.data);

export const deleteVaccination = (id) => api.delete(`/api/vaccinations/${id}`);
