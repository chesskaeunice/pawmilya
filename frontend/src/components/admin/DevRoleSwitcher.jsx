import { useNavigate } from "react-router-dom";

import { ROLES, ROLE_LABELS } from "../../config/rolePermissions.js";
import useAuth from "../../hooks/useAuth.js";


/*
 * DEV ONLY: lets you preview each staff role.
 * Renders nothing in a production build.
 */
function DevRoleSwitcher() {
  const { role, login } = useAuth();
  const navigate = useNavigate();

  if (!import.meta.env.DEV) {
    return null;
  }

  const handleChange = (event) => {
    login(event.target.value);

    // Go to the dashboard so the new role's page loads
    // (also avoids landing on a page the role can't open).
    navigate("/admin/dashboard");
  };

  return (
    <div
      style={{
        margin: "12px 16px",
        padding: "10px",
        border: "1px dashed #cc6f00",
        borderRadius: "8px",
        background: "#fffaf2",
        fontSize: "11px",
      }}
    >
      <label
        htmlFor="dev-role"
        style={{
          display: "block",
          marginBottom: "6px",
          color: "#4d2a00",
          fontWeight: 700,
        }}
      >
        Preview role (dev only)
      </label>

      <select
        id="dev-role"
        value={role}
        onChange={handleChange}
        style={{
          width: "100%",
          minHeight: "34px",
          border: "1px solid #e6ded2",
          borderRadius: "6px",
          background: "white",
          fontSize: "12px",
        }}
      >
        {Object.values(ROLES).map((value) => (
          <option key={value} value={value}>
            {ROLE_LABELS[value]}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DevRoleSwitcher;