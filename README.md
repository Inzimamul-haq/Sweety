# Sweety – Blood Glucose Tracker

Kenpath assignment: a patient logs up to four blood glucose readings a day and views daily, month-to-date, and previous-month reports.

The project lives in this folder as `sweety-BE` (Express + Supabase) and `sweety-FE` (React + Vite). Feature folders follow `stack-and-layout.md`.

## Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Framer Motion, Lucide
- **Backend:** Node.js, Express (ES modules), Zod, Helmet, CORS
- **Auth:** bcrypt + JWT
- **Database:** Supabase (Postgres) via `@supabase/supabase-js`

## Install

```bash
cd sweety-BE && npm install
cd ../sweety-FE && npm install
```

## Database setup

1. Create a Supabase project.
2. Copy environment files and fill in Project Settings → API:

```bash
cp sweety-BE/.env.example sweety-BE/.env
cp sweety-FE/.env.example sweety-FE/.env
```

Use the project URL and the **service role** key (backend only — it bypasses RLS because auth is our JWT, not Supabase Auth):

```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. In the Supabase SQL Editor, run `sweety-BE/db/schema.sql` (or `npm run db:migrate` to print it).
4. Seed demo data:

```bash
cd sweety-BE
npm run seed
```

Demo login after seed:

- Email: `demo@sweety.app`
- Password: `Demo12345`

The seed includes October 2026 readings and 1–7 November 2026 so reports have data for the assignment window.

## Run the server

```bash
cd sweety-BE
npm run dev
```

API: `http://localhost:4000`  
Health check: `GET /health`

## Run the client

```bash
cd sweety-FE
npm run dev
```

App: `http://localhost:5173`

## Tests

Backend tests were not added in this pass (Jest + Supertest are planned in Phase 5). When present, they will run with:

```bash
cd sweety-BE
npm test
```

## API

| Method | Path | Auth |
|---|---|---|
| POST | `/auth/register` | No |
| POST | `/auth/login` | No |
| GET | `/auth/me` | JWT |
| POST | `/readings` | JWT |
| GET | `/readings?date=` | JWT |
| PUT | `/readings/:id` | JWT |
| DELETE | `/readings/:id` | JWT |
| GET | `/reports/daily?date=` | JWT |
| GET | `/reports/month-to-date?date=` | JWT |
| GET | `/reports/monthly?date=` | JWT |

Reading body: `{ "date": "YYYY-MM-DD", "slot": "After lunch", "value": 140 }`.

Slots: `Morning (fasting)`, `After breakfast`, `After lunch`, `After dinner`.

## Notes

- Timezone for “today” and future-date checks is `Asia/Kolkata` (`APP_TIMEZONE`). `reading_date` is stored as a Postgres `DATE` so values do not drift.
- “Previous month” is relative to the **selected** date. 15 Oct 2026 → 1 Sep – 30 Sep 2026. A January date uses December of the previous year.
- JavaScript is used on both sides (the role is JavaScript & AI). Folders are `sweety-BE` / `sweety-FE` rather than `server` / `client`, with the same internal layers as `stack-and-layout.md`.
- The database is hosted Postgres on Supabase. Report stats still run in SQL through the `reading_stats` RPC (`MAX`, `MIN`, `ROUND(AVG(value), 1)`, `COUNT`).
- Validation order for readings: required value → range / whole number → future date → duplicate slot → max 4. Duplicate slot also maps Postgres `23505`.
- Users only ever see their own rows. Another user’s reading id returns `404`.
- `password_hash` is never returned.
- Improvements: Jest/Supertest, pagination, Recharts, Docker app services, screenshots in `docs/screenshots/`.
