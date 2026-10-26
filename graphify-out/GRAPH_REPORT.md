# Graph Report - Pawmilya-merged  (2026-10-26)

## Corpus Check
- 300 files · ~127,586 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 93 file(s) not represented in the graph (top: .css 71, (none) 18, .example 2)

## Summary
- 2043 nodes · 5474 edges · 151 communities (75 shown, 76 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 111 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7c0243ae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react-router-dom
- Illuminate\Database\Schema\Blueprint
- Role Dashboards
- Admin Reports
- authService.js
- AnimalApiTest
- Animal Status Rules
- ReportMissingPet.jsx
- RegisterRequest
- AdoptionApplication.jsx
- Animal
- Articles.jsx
- ReleaseUnclaimedReports
- AppRoutes.jsx
- AdoptionApplication
- BackButton
- AnimalController.php
- api.php
- RescuedReportFlowTest
- Shifts API Tests
- Missing Pet API Tests
- useFetch
- MissingPetReport
- Illuminate\Http\Request
- Illuminate\Database\Eloquent\Model
- Auth Security Tests
- Placeholder Images
- Application Details Page
- Illuminate\Database\Eloquent\Relations\HasMany
- Password Reset Email
- .record
- .record
- StaffShift
- Illuminate\Http\JsonResponse
- AppServiceProvider.php
- RoleMiddlewareTest
- Setting
- EmergencyReportModal.jsx
- AdoptionApplicationApiTest
- VaccinationApiTest
- Sanctum Bearer token auth
- UpdateAddressRequest
- 0001_01_01_000002_create_jobs_table.php
- UpdateVaccinationRequest
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
- formatApiError
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
- PetClaimTest
- scripts
- Roles
- AuditLog
- frontend/vite.config.js
- AdoptionApplicationApiTest
- User
- AnimalApiTest
- Vaccinations.jsx
- ReportApiTest
- Profile.jsx
- Illuminate\Foundation\Http\FormRequest
- PublicAnimalController.php
- Illuminate\Support\Facades\Schema
- Illuminate\Database\Migrations\Migration
- ProfileEmailTest
- SiteContentApiTest
- Illuminate\Foundation\Http\FormRequest
- LegalPage.jsx
- 2026_10_27_000200_add_vaccine_id_to_health_logs.php
- TestCase
- 0001_01_01_000001_create_cache_table.php
- 2026_10_21_000100_add_role_fields_to_users_table.php
- 2026_10_21_000500_create_missing_pet_reports_table.php
- RegisterAnimalFromReportTest
- 2026_10_25_000100_add_animal_id_to_missing_pet_reports.php
- 2026_10_26_000100_add_avatar_path_to_users.php
- 2026_10_26_000200_add_address_to_users.php
- 2026_10_26_000300_add_reporter_type_to_missing_pet_reports.php
- 2026_10_26_000400_add_other_species_to_animals.php
- 2026_10_26_000500_default_staff_shift_status_active.php
- BackButton
- User
- 2026_10_27_000100_create_vaccines_table.php
- 2026_11_02_000100_add_for_adoption_missing_pet_status.php
- Illuminate\Contracts\Validation\Validator
- 2026_10_21_000200_create_animals_table.php
- AutoRegisterOnFoundTest
- .login
- StoreMissingPetRequest
- PoundMatcher.php
- UpdateAnimalRequest.php
- 0001_01_01_000000_create_users_table.php
- PoundInfoForm.jsx
- StoreClaimRequest
- StoreVaccinationRequest
- 2026_11_03_000100_create_pet_claims_tables.php
- 2026_10_21_000400_create_adoption_applications_table.php
- First-time setup

## God Nodes (most connected - your core abstractions)
1. `User` - 98 edges
2. `Animal` - 66 edges
3. `react` - 66 edges
4. `useAuth()` - 65 edges
5. `useFetch()` - 59 edges
6. `BackButton()` - 58 edges
7. `MissingPetReport` - 51 edges
8. `TestCase` - 50 edges
9. `react-router-dom` - 50 edges
10. `lucide-react` - 47 edges

## Surprising Connections (you probably didn't know these)
- `Mock login (no backend)` --references--> `useAuth()`  [INFERRED]
  README.md → frontend/src/hooks/useAuth.js
- `API online/offline footer indicator` --references--> `api`  [INFERRED]
  CLAUDE.md → frontend/src/services/api.js
- `Auth (still mock)` --references--> `SignInModal()`  [INFERRED]
  CLAUDE.md → frontend/src/components/common/SignInModal.jsx
- `Roles` --references--> `hasPermission()`  [INFERRED]
  CLAUDE.md → frontend/src/config/rolePermissions.js
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

## Communities (151 total, 76 thin omitted)

### Community 0 - "react-router-dom"
Cohesion: 0.10
Nodes (30): Folder structure (frontend/src), EmergencyButton(), DonateInKindModal(), ICONS, exploreLinks, UserFooter(), getLinks(), myApplicationsLink (+22 more)

### Community 1 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.16
Nodes (9): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}(), {closure#3}() (+1 more)

### Community 2 - "Role Dashboards"
Cohesion: 0.05
Nodes (81): MyShifts(), OnDutyToday(), EMPTY, useAdminLists(), AdoptionCounselorDashboard(), DashboardCard(), EmptyState(), formatTimestamp() (+73 more)

### Community 3 - "Admin Reports"
Cohesion: 0.12
Nodes (44): statusClass(), ACTIVITY, addDays(), AdoptionsReport(), AnimalsReport(), Bar(), countBy(), countOf() (+36 more)

### Community 4 - "authService.js"
Cohesion: 0.20
Nodes (18): App(), CITIZEN, hasPermission(), ROLE_LABELS, rolePermissions, AuthProvider(), changePasswordRequest(), clearToken() (+10 more)

### Community 6 - "Animal Status Rules"
Cohesion: 0.08
Nodes (43): ClaimPeriodNote(), ADOPTION_NEEDS_CLEARED_MESSAGE, ADOPTION_STATUSES, allowedStatuses(), ANIMAL_STATUSES, canBeAdoptable(), CLEARED, DEFAULT_HEALTH_STATUS (+35 more)

### Community 7 - "ReportMissingPet.jsx"
Cohesion: 0.39
Nodes (8): ImageUpload(), REPORTER_TYPES, ReportMissingPet(), Required(), splitName(), SURNAME_PARTICLES, todayISO(), submitMissingPetReport()

### Community 8 - "RegisterRequest"
Cohesion: 0.10
Nodes (4): RegisterRequest, ResetPasswordRequest, {closure#1}(), PasswordRules

### Community 9 - "AdoptionApplication.jsx"
Cohesion: 0.10
Nodes (27): isKeyboardFocus(), PhotoGallery(), PreviewStatus(), ADOPTABLE_STATUS, articles, AdoptionApplication(), AgreeCheckbox(), EMPLOYMENT_OPTIONS (+19 more)

### Community 10 - "Animal"
Cohesion: 0.10
Nodes (4): {closure#1}(), Animal, {closure#1}(), {closure#2}()

### Community 11 - "Articles.jsx"
Cohesion: 0.11
Nodes (23): ALL_FIELDS, FilterDropdown(), Pagination(), SearchBar(), ArticleCard(), getCurrentIndex(), isKeyboardFocus(), ScrollStrip() (+15 more)

### Community 12 - "ReleaseUnclaimedReports"
Cohesion: 0.26
Nodes (3): ReleaseUnclaimedReportsCommand, MissingPetReportController, ReleaseUnclaimedReports

### Community 13 - "AppRoutes.jsx"
Cohesion: 0.10
Nodes (35): Auth (still mock), Known issues (not fixed yet), AdminHeader(), AdminSidebar(), menuItems, RequirePermission(), RequireSignIn(), ROLES (+27 more)

### Community 14 - "AdoptionApplication"
Cohesion: 0.12
Nodes (7): AdoptionApplicationController, {closure#1}(), {closure#5}(), {closure#6}(), ApplicationResource, {closure#1}(), AdoptionApplication

### Community 15 - "BackButton"
Cohesion: 0.11
Nodes (30): Modal(), SignInModal(), statuses, StatusHelp(), ClaimPetButton(), ClaimForm(), ClaimPetModal(), toISO() (+22 more)

### Community 16 - "AnimalController.php"
Cohesion: 0.10
Nodes (4): {closure#10}(), {closure#5}(), {closure#6}(), StoreAnimalRequest

### Community 17 - "api.php"
Cohesion: 0.08
Nodes (5): AuditLogController, {closure#5}(), {closure#2}(), VaccinationController, GET /user()

### Community 21 - "useFetch"
Cohesion: 0.16
Nodes (21): ReportClaims(), useFetch(), NONE, useMyClaims(), ContactRow(), Detail(), formatTimestamp(), InfoBox() (+13 more)

### Community 22 - "MissingPetReport"
Cohesion: 0.15
Nodes (8): {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}(), {closure#5}(), PetClaimController, MissingPetReport, PetClaim

### Community 23 - "Illuminate\Http\Request"
Cohesion: 0.09
Nodes (14): ReportController, EnsurePasswordChanged, EnsurePermission, EnsureRole, SecurityHeaders, MissingPetResource, MyApplicationResource, StaffMissingPetResource (+6 more)

### Community 24 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.11
Nodes (5): AnimalPhoto, HealthLog, MissingPetPhoto, PetClaimPhoto, PublicFile

### Community 26 - "Placeholder Images"
Cohesion: 0.12
Nodes (10): Article Image 1 Placeholder, Article Image 2 Placeholder, Article Image 3 Placeholder, Article Image 4 Placeholder, Article Image 5 Placeholder, Article Image 6 Placeholder, aboutPlaceholders, Paw-Print Gradient Placeholder Template (+2 more)

### Community 27 - "Application Details Page"
Cohesion: 0.18
Nodes (19): AdoptionApplicationDetails(), ContactRow(), Detail(), DocumentRow(), formatBirthDate(), OverviewItem(), Question(), ReviewRow() (+11 more)

### Community 28 - "Illuminate\Database\Eloquent\Relations\HasMany"
Cohesion: 0.08
Nodes (4): {closure#2}(), {closure#1}(), {closure#2}(), Vaccine

### Community 29 - "Password Reset Email"
Cohesion: 0.16
Nodes (3): PawmilyaResetPassword, {closure#1}(), PasswordResetEmailTest

### Community 30 - ".record"
Cohesion: 0.29
Nodes (3): {closure#1}(), SiteContentController, SiteContent

### Community 31 - ".record"
Cohesion: 0.15
Nodes (6): AnimalController, {closure#2}(), {closure#3}(), {closure#4}(), AnimalResource, ReportAnimalRegistrar

### Community 32 - "StaffShift"
Cohesion: 0.08
Nodes (13): MyShiftController, {closure#1}(), {closure#3}(), ScheduleController, AssignShiftRequest, ShiftAssignmentResource, Shift, StaffShift (+5 more)

### Community 33 - "Illuminate\Http\JsonResponse"
Cohesion: 0.07
Nodes (12): AuthController, Controller, {closure#1}(), PasswordController, ProfileController, {closure#3}(), UserManagementController, VaccineController (+4 more)

### Community 34 - "AppServiceProvider.php"
Cohesion: 0.18
Nodes (5): AppServiceProvider, {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}()

### Community 36 - "Setting"
Cohesion: 0.27
Nodes (3): DatabaseSeeder, ShiftSeeder, UserSeeder

### Community 37 - "EmergencyReportModal.jsx"
Cohesion: 0.15
Nodes (14): ErrorBoundary, EmergencyReportFlow(), emptyForm, isFutureDateTime(), joinList(), STEP_1_FIELDS, STEP_2_FIELDS, validate() (+6 more)

### Community 39 - "VaccinationApiTest"
Cohesion: 0.08
Nodes (5): {closure#1}(), PetCareArticleController, UserFactory, {closure#3}(), VaccinationApiTest

### Community 40 - "Sanctum Bearer token auth"
Cohesion: 0.33
Nodes (6): AuthContext (planned), Open question: Continue with Google vs Sanctum only, Reference UI (ui-reference/poundcare-frontend), Sanctum Bearer token auth, Wireframes (Staff Side / User Side screenshots), Sanctum personal access tokens (Bearer, not cookies)

### Community 42 - "0001_01_01_000002_create_jobs_table.php"
Cohesion: 0.33
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 45 - "api.php"
Cohesion: 0.17
Nodes (11): Data rules, Differences from Proposal Documentation.pdf, graphify-out knowledge graph, Pawmilya, Phases, Proposal Documentation.pdf (the paper), Required changes on top of the wireframes [CHANGE], Run (+3 more)

### Community 46 - "Pawmilya"
Cohesion: 0.18
Nodes (9): /api/health endpoint, API online/offline footer indicator, Laravel 12 REST API backend, MySQL / XAMPP MariaDB (DB poundcare), Configuration notes, Folder structure, Pawmilya, Requirements (+1 more)

### Community 47 - "Laravel framework (default README)"
Cohesion: 0.50
Nodes (4): robots.txt (allow all crawlers), Eloquent ORM, Laravel framework (default README), Schema migrations

### Community 48 - "backend/package.json"
Cohesion: 0.20
Nodes (9): axios, vite, private, $schema, type, concurrently, laravel-vite-plugin, tailwindcss (+1 more)

### Community 51 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): axios, vite, name, private, type, version, react-dom, @types/react (+1 more)

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
Cohesion: 0.28
Nodes (9): Adoption application (valid ID + proof of income uploads), SVG QR codes (bacon/bacon-qr-code), [CHANGE] required changes on top of wireframes, Development phases 0-8, Missing Pet Reports (guest/citizen), Stray QR code page (pet + owner info), Vaccinations and health logs, Working rules (+1 more)

### Community 58 - "formatApiError"
Cohesion: 0.28
Nodes (17): FieldError(), FormError(), PasswordHelp(), PasswordInput(), Login(), Card(), ChangePassword(), ForgotPassword() (+9 more)

### Community 60 - "Illuminate\Http\JsonResponse"
Cohesion: 0.25
Nodes (8): require-dev, fakerphp/faker, laravel/pail, laravel/pint, laravel/sail, mockery/mockery, nunomaduro/collision, phpunit/phpunit

### Community 61 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.18
Nodes (3): Setting, {closure#1}(), {closure#6}()

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
Cohesion: 0.40
Nodes (5): Mock data (src/data, src/services/*Service.js), React + Vite frontend, frontend index.html (Pawmilya), Vite Lightning Bolt Favicon, Vite Logo

### Community 76 - "TestCase"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 77 - "BreedSelect.jsx"
Cohesion: 0.37
Nodes (10): BreedSelect(), BREEDS, LOCAL_BREEDS, NOT_PUREBRED, purebredBreeds(), composeBreed(), hasBreedList(), KINDS (+2 more)

### Community 82 - "scripts"
Cohesion: 0.67
Nodes (3): scripts, build, dev

### Community 89 - "User"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 90 - "AnimalApiTest"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

### Community 91 - "Vaccinations.jsx"
Cohesion: 0.21
Nodes (19): addDays(), formatDate(), getStatus(), newestFirst(), newRow(), normalize(), pad(), parseDate() (+11 more)

### Community 93 - "Profile.jsx"
Cohesion: 0.17
Nodes (15): SuggestInput(), build(), loadPhLocations(), SMALL_WORDS, titleCase(), ADDRESS_FIELDS, DEFAULT_PROFILE, FIELD_ORDER (+7 more)

### Community 94 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.14
Nodes (3): LoginRequest, UpdateAvatarRequest, UpdateEmailRequest

### Community 95 - "PublicAnimalController.php"
Cohesion: 0.16
Nodes (3): {closure#1}(), PublicAnimalController, PublicAnimalResource

### Community 120 - "2026_10_27_000200_add_vaccine_id_to_health_logs.php"
Cohesion: 0.33
Nodes (4): {closure#1}(), {closure#3}(), mapExistingRecords(), up()

### Community 121 - "TestCase"
Cohesion: 0.19
Nodes (3): ExampleTest, ValidationWordingTest, TestCase

### Community 132 - "BackButton"
Cohesion: 0.16
Nodes (19): articlePlaceholders, petPlaceholders, BackButton(), SafeImage(), PetPreviewCard(), LEGAL_UPDATED, legalOrder, legalPages (+11 more)

### Community 133 - "User"
Cohesion: 0.12
Nodes (4): {closure#2}(), {closure#1}(), AuditLog, User

### Community 136 - "Illuminate\Contracts\Validation\Validator"
Cohesion: 0.21
Nodes (5): {closure#1}(), StoreApplicationRequest, {closure#1}(), {closure#1}(), {closure#1}()

### Community 143 - "0001_01_01_000000_create_users_table.php"
Cohesion: 0.33
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 144 - "PoundInfoForm.jsx"
Cohesion: 0.60
Nodes (4): MAX, PoundInfoForm(), getPoundInfo(), savePoundInfo()

### Community 150 - "First-time setup"
Cohesion: 0.67
Nodes (3): Backend, First-time setup, Frontend

## Ambiguous Edges - Review These
- `User Page Hero Banner Pattern (warm pet photography header)` → `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`  [AMBIGUOUS]
  frontend/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **20 isolated node(s):** `axios`, `concurrently`, `tailwindcss`, `vite`, `axios` (+15 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 504 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **76 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `AnimalApiTest`, `Animal`, `AutoRegisterOnFoundTest`, `StoreMissingPetRequest`, `RescuedReportFlowTest`, `Shifts API Tests`, `Missing Pet API Tests`, `MissingPetReport`, `Auth Security Tests`, `Illuminate\Database\Eloquent\Relations\HasMany`, `Password Reset Email`, `.record`, `StaffShift`, `Illuminate\Http\JsonResponse`, `RoleMiddlewareTest`, `Setting`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `RbacMatrixTest`, `AuthTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `UserManagementApiTest`, `ProfileAddressTest`, `ProfileAvatarTest`, `PetClaimTest`, `ReportApiTest`, `ProfileEmailTest`, `TestCase`, `RegisterAnimalFromReportTest`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **What connects `axios`, `concurrently`, `tailwindcss` to the rest of the system?**
  _20 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react-router-dom` be split into smaller, more focused modules?**
  _Cohesion score 0.09634551495016612 - nodes in this community are weakly interconnected._
- **Why does `react` connect `BackButton` to `react-router-dom`, `Role Dashboards`, `Admin Reports`, `BackButton`, `authService.js`, `Animal Status Rules`, `ReportMissingPet.jsx`, `AdoptionApplication.jsx`, `Articles.jsx`, `AppRoutes.jsx`, `PoundInfoForm.jsx`, `useFetch`, `Application Details Page`, `EmergencyReportModal.jsx`, `frontend/package.json`, `formatApiError`, `BreedSelect.jsx`, `Vaccinations.jsx`, `Profile.jsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `Role Dashboards` be split into smaller, more focused modules?**
  _Cohesion score 0.05112279025322503 - nodes in this community are weakly interconnected._
- **Why does `Animal` connect `Animal` to `AnimalApiTest`, `User`, `Illuminate\Contracts\Validation\Validator`, `ReleaseUnclaimedReports`, `PoundMatcher.php`, `AdoptionApplication`, `UpdateAnimalRequest.php`, `AnimalController.php`, `Missing Pet API Tests`, `Illuminate\Http\Request`, `Illuminate\Database\Eloquent\Model`, `Illuminate\Database\Eloquent\Relations\HasMany`, `.record`, `AppServiceProvider.php`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `RbacMatrixTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `ReportApiTest`, `PublicAnimalController.php`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `User Page Hero Banner Pattern (warm pet photography header)` and `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._