import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import useAuth from "../../../hooks/useAuth.js";
import {
  forgotPasswordRequest,
  formatApiError,
  resetPasswordRequest,
} from "../../../services/authService.js";
import { PasswordHelp, PasswordInput } from "../../../components/user/PasswordInput.jsx";
import FieldError, { FormError } from "../../../components/common/FieldError.jsx";
import { moveConfirmationError } from "../../../utils/formErrors.js";

import "../Login/Login.css";
import "./PasswordPages.css";
import BackButton from "../../../components/common/BackButton.jsx";

// Shared card (reuses the Login styles)
function Card({ title, intro, children }) {
  return (
    <div className="login">
      <section className="pwpage">
      <BackButton fallback="/login" />

        <div className="login__card">
          <div className="login__card-header">
            <p className="login__eyebrow">Account</p>
            <h2>{title}</h2>
            <p>{intro}</p>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ sent: false, error: "", emailError: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await forgotPasswordRequest(email.trim().toLowerCase());
      setStatus({ sent: true, error: "", emailError: "" });
    } catch (err) {
      const { message, fields } = formatApiError(err);
      setStatus({ sent: false, error: fields.email ? "" : message, emailError: fields.email ?? "" });
    }
    setSubmitting(false);
  };

  return (
    <Card title="Forgot Password" intro="Enter your email and we will send you a reset link.">
      {status.sent ? (
        <p className="pwpage__done" role="status">
          If that email has an account, a reset link has been sent. It is valid for 60 minutes.
        </p>
      ) : (
        <form className="login__form" onSubmit={handleSubmit} noValidate>
          <FormError message={status.error} />

          <div className="login__field">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setStatus((current) => ({ ...current, error: "", emailError: "" }));
              }}
              placeholder="name@email.com"
              aria-invalid={Boolean(status.emailError)}
              aria-describedby="email-error"
            />
            <FieldError id="email-error" message={status.emailError} />
          </div>

          <button type="submit" className="login__submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="login__signup-text"><Link to="/login">Back to Login</Link></p>
    </Card>
  );
}

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // typing in a field clears its error
  const clearError = (...keys) =>
    setErrors((current) => {
      const next = { ...current };
      keys.forEach((key) => delete next[key]);
      return next;
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      await resetPasswordRequest({ token, email, password, password_confirmation: confirmation });
      navigate("/login", { replace: true, state: { notice: "Password reset. You can log in now." } });
    } catch (err) {
      const { message, fields } = formatApiError(err);
      setErrors(Object.keys(fields).length ? moveConfirmationError(fields) : { email: message });
      setSubmitting(false);
    }
  };

  return (
    <Card title="Reset Password" intro={`Choose a new password for ${email || "your account"}.`}>
      <form className="login__form" onSubmit={handleSubmit} noValidate>
        <FormError message={errors.email} />

        <div className="login__field">
          <label htmlFor="password">New Password</label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearError("password", "password_confirmation");
            }}
            invalid={Boolean(errors.password)}
            describedBy="password-error"
          />
          <FieldError id="password-error" message={errors.password} />
          <PasswordHelp password={password} context={{ email }} />
        </div>

        <div className="login__field">
          <label htmlFor="confirmation">Confirm New Password</label>
          <PasswordInput
            id="confirmation"
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              clearError("password_confirmation");
            }}
            invalid={Boolean(errors.password_confirmation)}
            describedBy="confirmation-error"
          />
          <FieldError id="confirmation-error" message={errors.password_confirmation} />
        </div>

        <button type="submit" className="login__submit" disabled={submitting || !token}>
          {submitting ? "Saving..." : "Reset Password"}
        </button>
      </form>
    </Card>
  );
}

// Also the forced screen for staff accounts that still have a temporary password
export function ChangePassword() {
  const { user, loading, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ current: "", password: "", confirmation: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // typing in a field clears its error (and the ones that depend on it)
  const update = (key, ...errorKeys) => (event) => {
    setForm({ ...form, [key]: event.target.value });
    setErrors((current) => {
      const next = { ...current };
      errorKeys.forEach((errorKey) => delete next[errorKey]);
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      await changePassword({
        current_password: form.current,
        password: form.password,
        password_confirmation: form.confirmation,
      });
      navigate(user.role === "citizen" ? "/" : "/admin", { replace: true });
    } catch (err) {
      const { message, fields } = formatApiError(err);
      setErrors(Object.keys(fields).length ? moveConfirmationError(fields) : { form: message });
      setSubmitting(false);
    }
  };

  return (
    <Card
      title="Change Password"
      intro={user.mustChangePassword ? "Your account has a temporary password. Set your own to continue." : "Choose a new password."}
    >
      <form className="login__form" onSubmit={handleSubmit} noValidate>
        <FormError message={errors.form} />

        <div className="login__field">
          <label htmlFor="current">Current Password</label>
          <PasswordInput
            id="current"
            autoComplete="current-password"
            required
            value={form.current}
            onChange={update("current", "current_password")}
            invalid={Boolean(errors.current_password)}
            describedBy="current-error"
          />
          <FieldError id="current-error" message={errors.current_password} />
        </div>

        <div className="login__field">
          <label htmlFor="password">New Password</label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={update("password", "password", "password_confirmation")}
            invalid={Boolean(errors.password)}
            describedBy="password-error"
          />
          <FieldError id="password-error" message={errors.password} />
          <PasswordHelp password={form.password} context={{ email: user.email, name: user.name }} />
        </div>

        <div className="login__field">
          <label htmlFor="confirmation">Confirm New Password</label>
          <PasswordInput
            id="confirmation"
            autoComplete="new-password"
            required
            value={form.confirmation}
            onChange={update("confirmation", "password_confirmation")}
            invalid={Boolean(errors.password_confirmation)}
            describedBy="confirmation-error"
          />
          <FieldError id="confirmation-error" message={errors.password_confirmation} />
        </div>

        <button type="submit" className="login__submit" disabled={submitting}>
          {submitting ? "Saving..." : "Change Password"}
        </button>
      </form>

      {user.mustChangePassword && (
        <p className="login__signup-text">
          <button type="button" className="login__forgot" onClick={logout}>Log out</button>
        </p>
      )}
    </Card>
  );
}
