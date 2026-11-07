# Sweety – Stack and Project Layout

Plan for the Kenpath assignment (3 days, about 10–15 hours, deadline Mon 9 Nov 2026).
Pairs with `requirement.md` (features and phases). This file answers: **which stack, which folders, which rules.**

---

## 1. Verdict on the proposed architecture

The proposal is a good *company-scale* template. For this assignment it is too heavy: it would eat the time needed for features, validation and tests, which is what Kenpath grades.

| Proposal item | Decision | Reason |
|---|---|---|
| Feature-based structure (FE + BE) | **Keep** | Clean, easy to explain, gives granular commits |
| React + Vite + Tailwind + Axios + React Router | **Keep** | Fast and standard |
| Express + `pg` + Zod + Helmet + CORS + dotenv | **Keep** | Small and relevant |
| Router → Controller → Service → Repository | **Keep** | Shows clear separation; only 3 features so it stays small |
| Supabase | **Drop** | Reviewers must run it locally. Use local PostgreSQL (Docker optional). `DATABASE_URL` still works with Supabase later |
| TypeScript on both sides | **Optional** | Role is "JavaScript & AI". Plain JS is safer for 10–15 h. Use TS only if already fast with it |
| Per-feature `interface`, `constant`, `mapper`, `index` files | **Drop** | Ceremony with no benefit at this size |
| `database/` folder at root | **Move** | Put inside `server/db/` so the server owns its migrations and seed |
| 5 docs in `docs/` | **Drop** | One good `README.md` with a Notes section is what they asked for |
| Extra features: users, dashboard | **Drop** | Not in requirements |
| Context API / global state libs | **Minimal** | Only `AuthContext`. Everything else is local state |

---

## 2. Final stack

| Layer | Choice |
|---|---|
| Frontend | React (Vite), JavaScript |
| Styling | Tailwind CSS (or plain CSS; a simple UI is fine) |
| Routing | React Router |
| HTTP client | Axios |
| Backend | Node.js + Express (ES modules) |
| Validation | Zod |
| Auth | `bcrypt` + `jsonwebtoken` |
| Database | PostgreSQL (local or Docker) |
| DB driver | `pg` with plain SQL migrations |
| Security | Helmet, CORS |
| Config | dotenv |
| Backend tests | Jest + Supertest (separate test database) |
| Frontend tests (bonus) | Vitest + React Testing Library |
| Charts (bonus) | Recharts |
| Version control | Git + GitHub (public repo) |

Note: the brief says MERN, but the database is PostgreSQL, so **MongoDB is not used**.

---

## 3. Folder layout

```
sweety/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js              # Axios instance, attaches JWT
│   │   ├── components/
│   │   │   ├── ui/                    # Button, Input, Select, ErrorMessage
│   │   │   └── layout/                # Navbar, ProtectedRoute
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── components/        # LoginForm, SignupForm
│   │   │   │   ├── AuthContext.jsx
│   │   │   │   └── auth.api.js
│   │   │   ├── readings/
│   │   │   │   ├── components/        # ReadingForm, ReadingList, ReadingRow
│   │   │   │   ├── useReadings.js
│   │   │   │   └── readings.api.js
│   │   │   └── reports/
│   │   │       ├── components/        # StatsCard, DailyReport, RangeReport, EmptyState
│   │   │       └── reports.api.js
│   │   ├── pages/                     # LoginPage, SignupPage, ReadingsPage, ReportsPage
│   │   ├── constants/slots.js         # the 4 slots
│   │   ├── utils/date.js              # format and range-label helpers
│   │   ├── routes.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example                   # VITE_API_URL
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js                 # reads and checks env vars
│   │   │   └── db.js                  # pg Pool
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.repository.js
│   │   │   │   └── auth.validation.js
│   │   │   ├── readings/
│   │   │   │   ├── readings.routes.js
│   │   │   │   ├── readings.controller.js
│   │   │   │   ├── readings.service.js
│   │   │   │   ├── readings.repository.js
│   │   │   │   └── readings.validation.js
│   │   │   └── reports/
│   │   │       ├── reports.routes.js
│   │   │       ├── reports.controller.js
│   │   │       ├── reports.service.js
│   │   │       └── reports.repository.js
│   │   ├── middleware/
│   │   │   ├── auth.js                # verify JWT, set req.user
│   │   │   ├── validate.js            # run a Zod schema
│   │   │   └── errorHandler.js        # one JSON error shape
│   │   ├── shared/
│   │   │   ├── constants/slots.js
│   │   │   ├── errors/AppError.js
│   │   │   └── utils/dateRange.js     # daily / month-to-date / previous month
│   │   ├── routes.js                  # mounts /auth /readings /reports
│   │   ├── app.js                     # express app (no listen, testable)
│   │   └── server.js                  # listen
│   ├── db/
│   │   ├── migrations/                # 001_users.sql, 002_readings.sql
│   │   ├── migrate.js
│   │   └── seed.js                    # demo user + sample readings
│   ├── tests/
│   │   ├── unit/                      # validation, dateRange
│   │   └── api/                       # auth, readings, reports
│   └── package.json
│
├── docs/screenshots/                  # for README
├── docker-compose.yml                 # bonus: PostgreSQL (then app)
├── .env.example                       # server variables
├── .gitignore
├── README.md                          # install, DB, run, test, Notes
├── requirement.md
└── stack-and-layout.md
```

