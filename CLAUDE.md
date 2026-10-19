# Pawmilya

Web portal for animal pound management and pet adoption (school project CIT 301).

## Stack
- Backend `/backend`: Laravel 12 REST API, Sanctum token auth (Bearer), role middleware, Form Request validation (422), Eloquent, migrations, seeders, MySQL (XAMPP MariaDB). Only the scaffold exists so far.
- Frontend `/frontend`: React + Vite, React Router. It is the merge of the guest/citizen side and the staff/admin side. Still runs on mock data (`src/data`, `src/services/*Service.js`). Shared Axios instance in `src/services/api.js` (token interceptor, 401 -> login); the user footer shows an API online/offline indicator from `/api/health`.
- QR codes are SVG (bacon/bacon-qr-code); PHP `gd` is not installed. No deployment setup yet.

## Roles
- `guest`: not logged in (no user).
- `citizen`: logged-in public user, no staff permissions.
- Staff: `pound_staff`, `vet_tech`, `adoption_counselor`, `kennel_manager` (the admin, full permissions).
- Permission map: `src/config/rolePermissions.js` (`ROLES`, `ROLE_LABELS`, `hasPermission`).

## Auth (still mock)
- One `AuthContext` (`src/context/authContext.js`, `AuthProvider.jsx`) and one hook `useAuth` (`src/hooks/useAuth.js`), provided once in `main.jsx`. It gives `user, role, isLoggedIn, isStaff, roleLabel, can(permission), login(role), logout()`.
- The mock user `{ id, name, email, role }` is kept in localStorage under `pawmilya.mockUser`. No backend call is made.
- Citizen: submitting the Login form mock-logs in as citizen and returns to the previous page (`MockLoginHandler`, `RequireSignIn`, `SignInModal`).
- Staff: every `/admin/*` route needs a staff role (guest -> `/login`, citizen -> `/`). Each route is also wrapped in `RequirePermission`; a staff user without the permission goes to `/admin/dashboard`.
- Dev-only way in (`import.meta.env.DEV` only): `/login?as=<role>` logs in as that role (`citizen`, `pound_staff`, `vet_tech`, `adoption_counselor`, `kennel_manager`) and redirects to `/admin` (staff) or `/` (citizen). `DevRoleSwitcher` (staff sidebar) switches between staff roles. Both are ignored in production builds.
- Phase 2 replaces this with Sanctum login/register and real role checks.

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
- New columns/tables beyond the paper are allowed, but tell the user what was added.

## Sources of truth
- Knowledge graph `graphify-out/` first; open the original files only for exact details.
- "Proposal Documentation.pdf" (the paper): stack, roles, tables, endpoints, validation and business rules, except where the section above says otherwise.
- The merged UI in `frontend/` is the visual source for layout. Wireframes are screenshot images in `Wireframes/Staff Side/` (staff/admin pages) and `Wireframes/User Side/` (citizen pages): layout, pages, navigation, components, style (cream background, dark brown primary, amber accent, rounded cards, status badges).
- When building a page, open the matching wireframe image first (Read it) and match its layout.
- Paper vs wireframe conflict: list it and ask the user before choosing.
- Ignore wireframe placeholder text (Milo, Buddy, 2024 dates, US addresses); use realistic Philippine sample data.
- "Continue with Google" appears in the wireframe but not in the paper (only Sanctum). Ask in Phase 2.

## Required changes on top of the wireframes [CHANGE]
Citizen: 1 search bar filters (species, breed, sex, age, status); 2 My Missing Pet Reports shows login/sign-up prompt when logged out; 3 Missing Pets page filters; 4 Report Missing Pet form: breed dropdown, color/markings, back button, guests may submit (nullable reporter_id, contact name and number required for guests); 5 Adoptable Pets card opens pet details page.
Adoption application: 6 valid ID upload; 7 proof of income upload (dropped: no income or proof of income, see Data rules).
Strays: 8 QR code per stray opening a page with pet info and owner info (if known).
Staff/admin: 9 Applications statuses Pending/Approve/Reject with status filter; 10 application detail shows pet pictures and location; 11 Vaccinations vaccine dropdown and Add button; 12 filters on list pages.

