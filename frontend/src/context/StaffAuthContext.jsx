import {
  createContext,
  useContext,
  useState,
} from "react";

import {
  hasPermission,
  ROLE_LABELS,
  ROLES,
} from "../config/rolePermissions.js";


const StaffAuthContext =
  createContext(null);


const ROLE_STORAGE_KEY =
  "pawmilya.devRole";


const TEMPORARY_USERS = {
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


/*
 * TEMPORARY: remembers the role picked in the dev
 * role switcher. Later the role comes from Laravel
 * after staff login, and this goes away.
 */
function getInitialRole() {
  try {
    const saved =
      localStorage.getItem(
        ROLE_STORAGE_KEY
      );

    if (TEMPORARY_USERS[saved]) {
      return saved;
    }
  } catch {
    /* ignore storage errors */
  }

  return ROLES.POUND_STAFF;
}


export function StaffAuthProvider({
  children,
}) {
  const [role, setRoleState] =
    useState(getInitialRole);


  const setRole = (nextRole) => {
    if (!TEMPORARY_USERS[nextRole]) {
      return;
    }

    try {
      localStorage.setItem(
        ROLE_STORAGE_KEY,
        nextRole
      );
    } catch {
      /* ignore storage errors */
    }

    setRoleState(nextRole);
  };


  const user = {
    ...TEMPORARY_USERS[role],
    role,
  };


  const can = (permission) => {
    return hasPermission(
      role,
      permission
    );
  };


  const roleLabel =
    ROLE_LABELS[role] || role;


  const value = {
    user,
    role,
    roleLabel,
    can,
    setRole,
  };


  return (
    <StaffAuthContext.Provider
      value={value}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}


export function useStaffAuth() {
  const context =
    useContext(
      StaffAuthContext
    );


  if (!context) {
    throw new Error(
      "useStaffAuth must be used inside StaffAuthProvider."
    );
  }


  return context;
}