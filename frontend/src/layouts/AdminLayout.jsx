import {
  Navigate,
  Outlet,
} from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminHeader from "../components/admin/AdminHeader.jsx";

import useAuth from "../hooks/useAuth.js";


function AdminLayout() {
  const { isLoggedIn, isStaff } = useAuth();

  // Staff only: guests go to login, citizens go home
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  return (
    <>

      <div className="staff-layout">

        <AdminSidebar />


        <div className="staff-layout__main">

          <AdminHeader />


          <main className="staff-layout__content">

            <Outlet />

          </main>

        </div>

      </div>

    </>
  );
}


export default AdminLayout;