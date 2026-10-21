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
mysql -u root -e "CREATE DATABASE pawmilya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
php artisan migrate
php artisan storage:link      # needed for animal photos (Phase 3) and later uploads
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
- Reports links like `/admin/animals?status=...` are not read by `Animals.jsx`.
- `VetTechDashboard.css` has no style for the Under Observation badge.
- Staff application details still shows the pet's age (`petAge`).
- Existing lint warnings and a bundle-size warning (~620 kB chunk).
- `routes/UserRoutes.jsx` and `routes/AdminRoutes.jsx` are unused.
- Phase 8 (final polish) is still to do. See `CLAUDE.md`.

## Folder structure
```
backend/            Laravel 12 API (app/Http, app/Models, app/Support, database, tests)
frontend/src/
  routes/           AppRoutes (all routes)
  layouts/          UserLayout, AdminLayout (staff guard)
  context/          AuthProvider (Sanctum auth), ModalProvider
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

## Manual test checklist

Start MySQL, then in `backend`: `php artisan migrate:fresh --seed`, `php artisan storage:link`, `php artisan serve`; in `frontend`: `npm run dev`. Automated tests: `php artisan test` (backend). Seeded logins (password `password`): manager@pawmilya.com, staff@pawmilya.com, staff2@pawmilya.com, vet@pawmilya.com, vet2@pawmilya.com, counselor@pawmilya.com (all @pawmilya.com), and citizens juan@email.com, maria@email.com, john@email.com.

**Accounts and roles**
- [ ] Sign Up creates a citizen and logs in; a wrong password shows an error; Log out works on both the citizen navbar and the staff sidebar.
- [ ] Each staff role only sees its own sidebar items; opening a forbidden `/admin/...` page goes back to the dashboard.

**Animals**
- [ ] Kennel manager adds an animal (3-4 photos, owner info optional); "Available for Adoption" is refused unless health status is Cleared.
- [ ] Vet tech can change health status only; pound staff can change location only; counselor can change status but not health status.
- [ ] Animal details shows a stray QR code; opening `/stray/<token>` shows the pet and the owner info (if known). Citizen pages never show health status.

**Adoption applications**
- [ ] A citizen applies (valid ID + 2-3 home photos). Applying again for the same animal is refused. My Applications shows it as Pending.
- [ ] Counselor opens the application (pet pictures and location, ID and home photos load), approves it: the animal becomes Adopted and other pending applications for it are rejected. Approving or rejecting again is refused.

**Missing pets**
- [ ] A guest files a report from the Home page button (contact name and number required). Filing the same pet at the same place and day again is refused.
- [ ] A citizen's "My Reports" lists their reports; "Mark as Found" closes one as Reunited. Logged out, the page asks you to sign in.
- [ ] Staff open a report, see the reporter contact and the "Possible Matches in the Pound", and change the status (kennel manager / counselor only).

**Vaccinations**
- [ ] Vet tech adds several vaccines for one animal; the same vaccine on the same date is refused; the next due date and status (Up to date / Due Soon / Overdue) look right; edit, booster and delete work; pound staff can only view.

**Staff shifts**
- [ ] As the Kennel Manager open Staff Schedule and assign two staff (one pound staff, one vet tech) to a shift; the coverage badge turns "Covered". Assigning the same person again is refused. Removing one shows the "still needs..." warning.
- [ ] Log in as each of them: My Shifts on the dashboard shows the shift; Check In works only from 30 minutes before the start; Check Out is refused with "You cannot check out before your shift ends." until the end time, then works.
- [ ] Back as the Kennel Manager: "On Duty Today" shows who checked in; the Audit Logs page lists the assign, check-in and check-out entries.

**Accounts management and audit**
- [ ] In Settings the kennel manager adds a staff account, changes a role and disables an account (that person is signed out). You cannot change your own role.
- [ ] Audit Logs can be filtered by area and date.
