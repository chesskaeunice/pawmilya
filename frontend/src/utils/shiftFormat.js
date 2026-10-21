// "14:00" -> "2:00 PM"
export function formatTime(hhmm) {
  if (!hhmm) return "";

  const [hours, minutes] = hhmm.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";

  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

// "06:00", "14:00" -> "6:00 AM - 2:00 PM" (an overnight shift gets "(next day)")
export function formatShiftTime(shift) {
  const range = `${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`;
  return shift.isOvernight ? `${range} (next day)` : range;
}

// "2026-10-21" -> "Wed, Oct 21"
export function formatDay(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ISO timestamp -> "9:41 AM"
export function formatClock(iso) {
  return iso
    ? new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "";
}

// Local date as YYYY-MM-DD
export function toISODate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const SHIFT_STATUS_CLASS = {
  pending: "staff-status--pending",
  active: "staff-status--available",
  completed: "staff-status--approved",
};
