import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../../../hooks/useAuth.js";
import { FieldError, PasswordHelp, PasswordInput } from "../../../components/user/PasswordInput.jsx";
import { formatApiError } from "../../../services/authService.js";

import "./Signup.css";
import BackButton from "../../../components/common/BackButton.jsx";

function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", password: "" });

  const track = (key) => (event) => setValues({ ...values, [key]: event.target.value });

  // Creates a citizen account and logs in
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setErrors({});
    setFormError("");
    setSubmitting(true);

    try {
      await register({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: form.get("phone").trim(),
        password: form.get("password"),
        password_confirmation: form.get("confirmPassword"),
        terms: form.get("terms") === "on",
      });
      navigate("/", { replace: true });
    } catch (err) {
      const { message, fields } = formatApiError(err);
      setErrors(fields);
      setFormError(Object.keys(fields).length ? "" : message);
      setSubmitting(false);
    }
  };

  return (
    <div className="signup">
      <section className="signup__container">

        <div className="signup__intro">
      <BackButton fallback="/" />

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
            <span>Image Placeholder</span>
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


          <form className="signup__form" onSubmit={handleSubmit}>

            {formError && (
              <p className="signup__error" role="alert">{formError}</p>
            )}

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
                  onChange={track("firstName")}
                  placeholder="Enter first name"
                />
                <FieldError message={errors.first_name} />
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
                  onChange={track("lastName")}
                  placeholder="Enter last name"
                />
                <FieldError message={errors.last_name} />
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
                onChange={track("email")}
                placeholder="name@email.com"
              />
              <FieldError message={errors.email} />
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
              />
              <FieldError message={errors.phone} />
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
                  onChange={track("password")}
                />
                <FieldError message={errors.password} />
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
                />
              </div>

            </div>


            <PasswordHelp
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
              />

              <span>
                I agree to the Terms of Use and Privacy Policy.
              </span>

            </label>
            <FieldError message={errors.terms} />


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