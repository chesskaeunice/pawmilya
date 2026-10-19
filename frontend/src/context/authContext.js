import { createContext } from "react";

// Mock auth only (no backend yet): one user { id, name, email, role } or null
export const AuthContext = createContext(null);
