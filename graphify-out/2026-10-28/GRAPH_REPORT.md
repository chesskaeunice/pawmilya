# Graph Report - Pawmilya-merged  (2026-10-28)

## Corpus Check
- 340 files · ~517,419 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 99 file(s) not represented in the graph (top: .css 76, (none) 18, .example 2)

## Summary
- 2359 nodes · 6456 edges · 160 communities (71 shown, 89 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b8673859`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- Illuminate\Database\Schema\Blueprint
- Role Dashboards
- Admin Reports
- Illuminate\Http\Request
- Illuminate\Support\Facades\Storage
- Animal Status Rules
- Articles.jsx
- ResetPasswordRequest
- ReportSubmitted
- Animal
- Home.jsx
- ReleaseUnclaimedReports.php
- AdminLayout.jsx
- AdoptionApplication
- BackButton
- AnimalController.php
- Settings.jsx
- RescuedReportFlowTest
- authService.js
- Missing Pet API Tests
- useFetch
- lucide-react
- bootstrap/app.php
- Illuminate\Database\Eloquent\Model
- Auth Security Tests
- Placeholder Images
- Application Details Page
- Illuminate\Database\Eloquent\Relations\HasMany
- Password Reset Email
- MascotWelcome.jsx
- MissingPetReport
- ShiftsApiTest
- Illuminate\Http\JsonResponse
- AppServiceProvider.php
- RoleMiddlewareTest
- .login
- authService.js
- AdoptionApplicationApiTest
- VaccinationApiTest
- LostReportFlowTest
- ReportPostingLimitTest
- 0001_01_01_000002_create_jobs_table.php
- Illuminate\Contracts\Validation\Validator
- RbacMatrixTest
- api.php
- Pawmilya
- Laravel 12 REST API backend
- backend/package.json
- AuthTest
- SiteContentApiTest
- frontend/package.json
- UnclaimedReportsTest
- composer.json
- scripts
- backend/README.md
- AdoptionApplication.jsx
- Development phases 0-8
- AppRoutes.jsx
- 2026_11_01_000200_add_claim_deadline_to_missing_pet_reports.php
- Illuminate\Http\JsonResponse
- AnimalPhoto
- config
- Reports.jsx
- vaccinations.js
- DemoPetsTest
- authService.js
- AddVaccination.jsx
- api.php
- Pawmilya
- EmergencyReportModal.jsx
- AdoptionApplication
- Pawmilya
- MissingPetPublicVisibilityTest
- NeuteredFieldTest
- AdoptedAnimalQrEditTest
- ServerErrorResponseTest.php
- ProfileAddressTest
- ProfileAvatarTest
- PetClaimTest
- api
- LoginRequest
- AuditLog
- ProfileNameTest
- AdoptionApplicationApiTest
- User
- AnimalApiTest
- Animal
- ReportApiTest
- ValidIdVerificationTest
- AuditLog
- AutoRegisterOnFoundTest
- Illuminate\Support\Facades\Schema
- Illuminate\Database\Migrations\Migration
- ProfileEmailTest
- reset-password.blade.php
- SiteContentApiTest
- Illuminate\Foundation\Http\FormRequest
- LegalPage.jsx
- 2026_10_27_000200_add_vaccine_id_to_health_logs.php
- 2026_10_21_000700_create_shifts_tables.php
- 0001_01_01_000001_create_cache_table.php
- DemoPetSeeder
- 2026_10_21_000500_create_missing_pet_reports_table.php
- RegisterAnimalFromReportTest
- 2026_10_25_000100_add_animal_id_to_missing_pet_reports.php
- 2026_10_26_000100_add_avatar_path_to_users.php
- UserManagementApiTest
- 2026_10_26_000300_add_reporter_type_to_missing_pet_reports.php
- 2026_10_26_000400_add_other_species_to_animals.php
- 2026_10_26_000500_default_staff_shift_status_active.php
- 2026_10_22_000100_add_must_change_password_to_users.php
- ReportPostingLimit
- 2026_10_27_000100_create_vaccines_table.php
- 2026_11_02_000100_add_for_adoption_missing_pet_status.php
- ParticleBackground.jsx
- main.jsx
- SiteContentController
- StoreMissingPetRequest
- phLocations.js
- report-submitted.blade.php
- UpdateAddressRequest
- verify-otp.blade.php
- Illuminate\Foundation\Http\FormRequest
- 2026_11_03_000100_create_pet_claims_tables.php
- RegisterRequest
- 0001_01_01_000000_create_users_table.php
- StoreVaccinationRequest.php
- UpdateVaccinationRequest
- 2026_11_04_000100_drop_age_from_animals_table.php
- UpdateProfileRequest
- StoreClaimRequest
- 2026_11_05_000100_add_demo_key_to_animals_and_missing_pet_reports.php
- scripts
- 2026_10_27_000100_create_email_otps_table.php
- PROPOSED_RECORDS.md

## God Nodes (most connected - your core abstractions)
1. `User` - 132 edges
2. `Animal` - 92 edges
3. `MissingPetReport` - 73 edges
4. `react` - 72 edges
5. `TestCase` - 70 edges
6. `useAuth()` - 67 edges
7. `useFetch()` - 59 edges
8. `BackButton()` - 58 edges
9. `react-router-dom` - 53 edges
10. `lucide-react` - 49 edges

## Surprising Connections (you probably didn't know these)
- `Mock login (no backend)` --references--> `useAuth()`  [INFERRED]
  README.md → frontend/src/hooks/useAuth.js
- `Auth (still mock)` --references--> `SignInModal()`  [INFERRED]
  CLAUDE.md → frontend/src/components/common/SignInModal.jsx
- `Roles` --references--> `hasPermission()`  [INFERRED]
  CLAUDE.md → frontend/src/config/rolePermissions.js
- `Folder structure (frontend/src)` --references--> `useAuth()`  [INFERRED]
  CLAUDE.md → frontend/src/hooks/useAuth.js
- `Folder structure (frontend/src)` --references--> `AdminLayout()`  [INFERRED]
  CLAUDE.md → frontend/src/layouts/AdminLayout.jsx

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

## Communities (160 total, 89 thin omitted)

### Community 0 - "react"
Cohesion: 0.08
Nodes (35): Folder structure (frontend/src), EmergencyButton(), DonateInKindModal(), ICONS, exploreLinks, UserFooter(), getLinks(), myApplicationsLink (+27 more)

### Community 1 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.16
Nodes (8): {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}()

### Community 2 - "Role Dashboards"
Cohesion: 0.05
Nodes (81): MyShifts(), OnDutyToday(), rolePermissions, ROLES, useAdminLists(), AdoptionCounselorDashboard(), DashboardCard(), EmptyState() (+73 more)

### Community 3 - "Admin Reports"
Cohesion: 0.08
Nodes (63): statusClass(), ACTIVITY, addDays(), AdoptionsReport(), AnimalsReport(), Bar(), countBy(), countOf() (+55 more)

### Community 4 - "Illuminate\Http\Request"
Cohesion: 0.09
Nodes (6): {closure#1}(), PublicAnimalController, {closure#1}(), ReportController, PublicAnimalResource, VaccinationResource

### Community 5 - "Illuminate\Support\Facades\Storage"
Cohesion: 0.12
Nodes (7): {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}(), {closure#5}(), PetClaimController, PetClaim

### Community 6 - "Animal Status Rules"
Cohesion: 0.09
Nodes (45): ClaimPeriodNote(), ADOPTABLE_STATUS, ADOPTION_NEEDS_CLEARED_MESSAGE, ADOPTION_STATUSES, allowedStatuses(), ANIMAL_STATUSES, canBeAdoptable(), CLEARED (+37 more)

### Community 7 - "Articles.jsx"
Cohesion: 0.18
Nodes (15): ALL_FIELDS, FilterDropdown(), ArticleCard(), usePetCareArticles(), Articles(), listPetCareArticles(), animalTypeOptions, defaultFilters (+7 more)

### Community 8 - "ResetPasswordRequest"
Cohesion: 0.12
Nodes (4): ChangePasswordRequest, ResetPasswordRequest, {closure#1}(), PasswordRules

### Community 9 - "ReportSubmitted"
Cohesion: 0.06
Nodes (10): ReportSubmitted, VerifyEmailOtp, {closure#1}(), SafeMail, UserFactory, {closure#1}(), EmailOtpTest, {closure#1}() (+2 more)

### Community 10 - "Animal"
Cohesion: 0.06
Nodes (6): {closure#2}(), {closure#1}(), User, ExampleTest, ValidationWordingTest, TestCase

### Community 11 - "Home.jsx"
Cohesion: 0.09
Nodes (30): Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset), Adoptable Pets Hero Photo (woman interacting with four dogs in a training/shelter room), Cat and Dog Companionship Imagery, Home Hero Photo (person holding two cream Labrador puppies outdoors), User Page Hero Banner Pattern (warm pet photography header), My Applications Hero Photo (two kittens and a puppy peeking over a white ledge), Missing Pets Hero Photo (orange kitten sleeping on a golden puppy), DemoBadge() (+22 more)

### Community 12 - "ReleaseUnclaimedReports.php"
Cohesion: 0.40
Nodes (3): {closure#1}(), {closure#1}(), {closure#2}()

### Community 13 - "AdminLayout.jsx"
Cohesion: 0.21
Nodes (6): AdminHeader(), AdminSidebar(), initialsOf(), menuItems, AdminLayout(), useStaffMenu()

### Community 14 - "AdoptionApplication"
Cohesion: 0.13
Nodes (9): AdoptionApplicationController, {closure#1}(), {closure#5}(), {closure#6}(), {closure#7}(), ApplicationResource, {closure#1}(), MyApplicationResource (+1 more)

### Community 15 - "BackButton"
Cohesion: 0.14
Nodes (19): BackButton(), Pagination(), ROLE_LABELS, LEGAL_UPDATED, legalOrder, legalPages, AdoptionApplications(), getApplicationDate() (+11 more)

### Community 17 - "Settings.jsx"
Cohesion: 0.15
Nodes (19): AccountForm(), ADDRESS_FIELDS, DEFAULT_PROFILE, FIELD_ORDER, initialsOf(), loadProfile(), saveProfile(), todayLocal() (+11 more)

### Community 19 - "authService.js"
Cohesion: 0.31
Nodes (16): hasPermission(), AuthProvider(), changePasswordRequest(), clearToken(), fetchCurrentUser(), getStoredToken(), loginRequest(), logoutRequest() (+8 more)

### Community 21 - "useFetch"
Cohesion: 0.10
Nodes (37): Known issues (not fixed yet), articlePlaceholders, ReportClaims(), CITIZEN, useFetch(), NONE, useMyClaims(), ContactRow() (+29 more)

### Community 22 - "lucide-react"
Cohesion: 0.14
Nodes (23): Modal(), SignInModal(), statuses, StatusHelp(), ClaimPetButton(), ClaimForm(), ClaimPetModal(), toISO() (+15 more)

### Community 23 - "bootstrap/app.php"
Cohesion: 0.14
Nodes (9): EnsurePasswordChanged, EnsurePermission, EnsureRole, SecurityHeaders, {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}() (+1 more)

### Community 24 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.09
Nodes (6): AnimalPhoto, EmailOtp, HealthLog, MissingPetPhoto, PetClaimPhoto, PublicFile

### Community 26 - "Placeholder Images"
Cohesion: 0.11
Nodes (10): Article Image 1 Placeholder, Article Image 2 Placeholder, Article Image 3 Placeholder, Article Image 4 Placeholder, Article Image 5 Placeholder, Article Image 6 Placeholder, aboutPlaceholders, Paw-Print Gradient Placeholder Template (+2 more)

### Community 27 - "Application Details Page"
Cohesion: 0.12
Nodes (27): petPlaceholders, isKeyboardFocus(), PhotoGallery(), SafeImage(), AdoptionApplicationDetails(), animalLabel(), ContactRow(), Detail() (+19 more)

### Community 29 - "Password Reset Email"
Cohesion: 0.24
Nodes (3): PawmilyaResetPassword, {closure#1}(), PasswordResetEmailTest

### Community 30 - "MascotWelcome.jsx"
Cohesion: 0.14
Nodes (19): audio(), playVoice(), woof(), FRAMES, MascotWelcome(), cancelAutoHide(), clampToViewport(), closeBubble() (+11 more)

### Community 31 - "MissingPetReport"
Cohesion: 0.08
Nodes (13): ReleaseUnclaimedReportsCommand, RemoveDemoPetsCommand, {closure#2}(), {closure#4}(), {closure#5}(), MissingPetReportController, MissingPetResource, StaffMissingPetResource (+5 more)

### Community 32 - "ShiftsApiTest"
Cohesion: 0.06
Nodes (14): {closure#1}(), {closure#3}(), Setting, Shift, StaffShift, {closure#4}(), {closure#5}(), {closure#6}() (+6 more)

### Community 33 - "Illuminate\Http\JsonResponse"
Cohesion: 0.09
Nodes (9): EmailOtpController, MyShiftController, PasswordController, ProfileController, ScheduleController, ShiftAssignmentResource, UserResource, Audit (+1 more)

### Community 34 - "AppServiceProvider.php"
Cohesion: 0.13
Nodes (7): AppServiceProvider, {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}(), {closure#5}(), PublicCache

### Community 37 - "authService.js"
Cohesion: 0.10
Nodes (28): BreedSelect(), ErrorBoundary, SuggestInput(), EmergencyReportFlow(), EmergencyReportModal(), emptyForm, isFutureDateTime(), joinList() (+20 more)

### Community 39 - "VaccinationApiTest"
Cohesion: 0.08
Nodes (5): {closure#7}(), {closure#1}(), PetCareArticleController, AnimalApiTest, VaccinationApiTest

### Community 42 - "0001_01_01_000002_create_jobs_table.php"
Cohesion: 0.33
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 43 - "Illuminate\Contracts\Validation\Validator"
Cohesion: 0.16
Nodes (6): {closure#1}(), StoreApplicationRequest, {closure#3}(), {closure#1}(), {closure#1}(), {closure#1}()

### Community 45 - "api.php"
Cohesion: 0.17
Nodes (11): Data rules, Differences from Proposal Documentation.pdf, graphify-out knowledge graph, Pawmilya, Phases, Proposal Documentation.pdf (the paper), Required changes on top of the wireframes [CHANGE], Run (+3 more)

### Community 46 - "Pawmilya"
Cohesion: 0.14
Nodes (12): Backend, Configuration notes, Current status, Data rules, Differences from Proposal Documentation.pdf, First-time setup, Folder structure, Frontend (+4 more)

### Community 47 - "Laravel 12 REST API backend"
Cohesion: 0.20
Nodes (8): robots.txt (allow all crawlers), Eloquent ORM, Laravel framework (default README), Schema migrations, Laravel 12 REST API backend, MySQL / XAMPP MariaDB (DB poundcare), ProtectedRoute (planned), Roles

### Community 48 - "backend/package.json"
Cohesion: 0.15
Nodes (12): axios, vite, private, $schema, scripts, build, dev, type (+4 more)

### Community 51 - "frontend/package.json"
Cohesion: 0.17
Nodes (9): axios, vite, name, private, type, version, @types/react, @types/react-dom (+1 more)

### Community 53 - "composer.json"
Cohesion: 0.22
Nodes (8): description, keywords, license, minimum-stability, name, prefer-stable, $schema, type

### Community 54 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+1 more)

### Community 55 - "backend/README.md"
Cohesion: 0.22
Nodes (8): About Laravel, Code of Conduct, Contributing, Laravel Sponsors, Learning Laravel, License, Premium Partners, Security Vulnerabilities

### Community 56 - "AdoptionApplication.jsx"
Cohesion: 0.20
Nodes (14): ImageDropzone(), AdoptionApplication(), AgreeCheckbox(), EMPLOYMENT_OPTIONS, HOME_PHOTO_CHECKLIST, PROMPT_OPTIONS, PRONOUN_OPTIONS, RadioGroup() (+6 more)

### Community 57 - "Development phases 0-8"
Cohesion: 0.28
Nodes (9): Adoption application (valid ID + proof of income uploads), SVG QR codes (bacon/bacon-qr-code), [CHANGE] required changes on top of wireframes, Development phases 0-8, Missing Pet Reports (guest/citizen), Stray QR code page (pet + owner info), Vaccinations and health logs, Working rules (+1 more)

### Community 58 - "AppRoutes.jsx"
Cohesion: 0.14
Nodes (38): Auth (still mock), loginPlaceholder, RequirePermission(), AuthBackButton(), FieldError(), FormError(), RequireSignIn(), PasswordHelp() (+30 more)

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

### Community 66 - "authService.js"
Cohesion: 0.33
Nodes (6): require, bacon/bacon-qr-code, laravel/framework, laravel/sanctum, laravel/tinker, php

### Community 68 - "api.php"
Cohesion: 0.09
Nodes (7): AuditLogController, Controller, {closure#3}(), UserManagementController, VaccinationController, VaccineController, GET /user()

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

### Community 82 - "api"
Cohesion: 0.18
Nodes (12): /api/health endpoint, API online/offline footer indicator, AuthContext (planned), Open question: Continue with Google vs Sanctum only, Mock data (src/data, src/services/*Service.js), React + Vite frontend, Reference UI (ui-reference/poundcare-frontend), Sanctum Bearer token auth (+4 more)

### Community 89 - "User"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 90 - "AnimalApiTest"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

### Community 91 - "Animal"
Cohesion: 0.12
Nodes (7): AnimalController, {closure#6}(), StoreAnimalRequest, AnimalResource, Animal, {closure#1}(), {closure#2}()

### Community 94 - "AuditLog"
Cohesion: 0.14
Nodes (4): {closure#11}(), {closure#5}(), AuditLog, {closure#3}()

### Community 96 - "Illuminate\Support\Facades\Schema"
Cohesion: 0.15
Nodes (3): {closure#1}(), {closure#1}(), {closure#1}()

### Community 97 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.15
Nodes (3): {closure#1}(), {closure#1}(), {closure#1}()

### Community 120 - "2026_10_27_000200_add_vaccine_id_to_health_logs.php"
Cohesion: 0.33
Nodes (4): {closure#1}(), {closure#3}(), mapExistingRecords(), up()

### Community 121 - "2026_10_21_000700_create_shifts_tables.php"
Cohesion: 0.33
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 136 - "ParticleBackground.jsx"
Cohesion: 0.53
Nodes (5): buildParticles(), createRandom(), PARTICLE_COLORS, ParticleBackground(), PawShape()

### Community 138 - "main.jsx"
Cohesion: 0.29
Nodes (5): frontend index.html (Pawmilya), Vite Lightning Bolt Favicon, App(), Vite Logo, react-dom

### Community 139 - "SiteContentController"
Cohesion: 0.20
Nodes (5): {closure#1}(), {closure#1}(), SiteContentController, {closure#2}(), SiteContent

### Community 141 - "phLocations.js"
Cohesion: 0.38
Nodes (5): build(), loadPhLocations(), SMALL_WORDS, titleCase(), phil-reg-prov-mun-brgy

### Community 146 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.15
Nodes (3): UpdateAvatarRequest, UpdateEmailRequest, AssignShiftRequest

### Community 149 - "0001_01_01_000000_create_users_table.php"
Cohesion: 0.33
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 156 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

## Ambiguous Edges - Review These
- `User Page Hero Banner Pattern (warm pet photography header)` → `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`  [AMBIGUOUS]
  frontend/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **23 isolated node(s):** `axios`, `concurrently`, `tailwindcss`, `vite`, `emails.layout` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 565 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **89 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `Animal` to `UserManagementApiTest`, `Illuminate\Http\Request`, `ReportPostingLimit`, `Illuminate\Support\Facades\Storage`, `ReportSubmitted`, `SiteContentController`, `StoreMissingPetRequest`, `RescuedReportFlowTest`, `Missing Pet API Tests`, `bootstrap/app.php`, `Illuminate\Database\Eloquent\Model`, `Auth Security Tests`, `Illuminate\Database\Eloquent\Relations\HasMany`, `Password Reset Email`, `MissingPetReport`, `ShiftsApiTest`, `Illuminate\Http\JsonResponse`, `RoleMiddlewareTest`, `.login`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `LostReportFlowTest`, `ReportPostingLimitTest`, `RbacMatrixTest`, `AuthTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `DemoPetsTest`, `api.php`, `MissingPetPublicVisibilityTest`, `NeuteredFieldTest`, `AdoptedAnimalQrEditTest`, `ProfileAddressTest`, `ProfileAvatarTest`, `PetClaimTest`, `Laravel 12 REST API backend`, `ProfileNameTest`, `ReportApiTest`, `ValidIdVerificationTest`, `AuditLog`, `AutoRegisterOnFoundTest`, `ProfileEmailTest`, `RegisterAnimalFromReportTest`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **What connects `axios`, `concurrently`, `tailwindcss` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.07676767676767676 - nodes in this community are weakly interconnected._
- **Why does `Animal` connect `Animal` to `Illuminate\Http\Request`, `Illuminate\Support\Facades\Storage`, `Animal`, `ReleaseUnclaimedReports.php`, `AdoptionApplication`, `AnimalController.php`, `Missing Pet API Tests`, `bootstrap/app.php`, `Illuminate\Database\Eloquent\Model`, `Illuminate\Database\Eloquent\Relations\HasMany`, `MissingPetReport`, `Illuminate\Http\JsonResponse`, `AppServiceProvider.php`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `LostReportFlowTest`, `Illuminate\Contracts\Validation\Validator`, `RbacMatrixTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `DemoPetsTest`, `NeuteredFieldTest`, `AdoptedAnimalQrEditTest`, `Laravel 12 REST API backend`, `ReportApiTest`, `ValidIdVerificationTest`, `AuditLog`, `DemoPetSeeder`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `Role Dashboards` be split into smaller, more focused modules?**
  _Cohesion score 0.051425899953249185 - nodes in this community are weakly interconnected._
- **Why does `TestCase` connect `Animal` to `UserManagementApiTest`, `Illuminate\Support\Facades\Storage`, `ReportSubmitted`, `RescuedReportFlowTest`, `Missing Pet API Tests`, `Illuminate\Database\Eloquent\Model`, `Auth Security Tests`, `Password Reset Email`, `ShiftsApiTest`, `RoleMiddlewareTest`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `LostReportFlowTest`, `ReportPostingLimitTest`, `RbacMatrixTest`, `AuthTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `DemoPetsTest`, `MissingPetPublicVisibilityTest`, `NeuteredFieldTest`, `AdoptedAnimalQrEditTest`, `ServerErrorResponseTest.php`, `ProfileAddressTest`, `ProfileAvatarTest`, `PetClaimTest`, `Laravel 12 REST API backend`, `ProfileNameTest`, `ReportApiTest`, `ValidIdVerificationTest`, `AuditLog`, `AutoRegisterOnFoundTest`, `ProfileEmailTest`, `RegisterAnimalFromReportTest`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `User Page Hero Banner Pattern (warm pet photography header)` and `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._