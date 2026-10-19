# Pawmilya

Web portal for animal pound management and pet adoption (CIT 301 project).

- **Backend:** Laravel 12 REST API + Sanctum token auth + MySQL (`/backend`)
- **Frontend:** React + Vite (based on the reference UI, mock data for now), React Router, Axios (`/frontend`)
- **Roles:** citizen, pound_staff, veterinary_staff, admin

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

## Configuration notes

- CORS allows only `FRONTEND_URL` (default `http://localhost:5173`), set in `backend/.env`.
- Auth uses Sanctum **personal access tokens** (Bearer header), not cookies.
- Deployment (Vercel / Aiven per the proposal) is intentionally not set up yet.
