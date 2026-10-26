# Graph Report - Pawmilya-merged  (2026-10-26)

## Corpus Check
- 289 files · ~123,476 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 91 file(s) not represented in the graph (top: .css 69, (none) 18, .example 2)

## Summary
- 1957 nodes · 5138 edges · 136 communities (68 shown, 68 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 110 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c0243ae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UserFooter.jsx
- Illuminate\Database\Schema\Blueprint
- Role Dashboards
- Admin Reports
- Vaccinations.jsx
- AnimalApiTest
- Animal Status Rules
- BackButton
- AuthController.php
- AdoptionApplication.jsx
- TestCase
- Articles.jsx
- MissingPetReport
- react
- AdoptionApplication
- BackButton
- AnimalController.php
- api.php
- RescuedReportFlowTest
- Shifts API Tests
- Missing Pet API Tests
- MissingPetReportDetails.jsx
- useFetch
- Access Middleware
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Auth Security Tests
- Placeholder Images
- Application Details Page
- Animal
- Password Reset Email
- .record
- MissingPetPhoto
- StaffShift
- Illuminate\Http\JsonResponse
- AppServiceProvider.php
- RoleMiddlewareTest
- Setting
- EmergencyReportModal.jsx
- AdoptionApplicationApiTest
- VaccinationApiTest
- Sanctum Bearer token auth
- ProfileController.php
- 0001_01_01_000002_create_jobs_table.php
- Illuminate\Foundation\Http\FormRequest
- RbacMatrixTest
- api.php
- Pawmilya
- Laravel framework (default README)
- backend/package.json
- AuthTest
- SiteContentApiTest
- frontend/package.json
- UnclaimedReportsTest
- composer.json
- scripts
- backend/README.md
- UserManagementApiTest
- Development phases 0-8
- UserLayout.jsx
- 2026_11_01_000200_add_claim_deadline_to_missing_pet_reports.php
- Illuminate\Http\JsonResponse
- Illuminate\Database\Eloquent\Model
- config
- Reports.jsx
- vaccinations.js
- AdoptionApplicationDetails.jsx
- authService.js
- AddVaccination.jsx
- Current status
- Pawmilya
- EmergencyReportModal.jsx
- AdoptionApplication
- Pawmilya
- api
- TestCase
- BreedSelect.jsx
- ServerErrorResponseTest.php
- ProfileAddressTest
- ProfileAvatarTest
- Vaccine
- scripts
- Laravel 12 REST API backend
- AuditLog
- frontend/vite.config.js
- AdoptionApplicationApiTest
- User
- AnimalApiTest
- Illuminate\Database\Eloquent\Model
- ReportApiTest
- ModalProvider.jsx
- Illuminate\Support\Facades\Schema
- Illuminate\Database\Migrations\Migration
- ProfileEmailTest
- SiteContentApiTest
- Illuminate\Foundation\Http\FormRequest
- LegalPage.jsx
- 2026_10_27_000200_add_vaccine_id_to_health_logs.php
- 2026_10_21_000300_create_health_logs_table.php
- 0001_01_01_000001_create_cache_table.php
- 2026_10_21_000100_add_role_fields_to_users_table.php
- 2026_10_21_000500_create_missing_pet_reports_table.php
- 2026_10_22_000100_add_must_change_password_to_users.php
- 2026_10_25_000100_add_animal_id_to_missing_pet_reports.php
- 2026_10_26_000100_add_avatar_path_to_users.php
- 2026_10_26_000200_add_address_to_users.php
- 2026_10_26_000300_add_reporter_type_to_missing_pet_reports.php
- 2026_10_26_000400_add_other_species_to_animals.php
- 2026_10_26_000500_default_staff_shift_status_active.php
- AppRoutes.jsx
- User
- 2026_10_27_000100_create_vaccines_table.php
- 2026_11_02_000100_add_for_adoption_missing_pet_status.php
- UserNavbar.jsx
- 2026_10_21_000200_create_animals_table.php

## God Nodes (most connected - your core abstractions)
1. `User` - 93 edges
2. `Animal` - 64 edges
3. `react` - 63 edges
4. `BackButton()` - 58 edges
5. `useFetch()` - 55 edges
6. `useAuth()` - 53 edges
7. `react-router-dom` - 50 edges
8. `TestCase` - 48 edges
9. `lucide-react` - 47 edges
10. `AppRoutes()` - 43 edges

## Surprising Connections (you probably didn't know these)
- `Mock login (no backend)` --references--> `useAuth()`  [INFERRED]
  README.md → frontend/src/hooks/useAuth.js
- `Auth (still mock)` --references--> `SignInModal()`  [INFERRED]
  CLAUDE.md → frontend/src/components/common/SignInModal.jsx
- `Roles` --references--> `hasPermission()`  [INFERRED]
  CLAUDE.md → frontend/src/config/rolePermissions.js
- `Auth (still mock)` --references--> `useAuth()`  [INFERRED]
  CLAUDE.md → frontend/src/hooks/useAuth.js
- `Folder structure (frontend/src)` --references--> `useAuth()`  [INFERRED]
  CLAUDE.md → frontend/src/hooks/useAuth.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Sources of truth for building pages** — claude_proposal_documentation, claude_wireframes, claude_reference_ui, claude_change_requirements, claude_graphify_knowledge_graph [EXTRACTED 1.00]
- **Default Vite + React Scaffold Assets** — frontend_public_favicon_vite_lightning_favicon, frontend_public_icons_social_icon_sprite, frontend_src_assets_react_react_logo, frontend_src_assets_vite_vite_logo [INFERRED 0.75]
- **API health check (footer indicator -> Axios -> /api/health)** — claude_api_health_indicator, frontend_src_services_api_api, claude_api_health_endpoint, claude_laravel_rest_api [INFERRED 0.85]
- **Article Image Placeholder Set** — frontend_src_assets_images_placeholders_article_1_article_image_1_placeholder, frontend_src_assets_images_placeholders_article_2_article_image_2_placeholder, frontend_src_assets_images_placeholders_article_3_article_image_3_placeholder, frontend_src_assets_images_placeholders_article_4_article_image_4_placeholder, frontend_src_assets_images_placeholders_article_5_article_image_5_placeholder, frontend_src_assets_images_placeholders_article_6_article_image_6_placeholder [INFERRED 0.85]
- **Token auth flow: Sanctum + Axios interceptor + AuthContext/ProtectedRoute** — claude_sanctum_token_auth, frontend_src_services_api_api, claude_authcontext, claude_protectedroute, claude_role_middleware [INFERRED 0.85]
- **Pet Photo Placeholders (dog/cat/other)** — frontend_src_assets_images_placeholders_pet_cat_cat_photo_placeholder, frontend_src_assets_images_placeholders_pet_dog_dog_photo_placeholder, frontend_src_assets_images_placeholders_pet_other_pet_photo_placeholder [INFERRED 0.85]
- **User Pages Pet Photography Hero Banners** — frontend_src_assets_images_users_home_home_hero_home_hero_photo, frontend_src_assets_images_users_home_myapplications_hero_myapplications_hero_photo, frontend_src_assets_images_users_home_adoptablepets_hero_adoptablepets_hero_photo, frontend_src_assets_images_users_missing_pets_missing_pets_hero_missing_pets_hero_photo [INFERRED 0.85]

## Communities (136 total, 68 thin omitted)

### Community 0 - "UserFooter.jsx"
Cohesion: 0.15
Nodes (10): DonateInKindModal(), ICONS, exploreLinks, UserFooter(), inKindWishlist, sectionLinks, siteInfo, FALLBACK (+2 more)

### Community 1 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.15
Nodes (10): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}() (+2 more)

