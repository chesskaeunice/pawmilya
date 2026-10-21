# Graph Report - Pawmilya-merged  (2026-10-22)

## Corpus Check
- 239 files · ~152,494 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 86 file(s) not represented in the graph (top: .css 64, (none) 18, .example 2)

## Summary
- 1735 nodes · 4128 edges · 119 communities (76 shown, 43 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 129 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5568f93d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.js
- AppRoutes.jsx
- MyShiftController
- PoundCare Proposal Concepts
- frontend/package.json
- ShiftService
- Shift
- KennelManagerDashboard.jsx
- Search, Filters & Pagination
- ShiftsApiTest
- Illuminate\Database\Schema\Blueprint
- backend/package.json
- Admin Details Wireframes
- bootstrap/app.php
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
- AppServiceProvider.php
- PHP Runtime Dependencies
- RoleMiddlewareTest
- Oxlint Config
- PSR-4 Autoload
- Animal Profile Modal Wireframe
- Unit Test
- Users Admin Page
- Test Autoload
- Laravel Package Discovery
- api.php
- Adoptable Listing Feature
- Social Icon Sprite
- Other Pet Placeholder
- React Logo
- Animal
- Illuminate\Http\JsonResponse
- Illuminate\Database\Eloquent\Model
- Reports.jsx
- vaccinations.js
- AdoptionApplicationDetails.jsx
- authService.js
- Home.jsx
- AdminRoutes.jsx
- Pawmilya
- EmergencyReportModal.jsx
- AdoptionApplication
- Pawmilya
- backend/README.md
- main.jsx
- MissingPetReportDetails.jsx
- TestCase
- Development phases 0-8
- VaccinationApiTest
- React + Vite template (HMR)
- dependencies
- devDependencies
- StaffShift
- AuthSecurityTest
- Laravel 12 REST API backend
- AuditLog
- MissingPetReport
- AdoptionApplicationApiTest
- MissingPetApiTest
- User
- AnimalApiTest
- AdoptionApplication.jsx
- lucide-react
- Illuminate\Http\Request
- Illuminate\Database\Seeder
- Animal.php
- devDependencies
- User Page Hero Banner Pattern (warm pet photography header)
- AddVaccination.jsx
- AuthController.php
- applications.js
- missingPets.js
- BackButton
- scripts
- scripts
- frontend/vite.config.js
- ChangePasswordRequest
- RbacMatrixTest
- AuthTest
- SiteContentApiTest
- Illuminate\Foundation\Http\FormRequest
- LegalPage.jsx
- UserManagementApiTest
- MissingPets.jsx

## God Nodes (most connected - your core abstractions)
1. `User` - 68 edges
2. `BackButton()` - 62 edges
3. `react` - 54 edges
4. `react-router-dom` - 50 edges
5. `useFetch()` - 49 edges
6. `Animal` - 47 edges
7. `useAuth()` - 44 edges
8. `AppRoutes()` - 43 edges
9. `lucide-react` - 42 edges
10. `formatApiError()` - 35 edges

## Surprising Connections (you probably didn't know these)
- `Mock login (no backend)` --references--> `useAuth()`  [INFERRED]
  README.md → frontend/src/hooks/useAuth.js
- `API online/offline footer indicator` --references--> `api`  [INFERRED]
  CLAUDE.md → frontend/src/services/api.js
- `Auth (still mock)` --references--> `SignInModal()`  [INFERRED]
  CLAUDE.md → frontend/src/components/common/SignInModal.jsx
- `Roles` --references--> `hasPermission()`  [INFERRED]
  CLAUDE.md → frontend/src/config/rolePermissions.js
- `Folder structure (frontend/src)` --references--> `useModals()`  [INFERRED]
  CLAUDE.md → frontend/src/hooks/useModals.js

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
- **Sources of truth for building pages** — claude_proposal_documentation, claude_wireframes, claude_reference_ui, claude_change_requirements, claude_graphify_knowledge_graph [EXTRACTED 1.00]
- **Staff Dashboard Overview Widgets** — wireframes_staff_side_screenshot_2026_10_16_225228_summary_stat_cards, wireframes_staff_side_screenshot_2026_10_16_225228_recent_animal_records, wireframes_staff_side_screenshot_2026_10_16_225228_adoption_applications_panel, wireframes_staff_side_screenshot_2026_10_16_225228_missing_pet_reports_panel, wireframes_staff_side_screenshot_2026_10_16_225228_animals_by_status_chart, wireframes_staff_side_screenshot_2026_10_16_225228_recent_adoptions_gallery [EXTRACTED 1.00]
- **Default Vite + React Scaffold Assets** — frontend_public_favicon_vite_lightning_favicon, frontend_public_icons_social_icon_sprite, frontend_src_assets_react_react_logo, frontend_src_assets_vite_vite_logo [INFERRED 0.75]
- **API health check (footer indicator -> Axios -> /api/health)** — claude_api_health_indicator, frontend_src_services_api_api, claude_api_health_endpoint, claude_laravel_rest_api [INFERRED 0.85]
- **Article Image Placeholder Set** — frontend_src_assets_images_placeholders_article_1_article_image_1_placeholder, frontend_src_assets_images_placeholders_article_2_article_image_2_placeholder, frontend_src_assets_images_placeholders_article_3_article_image_3_placeholder, frontend_src_assets_images_placeholders_article_4_article_image_4_placeholder, frontend_src_assets_images_placeholders_article_5_article_image_5_placeholder, frontend_src_assets_images_placeholders_article_6_article_image_6_placeholder [INFERRED 0.85]
- **Token auth flow: Sanctum + Axios interceptor + AuthContext/ProtectedRoute** — claude_sanctum_token_auth, frontend_src_services_api_api, claude_authcontext, claude_protectedroute, claude_role_middleware [INFERRED 0.85]
- **Missing Pet Detail Hero Layout** — wireframes_user_side_screenshot_2026_10_16_233426_pet_image_placeholder, wireframes_user_side_screenshot_2026_10_16_233426_help_find_me_card, wireframes_user_side_screenshot_2026_10_16_233426_hero_text, wireframes_user_side_screenshot_2026_10_16_233426_found_miming_cta [INFERRED 0.85]
- **Missing Pet Detail Page Layout** — c_users_anne_arbolente_downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233124_photo_gallery, c_users_anne_arbolente_downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233124_basic_information_card, c_users_anne_arbolente_downloads_poundcare_wireframes_staff_side_screenshot_2026_10_16_233124_details_tabs [INFERRED 0.85]
- **Pet Photo Placeholders (dog/cat/other)** — frontend_src_assets_images_placeholders_pet_cat_cat_photo_placeholder, frontend_src_assets_images_placeholders_pet_dog_dog_photo_placeholder, frontend_src_assets_images_placeholders_pet_other_pet_photo_placeholder [INFERRED 0.85]
- **Adoption browse flow: list, filter, card, details, apply** — downloads_poundcare_wireframes_user_side_screenshot_2026_10_16_225010_adoptable_pets_screen, downloads_poundcare_wireframes_user_side_screenshot_2026_10_16_225010_pet_card, downloads_poundcare_wireframes_user_side_screenshot_2026_10_16_225010_pet_details_screen, downloads_poundcare_wireframes_user_side_screenshot_2026_10_16_225010_apply_cta [INFERRED 0.85]
- **Adoption Application Workflow (apply, review, approve, status update)** — proposal_documentation_adoption_application_management, proposal_documentation_adoption_approval_rule, proposal_documentation_adoption_applications_table, proposal_documentation_status_management [INFERRED 0.85]
- **Auth screens sharing nav, hero panel and form card pattern** — wireframes_user_side_screenshot_2026_10_16_224907_login_wireframe, wireframes_user_side_screenshot_2026_10_16_224907_register_wireframe, wireframes_user_side_screenshot_2026_10_16_224907_top_nav_bar, wireframes_user_side_screenshot_2026_10_16_224907_hero_panel [INFERRED 0.85]
- **Missing Pet Report and Matching Flow** — proposal_documentation_lost_pet_owners, proposal_documentation_missing_pet_reporting, proposal_documentation_missing_pet_monitoring, proposal_documentation_missing_pet_table [INFERRED 0.85]
- **Staff Vaccinations Screen Layout** — wireframes_staff_side_screenshot_2026_10_16_233321_sidebar_navigation, wireframes_staff_side_screenshot_2026_10_16_233321_filter_toolbar, wireframes_staff_side_screenshot_2026_10_16_233321_vaccination_table, wireframes_staff_side_screenshot_2026_10_16_233321_pagination [INFERRED 0.85]
- **User Pages Pet Photography Hero Banners** — frontend_src_assets_images_users_home_home_hero_home_hero_photo, frontend_src_assets_images_users_home_myapplications_hero_myapplications_hero_photo, frontend_src_assets_images_users_home_adoptablepets_hero_adoptablepets_hero_photo, frontend_src_assets_images_users_missing_pets_missing_pets_hero_missing_pets_hero_photo [INFERRED 0.85]

## Communities (119 total, 43 thin omitted)

### Community 0 - "index.js"
Cohesion: 0.12
Nodes (10): Article Image 1 Placeholder, Article Image 2 Placeholder, Article Image 3 Placeholder, Article Image 4 Placeholder, Article Image 5 Placeholder, Article Image 6 Placeholder, aboutPlaceholders, Paw-Print Gradient Placeholder Template (+2 more)

### Community 1 - "AppRoutes.jsx"
Cohesion: 0.17
Nodes (27): Auth (still mock), Folder structure (frontend/src), AdminHeader(), AdminSidebar(), menuItems, RequirePermission(), RequireSignIn(), FieldError() (+19 more)

### Community 2 - "MyShiftController"
Cohesion: 0.18
Nodes (3): MyShiftController, AssignShiftRequest, ShiftAssignmentResource

### Community 3 - "PoundCare Proposal Concepts"
Cohesion: 0.06
Nodes (46): Adoption Application Management Feature, Adoption_Applications Table (Pending/Under Review/Approved/Rejected), Aiven for MySQL (managed free tier), Animal Record Management Feature, Animals Table (animal_code, species, status enum), REST API Endpoints (/api/animals, /api/adoption-applications, /api/missing-pets, /api/dashboard, /api/reports), Audit_Logs Table, AuthContext (Context API: user, role, token) (+38 more)

### Community 4 - "frontend/package.json"
Cohesion: 0.22
Nodes (8): axios, vite, name, private, type, version, @types/react, @types/react-dom

### Community 5 - "ShiftService"
Cohesion: 0.16
Nodes (4): {closure#3}(), ScheduleController, {closure#1}(), ShiftService

### Community 6 - "Shift"
Cohesion: 0.18
Nodes (3): {closure#1}(), Shift, {closure#3}()

### Community 7 - "KennelManagerDashboard.jsx"
Cohesion: 0.05
Nodes (80): MyShifts(), OnDutyToday(), EMPTY, useAdminLists(), AdoptionCounselorDashboard(), DashboardCard(), EmptyState(), formatTimestamp() (+72 more)

### Community 8 - "Search, Filters & Pagination"
Cohesion: 0.17
Nodes (16): ALL_FIELDS, FilterDropdown(), Pagination(), SearchBar(), useDebouncedValue(), AdoptablePets(), AGE_OPTIONS, allArticles (+8 more)

### Community 10 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.05
Nodes (23): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}(), {closure#3}() (+15 more)

### Community 11 - "backend/package.json"
Cohesion: 0.20
Nodes (9): axios, vite, private, $schema, type, concurrently, laravel-vite-plugin, tailwindcss (+1 more)

### Community 12 - "Admin Details Wireframes"
Cohesion: 0.16
Nodes (16): Adoption Application Details Screen, Animal Details Screen (Bruno A-041), Animal Information Card (Luna) with View Animal Profile link, Animal Detail Tabs (About, Medical Records, Vaccinations, History), Applicant Information Card, Application Form Answers Card, Basic Information Card (status, type, breed, age, gender, date rescued, location), Behavior and Personality Tags / Ideal Home (+8 more)

### Community 13 - "bootstrap/app.php"
Cohesion: 0.16
Nodes (7): EnsurePasswordChanged, EnsurePermission, EnsureRole, SecurityHeaders, {closure#1}(), {closure#2}(), {closure#3}()

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

### Community 31 - "AppServiceProvider.php"
Cohesion: 0.15
Nodes (5): AppServiceProvider, {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}()

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

### Community 45 - "api.php"
Cohesion: 0.08
Nodes (6): AuditLogController, Controller, PasswordController, VaccinationController, StoreVaccinationRequest, GET /user()

### Community 59 - "Animal"
Cohesion: 0.08
Nodes (5): AnimalController, {closure#5}(), UpdateAnimalRequest, AnimalResource, Animal

### Community 60 - "Illuminate\Http\JsonResponse"
Cohesion: 0.12
Nodes (6): {closure#1}(), PublicAnimalController, {closure#1}(), SiteContentController, PublicCache, SiteContent

### Community 61 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.15
Nodes (4): AnimalPhoto, HealthLog, MissingPetPhoto, Setting

### Community 63 - "Reports.jsx"
Cohesion: 0.08
Nodes (58): ACTIVITY, addDays(), AdoptionsReport(), AnimalsReport(), Bar(), countBy(), countOf(), daysFromToday() (+50 more)

### Community 65 - "AdoptionApplicationDetails.jsx"
Cohesion: 0.23
Nodes (15): AdoptionApplicationDetails(), ContactRow(), Detail(), DocumentRow(), formatBirthDate(), OverviewItem(), Question(), ReviewRow() (+7 more)

### Community 66 - "authService.js"
Cohesion: 0.25
Nodes (15): CITIZEN, hasPermission(), ROLE_LABELS, rolePermissions, ROLES, AuthContext, AuthProvider(), changePasswordRequest() (+7 more)

### Community 67 - "Home.jsx"
Cohesion: 0.11
Nodes (25): articlePlaceholders, petPlaceholders, ArticleCard(), PetPreviewCard(), PreviewStatus(), getCurrentIndex(), isKeyboardFocus(), ScrollStrip() (+17 more)

### Community 68 - "AdminRoutes.jsx"
Cohesion: 0.20
Nodes (16): useFetch(), AdoptionApplications(), getApplicationDate(), getInitials(), NO_APPLICATIONS, SummaryCard(), AREAS, AuditLogs() (+8 more)

### Community 69 - "Pawmilya"
Cohesion: 0.17
Nodes (11): Data rules, Differences from Proposal Documentation.pdf, graphify-out knowledge graph, Pawmilya, Phases, Proposal Documentation.pdf (the paper), Required changes on top of the wireframes [CHANGE], Run (+3 more)

### Community 70 - "EmergencyReportModal.jsx"
Cohesion: 0.07
Nodes (36): Modal(), SignInModal(), EmergencyButton(), EmergencyReportFlow(), EmergencyReportModal(), emptyForm, isFutureDateTime(), joinList() (+28 more)

### Community 71 - "AdoptionApplication"
Cohesion: 0.13
Nodes (7): AdoptionApplicationController, {closure#1}(), {closure#5}(), {closure#6}(), ApplicationResource, {closure#1}(), AdoptionApplication

### Community 72 - "Pawmilya"
Cohesion: 0.12
Nodes (14): /api/health endpoint, API online/offline footer indicator, Backend, Configuration notes, Current status, Data rules, Differences from Proposal Documentation.pdf, First-time setup (+6 more)

### Community 73 - "backend/README.md"
Cohesion: 0.22
Nodes (8): About Laravel, Code of Conduct, Contributing, Laravel Sponsors, Learning Laravel, License, Premium Partners, Security Vulnerabilities

### Community 74 - "main.jsx"
Cohesion: 0.22
Nodes (7): Mock data (src/data, src/services/*Service.js), React + Vite frontend, frontend index.html (Pawmilya), Vite Lightning Bolt Favicon, App(), Vite Logo, react-dom

### Community 75 - "MissingPetReportDetails.jsx"
Cohesion: 0.16
Nodes (20): Dashboard(), ContactRow(), Detail(), formatTimestamp(), InfoBox(), MissingPetReportDetails(), STATUS_OPTIONS, StatusBadge() (+12 more)

### Community 77 - "Development phases 0-8"
Cohesion: 0.16
Nodes (15): Adoption application (valid ID + proof of income uploads), AuthContext (planned), SVG QR codes (bacon/bacon-qr-code), [CHANGE] required changes on top of wireframes, Open question: Continue with Google vs Sanctum only, Development phases 0-8, Missing Pet Reports (guest/citizen), Reference UI (ui-reference/poundcare-frontend) (+7 more)

### Community 79 - "React + Vite template (HMR)"
Cohesion: 0.29
Nodes (6): Expanding the Oxlint configuration, @vitejs/plugin-react (Oxc) / plugin-react-swc (SWC), React Compiler, React + Vite, React + Vite template (HMR), oxlint

### Community 80 - "dependencies"
Cohesion: 0.33
Nodes (6): dependencies, axios, lucide-react, react, react-dom, react-router-dom

### Community 81 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, oxlint, @types/react, @types/react-dom, vite, @vitejs/plugin-react

### Community 82 - "StaffShift"
Cohesion: 0.23
Nodes (4): StaffShift, {closure#4}(), {closure#5}(), {closure#6}()

### Community 84 - "Laravel 12 REST API backend"
Cohesion: 0.20
Nodes (8): robots.txt (allow all crawlers), Eloquent ORM, Laravel framework (default README), Schema migrations, Laravel 12 REST API backend, MySQL / XAMPP MariaDB (DB poundcare), ProtectedRoute (planned), Roles

### Community 85 - "AuditLog"
Cohesion: 0.20
Nodes (3): {closure#9}(), {closure#5}(), AuditLog

### Community 86 - "MissingPetReport"
Cohesion: 0.08
Nodes (8): {closure#2}(), MissingPetReportController, StoreMissingPetRequest, MissingPetResource, StaffMissingPetResource, MissingPetReport, {closure#1}(), PoundMatcher

### Community 89 - "User"
Cohesion: 0.14
Nodes (3): {closure#2}(), User, UserFactory

### Community 91 - "AdoptionApplication.jsx"
Cohesion: 0.21
Nodes (13): ImageDropzone(), AdoptionApplication(), AgreeCheckbox(), EMPLOYMENT_OPTIONS, HOME_PHOTO_CHECKLIST, PROMPT_OPTIONS, PRONOUN_OPTIONS, RadioGroup() (+5 more)

### Community 92 - "lucide-react"
Cohesion: 0.09
Nodes (41): ADOPTABLE_STATUS, ADOPTION_NEEDS_CLEARED_MESSAGE, allowedStatuses(), ANIMAL_STATUSES, canBeAdoptable(), CLEARED, DEFAULT_HEALTH_STATUS, DEFAULT_STATUS (+33 more)

### Community 93 - "Illuminate\Http\Request"
Cohesion: 0.09
Nodes (9): {closure#1}(), {closure#1}(), {closure#3}(), UserManagementController, MyApplicationResource, PublicAnimalResource, UserResource, VaccinationResource (+1 more)

### Community 94 - "Illuminate\Database\Seeder"
Cohesion: 0.15
Nodes (6): AdoptionApplicationSeeder, AnimalSeeder, DatabaseSeeder, MissingPetSeeder, ShiftSeeder, UserSeeder

### Community 96 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, axios, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite

### Community 97 - "User Page Hero Banner Pattern (warm pet photography header)"
Cohesion: 0.33
Nodes (7): Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset), Adoptable Pets Hero Photo (woman interacting with four dogs in a training/shelter room), Cat and Dog Companionship Imagery, Home Hero Photo (person holding two cream Labrador puppies outdoors), User Page Hero Banner Pattern (warm pet photography header), My Applications Hero Photo (two kittens and a puppy peeking over a white ledge), Missing Pets Hero Photo (orange kitten sleeping on a golden puppy)

### Community 99 - "AuthController.php"
Cohesion: 0.19
Nodes (3): AuthController, {closure#2}(), LoginGuard

### Community 104 - "BackButton"
Cohesion: 0.12
Nodes (25): Known issues (not fixed yet), BackButton(), BREEDS, EditAnimal(), MyApplications(), STATUS_FILTERS, MyMissingPetReports(), DEFAULT_PROFILE (+17 more)

### Community 105 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 106 - "scripts"
Cohesion: 0.67
Nodes (3): scripts, build, dev

### Community 108 - "ChangePasswordRequest"
Cohesion: 0.09
Nodes (5): ChangePasswordRequest, RegisterRequest, ResetPasswordRequest, {closure#1}(), PasswordRules

### Community 115 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.09
Nodes (10): {closure#1}(), StoreApplicationRequest, {closure#1}(), StoreAnimalRequest, {closure#3}(), LoginRequest, {closure#1}(), {closure#1}() (+2 more)

### Community 116 - "LegalPage.jsx"
Cohesion: 0.70
Nodes (3): LEGAL_UPDATED, legalOrder, legalPages

### Community 125 - "MissingPets.jsx"
Cohesion: 0.13
Nodes (21): statuses, StatusHelp(), DetailRow(), formatTimestamp(), MissingPetDetails(), ALPHABET, formatTimestamp(), getReportedDate() (+13 more)

## Ambiguous Edges - Review These
- `My Applications (Adoption Applications) Screen` → `View Details Button`  [AMBIGUOUS]
  Wireframes/User Side/Screenshot 2026-10-16 233431.png · relation: conceptually_related_to
- `Laravel REST API Backend` → `Vercel Hosting (serverless, GitHub CI/CD)`  [AMBIGUOUS]
  Proposal Documentation.pdf · relation: references
- `User Page Hero Banner Pattern (warm pet photography header)` → `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`  [AMBIGUOUS]
  frontend/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **98 isolated node(s):** `axios`, `concurrently`, `tailwindcss`, `vite`, `axios` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 484 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `ShiftService`, `Shift`, `ShiftsApiTest`, `RoleMiddlewareTest`, `TestCase`, `VaccinationApiTest`, `StaffShift`, `AuthSecurityTest`, `MissingPetReport`, `AdoptionApplicationApiTest`, `MissingPetApiTest`, `AnimalApiTest`, `Illuminate\Http\Request`, `Illuminate\Database\Seeder`, `AuthController.php`, `RbacMatrixTest`, `AuthTest`, `SiteContentApiTest`, `UserManagementApiTest`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `axios`, `concurrently`, `tailwindcss` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Why does `Animal` connect `Animal` to `AdoptionApplication`, `TestCase`, `AppServiceProvider.php`, `RbacMatrixTest`, `VaccinationApiTest`, `SiteContentApiTest`, `Illuminate\Foundation\Http\FormRequest`, `MissingPetReport`, `AdoptionApplicationApiTest`, `MissingPetApiTest`, `User`, `AnimalApiTest`, `Illuminate\Http\JsonResponse`, `Illuminate\Database\Eloquent\Model`, `Illuminate\Database\Seeder`, `Animal.php`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `PoundCare Proposal Concepts` be split into smaller, more focused modules?**
  _Cohesion score 0.05697278911564626 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `My Applications (Adoption Applications) Screen` and `View Details Button`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Laravel REST API Backend` and `Vercel Hosting (serverless, GitHub CI/CD)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._