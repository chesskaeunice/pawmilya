import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./authContext.js";
import {
  CITIZEN,
  hasPermission,
  ROLE_LABELS,
  rolePermissions,
} from "../config/rolePermissions.js";
import {
  changePasswordRequest,
  clearToken,
  fetchCurrentUser,
  getStoredToken,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "../services/authService.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Wait for /api/me before guards decide, when a token is already stored
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()));

  useEffect(() => {
    if (!getStoredToken()) return;

    fetchCurrentUser()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  // Both throw an Axios error on failure (422 with field errors, 403 if deactivated)
  const login = useCallback(async (email, password) => {
    const next = await loginRequest(email, password);
    setUser(next);
    return next;
  }, []);

  const register = useCallback(async (payload) => {
    const next = await registerRequest(payload);
    setUser(next);
    return next;
  }, []);

  const changePassword = useCallback(async (payload) => {
    await changePasswordRequest(payload);
    setUser((current) => (current ? { ...current, mustChangePassword: false } : current));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    logoutRequest();
  }, []);

  const value = useMemo(() => {
    const role = user?.role ?? null;

    return {
      user,
      role,
      loading,
      isLoggedIn: Boolean(user),
      isStaff: Boolean(user) && role !== CITIZEN && role in rolePermissions,
      roleLabel: ROLE_LABELS[role] || "Guest",
      can: (permission) => hasPermission(role, permission),
      login,
      register,
      changePassword,
      logout,
    };
  }, [user, loading, login, register, changePassword, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
