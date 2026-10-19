import { useCallback, useMemo, useState } from "react";

import { RoleContext } from "./roleContext.js";


const STORAGE_KEY = "pawmilya-dev-role";

function readStoredRole() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "user" ? "user" : "guest";
  } catch {
    return "guest";
  }
}

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(readStoredRole);

  const setRole = useCallback((next) => {
    setRoleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage can be blocked; the role still works for this visit */
    }
  }, []);

  const value = useMemo(
    () => ({
      role,
      isLoggedIn: role === "user",
      setRole,
      logout: () => setRole("guest"),
    }),
    [role, setRole]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}
