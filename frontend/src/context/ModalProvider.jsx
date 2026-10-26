import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { ModalContext } from "./modalContext.js";
import useAuth from "../hooks/useAuth.js";
import EmergencyReportModal from "../components/report/EmergencyReportModal.jsx";
import SignInModal from "../components/common/SignInModal.jsx";

// Holds which modal is open and renders it:
//   "emergency" -> emergency report form
//   "signin"    -> "Please sign in to continue" ({ from, reason })
// The sign-in pop-up also opens when a guest is redirected here from a page
// that needs an account (RequireSignIn puts signInFrom in the route state).
export function ModalProvider({ children }) {
  const location = useLocation();
  const { isLoggedIn, loading } = useAuth();

  const [active, setActive] = useState(null);
  const [signIn, setSignIn] = useState({ from: "/", reason: "" });
  const [dismissedKey, setDismissedKey] = useState(null);

  const close = useCallback(() => setActive(null), []);

  const value = useMemo(
    () => ({
      openEmergency: () => setActive("emergency"),
      openSignIn: (from, reason = "") => {
        setSignIn({ from, reason });
        setActive("signin");
      },
      close,
    }),
    [close]
  );

  // pop-up requested by a redirect (shown once per visit to that page)
  const routeFrom = location.state?.signInFrom;
  const routeSignInOpen = Boolean(routeFrom) && dismissedKey !== location.key;

  const signInOpen = active === "signin" || routeSignInOpen;

  const closeSignIn = () => {
    if (routeSignInOpen) setDismissedKey(location.key);
    setActive(null);
  };

  return (
    <ModalContext.Provider value={value}>
      {children}

      {/* guests only; not while a stored login is still being checked, or the pop-up would
          open for a visitor who turns out to be logged in and then vanish */}
      <EmergencyReportModal
        isOpen={active === "emergency" && !isLoggedIn && !loading}
        onClose={close}
      />

      <SignInModal
        isOpen={signInOpen}
        onClose={closeSignIn}
        from={routeSignInOpen ? routeFrom : signIn.from}
        reason={routeSignInOpen ? location.state?.signInReason : signIn.reason}
      />
    </ModalContext.Provider>
  );
}
