import { Outlet, useLocation } from "react-router-dom";

import UserNavbar from "../components/user/UserNavbar.jsx";
import UserFooter from "../components/user/UserFooter.jsx";
import EmergencyButton from "../components/landing/EmergencyButton.jsx";
import { ModalProvider } from "../context/ModalProvider.jsx";
import { useScrollOnNavigate } from "../hooks/useSectionScroll.js";

import "../styles/landing-motion.css";

// Pages that get the soft fade between pages (landing, adoptable, missing, articles)
const FADE_PATHS = ["/", "/adoptable-pets", "/missing-pets", "/articles"];

// Login and Sign Up are full-screen pages: no navbar and no footer
const BARE_PATHS = ["/login", "/signup"];

const usesFade = (pathname) =>
  pathname === "/" ||
  FADE_PATHS.some((base) => base !== "/" && pathname.startsWith(base));

function UserLayout() {
  const { pathname } = useLocation();
  const bare = BARE_PATHS.includes(pathname);

  useScrollOnNavigate();

  return (
      <ModalProvider>
      <div className={bare ? "user-layout user-layout--bare" : "user-layout"}>

        {!bare && <UserNavbar />}

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

        {!bare && <UserFooter />}

        <EmergencyButton />

      </div>
      </ModalProvider>
  );
}

export default UserLayout;
