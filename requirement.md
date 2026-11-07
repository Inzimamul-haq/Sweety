# Sweety – Blood Glucose Tracker

Kenpath assignment (Junior Full Stack Developer – JavaScript & AI).
**Deadline:** Monday, 9 November 2026
**Stack:** Node.js + Express, PostgreSQL, React

A diabetes patient records up to 4 blood glucose readings a day and views daily and monthly reports.

---

## Requirements

### R1. Auth
- Register with name, email, password; then log in.
- Passwords hashed with bcrypt. Never plain text.
- A user sees only their own readings.

### R2. Readings (add, view, edit, delete)
Fields: `date`, `slot`, `value` (mg/dl).
Slots: `Morning (fasting)`, `After breakfast`, `After lunch`, `After dinner`.

| Rule | Error message |
|---|---|
| Value required | `Please enter a glucose value.` |
| Whole number 40–600 | `Value must be between 40 and 600 mg/dl.` |
| One reading per slot per day | `You already have an After lunch reading for this date.` |
| Max 4 readings per day | `You can add only 4 readings per day.` |
| Date not in future | `Date cannot be in the future.` |

Validation order: required → range → future date → duplicate slot → max 4.

### R3. Reports
Each report: highest, lowest, average (1 decimal), count. Empty state when no readings.

| Report | Range | Example (selected 15 Oct 2026) |
|---|---|---|
| Daily (also lists readings with slot) | Selected date | 15 Oct 2026 |
| Month-to-date | 1st of month → selected date | 1 Oct – 15 Oct 2026 |
| Monthly | Whole previous month | 1 Sep – 30 Sep 2026 |

### R4. Submission
- Public GitHub repo, regular small commits
- `README.md`: install, DB setup, run server, client, tests
- `.env.example` (all variables, no secrets)
- Seed script: demo user + sample readings
- Screenshots or 2–3 min recording
- README "Notes": assumptions, what to improve
- Reply to the same email thread with repo link + media

### Bonus (optional, after everything above works)
Pagination · Charts (Recharts) · Docker compose · RTL form tests · Redis cache · BullMQ reminder · Doctor role

---

## Design Decisions

- `reading_date` is a `DATE` (no timezone drift).
- DB constraints are the safety net; app code gives friendly messages. Map Postgres `23505` to the duplicate-slot message.
- Max-4 is implied by 4 unique slots; still implement the explicit check for the required message.
- On edit, exclude the reading's own id from the duplicate check.
- Future-date check on the server; the client date picker `max=today` is only a convenience.
- Timezone assumption (e.g. Asia/Kolkata) written in README Notes.
- "Previous month" is relative to the selected date; handle January → December of last year.
- Always filter by `user_id`; return `404` for another user's reading.
- Stats computed in SQL: `MAX`, `MIN`, `ROUND(AVG(value),1)`, `COUNT`.
- Never return `password_hash`. One consistent error JSON shape.

## Data Model

```
users     (id, name, email UNIQUE, password_hash, created_at)
readings  (id, user_id FK ON DELETE CASCADE, reading_date DATE, slot, value INT, created_at)
          CHECK value BETWEEN 40 AND 600
          CHECK slot IN (4 slots)
          UNIQUE (user_id, reading_date, slot)
          INDEX  (user_id, reading_date)
```

## API

```
POST   /auth/register
POST   /auth/login
GET    /auth/me
POST   /readings
GET    /readings?date=
PUT    /readings/:id
DELETE /readings/:id
GET    /reports/daily?date=
GET    /reports/month-to-date?date=
GET    /reports/monthly?date=
```

---

## Commit Rules

- One commit = one idea, about 150 lines or fewer.
- App runs after every commit.
- Feature and its test go together or back to back.
- Never mix refactor and feature.
- Format: `type(scope): message` (`feat`, `fix`, `test`, `docs`, `chore`).

---

# Phases

## Phase 0 – Foundation
**Goal:** repo, folders, config.

- [ ] `chore: initialise repo with README stub and .gitignore`
- [ ] `chore(server): scaffold Express app with /health route`
- [ ] `chore(client): scaffold React app with Vite`
- [ ] `chore: add .env.example and config loader`

**Done when:** both apps start; `GET /health` returns ok.

---

## Phase 1 – Database
**Goal:** schema with constraints.

- [ ] `feat(db): add users table migration`
- [ ] `feat(db): add readings table with CHECK, UNIQUE, FK, index`
- [ ] `chore(db): add migration runner and npm run db:migrate`
- [ ] `chore(db): add pg connection pool`

**Done when:** migrations run cleanly on an empty database.

---

## Phase 2 – Auth API
**Goal:** register, login, protected routes.

- [ ] `feat(auth): register endpoint with bcrypt hashing`
- [ ] `feat(auth): validate register input`
- [ ] `feat(auth): login endpoint returning JWT`
- [ ] `feat(auth): auth middleware`
- [ ] `feat(auth): GET /auth/me`
- [ ] `feat(errors): central error handler`

