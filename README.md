# Zyra – Counselor Student Action Center

![Tests](https://img.shields.io/badge/tests-22%20passed-brightgreen) ![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-green) ![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-blue)

A full-stack feature that gives counselors a fast, clear view of a student's priorities, tasks, unread messages, and urgency level — all in one place.

---

## What's in here

```
zyra-action-center/
├── backend/     ← Node.js + Express + TypeScript  (Task 1 & Task 2)
└── frontend/    ← React + TypeScript + Vite        (Task 1 & Task 2)
```

Both tasks live in the same repo. Task 2 additions are called out clearly in each section below.

---

## Getting started

You need **Node.js 18+** installed. That's it.

### 1. Backend setup

```bash
cd backend
npm install
```

Seed the database with mock data (run once):

```bash
npm run seed
```

Start the dev server:

```bash
npm run dev
```

API runs at **http://localhost:4000**

---

### 2. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

UI opens at **http://localhost:3000**

Vite proxies `/students` and `/tasks` to the backend automatically — no CORS issues in development.

---

## API Contract

### `GET /students/:id/action-center`

Returns the full action center payload for a student — profile, tasks, unread message count, and computed urgency level.

**Example:** `GET /students/stu_001/action-center`

**Response `200`:**
```json
{
  "student": {
    "id": "stu_001",
    "name": "Maya Patel",
    "email": "maya.patel@school.edu",
    "grade": 11,
    "gpa": 3.2,
    "counselorId": "csl_001",
    "enrollmentStatus": "at_risk"
  },
  "tasks": [
    {
      "id": "tsk_001",
      "studentId": "stu_001",
      "title": "Submit FAFSA application",
      "description": "Deadline is approaching. Student has not started the form.",
      "status": "todo",
      "priority": "urgent",
      "dueDate": "2026-06-05",
      "createdAt": "2026-05-13T14:00:00Z",
      "updatedAt": "2026-05-13T14:00:00Z"
    }
  ],
  "unreadMessages": 2,
  "urgencyLevel": "critical"
}
```

**Errors:**
- `404` — student ID not found

---

### `PATCH /tasks/:taskId/status`

Updates the status of a task. Called when the counselor changes the dropdown in the UI.

**Example:** `PATCH /tasks/tsk_001/status`

**Request body:**
```json
{ "status": "completed" }
```

Valid values: `todo`, `in_progress`, `completed`

**Response `200`:**
```json
{
  "message": "Task status updated",
  "task": {
    "id": "tsk_001",
    "studentId": "stu_001",
    "title": "Submit FAFSA application",
    "status": "completed",
    "priority": "urgent",
    "dueDate": "2026-06-05",
    "createdAt": "2026-05-13T14:00:00Z",
    "updatedAt": "2026-06-05T10:00:00Z"
  }
}
```

**Errors:**
- `400` — missing or invalid status value
- `404` — task ID not found

All error responses include a `requestId` field for tracing (Task 2).

---

## Architecture Notes

### Why this structure?

I kept the project intentionally flat and readable. The goal was a feature that's easy to run locally, easy to review in a code interview, and easy to extend — not over-engineered for a small scope.

**Backend layout:**
```
src/
├── data/mockData.ts      — official Zyra mock data (copied as-is, IDs untouched)
├── db/
│   ├── connect.ts        — Mongoose connection helper
│   └── seed.ts           — one-time script to load mock data into MongoDB
├── models/
│   ├── Student.ts        — Mongoose schema for students
│   ├── Task.ts           — Mongoose schema for tasks (indexed on studentId)
│   └── Message.ts        — Mongoose schema for messages (indexed on studentId)
├── routes/
│   ├── students.ts       — GET /students/:id/action-center
│   └── tasks.ts          — PATCH /tasks/:taskId/status
├── middleware/
│   ├── logger.ts         — request ID attachment + request logging  [Task 2]
│   └── errorHandler.ts   — global error handler with request IDs    [Task 2]
└── index.ts              — app entry point, DB connect, middleware wiring
```

**Frontend layout:**
```
src/
├── components/
│   ├── ActionCenter.tsx   — page-level orchestrator
│   ├── StudentProfile.tsx — name, GPA, grade, enrollment status, unread count
│   ├── TaskList.tsx       — sorted task rows with inline status dropdown
│   ├── Sidebar.tsx        — student switcher
│   └── UrgencyBadge.tsx   — color-coded urgency pill
├── hooks/
│   ├── api.ts             — raw fetch functions
│   └── useActionCenter.ts — React Query hooks (query + mutation)
├── store/
│   └── studentStore.ts    — Zustand store (selected student ID)
└── types/index.ts         — shared TypeScript interfaces
```

**Urgency computation (server-side):**
Urgency is calculated in the backend so the frontend just renders what it receives — no duplicate logic in two places:
- Any open `urgent` task → `critical`
- 2+ open `high` tasks → `high`
- `at_risk` enrollment → `medium`
- Otherwise → `low`

**Single endpoint design:**
Instead of three separate calls (student, tasks, messages), everything is combined into one `/action-center` endpoint. The frontend makes one network round-trip instead of three — important for a tool counselors open constantly throughout their day. The three MongoDB queries inside run in parallel with `Promise.all`.

---

## Task 1 — Core Assessment

**What's covered:**

| Requirement | Where |
|---|---|
| `GET /students/:id/action-center` | `backend/src/routes/students.ts` |
| `PATCH /tasks/:taskId/status` | `backend/src/routes/tasks.ts` |
| Official mock data (IDs unchanged) | `backend/src/data/mockData.ts` |
| Student profile summary | `frontend/src/components/StudentProfile.tsx` |
| Task list with status update | `frontend/src/components/TaskList.tsx` |
| Unread messages count | Returned by API, shown in `StudentProfile` |
| Urgency / priority badges | `frontend/src/components/UrgencyBadge.tsx` |
| Loading state | `ActionCenter.tsx` — spinner while fetching |
| Error state | `ActionCenter.tsx` — error message with reason |
| React + TypeScript + Vite | `frontend/` |
| Node.js + Express + TypeScript | `backend/` |
| MongoDB | Mongoose models in `backend/src/models/` |
| TanStack React Query | `useActionCenter.ts` — query + mutation + cache invalidation |
| Zustand | `studentStore.ts` — selected student state |
| README + API contract + architecture notes | This file |

---

##  Task 2 — Bonus Assessment

### Request logging

Every request gets a unique UUID attached via `requestIdMiddleware`. The `requestLogger` then logs method, path, status, and duration on response finish.

Example log output:
```
[2026-06-05T10:23:41.000Z] [a1b2c3d4-xxxx] GET /students/stu_001/action-center → 200 (14ms)
[2026-06-05T10:23:55.000Z] [b9e3f1a2-xxxx] PATCH /tasks/tsk_001/status → 200 (8ms)
```

### Error middleware with request IDs

`errorHandler.ts` catches all thrown errors. It logs the full stack trace server-side but only sends a clean message to the client — always including the `x-request-id` so any error is traceable in logs.

### Performance decisions and tradeoffs

**1. Single `/action-center` endpoint instead of 3 calls**
- Fewer round-trips means faster load time for the counselor
- Tradeoff: slightly less flexible on the backend; adding a new data type means updating this one endpoint
- For this use case (counselors opening this panel constantly), latency matters more than flexibility

**2. `Promise.all` for parallel DB queries**
- Student, tasks, and messages are fetched at the same time rather than sequentially
- Saves roughly `2 × avg_query_time` per request — meaningful when queries each take 5–20ms

**3. React Query with 30s stale time**
- Data is treated as fresh for 30 seconds — no re-fetch on every render or window focus
- After a status update (mutation), the cache is invalidated and data refreshes automatically
- Tradeoff: a counselor might see 30-second-old data if another user updates something; acceptable for this context

**4. Urgency computed server-side**
- Logic lives in one place (the backend) rather than being duplicated on the frontend
- Tradeoff: a future change to urgency rules requires a backend deploy, not just a frontend update

**5. MongoDB indexes on `studentId`**
- Both `Task` and `Message` schemas index `studentId` for fast lookups by student
- Without this, every task/message query would do a full collection scan

---

## CI / Test Output

This project uses **GitHub Actions** to run tests automatically on every push to `main`.

Two parallel jobs run in CI:
- **Backend Tests** — 10 integration tests via Vitest + Supertest
- **Frontend Tests** — 12 component tests via Vitest + Testing Library

View live results → **Actions tab** of this repository.

### Run tests locally

```bash
# Backend (10 tests)
cd backend && npm test

# Frontend (12 tests)
cd frontend && npm test
```

### Expected output

```
# Backend
 src/tests/actionCenter.test.ts  (10 tests) ~100ms
Test Files  1 passed (1)
Tests  10 passed (10)

# Frontend
 src/tests/components.test.tsx  (12 tests) ~160ms
Test Files  1 passed (1)
Tests  12 passed (12)
```
