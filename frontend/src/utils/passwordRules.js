// Mirrors the backend password policy (App\Support\PasswordRules) for live feedback

export function passwordChecks(password, { email = "", name = "" } = {}) {
  const lower = password.toLowerCase();
  const differs = [email, name]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .every((value) => value !== lower);

  return [
    { label: "At least 10 characters", ok: password.length >= 10 },
    { label: "Upper and lower case letters", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "At least one number", ok: /\d/.test(password) },
    { label: "At least one symbol", ok: /[^A-Za-z0-9]/.test(password) },
    { label: "Not the same as your email or name", ok: differs },
  ];
}

// 0 (empty) to 4 (strong): how many rules pass, with a bonus for length
export function passwordStrength(password, context) {
  if (!password) return 0;

  const passed = passwordChecks(password, context).filter((check) => check.ok).length;
  const score = passed - 1 + (password.length >= 14 ? 1 : 0);

  return Math.max(1, Math.min(4, score));
}

export const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
