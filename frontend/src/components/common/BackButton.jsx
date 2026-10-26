import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import "./BackButton.css";

// Prominent "← Back". Goes back in history when the user came from inside the
// site; otherwise goes to `fallback`. With `closeTab` (page opened in a new tab
// from another page) it closes the tab first, so the page below it, and any form
// on it, is still there; if the browser refuses to close it, it goes to `fallback`.
function BackButton({ fallback = "/", label = "Back", closeTab = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else if (closeTab) {
      window.close();
      // only runs when the tab is still open (the browser did not allow closing it)
      setTimeout(() => navigate(fallback), 200);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button type="button" className="back-button" onClick={handleClick}>
      <ArrowLeft size={18} aria-hidden="true" />
      {label}
    </button>
  );
}

export default BackButton;