### Community 2 - "Role Dashboards"
Cohesion: 0.05
Nodes (79): MyShifts(), OnDutyToday(), useAdminLists(), AdoptionCounselorDashboard(), DashboardCard(), EmptyState(), formatTimestamp(), getApplicationDate() (+71 more)

### Community 3 - "Admin Reports"
Cohesion: 0.12
Nodes (44): statusClass(), ACTIVITY, addDays(), AdoptionsReport(), AnimalsReport(), Bar(), countBy(), countOf() (+36 more)

### Community 4 - "Vaccinations.jsx"
Cohesion: 0.05
Nodes (74): App(), FieldError(), FormError(), PasswordHelp(), PasswordInput(), build(), loadPhLocations(), SMALL_WORDS (+66 more)

### Community 6 - "Animal Status Rules"
Cohesion: 0.08
Nodes (44): Known issues (not fixed yet), ClaimPeriodNote(), ADOPTION_NEEDS_CLEARED_MESSAGE, ADOPTION_STATUSES, allowedStatuses(), ANIMAL_STATUSES, canBeAdoptable(), CLEARED (+36 more)

### Community 7 - "BackButton"
Cohesion: 0.16
Nodes (18): BackButton(), AREAS, AuditLogs(), formatTimestamp(), summarize(), MyApplications(), STATUS_FILTERS, ImageUpload() (+10 more)

