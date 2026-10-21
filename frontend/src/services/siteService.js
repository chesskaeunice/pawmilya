import api from "./api.js";

/* ----- public ----- */

// Pound info, donation QR, About text/images and the in-kind wishlist
export const getSiteInfo = () =>
  api.get("/api/public/site-info").then((res) => res.data.data);

/* ----- staff (Settings, kennel manager) ----- */

export const getSiteContent = () =>
  api.get("/api/site-content").then((res) => res.data.data);

export const saveSiteContent = (payload) =>
  api.put("/api/site-content", payload).then((res) => res.data.data);

// slot: donation_qr | about_1 | about_2
export function uploadSiteImage(slot, file) {
  const form = new FormData();
  form.append("image", file);

  return api.post(`/api/site-content/images/${slot}`, form).then((res) => res.data.data);
}

export const deleteSiteImage = (slot) =>
  api.delete(`/api/site-content/images/${slot}`).then((res) => res.data.data);
