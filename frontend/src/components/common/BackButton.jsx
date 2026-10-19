import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import "./BackButton.css";

// Prominent "← Back". Goes back in history when the user came from inside the
// site; otherwise goes to `fallback`.
function BackButton({ fallback = "/", label = "Back" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.key !== "default") {
      navigate(-1);
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
