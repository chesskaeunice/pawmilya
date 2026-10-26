// Laravel reports "Passwords do not match." on `password`; show it under Confirm Password
export function moveConfirmationError(fields) {
  if (!/match/i.test(fields.password ?? "")) return fields;

  const { password, ...rest } = fields;
  return { ...rest, password_confirmation: password };
}
