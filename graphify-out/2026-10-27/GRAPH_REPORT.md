# Graph Report - Pawmilya-merged  (2026-10-27)

## Corpus Check
- 332 files · ~170,029 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 97 file(s) not represented in the graph (top: .css 75, (none) 18, .example 2)

## Summary
- 2309 nodes · 6274 edges · 157 communities (69 shown, 88 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 117 edges (avg confidence: 0.87)
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
- AnimalApiTest
- Animal Status Rules
- BackButton
- UserManagementController.php
- ReportSubmitted
- Animal
- useFetch
- ReleaseUnclaimedReports
- useAuth
- AdoptionApplication
- SafeImage
- AnimalController.php
- Settings.jsx
- RescuedReportFlowTest
- Shifts API Tests
- Missing Pet API Tests
- BackButton
- lucide-react
- bootstrap/app.php
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Auth Security Tests
- Placeholder Images
- Application Details Page
- Illuminate\Database\Eloquent\Relations\HasMany
- Password Reset Email
- MascotWelcome.jsx
- MissingPetReport
- Carbon\Carbon
- Illuminate\Http\JsonResponse
- AppServiceProvider.php
- RoleMiddlewareTest
- Setting
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
- formatApiError
- 2026_11_01_000200_add_claim_deadline_to_missing_pet_reports.php
- Illuminate\Http\JsonResponse
- AnimalPhoto
- config
- Reports.jsx
- vaccinations.js
- AdoptionApplicationDetails.jsx
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
- FilterDropdown.jsx
- LoginRequest
- AuditLog
- ProfileNameTest
- AdoptionApplicationApiTest
- User
- AnimalApiTest
- Animal
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
- 2026_10_22_000100_add_must_change_password_to_users.php
- User
- 2026_10_27_000100_create_vaccines_table.php
- 2026_11_02_000100_add_for_adoption_missing_pet_status.php
- ParticleBackground.jsx
- PublicAnimalController.php
- SiteContentController
- StoreMissingPetRequest
- 2026_10_21_000600_create_audit_logs_table.php
- report-submitted.blade.php
- UpdateAddressRequest
- verify-otp.blade.php
- Illuminate\Foundation\Http\FormRequest
- 2026_11_03_000100_create_pet_claims_tables.php
- EmailOtpService.php
- StoreVaccinationRequest.php
- UpdateVaccinationRequest
- Illuminate\Validation\Rule
- UpdateProfileRequest
- StoreClaimRequest
- AssignShiftRequest
- PasswordRules.php

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

## Communities (157 total, 88 thin omitted)

### Community 0 - "react"
Cohesion: 0.10
Nodes (26): Folder structure (frontend/src), EmergencyButton(), exploreLinks, UserFooter(), getLinks(), myApplicationsLink, myMissingReportsLink, sectionIds (+18 more)

### Community 1 - "Illuminate\Database\Schema\Blueprint"
Cohesion: 0.16
Nodes (9): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}(), {closure#1}() (+1 more)

### Community 2 - "Role Dashboards"
Cohesion: 0.05
Nodes (79): MyShifts(), OnDutyToday(), useAdminLists(), AdoptionCounselorDashboard(), DashboardCard(), EmptyState(), formatTimestamp(), getApplicationDate() (+71 more)

### Community 3 - "Admin Reports"
Cohesion: 0.12
Nodes (44): statusClass(), ACTIVITY, addDays(), AdoptionsReport(), AnimalsReport(), Bar(), countBy(), countOf() (+36 more)

### Community 4 - "Illuminate\Http\Request"
Cohesion: 0.12
Nodes (6): ReportController, MissingPetResource, MyApplicationResource, PublicAnimalResource, StaffMissingPetResource, VaccinationResource

### Community 6 - "Animal Status Rules"
Cohesion: 0.08
Nodes (45): ClaimPeriodNote(), isKeyboardFocus(), PhotoGallery(), ADOPTION_NEEDS_CLEARED_MESSAGE, ADOPTION_STATUSES, allowedStatuses(), ANIMAL_STATUSES, canBeAdoptable() (+37 more)

### Community 7 - "BackButton"
Cohesion: 0.13
Nodes (21): articlePlaceholders, ReportClaims(), BackButton(), ArticleCard(), LEGAL_UPDATED, legalOrder, legalPages, ArticleDetails() (+13 more)

### Community 8 - "UserManagementController.php"
Cohesion: 0.12
Nodes (4): {closure#3}(), UserManagementController, ChangePasswordRequest, RegisterRequest

### Community 9 - "ReportSubmitted"
Cohesion: 0.10
Nodes (7): ReportSubmitted, VerifyEmailOtp, {closure#1}(), EmailOtpTest, {closure#1}(), {closure#2}(), ReportEmailTest

### Community 10 - "Animal"
Cohesion: 0.07
Nodes (5): {closure#1}(), Animal, AuditLog, ExampleTest, TestCase

### Community 11 - "useFetch"
Cohesion: 0.13
Nodes (22): getCurrentIndex(), isKeyboardFocus(), ScrollStrip(), useDebouncedValue(), useFetch(), NONE, useMyClaims(), usePetCareArticles() (+14 more)

### Community 12 - "ReleaseUnclaimedReports"
Cohesion: 0.17
Nodes (5): ReleaseUnclaimedReportsCommand, MissingPetReportController, {closure#1}(), {closure#2}(), ReleaseUnclaimedReports

### Community 13 - "useAuth"
Cohesion: 0.13
Nodes (24): Auth (still mock), Known issues (not fixed yet), App(), AdminHeader(), AdminSidebar(), initialsOf(), menuItems, RequirePermission() (+16 more)

### Community 14 - "AdoptionApplication"
Cohesion: 0.15
Nodes (8): AdoptionApplicationController, {closure#1}(), {closure#5}(), {closure#6}(), {closure#7}(), ApplicationResource, {closure#1}(), AdoptionApplication

### Community 15 - "SafeImage"
Cohesion: 0.24
Nodes (12): petPlaceholders, SafeImage(), FALLBACK, usePoundInfo(), ApprovedDetails(), MyApplications(), petLabel(), STATUS_FILTERS (+4 more)

### Community 16 - "AnimalController.php"
Cohesion: 0.07
Nodes (8): AnimalController, {closure#10}(), {closure#5}(), {closure#6}(), {closure#2}(), StoreAnimalRequest, UpdateAnimalRequest, AnimalResource

### Community 17 - "Settings.jsx"
Cohesion: 0.16
Nodes (15): ROLES, EMPTY, AREAS, AuditLogs(), formatTimestamp(), summarize(), Settings(), createStaffAccount() (+7 more)

### Community 21 - "BackButton"
Cohesion: 0.17
Nodes (20): Pagination(), ContactRow(), Detail(), formatTimestamp(), InfoBox(), MissingPetReportDetails(), STATUS_OPTIONS, StatusBadge() (+12 more)

### Community 22 - "lucide-react"
Cohesion: 0.11
Nodes (28): Modal(), SearchBar(), SignInModal(), statuses, StatusHelp(), ClaimPetButton(), ClaimForm(), ClaimPetModal() (+20 more)

### Community 23 - "bootstrap/app.php"
Cohesion: 0.14
Nodes (9): EnsurePasswordChanged, EnsurePermission, EnsureRole, SecurityHeaders, {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}() (+1 more)

### Community 26 - "Placeholder Images"
Cohesion: 0.11
Nodes (10): Article Image 1 Placeholder, Article Image 2 Placeholder, Article Image 3 Placeholder, Article Image 4 Placeholder, Article Image 5 Placeholder, Article Image 6 Placeholder, aboutPlaceholders, Paw-Print Gradient Placeholder Template (+2 more)

### Community 27 - "Application Details Page"
Cohesion: 0.22
Nodes (16): AdoptionApplicationDetails(), animalLabel(), ContactRow(), Detail(), DocumentRow(), formatBirthDate(), OverviewItem(), Question() (+8 more)

### Community 29 - "Password Reset Email"
Cohesion: 0.16
Nodes (3): PawmilyaResetPassword, {closure#1}(), PasswordResetEmailTest

### Community 30 - "MascotWelcome.jsx"
Cohesion: 0.14
Nodes (19): audio(), playVoice(), woof(), FRAMES, MascotWelcome(), cancelAutoHide(), clampToViewport(), closeBubble() (+11 more)

### Community 31 - "MissingPetReport"
Cohesion: 0.10
Nodes (9): {closure#2}(), {closure#3}(), {closure#4}(), MissingPetReport, {closure#1}(), PoundMatcher, ReportAnimalRegistrar, {closure#1}() (+1 more)

### Community 32 - "Carbon\Carbon"
Cohesion: 0.09
Nodes (12): MyShiftController, {closure#1}(), {closure#3}(), ScheduleController, ShiftAssignmentResource, Shift, StaffShift, {closure#4}() (+4 more)

### Community 33 - "Illuminate\Http\JsonResponse"
Cohesion: 0.08
Nodes (12): AuthController, Controller, EmailOtpController, {closure#1}(), PasswordController, ProfileController, VaccinationController, ResetPasswordRequest (+4 more)

### Community 34 - "AppServiceProvider.php"
Cohesion: 0.16
Nodes (6): AppServiceProvider, {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}(), {closure#5}()

### Community 36 - "Setting"
Cohesion: 0.25
Nodes (3): DatabaseSeeder, ShiftSeeder, UserSeeder

### Community 37 - "authService.js"
Cohesion: 0.09
Nodes (34): BreedSelect(), ErrorBoundary, EmergencyReportFlow(), EmergencyReportModal(), emptyForm, isFutureDateTime(), joinList(), STEP_1_FIELDS (+26 more)

### Community 39 - "VaccinationApiTest"
Cohesion: 0.09
Nodes (5): {closure#1}(), PetCareArticleController, UserManagementApiTest, {closure#3}(), VaccinationApiTest

### Community 42 - "0001_01_01_000002_create_jobs_table.php"
Cohesion: 0.33
Nodes (3): {closure#1}(), {closure#2}(), {closure#3}()

### Community 43 - "Illuminate\Contracts\Validation\Validator"
Cohesion: 0.17
Nodes (5): {closure#1}(), StoreApplicationRequest, {closure#3}(), {closure#1}(), {closure#1}()

### Community 45 - "api.php"
Cohesion: 0.17
Nodes (11): Data rules, Differences from Proposal Documentation.pdf, graphify-out knowledge graph, Pawmilya, Phases, Proposal Documentation.pdf (the paper), Required changes on top of the wireframes [CHANGE], Run (+3 more)

### Community 46 - "Pawmilya"
Cohesion: 0.12
Nodes (14): /api/health endpoint, API online/offline footer indicator, Backend, Configuration notes, Current status, Data rules, Differences from Proposal Documentation.pdf, First-time setup (+6 more)

### Community 47 - "Laravel 12 REST API backend"
Cohesion: 0.17
Nodes (10): robots.txt (allow all crawlers), Eloquent ORM, Laravel framework (default README), Schema migrations, SVG QR codes (bacon/bacon-qr-code), Laravel 12 REST API backend, MySQL / XAMPP MariaDB (DB poundcare), ProtectedRoute (planned) (+2 more)

### Community 48 - "backend/package.json"
Cohesion: 0.15
Nodes (12): axios, vite, private, $schema, scripts, build, dev, type (+4 more)

### Community 51 - "frontend/package.json"
Cohesion: 0.12
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
Cohesion: 0.13
Nodes (23): PetPreviewCard(), PreviewStatus(), ImageDropzone(), ADOPTABLE_STATUS, articles, AdoptionApplication(), AgreeCheckbox(), EMPLOYMENT_OPTIONS (+15 more)

### Community 57 - "Development phases 0-8"
Cohesion: 0.19
Nodes (13): Adoption application (valid ID + proof of income uploads), AuthContext (planned), [CHANGE] required changes on top of wireframes, Open question: Continue with Google vs Sanctum only, Development phases 0-8, Missing Pet Reports (guest/citizen), Reference UI (ui-reference/poundcare-frontend), Sanctum Bearer token auth (+5 more)

### Community 58 - "formatApiError"
Cohesion: 0.05
Nodes (81): loginPlaceholder, AccountForm(), ADDRESS_FIELDS, DEFAULT_PROFILE, FIELD_ORDER, initialsOf(), loadProfile(), saveProfile() (+73 more)

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

### Community 65 - "AdoptionApplicationDetails.jsx"
Cohesion: 0.33
Nodes (7): Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset), Adoptable Pets Hero Photo (woman interacting with four dogs in a training/shelter room), Cat and Dog Companionship Imagery, Home Hero Photo (person holding two cream Labrador puppies outdoors), User Page Hero Banner Pattern (warm pet photography header), My Applications Hero Photo (two kittens and a puppy peeking over a white ledge), Missing Pets Hero Photo (orange kitten sleeping on a golden puppy)

### Community 66 - "authService.js"
Cohesion: 0.33
Nodes (6): require, bacon/bacon-qr-code, laravel/framework, laravel/sanctum, laravel/tinker, php

### Community 68 - "api.php"
Cohesion: 0.09
Nodes (4): AuditLogController, {closure#5}(), VaccineController, GET /user()

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

### Community 81 - "PetClaimTest"
Cohesion: 0.12
Nodes (8): {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}(), {closure#5}(), PetClaimController, PetClaim, PetClaimTest

### Community 82 - "FilterDropdown.jsx"
Cohesion: 0.36
Nodes (6): ALL_FIELDS, FilterDropdown(), animalTypeOptions, defaultFilters, hasActiveFilters(), statusOptions

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

### Community 133 - "User"
Cohesion: 0.11
Nodes (5): {closure#2}(), {closure#1}(), User, ReportPostingLimit, ValidationWordingTest

### Community 136 - "ParticleBackground.jsx"
Cohesion: 0.53
Nodes (5): buildParticles(), createRandom(), PARTICLE_COLORS, ParticleBackground(), PawShape()

### Community 138 - "PublicAnimalController.php"
Cohesion: 0.14
Nodes (3): {closure#1}(), PublicAnimalController, PublicCache

### Community 139 - "SiteContentController"
Cohesion: 0.30
Nodes (3): {closure#1}(), SiteContentController, SiteContent

## Ambiguous Edges - Review These
- `User Page Hero Banner Pattern (warm pet photography header)` → `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`  [AMBIGUOUS]
  frontend/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **23 isolated node(s):** `axios`, `concurrently`, `tailwindcss`, `vite`, `emails.layout` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 553 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **88 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `AnimalApiTest`, `UserManagementController.php`, `ReportSubmitted`, `Animal`, `AnimalController.php`, `RescuedReportFlowTest`, `Shifts API Tests`, `EmailOtpService.php`, `Missing Pet API Tests`, `Auth Security Tests`, `Password Reset Email`, `MissingPetReport`, `Carbon\Carbon`, `Illuminate\Http\JsonResponse`, `RoleMiddlewareTest`, `Setting`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `LostReportFlowTest`, `ReportPostingLimitTest`, `Illuminate\Contracts\Validation\Validator`, `RbacMatrixTest`, `AuthTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `MissingPetPublicVisibilityTest`, `NeuteredFieldTest`, `AdoptedAnimalQrEditTest`, `ProfileAddressTest`, `ProfileAvatarTest`, `PetClaimTest`, `ProfileNameTest`, `Animal`, `ReportApiTest`, `ValidIdVerificationTest`, `AutoRegisterOnFoundTest`, `ProfileEmailTest`, `RegisterAnimalFromReportTest`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **What connects `axios`, `concurrently`, `tailwindcss` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.09745293466223699 - nodes in this community are weakly interconnected._
- **Why does `Animal` connect `Animal` to `Illuminate\Http\Request`, `AnimalApiTest`, `PublicAnimalController.php`, `ReleaseUnclaimedReports`, `AdoptionApplication`, `AnimalController.php`, `Missing Pet API Tests`, `StoreVaccinationRequest.php`, `Illuminate\Validation\Rule`, `Illuminate\Database\Eloquent\Relations\HasMany`, `MissingPetReport`, `AppServiceProvider.php`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `LostReportFlowTest`, `Illuminate\Contracts\Validation\Validator`, `RbacMatrixTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `NeuteredFieldTest`, `AdoptedAnimalQrEditTest`, `Animal`, `ReportApiTest`, `ValidIdVerificationTest`, `Illuminate\Database\Eloquent\Model`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `Role Dashboards` be split into smaller, more focused modules?**
  _Cohesion score 0.052604698672114404 - nodes in this community are weakly interconnected._
- **Why does `TestCase` connect `Animal` to `AnimalApiTest`, `User`, `ReportSubmitted`, `RescuedReportFlowTest`, `Shifts API Tests`, `Missing Pet API Tests`, `Auth Security Tests`, `Password Reset Email`, `RoleMiddlewareTest`, `AdoptionApplicationApiTest`, `VaccinationApiTest`, `LostReportFlowTest`, `ReportPostingLimitTest`, `RbacMatrixTest`, `AuthTest`, `SiteContentApiTest`, `UnclaimedReportsTest`, `MissingPetPublicVisibilityTest`, `NeuteredFieldTest`, `AdoptedAnimalQrEditTest`, `ServerErrorResponseTest.php`, `ProfileAddressTest`, `ProfileAvatarTest`, `PetClaimTest`, `ProfileNameTest`, `ReportApiTest`, `ValidIdVerificationTest`, `AutoRegisterOnFoundTest`, `ProfileEmailTest`, `RegisterAnimalFromReportTest`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `User Page Hero Banner Pattern (warm pet photography header)` and `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._