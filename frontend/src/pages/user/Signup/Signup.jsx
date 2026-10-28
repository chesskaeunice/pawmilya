import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../../../hooks/useAuth.js";
import { PasswordHelp, PasswordInput } from "../../../components/user/PasswordInput.jsx";
import FieldError, { FormError } from "../../../components/common/FieldError.jsx";
import { moveConfirmationError } from "../../../utils/formErrors.js";
import { formatApiError } from "../../../services/authService.js";
import AuthBackButton from "../../../components/common/AuthBackButton.jsx";
import { loginPlaceholder } from "../../../assets/images/placeholders/index.js";

import "./Signup.css";

function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // the password help is only open while this field is being used
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", password: "" });

  const clearError = (...keys) =>
    setErrors((current) => {
      const next = { ...current };
      keys.forEach((key) => delete next[key]);
      return next;
    });

  // typing in a field clears that field's error (red border and message go away)
  const track = (key, ...errorKeys) => (event) => {
    setValues({ ...values, [key]: event.target.value });
    clearError(...errorKeys);
  };

  // Creates a citizen account and logs in
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setErrors({});
    setFormError("");
    setSubmitting(true);

    try {
      const created = await register({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: form.get("phone").trim(),
        password: form.get("password"),
        password_confirmation: form.get("confirmPassword"),
        terms: form.get("terms") === "on",
      });
      // the account exists but is not verified: the next step is the emailed code
      navigate("/verify-email", { replace: true, state: { email: created.email } });
    } catch (err) {
      const { message, fields } = formatApiError(err);
      setErrors(moveConfirmationError(fields));
      setFormError(Object.keys(fields).length ? "" : message);
      setSubmitting(false);
    }
  };

  return (
    <div className="signup">
      <section className="signup__container">

        <div className="signup__intro">
          <AuthBackButton inline />
          <p className="signup__eyebrow">
            Join PAWmilya
          </p>

          <h1>
            Create an account and stay connected.
          </h1>

          <p className="signup__description">
            Create a PAWmilya account to submit adoption applications,
            manage missing pet reports, and receive updates about your requests.
          </p>

          <div className="signup__image-placeholder">
            <img src={loginPlaceholder} alt="" />
          </div>
        </div>


        <div className="signup__card">

          <div className="signup__card-header">
            <p className="signup__eyebrow">
              Create Account
            </p>

            <h2>Sign Up</h2>

            <p>
              Enter your basic information to create a PAWmilya account.
            </p>
          </div>


          <form className="signup__form" onSubmit={handleSubmit} noValidate>

            <FormError message={formError} />

            <div className="signup__name-grid">

              <div className="signup__field">
                <label htmlFor="firstName">
                  First Name
                </label>

                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  maxLength={100}
                  value={values.firstName}
                  onChange={track("firstName", "first_name")}
                  aria-invalid={Boolean(errors.first_name)}
                  aria-describedby="firstName-error"
                  placeholder="Enter first name"
                />
                <FieldError id="firstName-error" message={errors.first_name} />
              </div>


              <div className="signup__field">
                <label htmlFor="lastName">
                  Last Name
                </label>

                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  maxLength={100}
                  value={values.lastName}
                  onChange={track("lastName", "last_name")}
                  aria-invalid={Boolean(errors.last_name)}
                  aria-describedby="lastName-error"
                  placeholder="Enter last name"
                />
                <FieldError id="lastName-error" message={errors.last_name} />
              </div>

            </div>


            <div className="signup__field">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                type="email"
                id="email"
                name="email"
                autoComplete="username"
                value={values.email}
                onChange={track("email", "email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby="email-error"
                placeholder="name@email.com"
              />
              <FieldError id="email-error" message={errors.email} />
            </div>


            <div className="signup__field">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                type="tel"
                id="phone"
                name="phone"
                autoComplete="tel"
                placeholder="09XX XXX XXXX"
                onChange={() => clearError("phone")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby="phone-error"
              />
              <FieldError id="phone-error" message={errors.phone} />
            </div>


            <div className="signup__name-grid">

              <div className="signup__field">
                <label htmlFor="password">
                  Password
                </label>

                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Enter password"
                  value={values.password}
                  onChange={track("password", "password", "password_confirmation")}
                  invalid={Boolean(errors.password)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  describedBy="password-error password-help"
                />
                <FieldError id="password-error" message={errors.password} />
              </div>


              <div className="signup__field">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  onChange={() => clearError("password_confirmation")}
                  invalid={Boolean(errors.password_confirmation)}
                  describedBy="confirmPassword-error"
                />
                <FieldError id="confirmPassword-error" message={errors.password_confirmation} />
              </div>

            </div>


            <PasswordHelp
              id="password-help"
              collapsible
              focused={passwordFocused}
              forceOpen={Boolean(errors.password)}
              password={values.password}
              context={{
                email: values.email,
                name: `${values.firstName} ${values.lastName}`,
              }}
            />


            <label className="signup__terms">

              <input
                type="checkbox"
                name="terms"
                onChange={() => clearError("terms")}
                aria-invalid={Boolean(errors.terms)}
                aria-describedby="terms-error"
              />

              <span>
                I agree to the{" "}
                {/* new tab, so the sign-up form is not lost; the click must not toggle the checkbox */}
                <a
                  href="/terms-of-service?from=signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  Terms of Use
                </a>{" "}
                and{" "}
                <a
                  href="/privacy-policy?from=signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                >
                  Privacy Policy
                </a>
                .
              </span>

            </label>
            <FieldError id="terms-error" message={errors.terms} />


            <button
              type="submit"
              className="signup__submit"
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>

          </form>


          <p className="signup__login-text">
            Already have an account?

            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </section>
    </div>
  );
}

export default Signup;