# Graph Report - pawmilya  (2026-10-23)

## Corpus Check
- 227 files · ~104,913 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1603 nodes · 4045 edges · 120 communities (62 shown, 58 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 86 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Modals and Shared UI
- Migrations (Users, Cache)
- Role Dashboards
- Admin Reports
- Admin Layout and Sidebar
- Pet Care Articles API
- Animal Status Rules
- Adoption Application Form
- Auth and Report Controllers
- Landing Cards and Articles
- User Model and Auth Config
- List Page Controls
- Missing Pet Controller
- Staff Shifts UI
- Adoption Controller
- App Shell and Known Issues
- Adoption API Tests
- Audit Log Controller
- My Shifts Controller
- Shifts API Tests
- Missing Pet API Tests
- Data Hooks and Audit Page
- Missing Report Details
- Access Middleware
- Animal and Health Models
- Auth Security Tests
- Placeholder Images
- Application Details Page
- Shift and Report Models
- Password Reset Email
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 85
- Community 86
- Community 87
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 114
- Community 115
- Community 116

## God Nodes (most connected - your core abstractions)
1. `User` - 73 edges
2. `BackButton()` - 62 edges
3. `react` - 55 edges
4. `useFetch()` - 51 edges
5. `react-router-dom` - 49 edges
6. `Animal` - 47 edges
7. `useAuth()` - 44 edges
8. `lucide-react` - 43 edges
9. `AppRoutes()` - 43 edges
10. `formatApiError()` - 35 edges

## Surprising Connections (you probably didn't know these)
- `Mock login (no backend)` --references--> `useAuth()`  [INFERRED]
  README.md → frontend/src/hooks/useAuth.js
- `API online/offline footer indicator` --references--> `api`  [INFERRED]
  CLAUDE.md → frontend/src/services/api.js
- `Auth (still mock)` --references--> `SignInModal()`  [INFERRED]
  CLAUDE.md → frontend/src/components/common/SignInModal.jsx
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

## Communities (120 total, 58 thin omitted)

### Community 0 - "Modals and Shared UI"
Cohesion: 0.06
Nodes (48): Folder structure (frontend/src), Modal(), SignInModal(), EmergencyButton(), EmergencyReportFlow(), EmergencyReportModal(), emptyForm, isFutureDateTime() (+40 more)

### Community 1 - "Migrations (Users, Cache)"
Cohesion: 0.05
Nodes (23): {closure#1}(), {closure#2}(), {closure#3}(), {closure#1}(), {closure#2}(), {closure#1}(), {closure#2}(), {closure#3}() (+15 more)

### Community 2 - "Role Dashboards"
Cohesion: 0.07
Nodes (59): ROLES, useAdminLists(), Dashboard(), AdoptionCounselorDashboard(), DashboardCard(), EmptyState(), formatTimestamp(), getApplicationDate() (+51 more)

### Community 3 - "Admin Reports"
Cohesion: 0.08
Nodes (59): ACTIVITY, addDays(), AdoptionsReport(), AnimalsReport(), Bar(), countBy(), countOf(), daysFromToday() (+51 more)

### Community 4 - "Admin Layout and Sidebar"
Cohesion: 0.10
Nodes (39): Auth (still mock), AdminHeader(), AdminSidebar(), menuItems, RequirePermission(), FieldError(), FormError(), RequireSignIn() (+31 more)

### Community 5 - "Pet Care Articles API"
Cohesion: 0.07
Nodes (4): {closure#1}(), PetCareArticleController, UserFactory, AnimalApiTest

### Community 6 - "Animal Status Rules"
Cohesion: 0.09
Nodes (41): ADOPTION_NEEDS_CLEARED_MESSAGE, allowedStatuses(), ANIMAL_STATUSES, canBeAdoptable(), CLEARED, DEFAULT_HEALTH_STATUS, DEFAULT_STATUS, HEALTH_STATUSES (+33 more)

### Community 7 - "Adoption Application Form"
Cohesion: 0.10
Nodes (33): BREEDS, AdoptionApplication(), AgreeCheckbox(), EMPLOYMENT_OPTIONS, HOME_PHOTO_CHECKLIST, PROMPT_OPTIONS, PRONOUN_OPTIONS, RadioGroup() (+25 more)

### Community 8 - "Auth and Report Controllers"
Cohesion: 0.10
Nodes (5): {closure#1}(), ScheduleController, {closure#3}(), UserManagementController, Audit

### Community 9 - "Landing Cards and Articles"
Cohesion: 0.11
Nodes (19): articlePlaceholders, PetPreviewCard(), PreviewStatus(), getCurrentIndex(), isKeyboardFocus(), ScrollStrip(), ADOPTABLE_STATUS, articles (+11 more)

### Community 10 - "User Model and Auth Config"
Cohesion: 0.13
Nodes (4): {closure#2}(), {closure#1}(), User, ValidationWordingTest

### Community 11 - "List Page Controls"
Cohesion: 0.13
Nodes (19): Pagination(), SearchBar(), statuses, ArticleCard(), AdoptablePets(), Articles(), ALPHABET, formatTimestamp() (+11 more)

### Community 12 - "Missing Pet Controller"
Cohesion: 0.11
Nodes (7): {closure#2}(), MissingPetReportController, MissingPetResource, StaffMissingPetResource, MissingPetReport, {closure#1}(), PoundMatcher

### Community 13 - "Staff Shifts UI"
Cohesion: 0.20
Nodes (22): MyShifts(), OnDutyToday(), ROLE_LABELS, addDays(), NONE, StaffSchedule(), STATUSES, assignShift() (+14 more)

### Community 14 - "Adoption Controller"
Cohesion: 0.12
Nodes (7): AdoptionApplicationController, {closure#1}(), {closure#5}(), {closure#6}(), ApplicationResource, {closure#1}(), AdoptionApplication

### Community 15 - "App Shell and Known Issues"
Cohesion: 0.17
Nodes (20): Known issues (not fixed yet), App(), petPlaceholders, BackButton(), ArticleDetails(), LegalPage(), DetailRow(), formatTimestamp() (+12 more)

### Community 17 - "Audit Log Controller"
Cohesion: 0.09
Nodes (5): AuditLogController, {closure#5}(), PasswordController, VaccinationController, GET /user()

### Community 18 - "My Shifts Controller"
Cohesion: 0.16
Nodes (6): MyShiftController, MyApplicationResource, PublicAnimalResource, ShiftAssignmentResource, UserResource, VaccinationResource

### Community 21 - "Data Hooks and Audit Page"
Cohesion: 0.17
Nodes (16): EMPTY, useFetch(), usePetCareArticles(), AREAS, AuditLogs(), formatTimestamp(), summarize(), Settings() (+8 more)

### Community 22 - "Missing Report Details"
Cohesion: 0.17
Nodes (19): EditAnimal(), ContactRow(), Detail(), formatTimestamp(), InfoBox(), MissingPetReportDetails(), STATUS_OPTIONS, StatusBadge() (+11 more)

### Community 23 - "Access Middleware"
Cohesion: 0.16
Nodes (7): EnsurePasswordChanged, EnsurePermission, EnsureRole, SecurityHeaders, {closure#1}(), {closure#2}(), {closure#3}()

### Community 24 - "Animal and Health Models"
Cohesion: 0.14
Nodes (4): AnimalPhoto, HealthLog, MissingPetPhoto, Setting

### Community 26 - "Placeholder Images"
Cohesion: 0.12
Nodes (10): Article Image 1 Placeholder, Article Image 2 Placeholder, Article Image 3 Placeholder, Article Image 4 Placeholder, Article Image 5 Placeholder, Article Image 6 Placeholder, aboutPlaceholders, Paw-Print Gradient Placeholder Template (+2 more)

### Community 27 - "Application Details Page"
Cohesion: 0.18
Nodes (19): AdoptionApplicationDetails(), ContactRow(), Detail(), DocumentRow(), formatBirthDate(), OverviewItem(), Question(), ReviewRow() (+11 more)

### Community 28 - "Shift and Report Models"
Cohesion: 0.13
Nodes (4): {closure#1}(), Shift, ShiftSeeder, {closure#3}()

### Community 29 - "Password Reset Email"
Cohesion: 0.16
Nodes (3): PawmilyaResetPassword, {closure#1}(), PasswordResetEmailTest

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (4): ChangePasswordRequest, RegisterRequest, {closure#1}(), PasswordRules

### Community 33 - "Community 33"
Cohesion: 0.24
Nodes (3): {closure#1}(), SiteContentController, SiteContent

### Community 34 - "Community 34"
Cohesion: 0.14
Nodes (6): AppServiceProvider, {closure#1}(), {closure#2}(), {closure#3}(), {closure#4}(), PublicCache

### Community 36 - "Community 36"
Cohesion: 0.18
Nodes (5): AdoptionApplicationSeeder, AnimalSeeder, DatabaseSeeder, MissingPetSeeder, UserSeeder

### Community 37 - "Community 37"
Cohesion: 0.24
Nodes (3): AnimalController, {closure#2}(), AnimalResource

### Community 40 - "Community 40"
Cohesion: 0.21
Nodes (4): {closure#5}(), Animal, {closure#1}(), {closure#2}()

### Community 42 - "Community 42"
Cohesion: 0.23
Nodes (4): StaffShift, {closure#4}(), {closure#5}(), {closure#6}()

### Community 45 - "Community 45"
Cohesion: 0.17
Nodes (11): Data rules, Differences from Proposal Documentation.pdf, graphify-out knowledge graph, Pawmilya, Phases, Proposal Documentation.pdf (the paper), Required changes on top of the wireframes [CHANGE], Run (+3 more)

### Community 46 - "Community 46"
Cohesion: 0.18
Nodes (9): /api/health endpoint, API online/offline footer indicator, Laravel 12 REST API backend, MySQL / XAMPP MariaDB (DB poundcare), Configuration notes, Folder structure, Pawmilya, Requirements (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (9): axios, vite, private, $schema, type, concurrently, laravel-vite-plugin, tailwindcss (+1 more)

### Community 51 - "Community 51"
Cohesion: 0.20
Nodes (9): name, private, type, version, react-dom, @types/react, @types/react-dom, vite (+1 more)

### Community 52 - "Community 52"
Cohesion: 0.29
Nodes (5): {closure#1}(), {closure#1}(), {closure#1}(), {closure#1}(), {closure#1}()

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (8): description, keywords, license, minimum-stability, name, prefer-stable, $schema, type

### Community 54 - "Community 54"
Cohesion: 0.22
Nodes (9): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+1 more)

### Community 55 - "Community 55"
Cohesion: 0.22
Nodes (8): About Laravel, Code of Conduct, Contributing, Laravel Sponsors, Learning Laravel, License, Premium Partners, Security Vulnerabilities

### Community 57 - "Community 57"
Cohesion: 0.28
Nodes (9): Adoption application (valid ID + proof of income uploads), SVG QR codes (bacon/bacon-qr-code), [CHANGE] required changes on top of wireframes, Development phases 0-8, Missing Pet Reports (guest/citizen), Stray QR code page (pet + owner info), Vaccinations and health logs, Working rules (+1 more)

### Community 58 - "Community 58"
Cohesion: 0.36
Nodes (6): ALL_FIELDS, FilterDropdown(), animalTypeOptions, defaultFilters, hasActiveFilters(), statusOptions

### Community 60 - "Community 60"
Cohesion: 0.25
Nodes (8): require-dev, fakerphp/faker, laravel/pail, laravel/pint, laravel/sail, mockery/mockery, nunomaduro/collision, phpunit/phpunit

### Community 62 - "Community 62"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 63 - "Community 63"
Cohesion: 0.29
Nodes (7): devDependencies, axios, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite

### Community 64 - "Community 64"
Cohesion: 0.29
Nodes (6): Expanding the Oxlint configuration, @vitejs/plugin-react (Oxc) / plugin-react-swc (SWC), React Compiler, React + Vite, React + Vite template (HMR), oxlint

### Community 65 - "Community 65"
Cohesion: 0.33
Nodes (7): Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset), Adoptable Pets Hero Photo (woman interacting with four dogs in a training/shelter room), Cat and Dog Companionship Imagery, Home Hero Photo (person holding two cream Labrador puppies outdoors), User Page Hero Banner Pattern (warm pet photography header), My Applications Hero Photo (two kittens and a puppy peeking over a white ledge), Missing Pets Hero Photo (orange kitten sleeping on a golden puppy)

### Community 66 - "Community 66"
Cohesion: 0.33
Nodes (6): require, bacon/bacon-qr-code, laravel/framework, laravel/sanctum, laravel/tinker, php

### Community 68 - "Community 68"
Cohesion: 0.33
Nodes (6): AuthContext (planned), Open question: Continue with Google vs Sanctum only, Reference UI (ui-reference/poundcare-frontend), Sanctum Bearer token auth, Wireframes (Staff Side / User Side screenshots), Sanctum personal access tokens (Bearer, not cookies)

### Community 69 - "Community 69"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (6): dependencies, axios, lucide-react, react, react-dom, react-router-dom

### Community 71 - "Community 71"
Cohesion: 0.33
Nodes (6): devDependencies, oxlint, @types/react, @types/react-dom, vite, @vitejs/plugin-react

### Community 72 - "Community 72"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 75 - "Community 75"
Cohesion: 0.40
Nodes (5): Mock data (src/data, src/services/*Service.js), React + Vite frontend, frontend index.html (Pawmilya), Vite Lightning Bolt Favicon, Vite Logo

### Community 76 - "Community 76"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (5): Current status, Data rules, Differences from Proposal Documentation.pdf, Known issues (not fixed yet), Mock login (no backend)

### Community 83 - "Community 83"
Cohesion: 0.50
Nodes (4): robots.txt (allow all crawlers), Eloquent ORM, Laravel framework (default README), Schema migrations

### Community 89 - "Community 89"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 90 - "Community 90"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

### Community 91 - "Community 91"
Cohesion: 0.67
Nodes (3): scripts, build, dev

### Community 94 - "Community 94"
Cohesion: 0.67
Nodes (3): Backend, First-time setup, Frontend

## Ambiguous Edges - Review These
- `User Page Hero Banner Pattern (warm pet photography header)` → `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`  [AMBIGUOUS]
  frontend/src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **18 isolated node(s):** `axios`, `vite`, `concurrently`, `tailwindcss`, `Social Icon Sprite (Bluesky, Discord, GitHub, X, Docs)` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 416 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **58 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User Model and Auth Config` to `Pet Care Articles API`, `Auth and Report Controllers`, `Missing Pet Controller`, `Adoption API Tests`, `Shifts API Tests`, `Missing Pet API Tests`, `Auth Security Tests`, `Shift and Report Models`, `Password Reset Email`, `Community 32`, `Community 35`, `Community 36`, `Community 37`, `Community 38`, `Community 39`, `Community 42`, `Community 44`, `Community 47`, `Community 49`, `Community 50`, `Community 56`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `axios`, `vite`, `concurrently` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Modals and Shared UI` be split into smaller, more focused modules?**
  _Cohesion score 0.05926251097453907 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Animal Status Rules` to `Modals and Shared UI`, `Role Dashboards`, `Admin Reports`, `Admin Layout and Sidebar`, `Adoption Application Form`, `Landing Cards and Articles`, `List Page Controls`, `Staff Shifts UI`, `App Shell and Known Issues`, `Community 51`, `Data Hooks and Audit Page`, `Missing Report Details`, `Community 58`, `Application Details Page`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `Migrations (Users, Cache)` be split into smaller, more focused modules?**
  _Cohesion score 0.05336538461538461 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `Adoption Application Form` to `Modals and Shared UI`, `Role Dashboards`, `Admin Reports`, `Admin Layout and Sidebar`, `Animal Status Rules`, `Landing Cards and Articles`, `List Page Controls`, `Staff Shifts UI`, `App Shell and Known Issues`, `Community 51`, `Community 86`, `Missing Report Details`, `Application Details Page`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `User Page Hero Banner Pattern (warm pet photography header)` and `Hero Layers Illustration (isometric stacked purple/white tiles, Vite template asset)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._