import {
  Outlet,
} from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminHeader from "../components/admin/AdminHeader.jsx";

import {
  StaffAuthProvider,
} from "../context/StaffAuthContext.jsx";


function AdminLayout() {
  return (
    <StaffAuthProvider>

      <div className="staff-layout">

        <AdminSidebar />


        <div className="staff-layout__main">

          <AdminHeader />


          <main className="staff-layout__content">

            <Outlet />

          </main>

        </div>

      </div>

    </StaffAuthProvider>
  );
}


export default AdminLayout;