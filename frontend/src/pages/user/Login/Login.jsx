import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../../hooks/useAuth.js";
import { PasswordInput } from "../../../components/user/PasswordInput.jsx";
import FieldError, { FormError } from "../../../components/common/FieldError.jsx";
import { formatApiError } from "../../../services/authService.js";
import { CITIZEN } from "../../../config/rolePermissions.js";
import AuthBackButton from "../../../components/common/AuthBackButton.jsx";
import { loginPlaceholder } from "../../../assets/images/placeholders/index.js";

import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // typing in a field clears its error (and the form message)
  const clearError = (key) => {
    setErrors((current) => ({ ...current, [key]: undefined }));
    setFormError("");
  };

  // Staff go to the admin area; citizens go back to the page they came from
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setFormError("");
    setErrors({});
    setSubmitting(true);

    try {
      // Email is trimmed and lowercased; the password is sent exactly as typed
      const user = await login(String(form.get("email")).trim().toLowerCase(), form.get("password"));
      const home = user.mustChangePassword
        ? "/change-password"
        : user.role === CITIZEN ? location.state?.from || "/" : "/admin";
      navigate(home, { replace: true });
    } catch (err) {
      // the account exists but its email is not verified yet: go to the code step (a new code was sent)
      if (err.response?.status === 403 && err.response.data?.code === "email_not_verified") {
        navigate("/verify-email", {
          replace: true,
          state: { email: err.response.data.email, from: location.state?.from },
        });
        return;
      }

      const { message, fields } = formatApiError(err);

      if (fields.email && String(form.get("email")).trim()) {
        // a rejected email + password pair is about the whole form, not one field
        setFormError(fields.email);
      } else if (Object.keys(fields).length) {
        setErrors(fields);
      } else {
        setFormError(message);
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="login">
      <section className="login__container">

        <div className="login__intro">
          <AuthBackButton inline />
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
            <img src={loginPlaceholder} alt="" />
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


          <form className="login__form" onSubmit={handleSubmit} noValidate>

            {location.state?.notice && !error && (
              <p className="login__notice" role="status">{location.state.notice}</p>
            )}

            <FormError message={formError} />

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
                onChange={() => clearError("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby="email-error"
              />
              <FieldError id="email-error" message={errors.email} />
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
                onChange={() => clearError("password")}
                invalid={Boolean(errors.password)}
                describedBy="password-error"
              />
              <FieldError id="password-error" message={errors.password} />
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