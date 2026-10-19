// Mock educational articles. Images come from the placeholder set
// (imageIndex 0-5); replace with real images later.
const articles = [
  {
    id: "animal-pounds-vs-shelters",
    title: "Understanding Animal Pounds vs. Shelters",
    tags: ["Adoption", "Pet Care"],
    excerpt:
      "Pounds and shelters are often confused. Learn what each one does and how they work together.",
    readingTime: "5 min read",
    dateAdded: "2026-10-12T09:00:00",
    imageIndex: 0,
    body: [
      "An animal pound is usually run by the local government. Its main job is to hold stray and roaming animals for a set period so their owners can claim them. Pounds also help the community by controlling stray populations and responding to reports.",
      "A shelter is usually run by a private group or a non-profit. Its focus is on caring for animals until they are adopted, including rescued, surrendered and abandoned pets. Many shelters rely on donations and volunteers.",
      "Both places want the same outcome: safe animals and happy homes. When a stray is picked up, the pound keeps it for the holding period. If no owner comes forward, the animal may be offered for adoption or transferred to a partner shelter.",
      "PAWmilya brings these steps into one place. You can look through adoptable pets, report a missing pet, and follow what happens next without having to visit several offices.",
    ],
  },
  {
    id: "found-a-stray-pet",
    title: "What to Do When You Find a Stray Pet",
    tags: ["Stray Pets", "Safety"],
    excerpt:
      "Found an animal on the street? These simple steps keep both you and the pet safe.",
    readingTime: "4 min read",
    dateAdded: "2026-10-10T09:00:00",
    imageIndex: 1,
    body: [
      "First, stay calm and approach slowly. A frightened animal may bite or run. Keep a safe distance if it looks injured or aggressive, and call the local animal pound for help.",
      "If the pet is friendly, check for a collar, tag or ID. Take clear photos and note exactly where you found it. This helps the owner recognize their pet later.",
      "Offer water and a quiet, safe space while you look for the owner. Avoid giving human food or medicine. Do not keep the animal without reporting it, because the owner may be searching.",
      "Post a Found report on PAWmilya with the photos, location and time. Owners can browse the Missing Pets page and contact you or the pound.",
    ],
  },
  {
    id: "responsible-pet-ownership",
    title: "Responsible Pet Ownership Guidelines",
    tags: ["Pet Care", "Responsibility"],
    excerpt:
      "From vaccines to registration, here is what every pet owner in the Philippines should know.",
    readingTime: "6 min read",
    dateAdded: "2026-10-08T09:00:00",
    imageIndex: 2,
    body: [
      "Owning a pet is a long-term promise. Give your pet clean water, balanced food, shelter, exercise and regular visits to a veterinarian.",
      "Philippine law expects owners to look after their animals. The Animal Welfare Act (RA 8485, as amended) protects animals from cruelty and neglect, and the Anti-Rabies Act (RA 9482) asks dog owners to have their pets vaccinated and registered.",
      "Keep your pet identifiable with a collar and tag, and consider a microchip. Keep gates secure and use a leash outdoors. Most lost pets are found faster when they carry contact details.",
      "If you can no longer care for your pet, contact a shelter or the pound instead of abandoning it. Rehoming responsibly keeps animals safe.",
    ],
  },
  {
    id: "preparing-home-for-adopted-pet",
    title: "Preparing Your Home for an Adopted Pet",
    tags: ["Adoption", "Home"],
    excerpt:
      "A few small preparations make the first weeks with your new pet calmer for everyone.",
    readingTime: "5 min read",
    dateAdded: "2026-10-05T09:00:00",
    imageIndex: 3,
    body: [
      "Before your pet arrives, set up a quiet corner with a bed, food and water bowls, and a few toys. Remove small objects, loose wires and plants that may be harmful.",
      "Give your new pet time. Many adopted animals need days or weeks to feel safe. Keep a regular schedule for meals, walks and rest to help them settle.",
      "Book a check-up with a veterinarian soon after adoption, and ask about vaccines, deworming and a spay or neuter plan if it has not been done.",
      "Be patient and kind. Training with rewards works better than punishment, and it builds trust.",
    ],
  },
  {
    id: "why-spay-and-neuter",
    title: "Why Spay and Neuter Matter",
    tags: ["Pet Health", "Community"],
    excerpt:
      "Spaying and neutering protects your pet's health and reduces the number of stray animals.",
    readingTime: "4 min read",
    dateAdded: "2026-10-02T09:00:00",
    imageIndex: 4,
    body: [
      "Spaying (for females) and neutering (for males) are common, safe procedures done by a veterinarian. They prevent unwanted litters, which are a major reason for stray animals.",
      "These procedures can also lower the risk of some illnesses and reduce roaming and fighting. Pets that stay home are less likely to get lost or hurt.",
      "Ask your local veterinarian or the city veterinary office about schedules and costs. Some local governments hold free or low-cost spay and neuter drives.",
    ],
  },
  {
    id: "searching-for-a-missing-pet",
    title: "How to Search for a Missing Pet",
    tags: ["Missing Pets", "Safety"],
    excerpt:
      "Act quickly with these steps to improve the chances of bringing your pet home.",
    readingTime: "5 min read",
    dateAdded: "2026-09-28T09:00:00",
    imageIndex: 5,
    body: [
      "Start searching right away around the place where your pet was last seen. Call their name, bring treats and check hiding spots such as under cars, in drains and in bushes.",
      "Report your pet on PAWmilya with a clear photo, the last seen location, the date and time, and your contact details. You can also contact the local animal pound.",
      "Tell your neighbors, security guards and barangay officials. Share posters and social media posts with a recent photo and a short description.",
      "Keep checking the Missing Pets page and the pound regularly. Many pets are found days after they went missing.",
    ],
  },
  {
    id: "typhoon-season-pet-safety",
    title: "Keeping Pets Safe During Typhoon Season",
    tags: ["Safety","Emergency"],
    excerpt:
      "Plan ahead so your pets stay safe when a typhoon or flood hits.",
    readingTime: "5 min read",
    dateAdded: "2026-09-24T09:00:00",
    imageIndex: 0,
    body: [
      "Typhoons and floods can happen quickly. Prepare a pet emergency kit with food, water, medicine, a leash or carrier, and copies of vaccination records.",
      "Know which evacuation centers accept pets. If you must leave home, take your pets with you instead of leaving them behind.",
      "Keep recent photos of your pets and make sure each one wears a collar with your contact number.",
    ],
  },
  {
    id: "rabies-vaccination-guide",
    title: "Understanding Rabies Vaccination for Dogs and Cats",
    tags: ["Pet Health","Responsibility"],
    excerpt:
      "Rabies is preventable. Here is when and why to vaccinate your pet.",
    readingTime: "4 min read",
    dateAdded: "2026-09-20T09:00:00",
    imageIndex: 1,
    body: [
      "Rabies is a serious disease that can spread from animals to people, but vaccination prevents it. Ask your veterinarian when your puppy or kitten should get the first shot.",
      "Dogs need regular boosters, and keeping the vaccination card safe helps when you register your pet or adopt.",
      "Many city and municipal veterinary offices hold free or low-cost vaccination drives. Check your local announcements.",
    ],
  },
  {
    id: "safe-and-unsafe-foods",
    title: "Feeding Your Pet: What Is Safe and What Is Not",
    tags: ["Pet Care","Nutrition"],
    excerpt:
      "Some human foods are harmful to pets. Learn which ones to avoid.",
    readingTime: "5 min read",
    dateAdded: "2026-09-16T09:00:00",
    imageIndex: 2,
    body: [
      "Chocolate, onions, garlic, grapes and raisins can be dangerous for dogs and cats. Cooked bones can splinter and cause injuries.",
      "Choose a complete pet food suited to your pet's age and size, and keep fresh water available at all times.",
      "If your pet eats something harmful, call your veterinarian right away instead of waiting for symptoms.",
    ],
  },
  {
    id: "introducing-a-new-pet",
    title: "Introducing a New Pet to Your Household",
    tags: ["Adoption","Home"],
    excerpt:
      "Help your current pets and your new family member get along.",
    readingTime: "4 min read",
    dateAdded: "2026-09-12T09:00:00",
    imageIndex: 3,
    body: [
      "Give each pet their own space at first. Let them smell each other's bedding before they meet face to face.",
      "Keep first meetings short and calm, and reward good behavior with treats and praise.",
      "Do not force friendships. Some pets need weeks to feel comfortable with each other.",
    ],
  },
];

export default articles;
