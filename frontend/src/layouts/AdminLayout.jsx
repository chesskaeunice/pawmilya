import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Navigate,
  Outlet,
} from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminHeader from "../components/admin/AdminHeader.jsx";

import useAuth from "../hooks/useAuth.js";


const COLLAPSED_KEY = "pawmilya_sidebar_collapsed";
const PHONE_QUERY = "(max-width: 900px)";

// Desktop: the sidebar is collapsed to icons or expanded (remembered). Under 900px it is a drawer.
function useStaffMenu() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // follow the screen width; leaving the phone size closes the drawer
  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const update = () => {
      setIsPhone(query.matches);
      if (!query.matches) setDrawerOpen(false);
    };

    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const toggle = useCallback(() => {
    if (isPhone) {
      setDrawerOpen((open) => !open);
      return;
    }

    setCollapsed((current) => {
      const next = !current;

      try {
        localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* storage blocked: the choice lasts until the page is closed */
      }

      return next;
    });
  }, [isPhone]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return { collapsed, isPhone, drawerOpen, toggle, closeDrawer };
}


function AdminLayout() {
  const { isLoggedIn, isStaff, loading, loggedOutByUser, user } = useAuth();
  const { collapsed, isPhone, drawerOpen, toggle, closeDrawer } = useStaffMenu();
  const menuButtonRef = useRef(null);

  // open drawer: Esc closes it (focus goes back to the menu button) and the page behind does not scroll
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const handleKey = (event) => {
      if (event.key === "Escape") {
        closeDrawer();
        menuButtonRef.current?.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [drawerOpen, closeDrawer]);

  // Wait until the stored session is checked
  if (loading) {
    return null;
  }

  // Staff only: guests go to login (home after a manual Log out), citizens go home
  if (!isLoggedIn) {
    return <Navigate to={loggedOutByUser ? "/" : "/login"} replace />;
  }

  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  // Temporary password: nothing else works until it is replaced
  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  return (
    <>

      <div
        className={
          "staff-layout" +
          (collapsed ? " staff-layout--collapsed" : "") +
          (drawerOpen ? " staff-layout--drawer-open" : "")
        }
      >

        <AdminSidebar
          collapsed={collapsed && !isPhone}
          hidden={isPhone && !drawerOpen}
          onNavigate={closeDrawer}
          expanded={isPhone ? drawerOpen : !collapsed}
          onToggleMenu={toggle}
        />

        {drawerOpen && (
          <div className="staff-backdrop" onClick={closeDrawer} aria-hidden="true" />
        )}


        <div className="staff-layout__main">

          <AdminHeader
            expanded={isPhone ? drawerOpen : !collapsed}
            onToggleMenu={toggle}
            buttonRef={menuButtonRef}
          />


          <main className="staff-layout__content">

            <Outlet />

          </main>

        </div>

      </div>

    </>
  );
}


export default AdminLayout;