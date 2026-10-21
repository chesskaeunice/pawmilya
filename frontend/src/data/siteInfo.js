// Fixed site info. Contact details, donation QR, About text and the in-kind wishlist
// are edited by staff in Settings and come from /api/public/site-info (hooks/useSiteInfo.js).
export const siteInfo = {
  brandName: "PAWmilya",
  tagline: "Rescue, reunite and rehome pets across the community.",

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
