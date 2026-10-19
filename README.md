# Pawmilya

Web portal for animal pound management and pet adoption (CIT 301 project).

- **Backend:** Laravel 12 REST API + Sanctum token auth + MySQL (`/backend`)
- **Frontend:** React + Vite (based on the reference UI, mock data for now), React Router, Axios (`/frontend`)
- **Roles:** guest (not logged in), citizen, pound_staff, vet_tech, adoption_counselor, kennel_manager (the admin)

## Requirements

PHP 8.2+, Composer 2, Node 20+, MySQL/MariaDB (XAMPP works).
Needed PHP extensions: pdo_mysql, mbstring, openssl, fileinfo, tokenizer, xml, ctype. QR codes are generated as SVG, so `gd` is not required.

## First-time setup

### Backend
```bash
cd backend
composer install
cp .env.example .env          # then check DB_* values
php artisan key:generate
# create the database (start MySQL first)
mysql -u root -e "CREATE DATABASE poundcare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
php artisan migrate
php artisan storage:link      # for uploaded photos/IDs (used from Phase 3)
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:8000
```

## Run

Open two terminals (and make sure MySQL is running, e.g. XAMPP Control Panel):

```bash
# Terminal 1 - API on http://localhost:8000
cd backend && php artisan serve

# Terminal 2 - React app on http://localhost:5173
cd frontend && npm run dev
```

Open http://localhost:5173. The footer of the user pages shows an **API online** indicator (green dot) when the backend is reachable.
You can also check http://localhost:8000/api/health directly.

## Current status

The frontend (citizen side + staff/admin side) is merged and runs on **mock data with mock auth**. The backend only has the scaffold; the database is next (Phase 1).

### Mock login (no backend)
- One `AuthContext` / `useAuth`; the mock user is stored in localStorage under `pawmilya.mockUser`.
- Citizen: open `/login` and submit the form (any values).
- Staff (dev only): open `/login?as=<role>` with `pound_staff`, `vet_tech`, `adoption_counselor` or `kennel_manager` (redirects to `/admin`), or `/login?as=citizen`. The sidebar role switcher (dev only) changes staff role. Both are ignored in production builds.
- `/admin/*` needs a staff role: guests go to `/login`, citizens go to `/`.

### Data rules
- Animal `status`: Rescued, Available for Adoption, Pending Adoption, Adopted, Reunited with Owner. Staff-only `health_status`: Under Observation, Under Treatment, Cleared. Citizen pages only show "Available for Adoption"; staff can set it only when `health_status` is "Cleared".
- Missing pets: no `age`; statuses Lost, Sighted, Found, Reunited.
- Adoption applications: Pending, Approved, Rejected; no income fields; `employmentStatus`, `work`, `selfEmployedField`, `selfEmployedFieldOther`, `civilStatus`; valid ID upload; home photos min 2, max 3.

### Differences from Proposal Documentation.pdf
- Role names: `vet_tech` instead of `veterinary_staff`; `kennel_manager` is the admin; extra `adoption_counselor`.
- New `health_status` column on animals; no `age` on missing pets; no `monthly_income`.
- New employment fields on applications; missing-pet statuses in the UI are Lost, Sighted, Found, Reunited.

### Known issues (not fixed yet)
- Staff side has no logout button or real staff login page.
- Staff Reports counts missing pets with status "Active" (always 0 now); Reports links like `/admin/animals?status=...` are not read by `Animals.jsx`.
- `VetTechDashboard.css` has no style for the Under Observation badge; `EditAnimal` shows the browser's own validation bubble instead of an inline error.
- Staff application details still shows the pet's age (`petAge`).
- Existing lint warnings and a bundle-size warning (~620 kB chunk).
- `routes/UserRoutes.jsx` and `routes/AdminRoutes.jsx` are unused; `MyMissingPetReports` is not routed.
- Some [CHANGE] items are not done yet (stray QR code, and filters on some pages). See `CLAUDE.md`.

## Folder structure
```
backend/            Laravel 12 API (scaffold only)
frontend/src/
  routes/           AppRoutes (all routes)
  layouts/          UserLayout, AdminLayout (staff guard)
  context/          AuthProvider (mock auth), ModalProvider
  hooks/            useAuth, useModals, scroll helpers
  config/           rolePermissions, animalStatus
  pages/user|admin  one folder per page (admin/dashboards = role dashboards)
  components/       common, user, landing, report, admin
  data/ services/ utils/ styles/
Wireframes/         Staff Side, User Side (screenshots)
graphify-out/       knowledge graph
```

## Configuration notes

- CORS allows only `FRONTEND_URL` (default `http://localhost:5173`), set in `backend/.env`.
- Auth uses Sanctum **personal access tokens** (Bearer header), not cookies.
- Deployment (Vercel / Aiven per the proposal) is intentionally not set up yet.