---

## 4. Backend rules

| Layer | Does | Must not |
|---|---|---|
| Routes | Map URL + method to middleware and controller | Contain logic |
| Controller | Read `req`, call service, send `res` | Touch SQL |
| Service | Business rules (duplicate slot, max 4, report ranges) | Know about `req`/`res` |
| Repository | All SQL, parameterised (`$1`, `$2`) | Contain business rules |
| Validation | Zod schemas: required, whole number 40–600, valid slot, date not future | Query the database |
| Middleware | Auth, validation runner, error handler | Business logic |

Validation split (important for the five rules):

- **Zod (no DB):** value required, value range, whole number, date not in future.
- **Service (needs DB):** one reading per slot per day, max 4 per day.
- **DB constraints:** the safety net. Map Postgres `23505` to the duplicate-slot message.

Other backend rules:

- Every readings and reports query filters by `user_id = req.user.id`.
- Another user's reading returns `404`.
- `password_hash` is never returned.
- All errors return `{ "error": { "message": "...", "field": "..." } }`.
- `app.js` exports the app without listening, so Supertest can use it.
- Stats are computed in SQL (`MAX`, `MIN`, `ROUND(AVG(value),1)`, `COUNT`).

## 5. Frontend rules

- A feature keeps its own components, API calls and hooks inside its folder.
- Move a component to `components/ui` only when a second feature uses it.
- All HTTP goes through `api/client.js`. Components never call Axios directly.
- Only `AuthContext` is global. Everything else is local state or a hook.
- Display the server's error message as is; the server is the source of truth.
- Client checks (date picker `max=today`, disabled used slots) are convenience only.
- Constants (the 4 slots) live in `constants/slots.js` and match the server.

---

## 6. Request flow

```
Browser
  → React page → feature component → feature api.js → Axios (adds JWT)
  → Express: Helmet, CORS, JSON
  → routes → auth middleware → validate middleware
  → controller → service → repository → PostgreSQL
  ← JSON response  (errorHandler on any failure)
```

Example, `POST /readings`:

1. `auth` middleware sets `req.user`.
2. `validate` runs the Zod schema (required, range, future date).
3. Controller passes data to the service.
4. Service checks one-per-slot and max 4 using the repository.
5. Repository inserts; a `23505` error becomes the duplicate-slot message.
6. Controller returns `201` with the reading.

---

## 7. Database

- Local PostgreSQL, or `docker-compose.yml` (bonus).
- Two databases: `sweety` and `sweety_test`.
- SQL migration files are the source of truth. No manual table edits.
- `npm run db:migrate` applies them in order; `npm run seed` loads the demo user.

Tables: `users`, `readings` (full definition in `requirement.md`).

## 8. Environment variables

Server `.env.example`:

```
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/sweety
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5432/sweety_test
JWT_SECRET=change_me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
APP_TIMEZONE=Asia/Kolkata
```

Client `.env.example`:

```
VITE_API_URL=http://localhost:4000
```

## 9. npm scripts

| Where | Script | Purpose |
|---|---|---|
| server | `dev` | Run API with auto-reload |
| server | `db:migrate` | Apply migrations |
| server | `seed` | Demo user + sample readings |
| server | `test` | Jest + Supertest |
| client | `dev` | Vite dev server |
| client | `test` | Vitest (bonus) |

---

## 10. Where each phase touches the code

This is what keeps diffs small: each phase edits only its own area.

| Phase | Area |
|---|---|
| 0 Foundation | Root files, `server/src/app.js`, `server/src/server.js`, `client/` scaffold, `config/env.js` |
| 1 Database | `server/db/migrations/*`, `migrate.js`, `config/db.js` |
| 2 Auth API | `features/auth/*`, `middleware/auth.js`, `middleware/errorHandler.js`, `shared/errors/AppError.js` |
| 3 Readings API | `features/readings/*`, `middleware/validate.js`, `shared/constants/slots.js` |
| 4 Reports API | `features/reports/*`, `shared/utils/dateRange.js` |
| 5 Backend tests | `server/tests/*` |
| 6 Frontend + auth UI | `client/src/api`, `features/auth`, `routes.jsx`, auth pages |
| 7 Readings UI | `features/readings/*`, `ReadingsPage` |
| 8 Reports UI | `features/reports/*`, `ReportsPage` |
| 9 Deliverables | `db/seed.js`, `README.md`, `.env.example`, `docs/screenshots` |
| 10 Bonus | `docker-compose.yml`, pagination in readings, Recharts in reports, client tests |

## 11. Conventions

- Naming: `feature.layer.js` on the server, `PascalCase.jsx` for components, `camelCase` for functions.
- Commit format: `type(scope): message` with `feat`, `fix`, `test`, `docs`, `chore`.
- One commit = one idea, about 150 lines or fewer, app runs after each commit.
- No `console.log` left in final code.
- Assumptions (timezone, previous-month rule, TypeScript choice) go in the README Notes.
