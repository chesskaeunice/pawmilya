// Content for the Legal pages linked in the footer.
// DRAFT text for the PAWmilya school project: have it reviewed (for example by
// the city legal office) before the site is used for real.
// A section has a heading plus `paragraphs` and/or a bullet `list`.

export const LEGAL_UPDATED = "2026-10-18";

const legalPages = {
  "privacy-policy": {
    title: "Privacy Policy",
    intro:
      "This policy explains what information PAWmilya collects, why we collect it, and how we protect it. We follow the Data Privacy Act of 2012 (Republic Act No. 10173).",
    sections: [
      {
        heading: "Information we collect",
        list: [
          "Account details: your full name, email address and password (stored in protected form).",
          "Adoption applications: your contact details, address, a valid ID and proof of income, and your answers in the application form.",
          "Missing pet reports: photos of the pet and of the last seen area, the pet's details, the last seen location, date and time, and your name and contact number.",
          "Basic technical data, such as your browser type, used only to keep the website working and secure.",
        ],
      },
      {
        heading: "How we use your information",
        list: [
          "To review adoption applications and contact you about them.",
          "To publish missing pet reports and help reunite pets with their families.",
          "To send you updates about your requests.",
          "To keep records required for the operation of the animal pound.",
        ],
        paragraphs: [
          "We do not sell your personal information, and we do not use it for advertising.",
        ],
      },
      {
        heading: "Who can see your information",
        paragraphs: [
          "The pet's photos, details and last seen location in a missing pet report are shown publicly so the community can help. Your contact details are only seen by authorized pound staff, who use them to reach you.",
          "Adoption applications, IDs and proof of income are only seen by authorized pound staff and veterinary staff who review them.",
        ],
      },
      {
        heading: "How we keep it safe",
        paragraphs: [
          "Access to personal information is limited to staff who need it for their work. Accounts are protected by passwords, and uploaded documents are stored securely.",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "We keep your information only as long as needed for the purpose it was collected for, or as required by law. After that, it is deleted or made anonymous.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Under the Data Privacy Act, you have the right to be informed, to access your information, to ask us to correct it, to object to its processing, and to ask us to delete it. To use any of these rights, contact us using the details below.",
        ],
      },
    ],
  },

  "terms-of-service": {
    title: "Terms of Service",
    intro:
      "These terms explain the rules for using PAWmilya. By using the website, you agree to them.",
    sections: [
      {
        heading: "Using PAWmilya",
        paragraphs: [
          "PAWmilya helps the public browse adoptable pets, apply for adoption, report missing pets and learn about responsible pet care. Anyone can browse the website and report a missing pet. You need an account to apply for adoption.",
        ],
      },
      {
        heading: "Your account",
        list: [
          "Give true and complete information when you create your account.",
          "Keep your password private. You are responsible for what happens under your account.",
          "Tell us right away if you think someone else is using your account.",
        ],
      },
      {
        heading: "Reports and photos you submit",
        list: [
          "Only submit reports that are true to the best of your knowledge.",
          "Only upload photos that you took or that you have permission to use.",
          "Do not submit false, offensive or misleading reports. We may remove them and suspend the account involved.",
        ],
      },
      {
        heading: "Adoption applications",
        paragraphs: [
          "Submitting an application does not guarantee that it will be approved. The animal pound decides on each application based on the Adoption Policy and the welfare of the animal.",
        ],
      },
      {
        heading: "Acceptable use",
        paragraphs: [
          "Do not try to break, overload or gain unauthorized access to the website, and do not use it to harass other people or to sell animals.",
        ],
      },
      {
        heading: "Changes to these terms",
        paragraphs: [
          "We may update these terms from time to time. The date at the top of this page shows when they were last changed.",
        ],
      },
    ],
  },

  "adoption-policy": {
    title: "Adoption Policy",
    intro:
      "Every adoption should be a safe, lasting match for both the pet and the family. This policy explains who can adopt, how the process works, and what we expect from adopters.",
    sections: [
      {
        heading: "Who can adopt",
        list: [
          "Adopters must be at least 18 years old.",
          "Adopters must present a valid government-issued ID.",
          "Adopters must be able to provide food, shelter, veterinary care and a safe home for the pet.",
        ],
      },
      {
        heading: "How adoption works",
        list: [
          "Browse adoptable pets and choose a pet you would like to adopt.",
          "Log in and submit an adoption application with your valid ID and proof of income.",
          "Pound staff review your application and may contact you for an interview or a home check.",
          "If approved, you will be told when and where to pick up your new pet.",
        ],
      },
      {
        heading: "Fees",
        paragraphs: [
          "Any adoption fee is set by the local animal pound and will be explained to you before the pet is released.",
        ],
      },
      {
        heading: "Your responsibilities as an adopter",
        list: [
          "Keep your pet's vaccinations up to date, including the anti-rabies vaccine required under the Anti-Rabies Act of 2007 (Republic Act No. 9482), and register your pet as required by your local government.",
          "Treat your pet humanely, as required by the Animal Welfare Act (Republic Act No. 8485, as amended by Republic Act No. 10631).",
          "Never abandon your pet. If you can no longer care for it, contact the animal pound.",
        ],
      },
      {
        heading: "Our decision",
        paragraphs: [
          "The animal pound may approve or decline an application, or ask for more information, to protect the welfare of the animal. Approved adoptions may include a follow-up check after the pet goes home.",
        ],
      },
    ],
  },
};

export const legalOrder = ["privacy-policy", "terms-of-service", "adoption-policy"];

export default legalPages;
