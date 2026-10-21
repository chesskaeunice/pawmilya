import {
  Navigate,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";


// `permission`: one required permission. `anyOf`: a list where any one is enough.
function RequirePermission({
  permission,
  anyOf,
  children,
}) {
  const { can } =
    useAuth();


  const allowed = anyOf
    ? anyOf.some((item) => can(item))
    : can(permission);

  if (!allowed) {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }


  return children;
}


export default RequirePermission;