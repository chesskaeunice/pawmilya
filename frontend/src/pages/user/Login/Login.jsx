import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../../hooks/useAuth.js";
import { PasswordInput } from "../../../components/user/PasswordInput.jsx";
import { formatApiError } from "../../../services/authService.js";
import { CITIZEN } from "../../../config/rolePermissions.js";

import "./Login.css";
import BackButton from "../../../components/common/BackButton.jsx";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Staff go to the admin area; citizens go back to the page they came from
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setError("");
    setSubmitting(true);

    try {
      // Email is trimmed and lowercased; the password is sent exactly as typed
      const user = await login(String(form.get("email")).trim().toLowerCase(), form.get("password"));
      const home = user.mustChangePassword
        ? "/change-password"
        : user.role === CITIZEN ? location.state?.from || "/" : "/admin";
      navigate(home, { replace: true });
    } catch (err) {
      const { message, fields } = formatApiError(err);
      setError(fields.email || message);
      setSubmitting(false);
    }
  };

  return (
    <div className="login">
      <section className="login__container">

        <div className="login__intro">
      <BackButton fallback="/" />

          <p className="login__eyebrow">
            Welcome Back
          </p>

          <h1>
            Continue your PAWmilya journey.
          </h1>

          <p className="login__description">
            Sign in to view your adoption applications,
            manage your reports, and keep your account
            information updated.
          </p>

          <div className="login__image-placeholder">
          </div>    
        </div>


        <div className="login__card">

          <div className="login__card-header">
            <p className="login__eyebrow">
              Account
            </p>

            <h2>Login</h2>

            <p>
              Enter your email address and password.
            </p>
          </div>


          <form className="login__form" onSubmit={handleSubmit}>

            {location.state?.notice && !error && (
              <p className="login__notice" role="status">{location.state.notice}</p>
            )}

            {error && (
              <p className="login__error" role="alert">
                {error}
              </p>
            )}

            <div className="login__field">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                type="email"
                id="email"
                name="email"
                autoComplete="username"
                required
                placeholder="name@email.com"
              />
            </div>


            <div className="login__field">
              <label htmlFor="password">
                Password
              </label>

              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
              />
            </div>


            <div className="login__options">

              <label className="login__remember">
                <input type="checkbox" />

                <span>
                  Remember me
                </span>
              </label>


              <Link to="/forgot-password" className="login__forgot">
                Forgot Password?
              </Link>

            </div>


            <button
              type="submit"
              className="login__submit"
              disabled={submitting}
            >
              {submitting ? "Logging in..." : "Login"}
            </button>

          </form>


          <p className="login__signup-text">
            Don't have an account?

            <Link to="/signup">
              Sign Up
            </Link>
          </p>

        </div>

      </section>
    </div>
  );
}

export default Login;