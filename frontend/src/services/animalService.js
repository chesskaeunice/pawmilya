import api from "./api.js";

/* ----- staff (needs login) ----- */

// Returns { data, meta } (Laravel pagination)
export const listAnimals = (params) =>
  api.get("/api/animals", { params }).then((res) => res.data);

export const getAnimal = (id) =>
  api.get(`/api/animals/${id}`).then((res) => res.data.data);

// formData carries the photos (images[]), so it is sent as multipart
export const createAnimal = (formData) =>
  api.post("/api/animals", formData).then((res) => res.data.data);

export const updateAnimal = (id, payload) =>
  api.patch(`/api/animals/${id}`, payload).then((res) => res.data.data);

// Replaces the main photo (every staff role)
export function updateAnimalPhoto(id, file) {
  const form = new FormData();
  form.append("image", file);

  return api.post(`/api/animals/${id}/photo`, form).then((res) => res.data.data);
}

export const deleteAnimal = (id) => api.delete(`/api/animals/${id}`);

// Changes, vaccinations and adoption decisions recorded for one animal
export const getAnimalHistory = (id) =>
  api.get(`/api/animals/${id}/history`).then((res) => res.data.data);

// SVG markup of the animal's QR code
export const getAnimalQr = (id) =>
  api
    .get(`/api/animals/${id}/qr`, { responseType: "text" })
    .then((res) => res.data);


/* ----- public (guests and citizens) ----- */

// Returns { data, meta, breeds }; only animals available for adoption
export const listPets = (params) =>
  api.get("/api/pets", { params }).then((res) => res.data);

export const getPet = (id) =>
  api.get(`/api/pets/${id}`).then((res) => res.data.data);

// Page opened from a QR code: pet info and owner info (when known)
export const getStray = (token) =>
  api.get(`/api/stray/${token}`).then((res) => ({ ...res.data.data, pound: res.data.pound }));
