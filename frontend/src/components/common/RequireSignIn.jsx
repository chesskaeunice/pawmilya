import { Navigate, useLocation, useParams } from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";

// Wraps pages that need an account (the adoption application, My Applications).
// A guest who opens one directly is sent to `fallback` (a normal page), where the
// "Please sign in to continue" pop-up opens. After logging in, the Login page
// brings them back to the address they wanted.
function RequireSignIn({ children, reason, fallback = () => "/" }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();
  const params = useParams();

  // Wait until the stored session is checked
  if (loading) return null;

  if (!isLoggedIn) {
    return (
      <Navigate
        to={fallback(params)}
        replace
        state={{ signInFrom: location.pathname, signInReason: reason }}
      />
    );
  }

  return children;
}

export default RequireSignIn;
