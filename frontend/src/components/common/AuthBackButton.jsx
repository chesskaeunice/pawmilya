import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import "./AuthBackButton.css";

// Round arrow button for the Log In and Sign Up pages (the pill BackButton is for the other pages).
// Goes back when the visitor came from inside the site, otherwise to the Home page.
// inline: sits just above the welcome text (inside its column) instead of in the page's top padding
function AuthBackButton({ inline = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <button
      type="button"
      className={inline ? "auth-back auth-back--intro" : "auth-back"}
      onClick={handleClick}
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft size={20} aria-hidden="true" />
    </button>
  );
}

export default AuthBackButton;
