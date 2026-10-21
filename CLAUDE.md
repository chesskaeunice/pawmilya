# Pawmilya

Web portal for animal pound management and pet adoption (school project CIT 301).

## Stack
- Backend `/backend`: Laravel 12 REST API, Sanctum token auth (Bearer), role middleware, Form Request validation (422), Eloquent, migrations, seeders, MySQL (XAMPP MariaDB). Done: database, auth, animals, adoption applications, missing pets, vaccinations, user management, audit log and staff shifts API (Phases 1-7). Only Phase 8 (polish) is left.
- Frontend `/frontend`: React + Vite, React Router. It is the merge of the guest/citizen side and the staff/admin side. Auth is real (Sanctum); everything else still runs on mock data (`src/data`, `src/services/*Service.js`). Shared Axios instance in `src/services/api.js` (token interceptor, 401 -> login); the user footer shows an API online/offline indicator from `/api/health`.
- QR codes are SVG (bacon/bacon-qr-code); PHP `gd` is not installed. No deployment setup yet.

## Roles
- `guest`: not logged in (no user).
- `citizen`: logged-in public user, no staff permissions.
- Staff: `pound_staff`, `vet_tech`, `adoption_counselor`, `kennel_manager` (the admin, full permissions).
- Permission map: `src/config/rolePermissions.js` (`ROLES`, `ROLE_LABELS`, `hasPermission`).

## Auth (Sanctum, Phase 2)
- Backend: `POST /api/register` (citizen only, no role field), `POST /api/login` (422 for bad credentials, 403 if deactivated), `POST /api/logout`, `GET /api/me`. Login/register are throttled. Bearer token. Form Requests in `app/Http/Requests/Auth`, `AuthController`.
- Role middleware aliases: `role:kennel_manager,vet_tech` and `permission:shifts.manage` (`EnsureRole`, `EnsurePermission`; 401 guest, 403 wrong role). Permissions per role in `backend/config/permissions.php` (keep in sync with the frontend map). `User::hasPermission()`. The API always answers JSON.
- Frontend: one `AuthContext` (`context/authContext.js`, `AuthProvider.jsx`) and one hook `useAuth`, provided once in `main.jsx`. It gives `user, role, loading, isLoggedIn, isStaff, roleLabel, can(permission), login(email, password), register(data), logout()`. Token in localStorage (`pawmilya_token`, set by `services/authService.js`); the user is loaded from `/api/me` on start (guards wait while `loading`).
- Staff and citizens use the same Login page: staff go to `/admin`, citizens back to the page they came from (`RequireSignIn`, `SignInModal`). Sign Up creates a citizen and logs in.
- Staff: every `/admin/*` route needs a staff role (guest -> `/login`, citizen -> `/`). Each route is also wrapped in `RequirePermission`; a staff user without the permission goes to `/admin/dashboard`.
- The mock login, `/login?as=<role>` and `DevRoleSwitcher` are removed. Log in with the seeded accounts (see Phase 1).
- Not built: password reset ("Forgot Password?" is a dead button), "Continue with Google" (not in the paper), a separate staff login page.

## Data rules
- Animals: `status` is the paper enum: Rescued, Available for Adoption, Pending Adoption, Adopted, Reunited with Owner. Separate staff-only `health_status`: Under Observation, Under Treatment, Cleared. Helpers in `src/config/animalStatus.js`.
  - Citizen pages (Home previews, Adoptable Pets, Pet Details, apply flow) only show animals with status "Available for Adoption" (the citizen label is "Adoptable") and never show `health_status`.
  - Staff can set "Available for Adoption" only when `health_status` is "Cleared" (AddAnimal, EditAnimal). New animal defaults: Rescued + Under Observation.
- Missing pets: no `age` field. Statuses: Lost, Sighted, Found, Reunited.
- Adoption applications: statuses Pending, Approved, Rejected. No income or proof of income. Fields `employmentStatus` (Student, Employed, Self-employed, Unemployed), `work` (Employed and Self-employed), `selfEmployedField` (Self-employed: Retail / Sales, Food & Beverage, Freelance / Online, Agriculture / Fishing, Transport, Services, Other) and `selfEmployedFieldOther` (when the field is Other). Civil status is `civilStatus` (never `status`, which is the application status). Uploads: valid ID, and home photos (min 2, max 3).

