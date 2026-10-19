# Pawmilya

Web portal for animal pound management and pet adoption (school project CIT 301).

## Stack
- Backend `/backend`: Laravel 12 REST API, Sanctum token auth (Bearer), role middleware, Form Request validation (422), Eloquent, migrations, seeders, MySQL (XAMPP MariaDB).
- Frontend `/frontend`: React + Vite, React Router, based on the ready-made reference UI (copied from `ui-reference/poundcare-frontend`, which stays untouched; `/frontend-old` is the discarded Phase 0 backup). Keep its layouts, styles, routes and folder structure. It still runs on mock data (`src/data`, `src/services/*Service.js`). Shared Axios instance in `src/services/api.js` (token interceptor, 401 -> login); the user footer shows an API online/offline indicator from `/api/health`. Later: AuthContext, ProtectedRoute, controlled forms, FormData for uploads.
- QR codes are SVG (bacon/bacon-qr-code); PHP `gd` is not installed. No deployment setup yet.

## Roles
citizen, pound_staff, veterinary_staff, admin.

## Sources of truth
- Knowledge graph `graphify-out/` first; open the original files only for exact details.
- "Proposal Documentation.pdf" (the paper): stack, roles, tables, endpoints, validation and business rules.
- The reference UI in `frontend/` is the visual source for layout; wireframes below are screenshot images (no longer PDFs) in `Wireframes/Staff Side/` (staff/admin pages) and `Wireframes/User Side/` (citizen pages): layout, pages, navigation, components, style (cream background, dark brown primary, amber accent, rounded cards, status badges).
- When building a page, open the matching wireframe image first (Read it) and match its layout.
- Paper vs wireframe conflict: list it and ask the user before choosing.
- Ignore wireframe placeholder text (Milo, Buddy, 2024 dates, US addresses); use realistic Philippine sample data.
- Open question: wireframe has "Continue with Google"; the paper has only Sanctum. Ask in Phase 2.

## Required changes on top of the wireframes [CHANGE]
Citizen: 1 search bar filters (species, breed, sex, age, status); 2 My Missing Pet Reports shows login/sign-up prompt when logged out; 3 Missing Pets page filters; 4 Report Missing Pet form: breed dropdown, color/markings, back button, guests may submit (nullable reporter_id, contact name and number required for guests); 5 Adoptable Pets card opens pet details page.
Adoption application: 6 valid ID upload; 7 proof of income upload.
Strays: 8 QR code per stray opening a page with pet info and owner info (if known).
Staff/admin: 9 Applications statuses Pending/Approve/Reject with status filter; 10 application detail shows pet pictures and location; 11 Vaccinations vaccine dropdown and Add button; 12 filters on list pages.
New columns/tables beyond the paper are allowed, but tell the user what was added.

## Phases
0. Scaffold, CORS, Sanctum, .env.example, README. **DONE**
   F0-lite (frontend integration): `/frontend` is now the reference UI (mock data), with the shared Axios instance, `.env.example` and a footer API online/offline indicator, renamed to Pawmilya. **DONE, approved**
   Current state: the database and auth are NOT built yet (no migrations, models, seeders, login or role checks). The UI runs on mock data.
1. Database: migrations, models, seeders (users per role, animals, health logs, applications).
2. Auth and roles: register/login/logout, role middleware, AuthContext, ProtectedRoute, Login/Sign Up.
3. Animals: staff CRUD (wire the reference UI pages to the API), public listing + filters, details page, status, photo upload, stray QR.
4. Adoption applications: citizen form with ID/income uploads, My Applications, staff review with transactions updating animal status.
5. Missing pets: guest/citizen reports, Missing Pets page, My Reports, staff comparison with pound animals.
6. Vaccinations and health logs: dropdown, Add button, next due date.
7. Staff dashboard, reports, audit logs, admin user/role management.
8. Final polish: responsive, validation messages, empty/loading/error states, test checklist.

## Next steps
1. Phase 1: database (migrations, models, seeders).
2. Phase 2: auth and roles; ask about "Continue with Google" here.
3. Then Phases 3-8 in order, replacing the UI mock data (`src/data`, `src/services/*Service.js`) with API calls one area at a time, keeping layouts and styles unchanged.

## Working rules
- One phase at a time. Before each, state in 3-5 lines what will be built. After it, STOP, explain how to run/test, and wait for approval.
- Run migrations, build and lint; fix errors before reporting a phase done.
- Do not invent features outside the paper, wireframes and [CHANGE] items; ask if unsure.
- Clean folder structure, small files, brief comments, meaningful names. Keep explanations short.

## Run
MySQL must be running (XAMPP Control Panel, or `C:\xampp\mysql\bin\mysqld.exe --standalone`). DB name `poundcare`.
- Backend (http://localhost:8000): `cd backend; php artisan serve`
- Frontend (http://localhost:5173): `cd frontend; npm run dev`
- Health check: http://localhost:8000/api/health
- Setup details are in README.md.