## Folder structure (frontend/src)
- `main.jsx`, `App.jsx`: BrowserRouter + AuthProvider, then routes.
- `routes/AppRoutes.jsx`: all routes (user side and `/admin/*`). `UserRoutes.jsx` and `AdminRoutes.jsx` are unused.
- `layouts/`: `UserLayout` (navbar, footer, ModalProvider), `AdminLayout` (staff guard, sidebar, header).
- `context/`: `authContext.js` + `AuthProvider.jsx` (auth), `modalContext.js` + `ModalProvider.jsx` (emergency report and sign-in modals).
- `hooks/`: `useAuth`, `useModals`, scroll helpers.
- `config/`: `rolePermissions.js`, `animalStatus.js`.
- `pages/user/*`, `pages/admin/*` (one folder per page, with its own CSS; `pages/admin/dashboards/` has the role dashboards).
- `components/`: `common`, `user`, `landing`, `report` (citizen side), `admin` (AdminSidebar, AdminHeader, AdminStatCard, RequirePermission, DevRoleSwitcher).
- `data/` (mock data), `services/` (Axios + mock services), `utils/`, `styles/` (globals, variables, admin and user layout CSS).

## Phases
0. Scaffold, CORS, Sanctum, .env.example, README. **DONE**
   F0-lite and the frontend merge (citizen + staff side, one mock AuthContext, new animal/application data rules). **DONE**
   Current state: the database and real auth are NOT built yet (no migrations, models, seeders, Sanctum login). The UI runs on mock data with mock auth.
1. Database: migrations, models, seeders (users per role, animals, health logs, applications). **NEXT**
2. Auth and roles: register/login/logout, role middleware, replace the mock AuthContext with Sanctum, real Login/Sign Up and a staff login.
3. Animals: staff CRUD (wire the UI pages to the API), public listing + filters, details page, status, photo upload, stray QR.
4. Adoption applications: citizen form with ID/home photo uploads, My Applications, staff review with transactions updating animal status.
5. Missing pets: guest/citizen reports, Missing Pets page, My Reports, staff comparison with pound animals.
6. Vaccinations and health logs: dropdown, Add button, next due date.
7. Staff dashboard, reports, audit logs, admin user/role management.
8. Final polish: responsive, validation messages, empty/loading/error states, test checklist.

## Known issues (not fixed yet)
- Staff side has no logout button and no real staff login page (use `/login?as=<role>` in dev).
- Staff Reports counts missing pets with status "Active" (always 0 now).
- Reports links like `/admin/animals?status=...` are not read by `Animals.jsx`.
- `VetTechDashboard.css` has no style for the Under Observation badge.
- `EditAnimal` shows the browser's own validation bubble for the "Cleared" rule instead of an inline error (no error class in its CSS).
- Staff application details still shows the pet's age (`petAge`).
- Existing lint warnings (impure `Date` in render, setState in effects, a few unused imports) and the bundle-size warning (one ~620 kB chunk).
- `routes/UserRoutes.jsx` and `routes/AdminRoutes.jsx` are unused.
- `MyMissingPetReports` page exists but is not routed in `AppRoutes`.
- [CHANGE] items not done or not verified yet: 8 stray QR code is not started (needs the backend); 1, 3, 9, 10, 11 and 12 (filters, status filter, application detail pictures and location, vaccine dropdown and Add button) may be partly done in the UI. Check each against the pages before Phase 3.

## Working rules
- One phase at a time. Before each, state in 3-5 lines what will be built. After it, STOP, explain how to run/test, and wait for approval.
- Run migrations, build and lint; fix errors before reporting a phase done.
- Do not invent features outside the paper, wireframes and [CHANGE] items; ask if unsure.
- Design freeze when asked: no visual or CSS changes unless the user lists the file.
- Clean folder structure, small files, brief comments, meaningful names. Keep explanations short.

## Run
MySQL must be running (XAMPP Control Panel, or `C:\xampp\mysql\bin\mysqld.exe --standalone`). DB name `poundcare`.
- Backend (http://localhost:8000): `cd backend; php artisan serve`
- Frontend (http://localhost:5173): `cd frontend; npm run dev`
- Health check: http://localhost:8000/api/health
- Setup details are in README.md.