## Differences from Proposal Documentation.pdf
- Role names: `vet_tech` instead of `veterinary_staff`; `kennel_manager` is the admin (the paper has `admin`); extra `adoption_counselor`.
- New animals column `health_status` (the paper has only `status`).
- Missing pets have no `age`.
- No `monthly_income` (or proof of income) on adoption applications.
- New employment fields on applications: `employmentStatus`, `work`, `selfEmployedField`, `selfEmployedFieldOther`.
- Missing-pet statuses in the UI are Lost, Sighted, Found, Reunited (staff Reports still counts "Active"; see Known issues).
- New tables beyond the paper for [CHANGE] 13: `shifts`, `staff_shifts`, settings (planned, not built).
- New columns/tables beyond the paper are allowed, but tell the user what was added.

## Sources of truth
- Knowledge graph `graphify-out/` first; open the original files only for exact details.
- "Proposal Documentation.pdf" (the paper): stack, roles, tables, endpoints, validation and business rules, except where the section above says otherwise.
- The merged UI in `frontend/` is the visual source for layout. Wireframes are screenshot images in `Wireframes/Staff Side/` (staff/admin pages) and `Wireframes/User Side/` (citizen pages): layout, pages, navigation, components, style (cream background, dark brown primary, amber accent, rounded cards, status badges).
- When building a page, open the matching wireframe image first (Read it) and match its layout.
- Paper vs wireframe conflict: list it and ask the user before choosing.
- Ignore wireframe placeholder text (Milo, Buddy, 2024 dates, US addresses); use realistic Philippine sample data.
- "Continue with Google" appears in the wireframe but not in the paper (only Sanctum). Not built in Phase 2; still needs the user's decision.

## Required changes on top of the wireframes [CHANGE]
Citizen: 1 search bar filters (species, breed, sex, age, status); 2 My Missing Pet Reports shows login/sign-up prompt when logged out; 3 Missing Pets page filters; 4 Report Missing Pet form: breed dropdown, color/markings, back button, guests may submit (nullable reporter_id, contact name and number required for guests); 5 Adoptable Pets card opens pet details page.
Adoption application: 6 valid ID upload; 7 proof of income upload (dropped: no income or proof of income, see Data rules).
Strays: 8 QR code per stray opening a page with pet info and owner info (if known).
Staff/admin: 9 Applications statuses Pending/Approve/Reject with status filter; 10 application detail shows pet pictures and location; 11 Vaccinations vaccine dropdown and Add button; 12 filters on list pages.
Staff shifts: 13 staff scheduling and My Shifts (spec below).

### [CHANGE] 13 Staff shifts
Logic reference only: the old PHP project PharmAssist (sidebar, staff_dashboard, staff_management). Do not copy its PHP, SQL, sessions or design. Rebuild in Laravel and match Pawmilya's UI. No `branch_id` (one pound).
- Data: `shifts` (name, start_time, end_time, is_active; seed Morning, Afternoon, Night; end earlier than start = ends next day). `staff_shifts` (user_id, shift_id, assigned_date, assigned_by, status pending/active/completed, check_in_time, check_out_time, is_active as soft remove; UNIQUE on user_id + shift_id + assigned_date among active rows). A settings store holds the required coverage roles (default: at least one `pound_staff` and one `vet_tech` per shift). Scheduled staff = `pound_staff`, `vet_tech`, `adoption_counselor`; `kennel_manager` manages and is not scheduled.
- Staff Schedule page (permission `shifts.manage`, kennel_manager only; sidebar item, `RequirePermission` on the route): assign staff to shift + date, list grouped by date and shift, change status, soft remove with confirm, staff directory, coverage badge per shift/date, warning when an assign/remove leaves a shift uncovered.
  - Duplicate (user, shift, date) returns 422 (never delete and re-insert, check-in data must survive). Block inactive users, non-scheduled roles, and overlapping shifts for one person on the same date. Audit log on assign, remove, status change.
