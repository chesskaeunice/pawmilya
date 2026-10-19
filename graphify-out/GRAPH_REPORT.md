# Graph Report - Pawmilya-share  (2026-10-19)

## Corpus Check
- 117 files · ~103,671 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 756 nodes · 1368 edges · 63 communities (37 shown, 26 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 91 edges (avg confidence: 0.87)
- Token cost: 158,771 input · 0 output

## Community Hubs (Navigation)
- Landing, Articles & Legal Pages
- Admin Pages & Pet Data
- Shared UI, API & Role Context
- PoundCare Proposal Concepts
- Frontend Package & Tooling
- Project Docs & Architecture
- Auth Pages & User Routes
- Missing Pets & Status Help
- Search, Filters & Pagination
- Laravel User Model & Config
- Database Migrations
- Backend Node Tooling
- Admin Details Wireframes
- Laravel Routes & Bootstrap
- Login/Signup & Adopt Wireframes
- Staff Dashboard Wireframes
- Staff Reports Wireframe
- Composer Metadata
- Composer Scripts
- My Applications Wireframe
- Missing Pet Details Wireframe
- Staff Missing Reports Wireframe
- User Profile Wireframe
- PHP Dev Dependencies
- Staff Applications Wireframe
- Adoptable Pets Wireframe
- Report Missing Pet Wireframe
- Staff Vaccinations Wireframe
- Composer Config
- Staff Missing Pet Details
- Missing Pets List Wireframe
- App Service Provider
- PHP Runtime Dependencies
- Feature Test
- Oxlint Config
- PSR-4 Autoload
- Animal Profile Modal Wireframe
- Unit Test
- Users Admin Page
- Test Autoload
- Laravel Package Discovery
- Base Controller
- Adoptable Listing Feature
- Social Icon Sprite
- Other Pet Placeholder
- React Logo

## God Nodes (most connected - your core abstractions)
1. `react-router-dom` - 40 edges
2. `lucide-react` - 36 edges
3. `AppRoutes()` - 33 edges
4. `react` - 31 edges
5. `useRole()` - 15 edges
6. `AdminRoutes()` - 14 edges
7. `UserRoutes()` - 13 edges
8. `UserLayout()` - 12 edges
9. `pets` - 11 edges
10. `Home()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `API online/offline footer indicator` --references--> `api`  [INFERRED]
  CLAUDE.md → frontend/src/services/api.js
- `VITE_API_URL env variable` --shares_data_with--> `api`  [INFERRED]
  README.md → frontend/src/services/api.js
- `api` --shares_data_with--> `Sanctum Bearer token auth`  [INFERRED]
  frontend/src/services/api.js → CLAUDE.md
- `React + Vite frontend` --references--> `api`  [EXTRACTED]
  CLAUDE.md → frontend/src/services/api.js
- `React + Vite frontend` --conceptually_related_to--> `React + Vite template (HMR)`  [INFERRED]
  CLAUDE.md → frontend/README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Adoption Applications screen layout** — downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_225339_sidebar_navigation, downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_225339_top_bar_search, downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_225339_applications_table, downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_225339_pagination [EXTRACTED 0.95]
- **Profile form cards with Edit buttons** — wireframes_user_side_screenshot_2026_10_16_225148_personal_info_card, wireframes_user_side_screenshot_2026_10_16_225148_contact_details_card, wireframes_user_side_screenshot_2026_10_16_225148_password_security_card [EXTRACTED 1.00]
- **Adopt application screen layout (nav, form cards, footer)** — wireframes_user_side_screenshot_2026_10_16_224907_top_nav_bar, wireframes_user_side_screenshot_2026_10_16_225053_applicant_information_card, wireframes_user_side_screenshot_2026_10_16_225053_upload_photo_card, wireframes_user_side_screenshot_2026_10_16_225053_footer [EXTRACTED 1.00]
- **Adoption Application Review Layout** — wireframes_staff_side_screenshot_2026_10_16_225247_applicant_information_card, wireframes_staff_side_screenshot_2026_10_16_225247_application_form_answers, wireframes_staff_side_screenshot_2026_10_16_225247_documents_card, wireframes_staff_side_screenshot_2026_10_16_225247_review_actions_bar [EXTRACTED 1.00]
- **Missing Pet Report Form Sections** — wireframes_user_side_screenshot_2026_10_16_233417_pet_information_card, wireframes_user_side_screenshot_2026_10_16_233417_last_seen_card, wireframes_user_side_screenshot_2026_10_16_233417_upload_photo_card [EXTRACTED 1.00]
- **Missing Pets page layout sections** — wireframes_user_side_screenshot_2026_10_16_233409_navbar, wireframes_user_side_screenshot_2026_10_16_233409_hero_banner, wireframes_user_side_screenshot_2026_10_16_233409_search_filters, wireframes_user_side_screenshot_2026_10_16_233409_missing_pet_card_grid, wireframes_user_side_screenshot_2026_10_16_233409_footer [EXTRACTED 1.00]
- **Missing Pet Reports screen layout** — wireframes_staff_side_screenshot_2026_10_16_233047_sidebar_navigation, wireframes_staff_side_screenshot_2026_10_16_233047_filter_toolbar, wireframes_staff_side_screenshot_2026_10_16_233047_missing_pet_reports_table [EXTRACTED 1.00]
- **My Applications Screen Layout Sections** — wireframes_user_side_screenshot_2026_10_16_233431_top_navbar, wireframes_user_side_screenshot_2026_10_16_233431_hero_banner, wireframes_user_side_screenshot_2026_10_16_233431_status_filter_chips, wireframes_user_side_screenshot_2026_10_16_233431_application_card_list, wireframes_user_side_screenshot_2026_10_16_233431_footer [EXTRACTED 1.00]
- **PoundCare Tech Stack (React/Vite + Laravel/Sanctum + MySQL on Vercel/Aiven)** — proposal_documentation_react_frontend, proposal_documentation_laravel_backend, proposal_documentation_laravel_sanctum, proposal_documentation_mysql, proposal_documentation_vercel, proposal_documentation_aiven_mysql [EXTRACTED 1.00]
- **Reports screen analytics widgets** — downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233312_kpi_cards, downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233312_animals_by_status_donut, downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233312_animals_by_type_bars, downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233312_intake_vs_adoptions, downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233312_recent_activity [EXTRACTED 1.00]
- **Staff Dashboard Overview Widgets** — wireframes_staff_side_screenshot_2026_10_16_225228_summary_stat_cards, wireframes_staff_side_screenshot_2026_10_16_225228_recent_animal_records, wireframes_staff_side_screenshot_2026_10_16_225228_adoption_applications_panel, wireframes_staff_side_screenshot_2026_10_16_225228_missing_pet_reports_panel, wireframes_staff_side_screenshot_2026_10_16_225228_animals_by_status_chart, wireframes_staff_side_screenshot_2026_10_16_225228_recent_adoptions_gallery [EXTRACTED 1.00]
- **Missing Pet Detail Hero Layout** — wireframes_user_side_screenshot_2026_10_16_233426_pet_image_placeholder, wireframes_user_side_screenshot_2026_10_16_233426_help_find_me_card, wireframes_user_side_screenshot_2026_10_16_233426_hero_text, wireframes_user_side_screenshot_2026_10_16_233426_found_miming_cta [INFERRED 0.85]
- **Missing Pet Detail Page Layout** — c_users_anne_arbolente_downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233124_photo_gallery, c_users_anne_arbolente_downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233124_basic_information_card, c_users_anne_arbolente_downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233124_details_tabs [INFERRED 0.85]
- **Adoption browse flow: list, filter, card, details, apply** — downloads_poundcare_wireframes_user_side_screenshot_2026_10_16_225010_adoptable_pets_screen, downloads_poundcare_wireframes_user_side_screenshot_2026_10_16_225010_pet_card, downloads_poundcare_wireframes_user_side_screenshot_2026_10_16_225010_pet_details_screen, downloads_poundcare_wireframes_user_side_screenshot_2026_10_16_225010_apply_cta [INFERRED 0.85]
- **Adoption Application Workflow (apply, review, approve, status update)** — proposal_documentation_adoption_application_management, proposal_documentation_adoption_approval_rule, proposal_documentation_adoption_applications_table, proposal_documentation_status_management [INFERRED 0.85]
- **Auth screens sharing nav, hero panel and form card pattern** — wireframes_user_side_screenshot_2026_10_16_224907_login_wireframe, wireframes_user_side_screenshot_2026_10_16_224907_register_wireframe, wireframes_user_side_screenshot_2026_10_16_224907_top_nav_bar, wireframes_user_side_screenshot_2026_10_16_224907_hero_panel [INFERRED 0.85]
- **Missing Pet Report and Matching Flow** — proposal_documentation_lost_pet_owners, proposal_documentation_missing_pet_reporting, proposal_documentation_missing_pet_monitoring, proposal_documentation_missing_pet_table [INFERRED 0.85]
- **Staff Vaccinations Screen Layout** — wireframes_staff_side_screenshot_2026_10_16_233321_sidebar_navigation, wireframes_staff_side_screenshot_2026_10_16_233321_filter_toolbar, wireframes_staff_side_screenshot_2026_10_16_233321_vaccination_table, wireframes_staff_side_screenshot_2026_10_16_233321_pagination [INFERRED 0.85]
- **Token auth flow: Sanctum + Axios interceptor + AuthContext/ProtectedRoute** — claude_sanctum_token_auth, frontend_src_services_api_api, claude_authcontext, claude_protectedroute, claude_role_middleware [INFERRED 0.85]
- **API health check (footer indicator -> Axios -> /api/health)** — claude_api_health_indicator, frontend_src_services_api_api, claude_api_health_endpoint, claude_laravel_rest_api [INFERRED 0.85]
- **Sources of truth for building pages** — claude_proposal_documentation, claude_wireframes, claude_reference_ui, claude_change_requirements, claude_graphify_knowledge_graph [EXTRACTED 1.00]
- **Pet Photo Placeholders (dog/cat/other)** — frontend_src_assets_images_placeholders_pet_cat_cat_photo_placeholder, frontend_src_assets_images_placeholders_pet_dog_dog_photo_placeholder, frontend_src_assets_images_placeholders_pet_other_pet_photo_placeholder [INFERRED 0.85]
- **Article Image Placeholder Set** — frontend_src_assets_images_placeholders_article_1_article_image_1_placeholder, frontend_src_assets_images_placeholders_article_2_article_image_2_placeholder, frontend_src_assets_images_placeholders_article_3_article_image_3_placeholder, frontend_src_assets_images_placeholders_article_4_article_image_4_placeholder, frontend_src_assets_images_placeholders_article_5_article_image_5_placeholder, frontend_src_assets_images_placeholders_article_6_article_image_6_placeholder [INFERRED 0.85]
- **Default Vite + React Scaffold Assets** — frontend_public_favicon_vite_lightning_favicon, frontend_public_icons_social_icon_sprite, frontend_src_assets_react_react_logo, frontend_src_assets_vite_vite_logo [INFERRED 0.75]
- **User Pages Pet Photography Hero Banners** — frontend_src_assets_images_users_home_home_hero_home_hero_photo, frontend_src_assets_images_users_home_myapplications_hero_myapplications_hero_photo, frontend_src_assets_images_users_home_adoptablepets_hero_adoptablepets_hero_photo, frontend_src_assets_images_users_missing_pets_missing_pets_hero_missing_pets_hero_photo [INFERRED 0.85]

## Communities (63 total, 26 thin omitted)

### Community 0 - "Landing, Articles & Legal Pages"
Cohesion: 0.05
Nodes (43): About Us Image 1 Placeholder, About Us Image 2 Placeholder, Article Image 1 Placeholder, Article Image 2 Placeholder, Article Image 3 Placeholder, Article Image 4 Placeholder, Article Image 5 Placeholder, Article Image 6 Placeholder (+35 more)

### Community 1 - "Admin Pages & Pet Data"
Cohesion: 0.09
Nodes (41): AdminHeader(), AdminSidebar(), menuItems, AdminStatCard(), MockLoginHandler(), RequireSignIn(), applications, pets (+33 more)

### Community 2 - "Shared UI, API & Role Context"
Cohesion: 0.07
Nodes (41): Donation QR Code Placeholder, Donation via QR Payment, Modal(), SignInModal(), EmergencyButton(), EmergencyReportFlow(), EmergencyReportModal(), emptyForm (+33 more)

### Community 3 - "PoundCare Proposal Concepts"
Cohesion: 0.06
Nodes (46): Adoption Application Management Feature, Adoption_Applications Table (Pending/Under Review/Approved/Rejected), Aiven for MySQL (managed free tier), Animal Record Management Feature, Animals Table (animal_code, species, status enum), REST API Endpoints (/api/animals, /api/adoption-applications, /api/missing-pets, /api/dashboard, /api/reports), Audit_Logs Table, AuthContext (Context API: user, role, token) (+38 more)

### Community 4 - "Frontend Package & Tooling"
Cohesion: 0.05
Nodes (35): frontend index.html (Pawmilya), dependencies, axios, lucide-react, react, react-dom, react-router-dom, devDependencies (+27 more)

### Community 5 - "Project Docs & Architecture"
Cohesion: 0.08
Nodes (33): robots.txt (allow all crawlers), Eloquent ORM, Laravel framework (default README), Schema migrations, Adoption application (valid ID + proof of income uploads), /api/health endpoint, API online/offline footer indicator, AuthContext (planned) (+25 more)

### Community 6 - "Auth Pages & User Routes"
Cohesion: 0.10
Nodes (26): ImageDropzone(), AdoptionApplication(), AgreeCheckbox(), HOME_PHOTO_CHECKLIST, OCCUPATION_OPTIONS, PROMPT_OPTIONS, PRONOUN_OPTIONS, RadioGroup() (+18 more)

### Community 7 - "Missing Pets & Status Help"
Cohesion: 0.13
Nodes (20): Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset), Adoptable Pets Hero Photo (woman interacting with four dogs in a training/shelter room), Cat and Dog Companionship Imagery, Home Hero Photo (person holding two cream Labrador puppies outdoors), User Page Hero Banner Pattern (warm pet photography header), My Applications Hero Photo (two kittens and a puppy peeking over a white ledge), Missing Pets Hero Photo (orange kitten sleeping on a golden puppy), statuses (+12 more)

### Community 8 - "Search, Filters & Pagination"
Cohesion: 0.16
Nodes (18): ALL_FIELDS, FilterDropdown(), Pagination(), SearchBar(), ArticleCard(), AdoptablePets(), allPets, allArticles (+10 more)

### Community 9 - "Laravel User Model & Config"
Cohesion: 0.10
Nodes (3): User, UserFactory, DatabaseSeeder

### Community 10 - "Database Migrations"
Cohesion: 0.14
Nodes (9): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}(), {closure#3}() (+1 more)

### Community 11 - "Backend Node Tooling"
Cohesion: 0.10
Nodes (19): devDependencies, axios, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite, axios (+11 more)

### Community 12 - "Admin Details Wireframes"
Cohesion: 0.16
Nodes (16): Adoption Application Details Screen, Animal Details Screen (Bruno A-041), Animal Information Card (Luna) with View Animal Profile link, Animal Detail Tabs (About, Medical Records, Vaccinations, History), Applicant Information Card, Application Form Answers Card, Basic Information Card (status, type, breed, age, gender, date rescued, location), Behavior and Personality Tags / Ideal Home (+8 more)

### Community 13 - "Laravel Routes & Bootstrap"
Cohesion: 0.18
Nodes (3): {closure#1}(), {closure#2}(), GET /user()

### Community 14 - "Login/Signup & Adopt Wireframes"
Cohesion: 0.22
Nodes (13): My Applications (citizen section), Pet Adoption Application Flow, Continue with Google (social sign-in option), Left Hero Panel with Image Placeholder and Tagline 'Safer pets. Brighter tomorrows.', Log In Form Card (email, password, keep me logged in, forgot password, Log In, Continue with Google), PoundCare Login Wireframe, PoundCare Register (Sign Up) Wireframe, Sign Up Form Card (name, email, phone, password, confirm, terms checkbox, Create Account, Continue with Google) (+5 more)

### Community 15 - "Staff Dashboard Wireframes"
Cohesion: 0.19
Nodes (13): Adoption Applications Panel, Animals by Status Donut Chart, Animals Filters (search, type, status, sort) and Add Animal Button, Animals Management Screen, Animals Table with Pagination (ID, Photo, Name, Type, Status, Date Rescued, Actions), Global Search Bar and Staff Menu Header, Missing Pet Reports Panel, PoundCare Branding and Cream/Orange Palette (+5 more)

### Community 16 - "Staff Reports Wireframe"
Cohesion: 0.27
Nodes (10): Animals by Status Donut Chart, Animals by Type Horizontal Bar Chart (Dog, Cat, Rabbit, Bird, Others), Monthly Animal Intake vs. Adoptions Bar Chart, KPI Summary Cards (128 Total Animals, 34 Available, 12 Pending Applications, 12 Missing Pet Reports), Recent Activity Table (intake, adoption log with View All), Report Category Tabs (Animals, Adoptions, Missing Pets, Vaccinations), Staff Reports Screen (wireframe), Staff Sidebar Navigation (Dashboard, Animals, Adoption Applications, Missing Pets, Vaccinations, Reports, Settings) (+2 more)

### Community 17 - "Composer Metadata"
Cohesion: 0.22
Nodes (8): description, keywords, license, minimum-stability, name, prefer-stable, $schema, type

### Community 18 - "Composer Scripts"
Cohesion: 0.22
Nodes (9): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+1 more)

### Community 19 - "My Applications Wireframe"
Cohesion: 0.28
Nodes (9): Adoption Application Status Tracking, Application Card List (Buddy, Luna, Max), Footer (Socials, About, Contact), Hero Banner 'Your Adoption Applications' with puppies photo, My Applications (Adoption Applications) Screen, Application Status Badge (Pending, Under Review, Approved), Filter by Status Chips (All, Pending, Under Review, Approved, Rejected), Top Navigation Bar (Home, Adoptable Pets, My Applications, Missing Pets, My Missing Pet Reports, Profile) (+1 more)

### Community 20 - "Missing Pet Details Wireframe"
Cohesion: 0.28
Nodes (9): Missing Pets Section (nav item, active), Missing Pets Details Screen (citizen wireframe), Footer (Socials, About, Contact, copyright), Found Miming CTA Button, Help Find Me Card (Miming, 3 Years Old), Hero Headline 'Help Find Miming!' with last seen location, Top Navbar (Home, Adoptable Pets, My Applications, Missing Pets, My Missing Pet Reports, Profile, Login, Sign Up), Large Pet Photo Placeholder (+1 more)

### Community 21 - "Staff Missing Reports Wireframe"
Cohesion: 0.25
Nodes (9): Filter Toolbar (search, type, status, sort, Add Animal), Global Search Bar (animals, applications, reports), Missing Pet Reports Screen (Staff), Missing Pet Reports Table (Report ID, Photo, Pet name, Type, Last Seen, Date Reported, Status, Actions), Pagination Control, PoundCare Branding (Rescue Reunite Rehome), Sidebar Navigation (Dashboard, Animals, Adoption Applications, Missing Pets, Vaccinations, Reports, Settings), Staff User Menu (+1 more)

### Community 22 - "User Profile Wireframe"
Cohesion: 0.25
Nodes (8): Account Sidebar Menu (Account Information, My Activity, Notifications, Privacy & Preferences, Log Out), Contact Details Card (Email, Phone, Address), Footer (Socials, About, Contact), Password & Security Card, Personal Information Card (Full Name, Date of Birth, Preferred Contact Method), Top Navbar (Home, Adoptable Pets, My Applications, Missing Pets, My Missing Pet Reports, Profile, Login, Sign Up), User Account Screen (Profile), Welcome Back Hero Banner with pawsitive sticky note

### Community 23 - "PHP Dev Dependencies"
Cohesion: 0.25
Nodes (8): require-dev, fakerphp/faker, laravel/pail, laravel/pint, laravel/sail, mockery/mockery, nunomaduro/collision, phpunit/phpunit

### Community 24 - "Staff Applications Wireframe"
Cohesion: 0.25
Nodes (8): Staff Adoption Applications Screen (wireframe), Applications Table (ID, Applicant, Pet name, Type, Location, Date Submitted, Status, Actions), Export Application Button, Pagination Control (Showing 1-7 of 52), Staff Sidebar Navigation (Dashboard, Animals, Adoption Applications, Missing Pets, Vaccinations, Reports, Settings), Pending Status Badge, Top Bar Global Search and Staff Profile, PoundCare

### Community 25 - "Adoptable Pets Wireframe"
Cohesion: 0.39
Nodes (8): Adoptable Pets screen (hero banner, search, filters, pet card grid, pagination), Apply for Adoption and Ask a Question call-to-action buttons, Search and filter bar (keyword, type, location, time, clear filters), Footer (Socials, About, Contact, copyright), Pet card (photo, name, breed-age, personality tag, View Details link), Pet Details screen (Ready To Meet Milo, image carousel, Apply for Adoption), Wireframe: Adoptable Pets and Pet Details screens, Top navigation bar (Home, Adoptable Pets, My Applications, Missing Pets, My Missing Pet Reports, Profile, Login, Sign Up)

### Community 26 - "Report Missing Pet Wireframe"
Cohesion: 0.32
Nodes (8): Missing Pet Reporting Flow, Footer (Socials, About, Contact, copyright), Hero Banner 'Help Bring Pets Home', Last Seen Information Card (location, additional details), Top Navigation Bar (Home, Adoptable Pets, My Applications, Missing Pets, My Missing Pet Reports, Profile, Login, Sign Up), Pet Information Card (name, type, breed, color/markings, date last seen), Report Missing Pets Screen (citizen wireframe), Upload a Photo (Optional) Card with Submit Missing Pet Report button

### Community 27 - "Staff Vaccinations Wireframe"
Cohesion: 0.29
Nodes (8): Add Records Button, Vaccination Filter Toolbar (search, animal type, status, sort, Add Records), Global Search and Staff Profile Header, Pagination Control (Showing 1-7 of 52 animals), Staff Sidebar Navigation (Dashboard, Animals, Adoption Applications, Missing Pets, Vaccinations, Reports, Settings), Vaccination Status Badges (Up to date, Due Soon, Overdue), Vaccination Records Table (ID, Photo, Pet name, Type, Vaccine Type, Date Given, Next Due, Status, Actions), Staff Vaccinations Screen

### Community 28 - "Composer Config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 29 - "Staff Missing Pet Details"
Cohesion: 0.33
Nodes (7): Admin Sidebar Navigation (Dashboard, Animals, Adoption Applications, Missing Pets, Vaccinations, Reports, Settings), Basic Information Card (status, type, breed, age, gender, location last seen), Breadcrumb and Missing Status Badge, Tabs Panel (Pet Details, Last Seen) with Additional Details, Staff Missing Pets Details Screen (Miming), Animal Photo Gallery with Thumbnails, Top Bar with Global Search, Notifications and Staff Menu

### Community 30 - "Missing Pets List Wireframe"
Cohesion: 0.38
Nodes (7): Missing Pets Page (citizen wireframe), Footer (Socials, About, Contact, copyright), Hero Banner 'Help Bring Them Home' with Report Missing Pet CTA, Missing Pet Card Grid (image, name, breed, Active status, location found, date reported), Top Navbar (Home, Adoptable Pets, My Applications, Missing Pets, My Missing Pet Reports, Profile, Login, Sign Up), Report Missing Pet flow (CTA target), Search and Filter Bar (type, location, time, clear filters, sort by)

### Community 32 - "PHP Runtime Dependencies"
Cohesion: 0.33
Nodes (6): require, bacon/bacon-qr-code, laravel/framework, laravel/sanctum, laravel/tinker, php

### Community 34 - "Oxlint Config"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 35 - "PSR-4 Autoload"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 38 - "Animal Profile Modal Wireframe"
Cohesion: 0.40
Nodes (4): Additional Details section (animal description and adoption appeal), Available status badge, Basic Information card (status, type, breed, age, gender, location last seen), View More Details Pop-Up (animal profile modal wireframe)

### Community 43 - "Test Autoload"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 44 - "Laravel Package Discovery"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

## Ambiguous Edges - Review These
- `My Applications (Adoption Applications) Screen` → `View Details Button`  [AMBIGUOUS]
  Wireframes/User Side/Screenshot 2026-10-16 233431.png · relation: conceptually_related_to
- `Laravel REST API Backend` → `Vercel Hosting (serverless, GitHub CI/CD)`  [AMBIGUOUS]
  Proposal Documentation.pdf · relation: references
- `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)` → `User Page Hero Banner Pattern (warm pet photography header)`  [AMBIGUOUS]
  frontend/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **98 isolated node(s):** `axios`, `vite`, `concurrently`, `tailwindcss`, `PoundCare Branding and Cream/Orange Palette` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 280 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-router-dom` connect `Admin Pages & Pet Data` to `Landing, Articles & Legal Pages`, `Shared UI, API & Role Context`, `Frontend Package & Tooling`, `Auth Pages & User Routes`, `Missing Pets & Status Help`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **What connects `axios`, `vite`, `concurrently` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Landing, Articles & Legal Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.053208137715179966 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Shared UI, API & Role Context` to `Landing, Articles & Legal Pages`, `Admin Pages & Pet Data`, `Frontend Package & Tooling`, `Auth Pages & User Routes`, `Missing Pets & Status Help`, `Search, Filters & Pagination`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `Admin Pages & Pet Data` be split into smaller, more focused modules?**
  _Cohesion score 0.08999122036874452 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `My Applications (Adoption Applications) Screen` and `View Details Button`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Laravel REST API Backend` and `Vercel Hosting (serverless, GitHub CI/CD)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._