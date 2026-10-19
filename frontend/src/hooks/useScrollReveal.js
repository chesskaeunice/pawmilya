import { useEffect } from "react";

// Adds "reveal--visible" to every ".reveal" element once it scrolls into view.
// The CSS (landing-motion.css) only hides them when motion is allowed.
function useScrollReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".reveal"));

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("reveal--visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);
}

export default useScrollReveal;
