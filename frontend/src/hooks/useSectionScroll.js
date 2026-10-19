import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OFFSET_MS = 60;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToId(id) {
  const element = document.getElementById(id);
  if (!element) return false;

  element.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  return true;
}

// Header link behavior:
//  - on "/"        -> smooth scroll to the section
//  - on other page -> go to "/#id"; the effect below scrolls after render
//  - section not on the page yet -> open its full page instead
export function useGoToSection() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return useCallback(
    (link) => {
      if (pathname === "/") {
        if (scrollToId(link.id)) {
          window.history.replaceState(null, "", `/#${link.id}`);
        } else if (link.path !== "/") {
          navigate(link.path);
        }
        return;
      }

      navigate(`/#${link.id}`);
    },
    [pathname, navigate]
  );
}

// Put once in the layout: scrolls to the hash after route changes,
// and to the top when opening any page without a hash.
export function useScrollOnNavigate() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return undefined;
    }

    const timer = setTimeout(
      () => scrollToId(hash.slice(1)),
      OFFSET_MS
    );
    return () => clearTimeout(timer);
  }, [pathname, hash]);
}