### Community 8 - "AuthController.php"
Cohesion: 0.07
Nodes (7): AuthController, ChangePasswordRequest, LoginRequest, RegisterRequest, LoginGuard, {closure#1}(), PasswordRules

### Community 9 - "AdoptionApplication.jsx"
Cohesion: 0.12
Nodes (24): isKeyboardFocus(), PhotoGallery(), PreviewStatus(), ImageDropzone(), ADOPTABLE_STATUS, articles, AdoptionApplication(), AgreeCheckbox() (+16 more)

### Community 10 - "TestCase"
Cohesion: 0.11
Nodes (3): AuditLog, ExampleTest, TestCase

### Community 11 - "Articles.jsx"
Cohesion: 0.20
Nodes (13): ALL_FIELDS, FilterDropdown(), Pagination(), SearchBar(), ArticleCard(), AdoptablePets(), Articles(), listPets() (+5 more)

### Community 12 - "MissingPetReport"
Cohesion: 0.05
Nodes (16): ReleaseUnclaimedReportsCommand, {closure#2}(), {closure#3}(), {closure#4}(), MissingPetReportController, {closure#1}(), StoreMissingPetRequest, MissingPetResource (+8 more)

### Community 13 - "react"
Cohesion: 0.17
Nodes (17): AdminHeader(), AdminSidebar(), menuItems, ROLES, AuthContext, EMPTY, useAuth(), AdminLayout() (+9 more)

### Community 14 - "AdoptionApplication"
Cohesion: 0.09
Nodes (12): AdoptionApplicationController, {closure#1}(), {closure#5}(), {closure#6}(), ReportController, StoreApplicationRequest, ApplicationResource, {closure#1}() (+4 more)

### Community 15 - "BackButton"
Cohesion: 0.12
Nodes (27): petPlaceholders, SafeImage(), statuses, StatusHelp(), PetPreviewCard(), DetailRow(), formatTimestamp(), MissingPetDetails() (+19 more)

### Community 16 - "AnimalController.php"
Cohesion: 0.07
Nodes (7): AnimalController, {closure#10}(), {closure#5}(), {closure#6}(), StoreAnimalRequest, UpdateAnimalRequest, AnimalResource

### Community 17 - "api.php"
Cohesion: 0.06
Nodes (7): AuditLogController, {closure#5}(), Controller, {closure#1}(), PublicAnimalController, VaccineController, GET /user()

### Community 21 - "MissingPetReportDetails.jsx"
Cohesion: 0.17
Nodes (18): ContactRow(), Detail(), formatTimestamp(), InfoBox(), MissingPetReportDetails(), STATUS_OPTIONS, StatusBadge(), formatTimestamp() (+10 more)

### Community 22 - "useFetch"
Cohesion: 0.20
Nodes (11): getCurrentIndex(), isKeyboardFocus(), ScrollStrip(), useFetch(), usePetCareArticles(), useScrollReveal(), aboutGoals, Home() (+3 more)

### Community 23 - "Access Middleware"
Cohesion: 0.14
Nodes (9): EnsurePasswordChanged, EnsurePermission, EnsureRole, SecurityHeaders, {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}() (+1 more)

### Community 26 - "Placeholder Images"
Cohesion: 0.12
Nodes (10): Article Image 1 Placeholder, Article Image 2 Placeholder, Article Image 3 Placeholder, Article Image 4 Placeholder, Article Image 5 Placeholder, Article Image 6 Placeholder, aboutPlaceholders, Paw-Print Gradient Placeholder Template (+2 more)

### Community 27 - "Application Details Page"
Cohesion: 0.18
Nodes (19): AdoptionApplicationDetails(), ContactRow(), Detail(), DocumentRow(), formatBirthDate(), OverviewItem(), Question(), ReviewRow() (+11 more)

### Community 28 - "Animal"
Cohesion: 0.11
Nodes (6): {closure#1}(), Animal, {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}()

### Community 29 - "Password Reset Email"
Cohesion: 0.16
Nodes (3): PawmilyaResetPassword, {closure#1}(), PasswordResetEmailTest

### Community 30 - ".record"
Cohesion: 0.30
Nodes (3): {closure#1}(), SiteContentController, SiteContent

### Community 32 - "StaffShift"
Cohesion: 0.08
Nodes (14): MyShiftController, {closure#1}(), {closure#2}(), {closure#3}(), ScheduleController, AssignShiftRequest, ShiftAssignmentResource, Shift (+6 more)

### Community 33 - "Illuminate\Http\JsonResponse"
Cohesion: 0.10
Nodes (7): {closure#1}(), PasswordController, {closure#3}(), UserManagementController, ResetPasswordRequest, Audit, PublicCache

### Community 34 - "AppServiceProvider.php"
Cohesion: 0.15
Nodes (5): AppServiceProvider, {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}()

### Community 36 - "Setting"
Cohesion: 0.27
Nodes (3): DatabaseSeeder, ShiftSeeder, UserSeeder

### Community 37 - "EmergencyReportModal.jsx"
Cohesion: 0.13
Nodes (16): ErrorBoundary, SuggestInput(), EmergencyReportFlow(), emptyForm, isFutureDateTime(), joinList(), STEP_1_FIELDS, STEP_2_FIELDS (+8 more)

### Community 39 - "VaccinationApiTest"
Cohesion: 0.08
Nodes (5): {closure#1}(), PetCareArticleController, UserFactory, {closure#3}(), VaccinationApiTest

### Community 40 - "Sanctum Bearer token auth"
Cohesion: 0.33
Nodes (6): AuthContext (planned), Open question: Continue with Google vs Sanctum only, Reference UI (ui-reference/poundcare-frontend), Sanctum Bearer token auth, Wireframes (Staff Side / User Side screenshots), Sanctum personal access tokens (Bearer, not cookies)

### Community 41 - "ProfileController.php"
Cohesion: 0.12
Nodes (4): ProfileController, UpdateAddressRequest, UpdateEmailRequest, UserResource

### Community 42 - "0001_01_01_000002_create_jobs_table.php"
Cohesion: 0.33
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 43 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.08
Nodes (10): {closure#2}(), VaccinationController, {closure#1}(), {closure#3}(), UpdateAvatarRequest, {closure#1}(), {closure#1}(), StoreVaccinationRequest (+2 more)

### Community 45 - "api.php"
Cohesion: 0.17
Nodes (11): Data rules, Differences from Proposal Documentation.pdf, graphify-out knowledge graph, Pawmilya, Phases, Proposal Documentation.pdf (the paper), Required changes on top of the wireframes [CHANGE], Run (+3 more)

### Community 46 - "Pawmilya"
Cohesion: 0.20
Nodes (8): Backend, Configuration notes, First-time setup, Folder structure, Frontend, Pawmilya, Requirements, Run

### Community 47 - "Laravel framework (default README)"
Cohesion: 0.50
Nodes (4): robots.txt (allow all crawlers), Eloquent ORM, Laravel framework (default README), Schema migrations

### Community 48 - "backend/package.json"
Cohesion: 0.20
Nodes (9): axios, vite, private, $schema, type, concurrently, laravel-vite-plugin, tailwindcss (+1 more)

### Community 51 - "frontend/package.json"
Cohesion: 0.22
Nodes (8): axios, vite, name, private, type, version, @types/react, @types/react-dom

### Community 53 - "composer.json"
Cohesion: 0.22
Nodes (8): description, keywords, license, minimum-stability, name, prefer-stable, $schema, type

### Community 54 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+1 more)

### Community 55 - "backend/README.md"
Cohesion: 0.22
Nodes (8): About Laravel, Code of Conduct, Contributing, Laravel Sponsors, Learning Laravel, License, Premium Partners, Security Vulnerabilities

### Community 57 - "Development phases 0-8"
Cohesion: 0.38
Nodes (7): Adoption application (valid ID + proof of income uploads), [CHANGE] required changes on top of wireframes, Development phases 0-8, Missing Pet Reports (guest/citizen), Vaccinations and health logs, Working rules, storage:link for uploaded photos/IDs

### Community 58 - "UserLayout.jsx"
Cohesion: 0.31
Nodes (7): Folder structure (frontend/src), EmergencyButton(), useModals(), BARE_PATHS, FADE_PATHS, UserLayout(), usesFade()

### Community 60 - "Illuminate\Http\JsonResponse"
Cohesion: 0.25
Nodes (8): require-dev, fakerphp/faker, laravel/pail, laravel/pint, laravel/sail, mockery/mockery, nunomaduro/collision, phpunit/phpunit

### Community 62 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 63 - "Reports.jsx"
Cohesion: 0.29
Nodes (7): devDependencies, axios, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite

### Community 64 - "vaccinations.js"
Cohesion: 0.29
Nodes (6): Expanding the Oxlint configuration, @vitejs/plugin-react (Oxc) / plugin-react-swc (SWC), React Compiler, React + Vite, React + Vite template (HMR), oxlint

### Community 65 - "AdoptionApplicationDetails.jsx"
Cohesion: 0.33
Nodes (7): Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset), Adoptable Pets Hero Photo (woman interacting with four dogs in a training/shelter room), Cat and Dog Companionship Imagery, Home Hero Photo (person holding two cream Labrador puppies outdoors), User Page Hero Banner Pattern (warm pet photography header), My Applications Hero Photo (two kittens and a puppy peeking over a white ledge), Missing Pets Hero Photo (orange kitten sleeping on a golden puppy)

### Community 66 - "authService.js"
Cohesion: 0.33
Nodes (6): require, bacon/bacon-qr-code, laravel/framework, laravel/sanctum, laravel/tinker, php

### Community 68 - "Current status"
Cohesion: 0.50
Nodes (4): Current status, Data rules, Differences from Proposal Documentation.pdf, Mock login (no backend)

### Community 69 - "Pawmilya"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 70 - "EmergencyReportModal.jsx"
Cohesion: 0.29
Nodes (7): dependencies, axios, lucide-react, phil-reg-prov-mun-brgy, react, react-dom, react-router-dom

### Community 71 - "AdoptionApplication"
Cohesion: 0.33
Nodes (6): devDependencies, oxlint, @types/react, @types/react-dom, vite, @vitejs/plugin-react

### Community 72 - "Pawmilya"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 75 - "api"
Cohesion: 0.22
Nodes (9): /api/health endpoint, API online/offline footer indicator, Mock data (src/data, src/services/*Service.js), React + Vite frontend, frontend index.html (Pawmilya), Vite Lightning Bolt Favicon, Vite Logo, api (+1 more)

### Community 76 - "TestCase"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 77 - "BreedSelect.jsx"
Cohesion: 0.37
Nodes (10): BreedSelect(), BREEDS, LOCAL_BREEDS, NOT_PUREBRED, purebredBreeds(), composeBreed(), hasBreedList(), KINDS (+2 more)

### Community 82 - "scripts"
Cohesion: 0.67
Nodes (3): scripts, build, dev

### Community 83 - "Laravel 12 REST API backend"
Cohesion: 0.25
Nodes (6): SVG QR codes (bacon/bacon-qr-code), Laravel 12 REST API backend, MySQL / XAMPP MariaDB (DB poundcare), ProtectedRoute (planned), Roles, Stray QR code page (pet + owner info)

### Community 89 - "User"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 90 - "AnimalApiTest"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

### Community 94 - "ModalProvider.jsx"
Cohesion: 0.38
Nodes (5): Modal(), SignInModal(), EmergencyReportModal(), ModalContext, ModalProvider()

### Community 120 - "2026_10_27_000200_add_vaccine_id_to_health_logs.php"
Cohesion: 0.33
Nodes (4): {closure#1}(), {closure#3}(), mapExistingRecords(), up()

### Community 132 - "AppRoutes.jsx"
Cohesion: 0.16
Nodes (17): Auth (still mock), articlePlaceholders, RequirePermission(), RequireSignIn(), LEGAL_UPDATED, legalOrder, legalPages, usePoundInfo() (+9 more)

### Community 133 - "User"
Cohesion: 0.14
Nodes (3): {closure#1}(), User, ValidationWordingTest

### Community 136 - "UserNavbar.jsx"
Cohesion: 0.26
Nodes (10): getLinks(), myApplicationsLink, myMissingReportsLink, sectionIds, UserNavbar(), useActiveSection(), prefersReducedMotion(), scrollToId() (+2 more)

## Ambiguous Edges - Review These
- `User Page Hero Banner Pattern (warm pet photography header)` → `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`  [AMBIGUOUS]
  frontend/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **20 isolated node(s):** `axios`, `concurrently`, `tailwindcss`, `vite`, `axios` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 491 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **68 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `AnimalApiTest`, `AuthController.php`, `TestCase`, `MissingPetReport`, `RescuedReportFlowTest`, `Shifts API Tests`, `Missing Pet API Tests`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Auth Security Tests`, `Animal`, `Password Reset Email`, `.record`, `StaffShift`, `Illuminate\Http\JsonResponse`, `RoleMiddlewareTest`, `Setting`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `Illuminate\Foundation\Http\FormRequest`, `RbacMatrixTest`, `AuthTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `UserManagementApiTest`, `ProfileAddressTest`, `ProfileAvatarTest`, `ReportApiTest`, `ProfileEmailTest`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **What connects `axios`, `concurrently`, `tailwindcss` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Role Dashboards` be split into smaller, more focused modules?**
  _Cohesion score 0.052604698672114404 - nodes in this community are weakly interconnected._
- **Why does `Animal` connect `Animal` to `Illuminate\Http\JsonResponse`, `AppServiceProvider.php`, `AnimalApiTest`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `TestCase`, `Illuminate\Foundation\Http\FormRequest`, `MissingPetReport`, `RbacMatrixTest`, `AdoptionApplication`, `AnimalController.php`, `api.php`, `Vaccine`, `SiteContentApiTest`, `Missing Pet API Tests`, `UnclaimedReportsTest`, `Illuminate\Database\Eloquent\Model`, `ReportApiTest`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Should `Admin Reports` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `UserFooter.jsx`, `Role Dashboards`, `Admin Reports`, `Vaccinations.jsx`, `EmergencyReportModal.jsx`, `AppRoutes.jsx`, `Animal Status Rules`, `UserNavbar.jsx`, `AdoptionApplication.jsx`, `BackButton`, `Articles.jsx`, `BreedSelect.jsx`, `BackButton`, `frontend/package.json`, `MissingPetReportDetails.jsx`, `useFetch`, `Application Details Page`, `ModalProvider.jsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `User Page Hero Banner Pattern (warm pet photography header)` and `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._