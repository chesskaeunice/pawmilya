import { Outlet, useLocation } from "react-router-dom";

import UserNavbar from "../components/user/UserNavbar.jsx";
import UserFooter from "../components/user/UserFooter.jsx";
import EmergencyButton from "../components/landing/EmergencyButton.jsx";
import { ModalProvider } from "../context/ModalProvider.jsx";
import { useScrollOnNavigate } from "../hooks/useSectionScroll.js";

import "../styles/landing-motion.css";

// Pages that get the soft fade between pages (landing, adoptable, missing, articles)
const FADE_PATHS = ["/", "/adoptable-pets", "/missing-pets", "/articles"];

const usesFade = (pathname) =>
  pathname === "/" ||
  FADE_PATHS.some((base) => base !== "/" && pathname.startsWith(base));

function UserLayout() {
  const { pathname } = useLocation();

  useScrollOnNavigate();

  return (
      <ModalProvider>
      <div className="user-layout">

        <UserNavbar />

        <main
          key={usesFade(pathname) ? pathname : "other"}
          className={
            usesFade(pathname)
              ? "user-layout__content page-fade"
              : "user-layout__content"
          }
        >
          <Outlet />
        </main>

        <UserFooter />

        <EmergencyButton />

      </div>
      </ModalProvider>
  );
}

export default UserLayout;
