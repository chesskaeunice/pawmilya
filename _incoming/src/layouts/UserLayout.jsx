import { Outlet } from "react-router-dom";

import UserNavbar from "../components/user/UserNavbar.jsx";
import UserFooter from "../components/user/UserFooter.jsx";

function UserLayout() {
  return (
    <div className="user-layout">

      <UserNavbar />

      <main className="user-layout__content">
        <Outlet />
      </main>

      <UserFooter />

    </div>
  );
}

export default UserLayout;