**Done when:** register, login, `/auth/me` work via curl or Postman.

---

## Phase 3 – Readings API
**Goal:** CRUD with every validation rule.

- [ ] `feat(readings): validator functions (value, slot, date)`
- [ ] `feat(readings): POST /readings`
- [ ] `feat(readings): one-per-slot and max-4 rules`
- [ ] `feat(readings): GET /readings scoped to user`
- [ ] `feat(readings): PUT /readings/:id`
- [ ] `feat(readings): DELETE /readings/:id`
- [ ] `fix(readings): map Postgres 23505 to friendly message`

**Done when:** all 5 error messages appear; users cannot touch each other's data.

---

## Phase 4 – Reports API
**Goal:** daily, month-to-date, previous month.

- [ ] `feat(reports): date-range helper`
- [ ] `feat(reports): SQL aggregate query`
- [ ] `feat(reports): GET /reports/daily`
- [ ] `feat(reports): GET /reports/month-to-date`
- [ ] `feat(reports): GET /reports/monthly`
- [ ] `feat(reports): empty result shape (count 0, null stats)`

**Done when:** ranges match the 15 Oct 2026 examples.

---

## Phase 5 – Backend Tests
**Goal:** a few meaningful tests.

- [ ] `chore(test): set up Jest, Supertest, test database`
- [ ] `test(validation): value and future date rules`
- [ ] `test(reports): date-range helper (mid-month, 1st, January, leap Feb)`
- [ ] `test(api): auth flow`
- [ ] `test(api): reading rules (duplicate slot, edit, other user 404)`
- [ ] `test(api): report correctness`

**Done when:** `npm test` passes from a clean database.

---

## Phase 6 – Frontend Foundation + Auth UI
**Goal:** routing and login flow.

- [ ] `feat(client): router, layout, API client`
- [ ] `feat(client): AuthContext and protected routes`
- [ ] `feat(client): signup page`
- [ ] `feat(client): login page and logout`

**Done when:** sign up, log in, refresh, stay logged in.

---

## Phase 7 – Readings UI
**Goal:** add, view, edit, delete with clear errors.

- [ ] `feat(client): readings page with date picker (max=today)`
- [ ] `feat(client): reading form with client-side checks`
- [ ] `feat(client): show server validation errors inline`
- [ ] `feat(client): list day's readings with edit and delete`
- [ ] `feat(client): disable used slots; hide add form at 4`

**Done when:** every rule shows its message in the UI.

---

## Phase 8 – Reports UI
**Goal:** three reports and empty state.

- [ ] `feat(client): stats card component`
- [ ] `feat(client): daily report with readings list`
- [ ] `feat(client): month-to-date and monthly tabs with range label`
- [ ] `feat(client): empty state`

**Done when:** UI numbers match the API for the selected date.

---

## Phase 9 – Required Deliverables
**Goal:** everything in the submission list.

- [ ] `feat(seed): demo user with sample readings (previous + current month)`
- [ ] `docs: README install, DB, run server/client/tests`
- [ ] `docs: Notes section (assumptions, improvements)`
- [ ] `chore: cleanup (console logs, unused code, format)`
- [ ] `docs: add screenshots`

**Done when:** a stranger can clone, follow the README, and see demo data.

---

## Phase 10 – Bonus (only after Phases 0–9)
Order: cheapest and most visible first.

- [ ] Docker: `docker-compose.yml` with PostgreSQL, then app services
- [ ] Pagination: `?page=&limit=` on `GET /readings`, test, UI controls
- [ ] Charts: Recharts line chart of the month
- [ ] Frontend tests: React Testing Library for the reading form

Skip Redis, BullMQ, Doctor role unless time is left.

---

## Phase 11 – Record and Submit
- [ ] Record 2–3 min: sign up, add readings, trigger each error, edit, delete, three reports, empty state
- [ ] Repo is public; commit history reads well
- [ ] Reply on the same email thread with repo link + recording/screenshots

---

## Schedule

| Day | Date | Phases |
|---|---|---|
| Day 1 | Fri 6 Nov | 0, 1, 2, 3 |
| Day 2 | Sat 7 Nov | 4, 5, 6, 7 |
| Day 3 | Sun 8 Nov | 8, 9, 11 |
| Buffer | Mon 9 Nov | 10 (bonus) or fixes; submit before deadline |

## Final Checklist

- [ ] Passwords hashed; `password_hash` never returned
- [ ] All 5 validation messages match the brief word for word
- [ ] Users cannot see or change each other's readings
- [ ] Three reports match the examples; empty state works
- [ ] `npm test` passes; `.env.example` complete; seed works
- [ ] README complete with Notes
- [ ] Granular public commit history
- [ ] Screenshots or recording attached in the reply
