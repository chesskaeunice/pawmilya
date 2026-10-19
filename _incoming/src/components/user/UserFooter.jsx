import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { checkHealth } from "../../services/api";

function UserFooter() {
  // "checking" | "online" | "offline"
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  return (
    <footer className="user-footer">

      <div className="user-footer__container">

        <Link
          to="/"
          className="user-footer__brand"
        >

        </Link>


        <div className="user-footer__links">
          <a href="#">
            About
          </a>

          <a href="#">
            Contact
          </a>

          <a href="#">
            Privacy
          </a>
        </div>


        <p className="user-footer__copyright">
          © 2026 PAWmilya. All rights reserved.
        </p>

        <span className={`api-status api-status--${apiStatus}`}>
          <span className="api-status__dot" />
          API {apiStatus === "checking" ? "checking…" : apiStatus}
        </span>

      </div>

    </footer>
  );
}

export default UserFooter;