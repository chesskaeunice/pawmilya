// Pet name for display. Reports may have no name (for example a found pet),
// so an empty or missing name shows as "Unnamed pet".
export const UNNAMED_PET = "Unnamed pet";

export function displayPetName(name) {
  return (typeof name === "string" && name.trim()) || UNNAMED_PET;
}
