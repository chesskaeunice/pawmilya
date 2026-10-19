import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";
import { CITIZEN, ROLES } from "../../config/rolePermissions.js";

// Mock login (no backend yet): wraps the existing Login page without changing it.
// When its form is submitted, any credentials log the user in and we go back to
// the page they came from (for example an adoption application) or Home.
function MockLoginHandler({ children }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Dev only: /login?as=<role> mock-logs in as that role (unknown roles ignored)
  const asRole = new URLSearchParams(location.search).get("as");
  const devRole =
    import.meta.env.DEV && (asRole === CITIZEN || Object.values(ROLES).includes(asRole))
      ? asRole
      : null;

  useEffect(() => {
    if (!devRole) return;
    login(devRole);
    navigate(devRole === CITIZEN ? "/" : "/admin", { replace: true });
  }, [devRole, login, navigate]);

  if (devRole) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    login("citizen");
    navigate(location.state?.from || "/", { replace: true });
  };

  // display: contents keeps this wrapper out of the page layout
  return (
    <div style={{ display: "contents" }} onSubmit={handleSubmit}>
      {children}
    </div>
  );
}

export default MockLoginHandler;
