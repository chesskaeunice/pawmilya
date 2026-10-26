// Text shown for a missing pet report status. Display only: the stored status and every
// filter / API value stay "Rescued".
export function reportStatusLabel(status) {
  return status === "Rescued" ? "Rescued · In Pound" : status;
}
