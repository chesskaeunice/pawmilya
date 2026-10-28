# Graph Report - Pawmilya-merged  (2026-10-28)

## Corpus Check
- 334 files · ~171,870 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 98 file(s) not represented in the graph (top: .css 75, (none) 18, .example 2)

## Summary
- 2319 nodes · 6292 edges · 155 communities (75 shown, 80 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 117 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b8673859`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- Illuminate\Database\Schema\Blueprint
- StaffSchedule.jsx
- Admin Reports
- Illuminate\Http\Request
- Illuminate\Support\Facades\Storage
- Animal Status Rules
- Home.jsx
- ResetPasswordRequest
- ReportSubmitted
- Animal
- User Page Hero Banner Pattern (warm pet photography header)
- ShiftsApiTest
- AdminLayout.jsx
- AdoptionApplication
- Dashboard.jsx
- AnimalController.php
- Settings.jsx
- RescuedReportFlowTest
- authService.js
- Missing Pet API Tests
- MissingPetReportDetails.jsx
- useFetch
- bootstrap/app.php
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Auth Security Tests
- Placeholder Images
- BackButton
- Illuminate\Database\Eloquent\Relations\HasMany
- Password Reset Email
- MascotWelcome.jsx
- MissingPetReport
- Carbon\Carbon
- UserResource
- AppServiceProvider.php
- RoleMiddlewareTest
- .login
- authService.js
- AdoptionApplicationApiTest
- VaccinationApiTest
- LostReportFlowTest
- ReportPostingLimitTest
- AnimalApiTest
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
- AdoptionApplication.jsx
- Development phases 0-8
- AppRoutes.jsx
- 2026_11_01_000200_add_claim_deadline_to_missing_pet_reports.php
- Illuminate\Http\JsonResponse
- AnimalPhoto
- config
- Reports.jsx
- vaccinations.js
- Vaccinations.jsx
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
- KennelManagerDashboard.jsx
- MissingPetReportController.php
- AuditLog
- ProfileNameTest
- AdoptionApplicationApiTest
- User
- AnimalApiTest
- Animal.php
- ReportApiTest
- ValidIdVerificationTest
- Illuminate\Database\Eloquent\Model
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
- PoundStaffDashboard.jsx
- VetTechDashboard.jsx
- 2026_10_21_000500_create_missing_pet_reports_table.php
- RegisterAnimalFromReportTest
- 2026_10_25_000100_add_animal_id_to_missing_pet_reports.php
- 2026_10_26_000100_add_avatar_path_to_users.php
- ReportSubmitted
- 2026_10_26_000300_add_reporter_type_to_missing_pet_reports.php
- 2026_10_26_000400_add_other_species_to_animals.php
- 2026_10_26_000500_default_staff_shift_status_active.php
- 2026_10_22_000100_add_must_change_password_to_users.php
- User
- Illuminate\Database\Seeder
- 2026_11_02_000100_add_for_adoption_missing_pet_status.php
- ParticleBackground.jsx
- AdoptionCounselorDashboard.jsx
- Illuminate\Http\JsonResponse
- StoreMissingPetRequest
- phLocations.js
- report-submitted.blade.php
- 2026_10_21_000100_add_role_fields_to_users_table.php
- verify-otp.blade.php
- 2026_11_06_000100_drop_demo_key_from_animals_and_missing_pet_reports.php
- 2026_11_03_000100_create_pet_claims_tables.php
- 2026_10_21_000300_create_health_logs_table.php
- 0001_01_01_000000_create_users_table.php
- 2026_10_21_000400_create_adoption_applications_table.php
- 2026_11_04_000100_drop_age_from_animals_table.php
- 2026_11_05_000100_add_demo_key_to_animals_and_missing_pet_reports.php
- 2026_10_27_000100_create_email_otps_table.php

## God Nodes (most connected - your core abstractions)
1. `User` - 130 edges
2. `Animal` - 78 edges
3. `react` - 72 edges
4. `TestCase` - 68 edges
5. `useAuth()` - 67 edges
6. `MissingPetReport` - 64 edges
7. `useFetch()` - 59 edges
8. `BackButton()` - 58 edges
9. `react-router-dom` - 53 edges
10. `lucide-react` - 49 edges

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

## Communities (155 total, 80 thin omitted)

### Community 0 - "react"
Cohesion: 0.06
Nodes (48): App(), Modal(), SignInModal(), EmergencyButton(), ClaimForm(), toISO(), ImageDropzone(), DonateInKindModal() (+40 more)

### Community 1 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.16
Nodes (9): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}(), {closure#3}() (+1 more)

### Community 2 - "StaffSchedule.jsx"
Cohesion: 0.21
Nodes (21): MyShifts(), OnDutyToday(), addDays(), NONE, StaffSchedule(), STATUSES, assignShift(), changeAssignmentStatus() (+13 more)

### Community 3 - "Admin Reports"
Cohesion: 0.12
Nodes (44): statusClass(), ACTIVITY, addDays(), AdoptionsReport(), AnimalsReport(), Bar(), countBy(), countOf() (+36 more)

### Community 4 - "Illuminate\Http\Request"
Cohesion: 0.10
Nodes (8): {closure#1}(), PublicAnimalController, ReportController, MissingPetResource, MyApplicationResource, PublicAnimalResource, StaffMissingPetResource, VaccinationResource

### Community 5 - "Illuminate\Support\Facades\Storage"
Cohesion: 0.13
Nodes (8): {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}(), {closure#5}(), PetClaimController, StoreClaimRequest, PetClaim

### Community 6 - "Animal Status Rules"
Cohesion: 0.08
Nodes (50): Known issues (not fixed yet), ClaimPeriodNote(), ADOPTABLE_STATUS, ADOPTION_NEEDS_CLEARED_MESSAGE, ADOPTION_STATUSES, allowedStatuses(), ANIMAL_STATUSES, canBeAdoptable() (+42 more)

### Community 7 - "Home.jsx"
Cohesion: 0.08
Nodes (32): ALL_FIELDS, FilterDropdown(), Pagination(), SearchBar(), ArticleCard(), getCurrentIndex(), isKeyboardFocus(), ScrollStrip() (+24 more)

### Community 8 - "ResetPasswordRequest"
Cohesion: 0.09
Nodes (4): RegisterRequest, ResetPasswordRequest, {closure#1}(), PasswordRules

### Community 9 - "ReportSubmitted"
Cohesion: 0.07
Nodes (4): VerifyEmailOtp, UserFactory, {closure#1}(), EmailOtpTest

### Community 10 - "Animal"
Cohesion: 0.08
Nodes (5): {closure#1}(), Animal, AuditLog, ExampleTest, TestCase

### Community 11 - "User Page Hero Banner Pattern (warm pet photography header)"
Cohesion: 0.33
Nodes (7): Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset), Adoptable Pets Hero Photo (woman interacting with four dogs in a training/shelter room), Cat and Dog Companionship Imagery, Home Hero Photo (person holding two cream Labrador puppies outdoors), User Page Hero Banner Pattern (warm pet photography header), My Applications Hero Photo (two kittens and a puppy peeking over a white ledge), Missing Pets Hero Photo (orange kitten sleeping on a golden puppy)

### Community 13 - "AdminLayout.jsx"
Cohesion: 0.21
Nodes (6): AdminHeader(), AdminSidebar(), initialsOf(), menuItems, AdminLayout(), useStaffMenu()

### Community 14 - "AdoptionApplication"
Cohesion: 0.13
Nodes (9): AdoptionApplicationController, {closure#1}(), {closure#5}(), {closure#6}(), {closure#7}(), StoreApplicationRequest, ApplicationResource, {closure#1}() (+1 more)

### Community 15 - "Dashboard.jsx"
Cohesion: 0.40
Nodes (4): CITIZEN, ROLE_LABELS, rolePermissions, ROLES

### Community 16 - "AnimalController.php"
Cohesion: 0.07
Nodes (7): AnimalController, {closure#10}(), {closure#5}(), {closure#6}(), StoreAnimalRequest, UpdateAnimalRequest, AnimalResource

### Community 17 - "Settings.jsx"
Cohesion: 0.20
Nodes (15): AccountForm(), ADDRESS_FIELDS, DEFAULT_PROFILE, FIELD_ORDER, initialsOf(), loadProfile(), saveProfile(), todayLocal() (+7 more)

### Community 19 - "authService.js"
Cohesion: 0.29
Nodes (17): hasPermission(), AuthProvider(), TOKEN_KEY, changePasswordRequest(), clearToken(), fetchCurrentUser(), getStoredToken(), loginRequest() (+9 more)

### Community 21 - "MissingPetReportDetails.jsx"
Cohesion: 0.20
Nodes (17): ReportClaims(), ContactRow(), Detail(), formatTimestamp(), InfoBox(), MissingPetReportDetails(), STATUS_OPTIONS, StatusBadge() (+9 more)

### Community 22 - "useFetch"
Cohesion: 0.11
Nodes (40): petPlaceholders, SafeImage(), statuses, StatusHelp(), PetPreviewCard(), ClaimPetButton(), ClaimPetModal(), useFetch() (+32 more)

### Community 23 - "bootstrap/app.php"
Cohesion: 0.11
Nodes (11): EnsurePasswordChanged, EnsurePermission, EnsureRole, SecurityHeaders, {closure#1}(), SafeMail, {closure#1}(), {closure#2}() (+3 more)

### Community 26 - "Placeholder Images"
Cohesion: 0.11
Nodes (10): Article Image 1 Placeholder, Article Image 2 Placeholder, Article Image 3 Placeholder, Article Image 4 Placeholder, Article Image 5 Placeholder, Article Image 6 Placeholder, aboutPlaceholders, Paw-Print Gradient Placeholder Template (+2 more)

### Community 27 - "BackButton"
Cohesion: 0.10
Nodes (32): articlePlaceholders, BackButton(), LEGAL_UPDATED, legalOrder, legalPages, AdoptionApplicationDetails(), animalLabel(), ContactRow() (+24 more)

### Community 29 - "Password Reset Email"
Cohesion: 0.16
Nodes (3): PawmilyaResetPassword, {closure#1}(), PasswordResetEmailTest

### Community 30 - "MascotWelcome.jsx"
Cohesion: 0.14
Nodes (19): audio(), playVoice(), woof(), FRAMES, MascotWelcome(), cancelAutoHide(), clampToViewport(), closeBubble() (+11 more)

### Community 31 - "MissingPetReport"
Cohesion: 0.11
Nodes (9): {closure#2}(), {closure#3}(), {closure#4}(), MissingPetReport, {closure#1}(), PoundMatcher, {closure#1}(), {closure#2}() (+1 more)

### Community 32 - "Carbon\Carbon"
Cohesion: 0.09
Nodes (12): MyShiftController, {closure#1}(), {closure#3}(), ScheduleController, AssignShiftRequest, ShiftAssignmentResource, Shift, StaffShift (+4 more)

### Community 33 - "UserResource"
Cohesion: 0.08
Nodes (6): ProfileController, UpdateAddressRequest, UpdateAvatarRequest, UpdateEmailRequest, UpdateProfileRequest, UserResource

### Community 34 - "AppServiceProvider.php"
Cohesion: 0.16
Nodes (6): AppServiceProvider, {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}(), {closure#5}()

### Community 36 - ".login"
Cohesion: 0.16
Nodes (4): AuthController, EmailOtpController, EmailOtpService, LoginGuard

### Community 37 - "authService.js"
Cohesion: 0.11
Nodes (26): BreedSelect(), ErrorBoundary, SuggestInput(), EmergencyReportFlow(), EmergencyReportModal(), emptyForm, isFutureDateTime(), joinList() (+18 more)

### Community 39 - "VaccinationApiTest"
Cohesion: 0.10
Nodes (5): {closure#1}(), PetCareArticleController, UserManagementApiTest, {closure#3}(), VaccinationApiTest

### Community 43 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.07
Nodes (11): {closure#2}(), VaccinationController, {closure#1}(), {closure#3}(), LoginRequest, {closure#1}(), {closure#1}(), {closure#1}() (+3 more)

### Community 45 - "api.php"
Cohesion: 0.15
Nodes (12): Data rules, Differences from Proposal Documentation.pdf, Folder structure (frontend/src), graphify-out knowledge graph, Pawmilya, Phases, Proposal Documentation.pdf (the paper), Required changes on top of the wireframes [CHANGE] (+4 more)

### Community 46 - "Pawmilya"
Cohesion: 0.11
Nodes (16): /api/health endpoint, API online/offline footer indicator, Laravel 12 REST API backend, MySQL / XAMPP MariaDB (DB poundcare), Backend, Configuration notes, Current status, Data rules (+8 more)

### Community 47 - "Laravel framework (default README)"
Cohesion: 0.50
Nodes (4): robots.txt (allow all crawlers), Eloquent ORM, Laravel framework (default README), Schema migrations

### Community 48 - "backend/package.json"
Cohesion: 0.12
Nodes (13): axios, vite, private, $schema, scripts, build, dev, type (+5 more)

### Community 51 - "frontend/package.json"
Cohesion: 0.13
Nodes (14): axios, vite, name, private, scripts, build, dev, lint (+6 more)

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
Cohesion: 0.12
Nodes (24): isKeyboardFocus(), PhotoGallery(), PreviewStatus(), articles, AdoptionApplication(), AgreeCheckbox(), EMPLOYMENT_OPTIONS, HOME_PHOTO_CHECKLIST (+16 more)

### Community 57 - "Development phases 0-8"
Cohesion: 0.13
Nodes (17): Adoption application (valid ID + proof of income uploads), AuthContext (planned), SVG QR codes (bacon/bacon-qr-code), [CHANGE] required changes on top of wireframes, Open question: Continue with Google vs Sanctum only, Development phases 0-8, Missing Pet Reports (guest/citizen), ProtectedRoute (planned) (+9 more)

### Community 58 - "AppRoutes.jsx"
Cohesion: 0.14
Nodes (36): Auth (still mock), loginPlaceholder, RequirePermission(), AuthBackButton(), FieldError(), FormError(), RequireSignIn(), PasswordHelp() (+28 more)

### Community 60 - "Illuminate\Http\JsonResponse"
Cohesion: 0.25
Nodes (8): require-dev, fakerphp/faker, laravel/pail, laravel/pint, laravel/sail, mockery/mockery, nunomaduro/collision, phpunit/phpunit

### Community 61 - "AnimalPhoto"
Cohesion: 0.13
Nodes (5): AnimalPhoto, MissingPetPhoto, PublicFile, {closure#1}(), {closure#6}()

### Community 62 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 63 - "Reports.jsx"
Cohesion: 0.29
Nodes (7): devDependencies, axios, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite

### Community 64 - "vaccinations.js"
Cohesion: 0.17
Nodes (11): Mock data (src/data, src/services/*Service.js), React + Vite frontend, frontend index.html (Pawmilya), Vite Lightning Bolt Favicon, Expanding the Oxlint configuration, @vitejs/plugin-react (Oxc) / plugin-react-swc (SWC), React Compiler, React + Vite (+3 more)

### Community 65 - "Vaccinations.jsx"
Cohesion: 0.21
Nodes (19): addDays(), formatDate(), getStatus(), newestFirst(), newRow(), normalize(), pad(), parseDate() (+11 more)

### Community 66 - "authService.js"
Cohesion: 0.33
Nodes (6): require, bacon/bacon-qr-code, laravel/framework, laravel/sanctum, laravel/tinker, php

### Community 68 - "api.php"
Cohesion: 0.09
Nodes (5): AuditLogController, {closure#5}(), Controller, VaccineController, GET /user()

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

### Community 82 - "KennelManagerDashboard.jsx"
Cohesion: 0.22
Nodes (18): ACTIVE_MISSING_STATUSES, ATTENTION_STATUSES, BreakdownGroup(), countBy(), DashboardCard(), EmptyState(), formatTimestamp(), getDaysUntil() (+10 more)

### Community 83 - "MissingPetReportController.php"
Cohesion: 0.20
Nodes (3): ReleaseUnclaimedReportsCommand, MissingPetReportController, ReleaseUnclaimedReports

### Community 89 - "User"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 90 - "AnimalApiTest"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

### Community 94 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.24
Nodes (3): EmailOtp, PetClaimPhoto, Setting

### Community 96 - "Illuminate\Support\Facades\Schema"
Cohesion: 0.14
Nodes (4): {closure#1}(), {closure#2}(), {closure#1}(), {closure#1}()

### Community 97 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.14
Nodes (3): {closure#1}(), {closure#1}(), {closure#1}()

### Community 120 - "2026_10_27_000200_add_vaccine_id_to_health_logs.php"
Cohesion: 0.33
Nodes (4): {closure#1}(), {closure#3}(), mapExistingRecords(), up()

### Community 121 - "2026_10_21_000700_create_shifts_tables.php"
Cohesion: 0.33
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 122 - "PoundStaffDashboard.jsx"
Cohesion: 0.21
Nodes (16): EMPTY, useAdminLists(), DashboardCard(), EmptyState(), formatTimestamp(), getAnimalDate(), getAnimalImage(), getAnimalLocation() (+8 more)

### Community 123 - "VetTechDashboard.jsx"
Cohesion: 0.22
Nodes (17): ATTENTION_PRIORITY, ATTENTION_STATUSES, DashboardCard(), EmptyState(), formatTimestamp(), getActivityDate(), getDaysSince(), getDueLabel() (+9 more)

### Community 128 - "ReportSubmitted"
Cohesion: 0.26
Nodes (4): ReportSubmitted, {closure#1}(), {closure#2}(), ReportEmailTest

### Community 133 - "User"
Cohesion: 0.10
Nodes (6): {closure#2}(), {closure#1}(), User, ReportPostingLimit, {closure#3}(), ValidationWordingTest

### Community 134 - "Illuminate\Database\Seeder"
Cohesion: 0.27
Nodes (3): DatabaseSeeder, ShiftSeeder, UserSeeder

### Community 136 - "ParticleBackground.jsx"
Cohesion: 0.53
Nodes (5): buildParticles(), createRandom(), PARTICLE_COLORS, ParticleBackground(), PawShape()

### Community 138 - "AdoptionCounselorDashboard.jsx"
Cohesion: 0.38
Nodes (9): AdoptionCounselorDashboard(), DashboardCard(), EmptyState(), formatTimestamp(), getApplicationDate(), getInitials(), MissingStatus(), StatCard() (+1 more)

### Community 139 - "Illuminate\Http\JsonResponse"
Cohesion: 0.10
Nodes (10): {closure#1}(), PasswordController, {closure#1}(), SiteContentController, {closure#3}(), UserManagementController, ChangePasswordRequest, Audit (+2 more)

### Community 141 - "phLocations.js"
Cohesion: 0.50
Nodes (3): build(), SMALL_WORDS, titleCase()

### Community 149 - "0001_01_01_000000_create_users_table.php"
Cohesion: 0.33
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

## Ambiguous Edges - Review These
- `User Page Hero Banner Pattern (warm pet photography header)` → `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`  [AMBIGUOUS]
  frontend/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **23 isolated node(s):** `axios`, `concurrently`, `tailwindcss`, `vite`, `emails.layout` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 557 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **80 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `Illuminate\Database\Seeder`, `ResetPasswordRequest`, `ReportSubmitted`, `Animal`, `Illuminate\Http\JsonResponse`, `ShiftsApiTest`, `RescuedReportFlowTest`, `Missing Pet API Tests`, `Auth Security Tests`, `Illuminate\Database\Eloquent\Relations\HasMany`, `Password Reset Email`, `MissingPetReport`, `Carbon\Carbon`, `RoleMiddlewareTest`, `.login`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `LostReportFlowTest`, `ReportPostingLimitTest`, `AnimalApiTest`, `Illuminate\Foundation\Http\FormRequest`, `RbacMatrixTest`, `AuthTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `MissingPetPublicVisibilityTest`, `NeuteredFieldTest`, `AdoptedAnimalQrEditTest`, `ProfileAddressTest`, `ProfileAvatarTest`, `PetClaimTest`, `ProfileNameTest`, `ReportApiTest`, `ValidIdVerificationTest`, `AutoRegisterOnFoundTest`, `ProfileEmailTest`, `RegisterAnimalFromReportTest`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **What connects `axios`, `concurrently`, `tailwindcss` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.06049213943950786 - nodes in this community are weakly interconnected._
- **Why does `Animal` connect `Animal` to `Illuminate\Http\Request`, `Illuminate\Support\Facades\Storage`, `AdoptionApplication`, `AnimalController.php`, `Missing Pet API Tests`, `Illuminate\Database\Eloquent\Relations\HasMany`, `MissingPetReport`, `AppServiceProvider.php`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `LostReportFlowTest`, `AnimalApiTest`, `Illuminate\Foundation\Http\FormRequest`, `RbacMatrixTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `NeuteredFieldTest`, `AdoptedAnimalQrEditTest`, `MissingPetReportController.php`, `Animal.php`, `ReportApiTest`, `ValidIdVerificationTest`, `Illuminate\Database\Eloquent\Model`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `Admin Reports` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Why does `TestCase` connect `Animal` to `ReportSubmitted`, `User`, `ReportSubmitted`, `ShiftsApiTest`, `RescuedReportFlowTest`, `Missing Pet API Tests`, `Auth Security Tests`, `Password Reset Email`, `RoleMiddlewareTest`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `LostReportFlowTest`, `ReportPostingLimitTest`, `AnimalApiTest`, `RbacMatrixTest`, `AuthTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `MissingPetPublicVisibilityTest`, `NeuteredFieldTest`, `AdoptedAnimalQrEditTest`, `ServerErrorResponseTest.php`, `ProfileAddressTest`, `ProfileAvatarTest`, `PetClaimTest`, `ProfileNameTest`, `ReportApiTest`, `ValidIdVerificationTest`, `AutoRegisterOnFoundTest`, `ProfileEmailTest`, `RegisterAnimalFromReportTest`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `User Page Hero Banner Pattern (warm pet photography header)` and `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._