- My Shifts (permission `shifts.viewOwn`, all four staff roles): section on each role dashboard with Today and Upcoming (next 7 days), shift name, time, status, Check In / Check Out. Kennel manager dashboard also shows everyone's shifts today (on duty, checked in or not) with coverage. Overnight shifts stay in Today until they end (assigned_date >= today - 1 day).
  - Endpoints: `GET /api/my/shifts?range=today|upcoming`, `POST /api/my/shifts/{id}/check-in`, `POST /api/my/shifts/{id}/check-out`.
  - Security: auth required; only your own assignment (403 for someone else's, 404 if missing). Check in once, only on the assigned date, with a configurable grace window before start. Check out only after check-in and only after shift end (overnight = next day); early check-out is blocked with the message "You cannot check out before your shift ends." Status and times come from the server only (never the client).
- Timezone `Asia/Manila` in `config/app.php`; timestamps stored consistently.
- Tests: 403 on others' shifts, no double check-in, no early check-out, check-out after end works, duplicate 422, non-managers 403 on schedule endpoints, guests 401, coverage incl. overnight shifts.
- Manual checklist item: as Kennel Manager assign two staff to a shift, log in as each, check in/out, watch the coverage badge and the audit log.
- Sidebar (part of 13): `AdminSidebar` shows the user's name, role label and a working logout button at the bottom; no redesign. This fixes the known "no logout button" issue.

## Folder structure (frontend/src)
- `main.jsx`, `App.jsx`: BrowserRouter + AuthProvider, then routes.
- `routes/AppRoutes.jsx`: all routes (user side and `/admin/*`). `UserRoutes.jsx` and `AdminRoutes.jsx` are unused.
- `layouts/`: `UserLayout` (navbar, footer, ModalProvider), `AdminLayout` (staff guard, sidebar, header).
- `context/`: `authContext.js` + `AuthProvider.jsx` (Sanctum auth), `modalContext.js` + `ModalProvider.jsx` (emergency report and sign-in modals).
- `hooks/`: `useAuth`, `useModals`, scroll helpers.
- `config/`: `rolePermissions.js`, `animalStatus.js`.
- `pages/user/*`, `pages/admin/*` (one folder per page, with its own CSS; `pages/admin/dashboards/` has the role dashboards).
- `components/`: `common`, `user`, `landing`, `report` (citizen side), `admin` (AdminSidebar, AdminHeader, AdminStatCard, RequirePermission, DevRoleSwitcher).
- `data/` (mock data), `services/` (Axios + mock services), `utils/`, `styles/` (globals, variables, admin and user layout CSS).

## Phases
0. Scaffold, CORS, Sanctum, .env.example, README. **DONE**
   F0-lite and the frontend merge (citizen + staff side, one mock AuthContext, new animal/application data rules). **DONE**
   Current state: Phases 1-7 are built. Every admin and citizen page that shows animals, applications, missing pets, vaccinations, accounts, shifts, dashboards and reports uses the API (dashboards and Reports load the lists through `hooks/useAdminLists.js`). `src/data/` is now only used for articles, legal pages, site info, the in-kind wishlist and unused mock files (`pets.js`, `applications.js`, `missingPets.js`, `vaccinations.js`, `users.js`; `AddVaccination` is an unrouted leftover that still imports `pets.js`).
1. Database: migrations, models, seeders (users per role, animals, health logs, applications). **DONE**
   Also [CHANGE] 13: `shifts`, `staff_shifts` and settings tables, 3 default shifts seeded, timezone Asia/Manila. **DONE**
   Tables: users (+ `phone`, `role`, `is_active`), animals, health_logs, adoption_applications, missing_pet_reports, audit_logs, shifts, staff_shifts, settings. Models in `app/Models`, seeders in `database/seeders` (`php artisan migrate:fresh --seed`). Dev logins, password `password`: manager@pawmilya.com (kennel_manager), staff@ / staff2@ (pound_staff), vet@ / vet2@ (vet_tech), counselor@ (adoption_counselor), maria@email.com / juan@email.com / john@email.com (citizen), all @pawmilya.com except the citizens.
   Added beyond the paper: `animals.qr_token`, `owner_name`, `owner_contact` (stray QR); `users.phone/is_active`; `missing_pet_reports.contact_name/contact_number/markings`; `adoption_applications` employment fields, `valid_id_path`, `home_photo_paths`, `id_verification_status`; `staff_shifts.active_slot` (generated column so the unique key only covers active rows); `settings` (keys `shifts.required_roles`, `shifts.check_in_grace_minutes`).
   The missing pet table is named `missing_pet_reports` (paper: Missing_Pet).
2. Auth and roles: register/login/logout, role middleware, replace the mock AuthContext with Sanctum, real Login/Sign Up and a staff login. **DONE** (staff use the shared Login page)
   Also [CHANGE] 13: permissions `shifts.manage` and `shifts.viewOwn` (frontend `rolePermissions.js` and backend config); AdminSidebar user name, role label and logout button (sidebar logout now calls Sanctum logout). **DONE**
3. Animals: staff CRUD (wire the UI pages to the API), public listing + filters, details page, status, photo upload, stray QR. **DONE**
   API: staff `GET/POST /api/animals`, `GET/PATCH/DELETE /api/animals/{id}`, `GET /api/animals/{id}/qr` (SVG). Public: `GET /api/pets` (filters q, type, breed, sex, age=baby|young|adult; page, per_page; returns `breeds`), `GET /api/pets/{id}`, `GET /api/stray/{token}`. Public output never has `health_status`, owner info (except the stray page) or the animal code; only "Available for Adoption" animals are listed.
   Rules enforced in the API: Cleared before Available for Adoption (422); create needs 3-4 photos (first = main); PATCH is field-level by permission (`UpdateAnimalRequest::FIELD_PERMISSIONS`, 403 if a role sends a field it may not edit; counselor can set status but not health status); delete is blocked when the animal has applications; audit log entries (`AppSupportAudit`) for create/update/delete.
   Photos: `animal_photos` table, stored on the public disk (`php artisan storage:link`). Animals use `age_months`, `ideal_home` and the animal code PAW-0001 (auto). The stray QR page is `/stray/:token` (owner info only when `owner_name`/`owner_contact` is set; staff enter it in Add/Edit Animal).
   Collar tag: Animal Details has a Create Collar Tag button (page `/admin/animals/:id/collar-tag`): printable 62x34 mm tag with the QR code, name, animal code and pound contact (1, 6 or 12 copies per sheet) and a Download QR (SVG) button. The pound phone on the tag is still the placeholder in `data/siteInfo.js`.
   Owner on the scan page: approving an adoption (Phase 4) sets the animal's `owner_name` and `owner_contact` to the adopter (name + phone), so the stray page then shows them; staff can also type them in Add/Edit Animal.
   Not in the UI yet: deleting an animal (API only), editing photos after creation.
4. Adoption applications: citizen form with ID/home photo uploads, My Applications, staff review with transactions updating animal status. **DONE**
   API: citizen `POST /api/adoption-applications` (multipart, citizens only) and `GET /api/my/adoption-applications`; staff `GET /api/adoption-applications` (status, q, per_page), `GET .../{id}`, `POST .../{id}/approve`, `POST .../{id}/reject` (optional reason). The staff output uses the same camelCase keys as the old mock (plus `petImages`), so the staff pages only swapped their data source.
   No duplicates: (1) a citizen can have one live (Pending or Approved) application per animal, checked in `StoreApplicationRequest` and enforced by the unique index on generated column `live_slot`; a Rejected one can be re-applied; a double submit gets 422. (2) At most one Approved application per animal (`approved_slot` unique index). (3) Approve/reject lock the rows in a transaction and only work on a Pending application, so a double click or two staff cannot decide twice.
   Approve = application Approved + animal Adopted + other Pending applications for that animal auto-Rejected ("Another application for this animal was approved."). Reject does not change the animal. Only an animal "Available for Adoption" can be applied for; approval also needs it to be Available or Pending Adoption. Audit entries: application.submitted/approved/rejected.
   Files: valid ID and home photos are private (storage/app/private); staff get signed links that expire after 30 minutes (`application.file` route). Reject asks for an optional reason with a browser prompt (no new UI).
   Still mock: staff dashboards, Reports and the other admin pages that read `src/data/applications.js`. The "Request More Information" button is still a placeholder. The application ID shown in the staff UI still uses the old `MPR-` prefix.
5. Missing pets: guest/citizen reports, Missing Pets page, My Reports, staff comparison with pound animals. **DONE**
   API: public `GET /api/missing-pets` (all reports, newest first; the pages filter on the client) and `/{id}`; `POST /api/missing-pets` is open to guests (a token, if sent, sets `reporter_id`; guests must give contact name + number; 2-3 pet photos and 1-3 last-seen photos; status Lost/Sighted/Found). Citizens: `GET /api/my/missing-pets`, `POST /api/my/missing-pets/{id}/reunited` (owner only). Staff (`missingPets.view`): `GET /api/missing-pet-reports` (+ reporter name/phone/email, `reportedBy`), `/{id}`, `/{id}/matches`, and `PATCH /{id}/status` (`missingPets.updateStatus`: kennel manager and counselor; any of Lost/Sighted/Found/Reunited). Public output never has the reporter's contact details.
   Duplicates: the same reporter (account, or phone number for guests) cannot file the same pet (species + name + place + day) twice while the report is open; checked in `StoreMissingPetRequest` and enforced by unique key `fingerprint` + generated `open_slot`; a Reunited report frees it again. Double submits get 422.
   Staff comparison: `App\Support\PoundMatcher` lists animals still in the pound (Rescued, Available, Pending Adoption) of the same species that match by name, breed or color (sex and rescue date only add to the score), shown on the staff report details page.
   UI: Report Missing Pet has a breed dropdown (`config/petBreeds.js`); the Emergency Report pop-up and the page both post to the API; My Reports is routed at `/my-missing-reports` (logged-out users get the sign-in prompt) and has a navbar link; "Mark as Found" sets the report to Reunited. The staff status list is Lost/Sighted/Found/Reunited (Adopted/Transfer/Adoptable removed).
   Tables: `missing_pet_reports` gained `contact_email`, `other_species`, `fingerprint`, `open_slot`; photos are in `missing_pet_photos` (kind pet/last_seen, public disk). Still mock: dashboards and Reports that read `src/data/missingPets.js`. The report's "Edit" button on My Reports is still not wired. Public reports have no sex field in the forms (stored as Unknown).
6. Vaccinations and health logs: dropdown, Add button, next due date. **DONE**
   API (health_logs table): `GET/POST /api/vaccinations`, `PATCH/DELETE /api/vaccinations/{id}`. POST takes one animal and a list of records (the Add button's batch). Permissions: view = all staff, create/edit/delete = kennel manager and vet tech (delete too). Next due date = date given + the vaccine's interval when not sent (`config/vaccines.php`: default 365 days, Bordetella 180); status is computed (Up to date / Due Soon within 30 days / Overdue). The same vaccine cannot be recorded twice for one animal on the same day (API check + unique key `health_logs_no_duplicate_dose`). `animals.vaccinated` is kept in step with the logs (true when at least one record is not overdue). The existing Vaccinations page (dropdown by animal type, batch Add, edit, delete, booster) and the Reports "Log Vaccine" action now call the API.
7. Staff dashboard, reports, audit logs, admin user/role management. **DONE**
   - Dashboards and Reports read real data (`useAdminLists`); the Reports "Active" bug is fixed (open = not Reunited; statuses Lost/Sighted/Found/Reunited).
   - Staff accounts and roles (Settings page, kennel manager only, permission `settings.system`): `GET/POST /api/users`, `PATCH /api/users/{id}` (role, active, name). You cannot change your own role or deactivate yourself; deactivating or changing a role signs the person out; the Settings page has an "Add Staff Account" form. New sidebar page **Audit Logs** (`GET /api/audit-logs`, filters: area, dates) lists the entries written since Phase 3.
   - [CHANGE] 13 staff shifts **DONE**: migrations/seed (3 shifts, required roles + grace settings, a sample schedule for today and tomorrow), `App\Support\ShiftService` (overnight windows, overlap check, coverage, check-in/out rules, Today/Upcoming lists). Kennel manager (`shifts.manage`): `GET /api/schedule/meta`, `GET /api/schedule/assignments?from&to` (with coverage for every shift and day), `GET /api/schedule/today`, `POST /api/schedule/assignments`, `PATCH .../{id}/status`, `DELETE .../{id}` (soft remove). Staff (`shifts.viewOwn`): `GET /api/my/shifts?range=today|upcoming`, `POST /api/my/shifts/{id}/check-in`, `POST /api/my/shifts/{id}/check-out`. Rules: own assignment only (403 for someone else's, 404 if missing); one check-in; check-in from the grace window before the start until the end; check-out only after check-in and after the end (message "You cannot check out before your shift ends."); times and status come from the server only; timezone Asia/Manila. Assigning a duplicate (person, shift, date) returns 422 and never touches the existing row; inactive users, non-scheduled roles, past dates and overlapping shifts are refused; the database also allows only one active row (`active_slot`). Audit entries: shift.assigned/removed/status_changed/check_in/check_out. Coverage default: at least one pound_staff and one vet_tech per shift (setting `shifts.required_roles`).
   - UI: **Staff Schedule** sidebar page (assign form, coverage table per day and shift, assignments grouped by date and shift with status select and Remove, staff directory, warning notices); **My Shifts** section at the bottom of the Pound Staff, Vet Tech and Adoption Counselor dashboards (Check In / Check Out buttons follow the server's `canCheckIn`/`canCheckOut`); **On Duty Today** (who is on duty, checked in or not, coverage) on the Kennel Manager dashboard.
8. Final polish: responsive, validation messages, empty/loading/error states, test checklist. **NEXT** (the manual checklist is in README.md)

## Known issues (not fixed yet)
- Forgot Password button does nothing (no password reset in the paper).
- Reports links like `/admin/animals?status=...` are not read by `Animals.jsx`.
- `VetTechDashboard.css` has no style for the Under Observation badge.
- Staff application details still shows the pet's age (`petAge`).
- Existing lint warnings (impure `Date` in render, setState in effects, a few unused imports) and the bundle-size warning (one ~620 kB chunk).
- `routes/UserRoutes.jsx` and `routes/AdminRoutes.jsx` are unused.
- [CHANGE] items: all done except 9 and 12 which still need a check against the pages (status filter, filters on every list page). 8 stray QR code is done (Phase 3); 6 valid ID upload and the live adoption flow are done (Phase 4), 10 application detail shows pet pictures and location (Phase 4); 2, 3 and 4 (My Reports prompt, Missing Pets filters, Report form with breed dropdown, back button and guest reports) are done (Phase 5); 1 is done on Adoptable Pets (type, breed, sex, age; status does not apply because citizens only see Adoptable animals); 11 (vaccine dropdown and Add button) and 13 (staff shifts) are done (Phases 6-7); 9 and 12 (status filter, filters on list pages) exist on the Applications, Animals, Missing Pets, Vaccinations and audit pages. Check each against the pages before the phase that wires it.

## Design (frontend/src/styles)
- The site keeps its original look (the merged design). The earlier site-wide restyle (shared `ui.css`, new type scale applied everywhere, new button/field/badge styles) was **reverted on request**: do not reintroduce it unless asked. `variables.css` still has extra tokens (type scale, badge colors, spacing) that only the newer components use (password fields, password pages).
- Footer, Donate In-Kind pop-up, Home About section, Legal pages and collar tag use the static data in `data/siteInfo.js`, `data/inKindWishlist.js` and the about/donation placeholder images, as at first. The backend still has `GET /api/public/site-info` and the site-content endpoints, but no page uses them (the Settings editor was removed).
- Kept UI changes: one Back button (components/common/BackButton) on all pages except Home and the staff Dashboard; staff header shows name and role once (sidebar has only the menu and a pinned Log out); no three-dot menus (Vaccinations has visible Booster/Edit/Delete buttons); guests see Log In and Sign Up in the navbar.
- Permissions added: `animals.photo` (all staff: change the main photo), `qr.generate` (kennel manager and pound staff: stray QR / collar tag). Pound staff has no adoption application access.
- The print margin for the collar tag sheet is in `index.html` (the CSS minifier rejects `@page`).

## Working rules
- One phase at a time. Before each, state in 3-5 lines what will be built. After it, STOP, explain how to run/test, and wait for approval.
- Run migrations, build and lint; fix errors before reporting a phase done.
- Do not invent features outside the paper, wireframes and [CHANGE] items; ask if unsure.
- Design freeze when asked: no visual or CSS changes unless the user lists the file.
- Clean folder structure, small files, brief comments, meaningful names. Keep explanations short.

## Run
MySQL must be running (XAMPP Control Panel, or `C:\xampp\mysql\bin\mysqld.exe --standalone`). DB name `pawmilya`.
- Backend (http://localhost:8000): `cd backend; php artisan serve`
- Frontend (http://localhost:5173): `cd frontend; npm run dev`
- Health check: http://localhost:8000/api/health
- Setup details are in README.md.
