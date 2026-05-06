# Campus Notifications Microservice

**Student:** A. Arjun | **Roll No:** AM.SC.U4CSE23011 | **GitHub:** arjunalone

---

## What is this project?

This is a **backend system for a college campus notification platform** where students get real-time alerts about:
- 📢 **Placements** — companies coming to campus for hiring
- 🎉 **Events** — college events like tech-fest, farewell, etc.
- 📊 **Results** — exam results like mid-sem, project-review, etc.

The project has **two parts**:

---

### Part 1 — Logging Middleware (`src/index.ts`)
A reusable TypeScript library that any backend service can use to **send logs to a central server**.

Think of it like a `console.log()` but it sends the log over the internet to a monitoring service instead of just printing it.

**How to use it:**
```typescript
import { Log } from './src/index';

Log('backend', 'info', 'handler', 'User fetched notifications');
Log('backend', 'error', 'db', 'Database connection failed');
```

---

### Part 2 — Campus Notifications Backend (`campus_notifications_backend/`)
A **REST API server** built with Express.js that:
- Fetches live campus notifications from the evaluation service
- Exposes clean API endpoints that a frontend app can call
- Supports **real-time streaming** using SSE (Server-Sent Events)

**API Endpoints:**
| Method | URL | What it does |
|--------|-----|--------------|
| GET | `/health` | Check if server is running |
| GET | `/api/v1/notifications` | Get all notifications |
| GET | `/api/v1/notifications?type=Placement` | Filter by type |
| GET | `/api/v1/notifications/:id` | Get one notification |
| GET | `/api/v1/sse/notifications` | Real-time stream of new notifications |

---

### Part 3 — System Design Document (`notification_system_design.md`)
A written design document covering 5 stages:
- **Stage 1** — REST API design with request/response structure
- **Stage 2** — Database selection (PostgreSQL) and schema design
- **Stage 3** — Query optimization and indexing strategy
- **Stage 4** — Caching strategy using Redis to reduce DB load
- **Stage 5** — Reliable bulk notification system using Message Queues

---

## How to Run

### Run the Notifications Backend
```bash
cd campus_notifications_backend
npm install
node dist/server.js
```
Server starts at: `http://localhost:3000`

### Test with Postman

**Step 1 — Get a token:**
```
POST http://20.207.122.201/evaluation-service/auth
Content-Type: application/json

{
  "email": "anipeddiarjun@gmail.com",
  "name": "A.arjun",
  "mobileNo": "9182355621",
  "githubUsername": "arjunalone",
  "rollNo": "AM.SC.U4CSE23011",
  "accessCode": "PTBMmQ",
  "clientID": "a5291495-80f2-44d3-a081-ba7c289d0bdd",
  "clientSecret": "jezdyHXBcHFJFCJB"
}
```

**Step 2 — Get notifications:**
```
GET http://20.207.122.201/evaluation-service/notifications
Authorization: Bearer <token from step 1>
```

**Step 3 — Send a log:**
```
POST http://20.207.122.201/evaluation-service/logs
Authorization: Bearer <token from step 1>
Content-Type: application/json

{
  "stack": "backend",
  "level": "info",
  "package": "handler",
  "message": "your log message here"
}
```

---

## Tech Stack
- **Language:** TypeScript
- **Framework:** Express.js
- **HTTP Client:** Axios
- **Real-time:** Server-Sent Events (SSE)
- **Auth:** Bearer JWT tokens from evaluation service
