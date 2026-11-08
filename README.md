# Sweety – Blood Glucose Tracker

Kenpath assignment: a patient logs up to four blood glucose readings a day and views daily, month-to-date, and previous-month reports.

The project lives in this folder as `sweety-BE` (Express + Neon PostgreSQL) and `sweety-FE` (React + Vite). Feature folders follow `stack-and-layout.md`.

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7, Axios, Framer Motion, Lucide React
- **Backend:** Node.js, Express (ES modules), `pg` (node-postgres), Zod, Helmet, CORS
- **Auth:** bcrypt + JWT
- **Database:** Neon Serverless PostgreSQL (plain Postgres with connection pooling and SSL)

## Install

```bash
cd sweety-BE && npm install
cd ../sweety-FE && npm install
```

## Database Setup

1. Create a project in [Neon Console](https://console.neon.tech).
2. Copy the environment template files:

```bash
cp sweety-BE/.env.example sweety-BE/.env
cp sweety-FE/.env.example sweety-FE/.env
```

3. Fill in your Neon connection strings in `sweety-BE/.env`:
   - `DATABASE_URL`: Connection string with pooling enabled (e.g., `-pooler` hostname) for general API traffic.
   - `DIRECT_URL`: Direct connection string for DDL migrations and administrative seeding.

```env
PORT=4000
DATABASE_URL=postgresql://neondb_owner:password@ep-something-pooler.c-4.region.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:password@ep-something.c-4.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

4. Initialize the database schema and demo data:

```bash
cd sweety-BE
npm run db:init
```

> **Note:** `npm run db:init` runs both `npm run setup` (executing `db/schema.sql` against Postgres) and `npm run seed`. You can also run them individually:
> - `npm run setup`: Creates tables, constraints, index, and functions.
> - `npm run seed`: Seeds the demo user and sample readings (safe to re-run).

### Demo Credentials

- **Email:** `demo@sweety.app`
- **Password:** `Demo12345`

The seed includes readings for all of October 2026 and November 1–7, 2026, ensuring reports have complete demo data.

## Run the Server

```bash
cd sweety-BE
npm run dev
```

- API Base: `http://localhost:4000`
- Health check: `GET http://localhost:4000/health`

## Run the Client

```bash
cd sweety-FE
npm run dev
```

- App UI: `http://localhost:5173`

## Available Scripts

### Backend (`sweety-BE`)
| Command | Description |
|---|---|
| `npm run dev` | Start backend with `--watch` auto-reload on port 4000 |
| `npm run start` | Start backend in production mode |
| `npm run setup` | Execute `db/schema.sql` via `pg` using `DIRECT_URL` |
| `npm run seed` | Seed demo user and sample readings into Neon DB |
| `npm run db:init` | Run both `setup` and `seed` sequentially |

### Frontend (`sweety-FE`)
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on `http://localhost:5173` |
| `npm run build` | Build production assets to `dist/` |
| `npm run preview` | Locally preview production build |
| `npm run lint` | Run ESLint |

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new patient account (`name`, `email`, `password`) |
| POST | `/auth/login` | Public | Authenticate patient and obtain JWT |
| GET | `/auth/me` | JWT | Get current authenticated user profile |
| POST | `/readings` | JWT | Create reading (`date`, `slot`, `value`) |
| GET | `/readings?date=YYYY-MM-DD` | JWT | List readings for a specific date |
| PUT | `/readings/:id` | JWT | Update reading by ID |
| DELETE | `/readings/:id` | JWT | Delete reading by ID |
| GET | `/reports/daily?date=YYYY-MM-DD` | JWT | Daily summary report and readings |
| GET | `/reports/month-to-date?date=YYYY-MM-DD` | JWT | Month-to-date statistics |
| GET | `/reports/monthly?date=YYYY-MM-DD` | JWT | Previous-month statistics relative to selected date |

### Reading Payload Format
```json
{
  "date": "YYYY-MM-DD",
  "slot": "After lunch",
  "value": 140
}
```

Allowed slots:
- `Morning (fasting)`
- `After breakfast`
- `After lunch`
- `After dinner`

## Notes & Architecture

- **PostgreSQL on Neon:** Pure PostgreSQL managed via `pg.Pool` with SSL support (`ssl: { rejectUnauthorized: false }`). No ORMs or Supabase SDK dependencies.
- **Date Handling:** Postgres `DATE` type OID 1082 is parsed directly as `'YYYY-MM-DD'` string in `src/config/db.js` to eliminate timezone drift across UTC and local timezones.
- **Data Isolation:** User data isolation is enforced in the application layer through JWT authentication (`requireAuth`) and scoped parameterized queries (`WHERE user_id = $1`).
- **Validation Rules:** Validated in order: required fields → range / integer (40–600 mg/dL) → future date restriction → duplicate slot check (also guarded by unique constraint `readings_user_date_slot_unique` and DB code `23505`) → maximum 4 readings per day limit.
- **Security:** Passwords are hashed with bcrypt (`cost 10`). `password_hash` is never exposed or returned in API responses.
