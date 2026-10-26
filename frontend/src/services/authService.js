import api, { TOKEN_KEY } from "./api.js";

// Sanctum auth calls. The token is kept in localStorage (read by the Axios interceptor).

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage blocked: the session lasts until the page is closed */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}

export async function loginRequest(email, password) {
  const { data } = await api.post("/api/login", { email, password });
  storeToken(data.token);
  return data.user;
}

// Profile page: change the logged-in user's email (returns the updated user)
export async function updateEmailRequest(email) {
  const { data } = await api.patch("/api/profile/email", { email });
  return data.user;
}

// Profile page: the home address in parts { province, city, barangay, street } (returns the updated user)
export async function updateAddressRequest(address) {
  const { data } = await api.patch("/api/profile/address", address);
  return data.user;
}

// Profile photo (one image file); both return the updated user, with `avatar_url` (null = no photo)
export async function uploadAvatarRequest(file) {
  const body = new FormData();
  body.append("avatar", file);

  const { data } = await api.post("/api/me/avatar", body);
  return data.user;
}

export async function removeAvatarRequest() {
  const { data } = await api.delete("/api/me/avatar");
  return data.user;
}

export async function registerRequest(payload) {
  const { data } = await api.post("/api/register", payload);
  storeToken(data.token);
  return data.user;
}

export async function logoutRequest() {
  try {
    await api.post("/api/logout");
  } catch {
    /* the token may already be invalid; it is cleared either way */
  }
  clearToken();
}

export async function fetchCurrentUser() {
  const { data } = await api.get("/api/me");
  return data.user;
}

const SERVER_ERROR_TEXT = "Something went wrong on our side. Please try again later.";
const NETWORK_ERROR_TEXT = "We could not reach the server. Please check your connection and try again.";

// Turns an Axios error into { message, fields } for the forms (422 field errors).
// A server failure (5xx) or a lost connection only ever shows a friendly text: the technical detail
// (SQL, class names, traces) goes to the console, never to the screen.
export function formatApiError(error) {
  const response = error.response;

  if (!response) {
    console.error("Request failed without a response:", error);
    return { message: NETWORK_ERROR_TEXT, fields: {} };
  }

  if (response.status >= 500) {
    console.error(`Server error ${response.status}:`, response.data);
    return { message: SERVER_ERROR_TEXT, fields: {} };
  }

  if (response.status === 429) {
    const seconds = Number(response.headers?.["retry-after"]) || 60;
    const minutes = Math.max(1, Math.ceil(seconds / 60));
    return {
      message: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      fields: {},
    };
  }

  const fields = {};
  for (const [name, messages] of Object.entries(response.data?.errors ?? {})) {
    fields[name] = messages[0];
  }

  const message = response.data?.message;

  // safety net: a message that looks technical is never shown
  if (typeof message === "string" && /SQLSTATE|Exception/.test(message)) {
    console.error(`Technical message hidden (status ${response.status}):`, message);
    return { message: SERVER_ERROR_TEXT, fields: {} };
  }

  return {
    message: message || "Something went wrong.",
    fields,
  };
}

export async function forgotPasswordRequest(email) {
  await api.post("/api/forgot-password", { email });
}

export async function resetPasswordRequest(payload) {
  await api.post("/api/reset-password", payload);
}

// Revokes every other token; the server answers with a fresh one for this device
export async function changePasswordRequest(payload) {
  const { data } = await api.post("/api/change-password", payload);
  storeToken(data.token);
}
