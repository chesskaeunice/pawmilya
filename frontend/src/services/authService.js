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

// Turns an Axios error into { message, fields } for the forms (422 field errors)
export function formatApiError(error) {
  const response = error.response;

  if (!response) {
    return { message: "Cannot reach the server. Please try again.", fields: {} };
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

  return {
    message: response.data?.message || "Something went wrong.",
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
