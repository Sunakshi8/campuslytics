# Campuslytics — Placement & Internship Portal

A full-stack MERN application that centralizes student, company, and TPO placement workflows:
automated eligibility checks, application tracking, and placement analytics.

This repo has two folders:
- `backend/` — Node.js + Express + MongoDB REST API
- `frontend/` — React + Redux Toolkit + Tailwind CSS (built with Vite)

---

## 1. Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- VS Code (or any editor)

---

## 2. Quick Start

### a) Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and, at minimum, confirm/set:
```
MONGO_URI=mongodb://127.0.0.1:27017/campuslytics
JWT_SECRET=change_this_to_a_long_random_secret
```

Seed the database with demo accounts and sample drives (recommended for first run):
```bash
npm run seed
```

Start the API:
```bash
npm run dev
```
The API runs on **http://localhost:5000**. Health check: `GET http://localhost:5000/api/health`.

### b) Frontend

In a new terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
The app runs on **http://localhost:5173** and is already configured to call the backend at
`http://localhost:5000/api` (see `frontend/.env`).

---

## 3. Demo accounts (created by `npm run seed`)

All passwords: **Password@123**

| Role      | Email                        |
|-----------|-------------------------------|
| TPO/Admin | tpo@campuslytics.com          |
| Student   | student@campuslytics.com      |
| Student   | ananya@campuslytics.com       |
| Company   | google@campuslytics.com       |
| Company   | microsoft@campuslytics.com    |
| Company   | amazon@campuslytics.com       |

You can also sign up new student/company accounts directly from the app (`Sign Up` on the login screen).
TPO/Admin accounts are only created via the seed script — there's no public TPO signup, matching how a
real placement office would provision that access.

---

## 4. What's implemented

**Auth & Users**
- Student/Company signup, login/logout for all 3 roles, JWT auth, bcrypt password hashing, role-based route guards.

**Student**
- Profile (branch, CGPA, year, skills, backlogs), PDF resume upload with automatic parsing (text extraction +
  keyword-based skill detection via `pdf-parse`), browse/search/filter drives, per-drive eligibility + resume
  match score, apply, save/bookmark, application history with status tracking, **Placement Eligibility
  Simulator** (what-if CGPA/skills/backlog scenarios, missing-skill detection — fully rule-based, no ML).

**Company**
- Company profile, post/edit/close/delete drives with structured eligibility rules, view applicants sorted by
  match score, update application status (Applied → Shortlisted → Interview → Selected/Rejected) with an
  automatic timeline and email notification (see note below).

**TPO/Admin**
- Manage students & companies, view all drives/applications platform-wide, deactivate accounts, **bulk student
  import** from CSV/Excel (parsed client-side with SheetJS, posted as JSON), **CSV export** of the applications
  report, and a **placement analytics dashboard** (department-wise placement rate, company participation,
  highest/average package) built on MongoDB aggregation-style queries and rendered with Recharts.

**Cross-cutting**
- In-app notifications (applications, interviews, system messages) for every role.

---

## 5. Notes on optional integrations

These are wired into the code but need your own credentials to be fully "live." The app works completely
without them using safe local fallbacks:

- **File storage** — defaults to local disk (`backend/src/uploads`, served at `/uploads`). Set
  `STORAGE_DRIVER=cloudinary` in `backend/.env` plus your Cloudinary credentials to store resumes in the cloud
  instead.
- **Email notifications** — if `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` are left blank in `backend/.env`, emails are
  skipped and logged to the console instead of failing. Fill them in (e.g. with a Gmail app password or any
  SMTP provider) to send real emails on status changes.
- **Real-time (Socket.io)** — the server boots a Socket.io instance (`backend/src/server.js`) as future-ready
  infrastructure, exactly as scoped in the original spec ("Future-ready support for real-time notifications").
  The REST notification endpoints work independently of it; wiring live push updates on top is a drop-in
  addition later.

---

## 6. Project structure

```
campuslytics/
├── backend/
│   └── src/
│       ├── config/        # db + cloudinary config
│       ├── models/        # Mongoose schemas
│       ├── controllers/   # route handlers
│       ├── routes/        # express routers
│       ├── middleware/    # auth, upload, error handling
│       └── utils/         # eligibility engine, resume parser, email, seed script
└── frontend/
    └── src/
        ├── api/           # axios client + endpoint functions
        ├── app/            # redux store + auth slice
        ├── components/    # layout + shared UI + drive form
        ├── pages/          # auth / student / company / tpo pages
        └── routes/         # protected route wrapper
```

## 7. Bulk student import format

Upload a `.csv` or `.xlsx` file (TPO → Students → Bulk Import) with these columns:

```
name, email, password, branch, year, cgpa, backlogs, skills, rollNumber
```
`skills` can be a comma/semicolon-separated string (e.g. `"Python, DSA, SQL"`).

---

## 8. Deployment notes

- **Frontend**: `npm run build` in `frontend/` produces a static `dist/` folder — deploy to Vercel or Netlify.
  Set `VITE_API_URL` to your deployed backend URL.
- **Backend**: deploy to Render (or similar). Set all variables from `.env.example` in your host's environment
  settings, and point `MONGO_URI` at a MongoDB Atlas cluster. Set `CLIENT_URL` to your deployed frontend URL
  (used for CORS).
