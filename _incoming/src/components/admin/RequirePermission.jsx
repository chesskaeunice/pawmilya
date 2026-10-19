import {
  Navigate,
} from "react-router-dom";

import {
  useStaffAuth,
} from "../../context/StaffAuthContext.jsx";


function RequirePermission({
  permission,
  children,
}) {
  const { can } =
    useStaffAuth();


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