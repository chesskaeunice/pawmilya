import api from "./api.js";

/* ----- citizen ----- */

// formData: contact_name, contact_number, contact_email, pickup_date, proof_images[] (multipart)
export const submitClaim = (reportId, formData) =>
  api.post(`/api/missing-pets/${reportId}/claims`, formData).then((res) => res.data.data);

// My claims: status, pickup date and the reject reason
export const listMyClaims = () =>
  api.get("/api/my/claims").then((res) => res.data.data);

/* ----- staff (pound staff decide, the kennel manager only views) ----- */

// Claimants' contact details and the proof images (signed links that expire)
export const listReportClaims = (reportId) =>
  api.get(`/api/missing-pet-reports/${reportId}/claims`).then((res) => res.data.data);

export const approveClaim = (reportId, claimId) =>
  api.post(`/api/missing-pet-reports/${reportId}/claims/${claimId}/approve`).then((res) => res.data.data);

export const rejectClaim = (reportId, claimId, reason) =>
  api
    .post(`/api/missing-pet-reports/${reportId}/claims/${claimId}/reject`, { reason })
    .then((res) => res.data.data);
