import api from "./api.js";

/* ----- citizen ----- */

// formData carries the valid ID and the home photos (multipart)
export const submitApplication = (formData) =>
  api.post("/api/adoption-applications", formData).then((res) => res.data.data);

export const listMyApplications = () =>
  api.get("/api/my/adoption-applications").then((res) => res.data.data);


/* ----- staff ----- */

// Returns { data, meta } (Laravel pagination)
export const listApplications = (params) =>
  api.get("/api/adoption-applications", { params }).then((res) => res.data);

export const getApplication = (id) =>
  api.get(`/api/adoption-applications/${id}`).then((res) => res.data.data);

export const approveApplication = (id) =>
  api.post(`/api/adoption-applications/${id}/approve`).then((res) => res.data.data);

export const rejectApplication = (id, reason) =>
  api
    .post(`/api/adoption-applications/${id}/reject`, { reason })
    .then((res) => res.data.data);
