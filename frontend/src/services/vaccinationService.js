import api from "./api.js";

// Records come back in the shape the Vaccinations page uses:
// { id, petId, petName, petType, vaccine, date, nextDue, status }

// params: { animal_id? } limits the list to one animal
export const listVaccinations = (params) =>
  api.get("/api/vaccinations", { params }).then((res) => res.data.data);

// One animal, one or more vaccines: records = [{ vaccine, administered_at, next_due_date? }]
export const addVaccinations = (animalId, records) =>
  api
    .post("/api/vaccinations", { animal_id: animalId, records })
    .then((res) => res.data.data);

// changes: { vaccine?, administered_at?, next_due_date? }
export const updateVaccination = (id, changes) =>
  api.patch(`/api/vaccinations/${id}`, changes).then((res) => res.data.data);

export const deleteVaccination = (id) => api.delete(`/api/vaccinations/${id}`);
