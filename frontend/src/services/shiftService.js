import api from "./api.js";

/* ----- My Shifts (pound staff, vet tech, adoption counselor) ----- */

// range: "today" | "upcoming"
export const listMyShifts = (range) =>
  api.get("/api/my/shifts", { params: { range } }).then((res) => res.data.data);

export const checkIn = (id) =>
  api.post(`/api/my/shifts/${id}/check-in`).then((res) => res.data.data);

export const checkOut = (id) =>
  api.post(`/api/my/shifts/${id}/check-out`).then((res) => res.data.data);


/* ----- Staff Schedule (kennel manager) ----- */

// { shifts, staff, requiredRoles, checkInGraceMinutes }
export const getScheduleMeta = () =>
  api.get("/api/schedule/meta").then((res) => res.data);

// { data: assignments, coverage: [{ date, shiftId, complete, missing, ... }] }
export const getAssignments = (params) =>
  api.get("/api/schedule/assignments", { params }).then((res) => res.data);

// Who is on duty today, with coverage
export const getTodayOverview = () =>
  api.get("/api/schedule/today").then((res) => res.data);

// Returns { data, coverage }
export const assignShift = (payload) =>
  api.post("/api/schedule/assignments", payload).then((res) => res.data);

export const changeAssignmentStatus = (id, status) =>
  api.patch(`/api/schedule/assignments/${id}/status`, { status }).then((res) => res.data.data);

// Soft remove; returns { coverage }
export const removeAssignment = (id) =>
  api.delete(`/api/schedule/assignments/${id}`).then((res) => res.data);
