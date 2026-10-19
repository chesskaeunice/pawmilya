const applications = [
  {
    id: 1,

    /* =====================================
       SELECTED PET
    ====================================== */

    petId: 1,
    petName: "Milo",
    petType: "Dog",
    petBreed: "Mixed Breed",
    petAge: "3 years old",
    petSex: "Male",
    petLocation: "Main Shelter",
    petImage: null,

    petPersonality: [
      "Friendly",
      "Playful",
    ],


    /* =====================================
       PERSONAL INFORMATION
    ====================================== */

    firstName: "Maria",
    lastName: "Santos",
    applicantName: "Maria Santos",

    address:
      "142 Pine Street, San Francisco",

    phone:
      "0917 555 0187",

    email:
      "maria@email.com",

    birthDate:
      "1999-05-14",

    occupation:
      "Employed",

    company:
      "Sample Company",

    socialMedia:
      "https://facebook.com/maria.sample",

    civilStatus:
      "Single",

    pronouns:
      "She/her",

    prompt:
      "Social Media",

    adoptedBefore:
      "No",


    /* =====================================
       VALID ID
    ====================================== */

    validId: {
      name:
        "maria-national-id.jpg",

      url: null,
    },

    idVerificationStatus:
      "Pending Verification",


    /* =====================================
       HOME AND PET EXPERIENCE
    ====================================== */

    residence:
      "House",

    householdMembers:
      4,

    hasPets:
      "Yes",

    petCount:
      2,

    petExperience:
      "Experienced pet owner",


    /* =====================================
       HOME PHOTOS
    ====================================== */

    homePhotos: [
      {
        name:
          "maria-home-collage-1.jpg",

        url: null,
      },
      {
        name:
          "maria-home-collage-2.jpg",

        url: null,
      },
    ],


    /* =====================================
       ADOPTION QUESTIONS
    ====================================== */

    whyAdopt:
      "I have been looking for a loving companion for our family and believe Milo would be a good fit.",

    howCare:
      "Milo will stay inside our home and will receive proper food, exercise, vaccination, and veterinary care.",


    /* =====================================
       TERMS
    ====================================== */

    termsAccepted:
      true,


    /* =====================================
       APPLICATION METADATA
    ====================================== */

    date:
      "Sep 27, 2026",

    status:
      "Pending",

    rejectionReason:
      "",
  },


  {
    id: 2,

    /* PET */

    petId: 2,
    petName: "Luna",
    petType: "Cat",
    petBreed: "Domestic Shorthair",
    petAge: "1 year old",
    petSex: "Female",
    petLocation: "Main Shelter",
    petImage: null,

    petPersonality: [
      "Calm",
      "Affectionate",
    ],


    /* PERSONAL INFORMATION */

    firstName: "John",
    lastName: "Reyes",
    applicantName: "John Reyes",

    address:
      "Quezon City",

    phone:
      "0918 222 0192",

    email:
      "john@email.com",

    birthDate:
      "1996-03-22",

    occupation:
      "Employed",

    company:
      "Sample Tech",

    socialMedia:
      "https://facebook.com/john.sample",

    civilStatus:
      "Single",

    pronouns:
      "He/him",

    prompt:
      "Website",

    adoptedBefore:
      "No",


    /* VALID ID */

    validId: {
      name:
        "john-drivers-license.jpg",

      url: null,
    },

    idVerificationStatus:
      "Verified",


    /* HOME AND PET EXPERIENCE */

    residence:
      "Apartment / Condominium",

    householdMembers:
      2,

    hasPets:
      "No",

    petCount:
      0,

    petExperience:
      "Some experience",


    /* HOME PHOTOS */

    homePhotos: [
      {
        name:
          "john-home-collage.jpg",

        url: null,
      },
    ],


    /* QUESTIONS */

    whyAdopt:
      "I would like to provide Luna with a permanent and safe home.",

    howCare:
      "She will live indoors and receive proper food, enrichment, and regular veterinary care.",


    /* TERMS */

    termsAccepted:
      true,


    /* APPLICATION */

    date:
      "Sep 25, 2026",

    status:
      "Approved",

    rejectionReason:
      "",
  },


  {
    id: 3,

    /* PET */

    petId: 3,
    petName: "Buddy",
    petType: "Dog",
    petBreed: "Aspin Mix",
    petAge: "2 years old",
    petSex: "Male",
    petLocation:
      "North Holding Area",

    petImage:
      null,

    petPersonality: [
      "Energetic",
      "Friendly",
    ],


    /* PERSONAL INFORMATION */

    firstName:
      "Ana",

    lastName:
      "Cruz",

    applicantName:
      "Ana Cruz",

    address:
      "Makati City",

    phone:
      "0919 333 8821",

    email:
      "ana@email.com",

    birthDate:
      "2001-07-09",

    occupation:
      "Self-Employed",

    company:
      "Ana's Online Shop",

    socialMedia:
      "https://facebook.com/ana.sample",

    civilStatus:
      "Single",

    pronouns:
      "She/her",

    prompt:
      "Friends",

    adoptedBefore:
      "No",


    /* VALID ID */

    validId: {
      name:
        "ana-passport.jpg",

      url: null,
    },

    idVerificationStatus:
      "Verified",


    /* HOME AND PET EXPERIENCE */

    residence:
      "Apartment / Condominium",

    householdMembers:
      3,

    hasPets:
      "Yes",

    petCount:
      1,

    petExperience:
      "Experienced pet owner",


    /* HOME PHOTOS */

    homePhotos: [
      {
        name:
          "ana-home-collage-1.jpg",

        url: null,
      },
      {
        name:
          "ana-home-collage-2.jpg",

        url: null,
      },
    ],


    /* QUESTIONS */

    whyAdopt:
      "I would like another companion for our current dog.",

    howCare:
      "Buddy will receive daily exercise, proper food, regular veterinary care, and will live safely inside our home.",


    /* TERMS */

    termsAccepted:
      true,


    /* APPLICATION */

    date:
      "Sep 23, 2026",

    status:
      "Rejected",

    rejectionReason:
      "The current living arrangement did not meet the required space and home-safety requirements.",
  },
];


export default applications;