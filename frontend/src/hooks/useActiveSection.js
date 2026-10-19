import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Returns the id of the header link that should be highlighted.
// On "/" it follows the scroll position; on other pages it follows the route.
function useActiveSection(sectionIds) {
  const { pathname } = useLocation();
  const [scrollActive, setScrollActive] = useState("home");

  useEffect(() => {
    if (pathname !== "/") return undefined;

    const visible = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible.set(entry.target.id, entry.isIntersecting);
        });

        // Last visible section in page order wins
        const current = sectionIds.filter((id) => visible.get(id)).pop();
        if (current) setScrollActive(current);
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pathname, sectionIds]);

  if (pathname === "/") return scrollActive;
  if (pathname.startsWith("/adoptable-pets")) return "adoptable-pets";
  if (pathname.startsWith("/missing-pets")) return "missing-pets";
  if (pathname.startsWith("/my-applications")) return "my-applications";
  return null;
}

export default useActiveSection;
