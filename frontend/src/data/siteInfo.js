// PLACEHOLDER CONTACT DETAILS - replace with the real ones before release.
// Everything marked PLACEHOLDER is NOT real information.
export const siteInfo = {
  brandName: "PAWmilya",
  tagline: "Rescue, reunite and rehome pets across the community.",

  contact: {
    address: "PLACEHOLDER: City Animal Pound, Street Name, Quezon City",
    phone: "PLACEHOLDER: (00) 0000-0000",
    email: "PLACEHOLDER: hello@example.com",
    hours: "PLACEHOLDER: Mon-Sat, 8:00 AM - 5:00 PM",
  },

  donation: {
    caption: "Scan to support our rescued pets",
    note: "PLACEHOLDER QR - swap the image file",
  },

  // Legal pages (content in data/legalPages.js)
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Adoption Policy", href: "/adoption-policy" },
  ],
};

// Landing page sections, in page order. Shared by header and footer.
export const sectionLinks = [
  { id: "home", label: "Home", path: "/" },
  { id: "adoptable-pets", label: "Adoptable Pets", path: "/adoptable-pets" },
  { id: "missing-pets", label: "Missing Pets", path: "/missing-pets" },
  { id: "about", label: "About Us", path: "/" },
];
