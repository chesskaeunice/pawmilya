import { LOCAL_BREEDS, purebredBreeds } from "../config/petBreeds.js";

// The Breed field keeps ONE string (the API's `breed`), so no extra column is needed:
//   ""  (not given)   "Aspin" / "Puspin"   "Shih Tzu"   "Mixed Breed"   "Mixed Breed - Shih Tzu x Poodle"
// composeBreed() builds that string from the form state, parseBreed() turns a saved
// string back into the form state (so edit forms show the saved breed correctly).

// Breed type: Purebred, Mixed breed, or the local breed of the animal (Aspin for dogs, Puspin for cats)
export const KINDS = { PUREBRED: "purebred", MIXED: "mixed", LOCAL: "local" };
export const OTHER_CHOICE = "__other__";
const MIXED = "Mixed Breed";

// Dog and Cat have the full field; any other type (Others) only has a plain text input
export const hasBreedList = (petType) => petType === "Dog" || petType === "Cat";

// state: { kind, choice (purebred dropdown), other (text: the breed under "Others (specify)", or the mix) }
export function composeBreed({ kind, choice, other }, petType) {
  const text = (other ?? "").trim();

  if (!hasBreedList(petType)) return text;
  if (kind === KINDS.LOCAL) return LOCAL_BREEDS[petType];
  if (kind === KINDS.PUREBRED) return choice === OTHER_CHOICE ? text : choice;
  if (kind === KINDS.MIXED) return text ? `${MIXED} - ${text}` : MIXED;
  return "";
}

export function parseBreed(value, petType) {
  const saved = (value ?? "").trim();
  const empty = { kind: "", choice: "", other: "" };

  if (!saved) return empty;
  if (!hasBreedList(petType)) return { ...empty, other: saved };

  if (saved === LOCAL_BREEDS[petType]) return { ...empty, kind: KINDS.LOCAL };
  if (purebredBreeds(petType).includes(saved)) return { kind: KINDS.PUREBRED, choice: saved, other: "" };

  if (saved.startsWith(MIXED)) {
    // "Mixed Breed", "Mixed Breed - Shih Tzu x Poodle" (and a loose "Mixed Breed (Shih Tzu)")
    const mix = saved.slice(MIXED.length).replace(/^[\s\-:]+/, "");
    return { kind: KINDS.MIXED, choice: "", other: mix };
  }

  // anything else (also old values such as "Unidentified" or "Other / Unknown"):
  // Purebred > Others (specify), with the text filled in
  return { kind: KINDS.PUREBRED, choice: OTHER_CHOICE, other: saved };
}
