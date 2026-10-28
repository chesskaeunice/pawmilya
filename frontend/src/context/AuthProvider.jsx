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
  verifyEmailRequest,
  removeAvatarRequest,
  updateAddressRequest,
  updateEmailRequest,
  updateProfileRequest,
  uploadAvatarRequest,
} from "../services/authService.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Wait for /api/me before guards decide, when a token is already stored
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()));
  // true after the user pressed Log out (a session that ended by itself leaves it false)
  const [loggedOutByUser, setLoggedOutByUser] = useState(false);

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
    setLoggedOutByUser(false);
    setUser(next);
    return next;
  }, []);

  // Sign up only creates the account; the person is logged in by verifyEmail (the emailed code)
  const register = useCallback((payload) => registerRequest(payload), []);

  const verifyEmail = useCallback(async (email, code) => {
    const next = await verifyEmailRequest(email, code);
    setLoggedOutByUser(false);
    setUser(next);
    return next;
  }, []);

  // Full name and phone number: throws an Axios error on failure (422 with the field errors);
  // the new name is in `user` at once (navbar, staff sidebar and header, My Account)
  const updateProfile = useCallback(async (profile) => {
    const next = await updateProfileRequest(profile);
    setUser(next);
    return next;
  }, []);

  // Throws an Axios error on failure (422 with the field error); the new email is in `user` at once
  const updateEmail = useCallback(async (email) => {
    const next = await updateEmailRequest(email);
    setUser(next);
    return next;
  }, []);

  // Throws an Axios error on failure (422 with the field errors); the new address is in `user` at once
  const updateAddress = useCallback(async (address) => {
    const next = await updateAddressRequest(address);
    setUser(next);
    return next;
  }, []);

  // Profile photo: the new `avatar_url` is in `user` at once (navbar, staff header, Profile page)
  const uploadAvatar = useCallback(async (file) => {
    const next = await uploadAvatarRequest(file);
    setUser(next);
    return next;
  }, []);

  const removeAvatar = useCallback(async () => {
    const next = await removeAvatarRequest();
    setUser(next);
    return next;
  }, []);

  const changePassword = useCallback(async (payload) => {
    await changePasswordRequest(payload);
    setUser((current) => (current ? { ...current, mustChangePassword: false } : current));
  }, []);

  const logout = useCallback(() => {
    setLoggedOutByUser(true);
    setUser(null);
    logoutRequest();
  }, []);

  const value = useMemo(() => {
    const role = user?.role ?? null;

    return {
      user,
      role,
      loading,
      loggedOutByUser,
      isLoggedIn: Boolean(user),
      isStaff: Boolean(user) && role !== CITIZEN && role in rolePermissions,
      roleLabel: ROLE_LABELS[role] || "Guest",
      can: (permission) => hasPermission(role, permission),
      login,
      register,
      verifyEmail,
      updateProfile,
      updateEmail,
      updateAddress,
      uploadAvatar,
      removeAvatar,
      changePassword,
      logout,
    };
  }, [
    user, loading, loggedOutByUser, login, register, verifyEmail, updateProfile, updateEmail, updateAddress, uploadAvatar, removeAvatar,
    changePassword, logout,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
