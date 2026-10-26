import api from "./api.js";

// Public site content (pound info, about texts): no login needed
export const getPublicSiteInfo = () =>
  api.get("/api/public/site-info").then((res) => res.data.data);

/* ----- pound information (kennel manager, settings.system) ----- */

export const getPoundInfo = () =>
  api.get("/api/site-content").then((res) => res.data.data);

// payload: { name, address, phone, email, hours, vision, mission }
export const savePoundInfo = (payload) =>
  api.patch("/api/pound-info", payload).then((res) => res.data.data);
