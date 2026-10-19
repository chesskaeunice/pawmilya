import { useCallback, useMemo, useState } from "react";

import { AuthContext } from "./authContext.js";
import {
  CITIZEN,
  hasPermission,
  ROLE_LABELS,
  ROLES,
  rolePermissions,
} from "../config/rolePermissions.js";

const STORAGE_KEY = "pawmilya.mockUser";

// Temporary mock users, one per role. Later the user comes from Laravel.
const MOCK_USERS = {
  [CITIZEN]: { id: 100, name: "Citizen", email: "citizen@pawmilya.local" },
  [ROLES.KENNEL_MANAGER]: {
    id: 1,
    name: "Kennel Manager",
    email: "manager@pawmilya.local",
  },
  [ROLES.ADOPTION_COUNSELOR]: {
    id: 2,
    name: "Adoption Counselor",
    email: "counselor@pawmilya.local",
  },
  [ROLES.VET_TECH]: {
    id: 3,
    name: "Vet Tech",
    email: "vettech@pawmilya.local",
  },
  [ROLES.POUND_STAFF]: {
    id: 4,
    name: "Pound Staff",
    email: "poundstaff@pawmilya.local",
  },
};

function readStoredUser() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && MOCK_USERS[saved.role] ? saved : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback((role) => {
    if (!MOCK_USERS[role]) return;

    const next = { ...MOCK_USERS[role], role };
    setUser(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage can be blocked; the login still works for this visit */
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const value = useMemo(() => {
    const role = user?.role ?? null;

    return {
      user,
      role,
      isLoggedIn: Boolean(user),
      isStaff: Boolean(user) && role !== CITIZEN && role in rolePermissions,
      roleLabel: ROLE_LABELS[role] || "Guest",
      can: (permission) => hasPermission(role, permission),
      login,
      logout,
    };
  }, [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
