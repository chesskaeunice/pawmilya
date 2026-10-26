// Service area: Quiapo, Manila only. Used by the "last seen" location fields.

export const CITY = "Manila";
export const DISTRICT = "Quiapo";

// Streets and landmarks in and around Quiapo. These are only suggestions:
// people may type any street or landmark.
// (Carlos Palanca Street was formerly Calle Echague.)
export const QUIAPO_STREETS = [
  "Arlegui Street",
  "Bautista Street",
  "Bilibid Viejo Street",
  "Carlos Palanca Street",
  "Evangelista Street",
  "Globo de Oro Street",
  "Gonzalo Puyat Street",
  "Guzman Street",
  "Hidalgo Street",
  "Nepomuceno Street",
  "Plaza del Carmen",
  "Plaza Miranda",
  "Quezon Boulevard",
  "Recto Avenue",
  "Rizal Avenue",
  "Villalobos Street",
];

// The 16 barangays of Quiapo (Zone 30: 306-309, Zone 39: 383-388, Zone 40: 389-394).
// Manila barangays are numbered, they have no names.
export const QUIAPO_BARANGAYS = [
  ...[306, 307, 308, 309],
  ...[383, 384, 385, 386, 387, 388],
  ...[389, 390, 391, 392, 393, 394],
].map((number) => `Barangay ${number}`);

export const isQuiapoBarangay = (value) => QUIAPO_BARANGAYS.includes(value);

// One string for the API: "{street}, {barangay}, Quiapo, Manila"
export const formatQuiapoLocation = (street, barangay) =>
  [street.trim(), barangay.trim(), DISTRICT, CITY].join(", ");
