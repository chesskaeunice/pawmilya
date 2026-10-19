// Example output: "Oct 18, 2026 • 01:47 AM"
export function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} • ${timePart}`;
}

// Example output: "Oct 18, 2026"
export function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
