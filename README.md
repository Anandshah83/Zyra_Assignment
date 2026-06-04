# Zyra – Counselor Student Action Center

![CI](https://github.com/Anandshah83/Zyra_Assignment/actions/workflows/ci.yml/badge.svg)

A full-stack feature that gives counselors a fast, clear view of a student's priorities, tasks, unread messages, and urgency level — all in one place.

---

## What's in here

```
zyra-action-center/
├── backend/     ← Node.js + Express + TypeScript  (Task 1 & Task 2)
└── frontend/    ← React + TypeScript + Vite        (Task 1 & Task 2)
```

Both tasks live in the same repo. Task 2 additions are called out clearly below.

---

## Getting started

You need **Node.js 18+** installed. That's it.

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

The API runs at **http://localhost:4000**

### 2. Start the frontend

Open a new terminal tab:

```bash
cd frontend
npm install
npm run dev
```

The UI opens at **http://localhost:3000**

The Vite dev server proxies `/students` and `/tasks` to the backend automatically, so no CORS issues during development.

---

## API Contract

### `GET /students/:id/action-center`

Returns everything the action center needs for a student.

**Example:** `GET /students/stu_001/action-center`

**Response:**
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
- `404` – student ID not found

---

### `PATCH /tasks/:taskId/status`

Updates the status of a task.

**Body:**
```json
{ "status": "done" }
```

Valid values: `todo`, `in_progress`, `done`

**Response:**
```json
{
  "message": "Task status updated",
  "task": { "id": "task_001", "status": "done", ... }
}
```

**Errors:**
- `400` – invalid or missing status value
- `404` – task ID not found

All error responses include a `requestId` field for tracing (Task 2).

---

## Architecture notes

### Why this structure?

I kept the project flat and straightforward intentionally. The goal was a feature that's easy to run locally, easy to review, and easy to extend — not over-engineering a small submission.

**Backend:**
- `src/data/mockData.ts` — the in-memory store that replaces MongoDB for this submission. Switching to real Mongo would just mean replacing the array reads with `db.collection.findOne(...)` calls.
- `src/routes/` — one file per resource (`students`, `tasks`). Each route is its own Express Router so they stay isolated.
- `src/middleware/` — error handling and logging separated from business logic.

**Frontend:**
- **TanStack React Query** handles all server state — fetching, caching, invalidation after mutations. No manual loading/error state variables.
- **Zustand** holds one piece of client state: which student the counselor has selected. Simple, no boilerplate.
- Components are split by responsibility: `StudentProfile` shows who, `TaskList` shows what needs to be done, `ActionCenter` orchestrates both.

**Urgency logic:**
The API computes urgency server-side based on open high-priority tasks. Two or more open high-priority tasks → `critical`. One → `high`. Otherwise falls back to the student's base level. This way the frontend just renders what it receives — no duplicate logic in two places.

---

## Task 1

- `GET /students/:id/action-center` endpoint
- `PATCH /tasks/:taskId/status` endpoint
- Mock data with realistic students, tasks, and messages
- React frontend with:
  - Student profile card with GPA, grade, school
  - Task list sorted by priority, with inline status dropdown
  - Unread message count badge
  - Urgency / priority badges
  - Loading and error states

---

## Task 2 (Production improvements)

### Logging
Every request gets a unique UUID attached via `requestIdMiddleware`. The `requestLogger` middleware then logs the method, path, response status, and duration when the response finishes. Example output:

```
[2024-10-15T10:23:41.000Z] [a1b2c3d4-...] GET /students/stu_001/action-center → 200 (12ms)
```

### Error middleware with request IDs
The `errorHandler` middleware catches all errors thrown in route handlers. It logs the full stack trace server-side but only sends a clean message to the client — along with the `x-request-id` header so errors are traceable. A custom `AppError` class lets routes attach specific status codes.

### Backend integration tests
Run them with:

```bash
cd backend
npm test
```

Tests cover:
- Action center returns correct data for a valid student
- Tasks are scoped to the right student
- 404 for unknown student
- Request ID header is present
- Task status update works
- 400 for invalid status
- 404 for unknown task

### Frontend component tests
Run them with:

```bash
cd frontend
npm test
```

Tests cover:
- `UrgencyBadge` renders correct label and CSS class
- `StudentProfile` shows name, school, unread count, and urgency badge
- Unread badge hidden when count is 0
- `TaskList` renders all tasks
- Empty state shown with no tasks
- `onStatusChange` called with correct args on dropdown change
- All dropdowns disabled while update is in progress

### Performance decisions and tradeoffs

**Caching with React Query**
Data is treated as fresh for 30 seconds (`staleTime: 30_000`). This avoids a re-fetch every time the counselor switches between students and back. For a counseling session, 30 seconds of stale tolerance is fine — the data isn't changing every second. If real-time updates were needed, the right move would be SSE from the backend, not polling.

**Single endpoint for action center**
Instead of three separate calls (student, tasks, messages), I combined everything into one `/action-center` endpoint. This is a deliberate tradeoff: slightly less flexible on the backend, but the frontend makes one network round-trip instead of three. For a tool counselors open constantly throughout the day, that latency reduction matters.

**In-memory data**
The mock data lives in a module-level array. In production this would be MongoDB with an index on `studentId` for the task and message queries. The query structure maps directly to `db.collection.find({ studentId: id })`.

**No over-abstraction**
I didn't add a repository layer, service layer, or dependency injection. For this scale, that would be ceremony without benefit. The route handlers are thin — they validate input, call pure data functions, and return results. Easy to test, easy to read.
