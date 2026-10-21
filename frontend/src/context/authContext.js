import { createContext } from "react";

// Sanctum auth: one user { id, name, email, phone, role } or null
export const AuthContext = createContext(null);
