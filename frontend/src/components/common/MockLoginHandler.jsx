import { useLocation, useNavigate } from "react-router-dom";

import useRole from "../../hooks/useRole.js";

// Mock login (no backend yet): wraps the existing Login page without changing it.
// When its form is submitted, any credentials log the user in and we go back to
// the page they came from (for example an adoption application) or Home.
function MockLoginHandler({ children }) {
  const { setRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (event) => {
    event.preventDefault();
    setRole("user");
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
