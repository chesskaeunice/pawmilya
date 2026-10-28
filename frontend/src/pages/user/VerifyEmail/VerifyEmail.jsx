import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../../hooks/useAuth.js";
import { formatApiError, resendEmailCodeRequest } from "../../../services/authService.js";
import { FormError } from "../../../components/common/FieldError.jsx";
import AuthBackButton from "../../../components/common/AuthBackButton.jsx";

import "../Login/Login.css";
import "./VerifyEmail.css";

const CODE_LENGTH = 6;
const EXPIRES_SECONDS = 10 * 60; // same as the server: a code lasts 10 minutes
const RESEND_SECONDS = 60;

const clock = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

// Step after Sign Up (and after a Log In by an unverified account): the 6-digit code from the email
function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const boxes = useRef([]);

  // Both countdowns run from the moment a code was sent
  const [now, setNow] = useState(() => Date.now());
  const [sentAt, setSentAt] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!email) return <Navigate to="/login" replace />;

  const elapsed = Math.floor((now - sentAt) / 1000);
  const expiresIn = Math.max(0, EXPIRES_SECONDS - elapsed);
  const resendIn = Math.max(0, RESEND_SECONDS - elapsed);
  const code = digits.join("");

  const setDigit = (index, value) => {
    setDigits((current) => current.map((digit, i) => (i === index ? value : digit)));
    setError("");
  };

  const handleChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, "").slice(-1);
    setDigit(index, value);
    if (value && index < CODE_LENGTH - 1) boxes.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      boxes.current[index - 1]?.focus();
    }
  };

  // Pasting the whole code fills every box
  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;

    event.preventDefault();
    setDigits(Array.from({ length: CODE_LENGTH }, (_, i) => pasted[i] ?? ""));
    setError("");
    boxes.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (code.length < CODE_LENGTH) {
      setError("Enter all 6 digits of the code.");
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await verifyEmail(email, code);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      const { message, fields } = formatApiError(err);
      setError(fields.code || message);
      setDigits(Array(CODE_LENGTH).fill(""));
      boxes.current[0]?.focus();
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || resending) return;

    setResending(true);
    setError("");

    try {
      await resendEmailCodeRequest(email);
      setSentAt(Date.now());
      setNow(Date.now());
      setDigits(Array(CODE_LENGTH).fill(""));
      setNotice("A new code is on its way. Check your inbox.");
      boxes.current[0]?.focus();
    } catch (err) {
      setError(formatApiError(err).message);
    }
    setResending(false);
  };

  return (
    <div className="login">
      <AuthBackButton />

      <section className="verify">
        <div className="login__card">
          <div className="login__card-header">
            <p className="login__eyebrow">Almost there</p>
            <h2>Verify your email</h2>
            <p>
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below to finish.
            </p>
          </div>

          <form className="login__form" onSubmit={handleSubmit} noValidate>
            {notice && !error && <p className="login__notice" role="status">{notice}</p>}

            <FormError message={error} />

            <div className="verify__boxes" onPaste={handlePaste}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    boxes.current[index] = element;
                  }}
                  className="verify__box"
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleChange(index, event)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onFocus={(event) => event.target.select()}
                  aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                  aria-invalid={Boolean(error)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <p className="verify__timer" aria-live="polite">
              {expiresIn > 0
                ? `The code expires in ${clock(expiresIn)}.`
                : "This code has expired. Request a new one."}
            </p>

            <button type="submit" className="login__submit" disabled={submitting || expiresIn === 0}>
              {submitting ? "Verifying..." : "Verify email"}
            </button>
          </form>

          <p className="login__signup-text">
            Did not get it?{" "}
            <button
              type="button"
              className="verify__resend"
              onClick={handleResend}
              disabled={resendIn > 0 || resending}
            >
              {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
            </button>
          </p>

          <p className="login__signup-text">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default VerifyEmail;
