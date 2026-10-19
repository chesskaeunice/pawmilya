import {
  Navigate,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth.js";


function RequirePermission({
  permission,
  children,
}) {
  const { can } =
    useAuth();


  if (!can(permission)) {
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