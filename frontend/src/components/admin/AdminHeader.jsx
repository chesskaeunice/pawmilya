import useAuth from "../../hooks/useAuth.js";

// Plain (non-clickable) identity of the logged-in staff member; logout is in the sidebar
function AdminHeader() {
  const { user, roleLabel } = useAuth();
  const name = user?.name ?? "";

  return (
    <header className="staff-header">

      <div className="staff-header__profile">

        <div className="staff-header__avatar" aria-hidden="true">
          {name.charAt(0).toUpperCase() || "S"}
        </div>

        <div className="staff-header__identity">
          <strong>{name}</strong>
          <span>{roleLabel}</span>
        </div>

      </div>

    </header>
  );
}

export default AdminHeader;
