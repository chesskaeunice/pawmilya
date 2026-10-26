// Breed choices for the Report Missing Pet form, by pet type
export const BREEDS = {
  Dog: [
    "Aspin",
    "Shih Tzu",
    "Labrador Retriever",
    "Golden Retriever",
    "Poodle",
    "Pomeranian",
    "Beagle",
    "Siberian Husky",
    "Chihuahua",
    "German Shepherd",
    "Mixed Breed",
    "Other / Unknown",
  ],
  Cat: [
    "Puspin",
    "Persian",
    "Siamese",
    "Maine Coon",
    "Bengal",
    "British Shorthair",
    "Domestic Shorthair",
    "Domestic Longhair",
    "Mixed Breed",
    "Other / Unknown",
  ],
};

// The local breed of each type: its own option next to Purebred and Mixed breed
export const LOCAL_BREEDS = { Dog: "Aspin", Cat: "Puspin" };

// Entries of BREEDS that are not a purebred breed
const NOT_PUREBRED = ["Mixed Breed", "Other / Unknown"];

// Purebred choices for a type: BREEDS without the local breed and the generic entries
export const purebredBreeds = (type) =>
  (BREEDS[type] ?? []).filter((breed) => breed !== LOCAL_BREEDS[type] && !NOT_PUREBRED.includes(breed));
