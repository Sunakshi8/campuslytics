# 🎓 Campuslytics — Placement & Internship Portal

**Your Campus. Your Career.**
A full-stack MERN platform that centralizes student, company, and TPO placement workflows — automated eligibility checks, application tracking, and live placement analytics, all in one place.

![Node](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-state-764ABC?logo=redux&logoColor=white)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Core Features](#-core-features)
- [Standout Feature: Eligibility Simulator](#-standout-feature-placement-eligibility-simulator)
- [Architecture](#-architecture)
- [Data Model (ER Diagram)](#-data-model-er-diagram)
- [Key Flows](#-key-flows)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Demo Accounts](#-demo-accounts)
- [Environment Variables](#-environment-variables)
- [Bulk Student Import Format](#-bulk-student-import-format)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)

---

## 📌 Problem Statement

Colleges often manage placements through spreadsheets, emails, and manual screening — making it hard to track applications, filter eligible students, and analyze placement trends. **Campuslytics** replaces that with a single platform that automates eligibility checks, application tracking, and placement analytics for students, companies, and the TPO office.

---

## ✨ Core Features

| Role | What they can do |
|---|---|
| 🎓 **Student** | Build a profile (branch, CGPA, year, skills, backlogs), upload a resume (auto-parsed for skills), browse/filter drives, see per-drive eligibility + resume match score, apply, bookmark, track application status, run the Eligibility Simulator |
| 🏢 **Company** | Manage company profile, post/edit/close drives with structured eligibility rules, view applicants ranked by match score, move applicants through the pipeline (Applied → Shortlisted → Interview → Selected/Rejected) |
| 🛠️ **TPO / Admin** | Manage students & companies, bulk-import students via CSV/Excel, view all drives & applications platform-wide, export CSV reports, view the placement analytics dashboard |

All three roles get **JWT-secured, role-gated access** and an in-app **notification center** (applications, interviews, system messages).

---

## 🧠 Standout Feature: Placement Eligibility Simulator

A fully **rule-based** engine (no ML required) that helps students understand *and improve* their eligibility:

- Shows how many companies they're currently eligible for
- Explains **exactly why** they're ineligible for a given drive (CGPA, branch, year, backlogs, or missing skills)
- Runs **what-if scenarios**: "If your CGPA becomes 8.5", "If you add these missing skills", "If you clear your backlogs" — and shows the eligibility gain for each
- Aggregates missing skills across all near-miss drives into one actionable list

```mermaid
flowchart LR
    A[Student Profile<br/>CGPA . Branch . Year . Backlogs . Skills] --> B{Eligibility Engine}
    C[Drive Eligibility Rules] --> B
    B -->|Pass all rules| D[Eligible]
    B -->|Fails one or more rules| E[Ineligible + Reasons]
    E --> F[What-If Simulator]
    F --> G[Scenario: CGPA to 8.5]
    F --> H[Scenario: Add missing skills]
    F --> I[Scenario: Clear backlogs]
    G --> J[Projected eligible company count]
    H --> J
    I --> J
```

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend - React + Redux Toolkit + Tailwind (Vite)"]
        UI[Pages: Auth / Student / Company / TPO]
        RTK[Redux Store - authSlice]
        AX[Axios Client - JWT interceptor]
        UI --> RTK
        UI --> AX
    end

    subgraph Server["Backend - Node.js + Express"]
        MW[Middleware: auth, upload, errorHandler]
        RT[Routes]
        CT[Controllers]
        UTL[Utils: eligibilityEngine, resumeParser, sendEmail]
        RT --> MW
        MW --> CT
        CT --> UTL
    end

    subgraph Data["Data and Services"]
        DB[(MongoDB Atlas)]
        FS[Local Disk or Cloudinary]
        SMTP[SMTP Email - optional]
        IO[Socket.io - future real-time layer]
    end

    AX -- REST /api --> RT
    CT --> DB
    CT --> FS
    CT --> SMTP
    Server --> IO
```

---

## 🗂️ Data Model (ER Diagram)

```mermaid
erDiagram
    USER ||--o| STUDENT_PROFILE : has
    USER ||--o| COMPANY_PROFILE : has
    STUDENT_PROFILE ||--o{ APPLICATION : submits
    STUDENT_PROFILE ||--o{ SAVED_DRIVE : bookmarks
    COMPANY_PROFILE ||--o{ DRIVE : posts
    DRIVE ||--o{ APPLICATION : receives
    USER ||--o{ NOTIFICATION : receives

    USER {
        string name
        string email
        string password_hash
        string role
        boolean isActive
    }
    STUDENT_PROFILE {
        string branch
        string year
        number cgpa
        number backlogs
        array skills
        string resumeUrl
        number profileCompletion
    }
    COMPANY_PROFILE {
        string companyName
        string industry
        string location
        boolean isVerified
    }
    DRIVE {
        string title
        string jobType
        number packageMin
        number packageMax
        date applyBy
        object eligibility
        string status
    }
    APPLICATION {
        string status
        number matchScore
        array timeline
    }
    NOTIFICATION {
        string type
        string title
        boolean isRead
    }
```

---

## 🔄 Key Flows

**Authentication & Application Lifecycle**

```mermaid
sequenceDiagram
    participant S as Student
    participant F as Frontend
    participant A as API
    participant D as MongoDB

    S->>F: Login (email, password, role)
    F->>A: POST /api/auth/login
    A->>D: Verify credentials (bcrypt)
    D-->>A: User + Profile
    A-->>F: JWT + user data
    F-->>S: Redirected to role dashboard

    S->>F: Browse drives
    F->>A: GET /api/student/drives
    A->>A: Run eligibility engine per drive
    A-->>F: Drives + eligibility + match score
    S->>F: Apply to eligible drive
    F->>A: POST /api/student/drives/:id/apply
    A->>D: Create Application (status Applied)
    A-->>F: Confirmation

    Note over A,D: Company later updates status
    A->>D: Update Application status and timeline
    A->>S: Notification and email (if SMTP configured)
```

---

## 🛠️ Tech Stack

**Frontend:** React 18 · Redux Toolkit · React Router DOM · Tailwind CSS · Axios · Recharts · Vite
**Backend:** Node.js · Express.js · Mongoose · JWT · bcrypt.js · Multer
**Database:** MongoDB (Atlas or local)
**Resume Processing:** `pdf-parse` + custom keyword-extraction skill dictionary (rule-based, no ML)
**File Storage:** Local disk by default, optional Cloudinary
**Notifications:** In-app + Nodemailer (optional SMTP), Socket.io wired as a future real-time layer
**Analytics:** MongoDB aggregation-style queries + Recharts (bar & pie charts)
**Reports:** CSV export via `csv-writer`
**Bulk Import:** SheetJS (`xlsx`) parses CSV/Excel client-side before posting to the API

---

## 📁 Project Structure

```
campuslytics/
├── backend/
│   └── src/
│       ├── config/         # db.js, cloudinary.js
│       ├── models/         # User, StudentProfile, CompanyProfile, Drive, Application, ...
│       ├── controllers/    # authController, studentController, companyController, tpoController
│       ├── routes/         # authRoutes, studentRoutes, companyRoutes, tpoRoutes
│       ├── middleware/     # auth (JWT + role guard), upload, errorHandler
│       └── utils/          # eligibilityEngine.js, resumeParser.js, sendEmail.js, seed.js
└── frontend/
    └── src/
        ├── api/            # axios client + endpoint functions
        ├── app/             # redux store + authSlice
        ├── components/     # layout (Sidebar/Topbar), common UI, DriveForm
        ├── pages/           # auth/, student/, company/, tpo/
        └── routes/          # ProtectedRoute
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas cluster (or local MongoDB)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm run seed               # creates demo accounts + sample drives
npm run dev                 # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env       # defaults already point to localhost:5000/api
npm run dev                 # starts on http://localhost:5173
```

Open the frontend URL and log in with any [demo account](#-demo-accounts) below.

---

## 🔑 Demo Accounts

All passwords: **`Password@123`**

| Role | Email |
|---|---|
| TPO / Admin | `tpo@campuslytics.com` |
| Student | `student@campuslytics.com` (Rahul Sharma) |
| Student | `ananya@campuslytics.com` (Ananya Verma) |
| Company | `google@campuslytics.com` |
| Company | `microsoft@campuslytics.com` |
| Company | `amazon@campuslytics.com` |

> New student/company accounts can also be created from the Sign Up screen. TPO accounts are provisioned only via the seed script, matching how a real placement office would restrict that access.

---

## ⚙️ Environment Variables

**`backend/.env`**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/campuslytics
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d

STORAGE_DRIVER=local          # or "cloudinary"
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=                      # leave blank to skip email sending safely
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=Campuslytics <no-reply@campuslytics.com>
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ Never commit real `.env` files. Only `.env.example` should be tracked in git — check `git status` before your first commit to confirm.

---

## 📊 Bulk Student Import Format

TPO → Students → **Bulk Import** accepts `.csv` or `.xlsx` with these columns:

```
name, email, password, branch, year, cgpa, backlogs, skills, rollNumber
```
`skills` accepts a comma/semicolon-separated string, e.g. `"Python, DSA, SQL"`.

---

## ☁️ Deployment

| Layer | Suggested host | Notes |
|---|---|---|
| Frontend | Vercel / Netlify | `npm run build` then deploy `frontend/dist`; set `VITE_API_URL` to your live backend |
| Backend | Render | Set all `backend/.env` variables in host settings; set `CLIENT_URL` to your deployed frontend origin for CORS |
| Database | MongoDB Atlas | Whitelist your backend host's IP (or `0.0.0.0/0` for quick testing) under Network Access |

---

## 🗺️ Roadmap

- [ ] Live push notifications over the existing Socket.io layer
- [ ] Resume-to-JD semantic matching (beyond keyword overlap)
- [ ] Interview scheduling calendar sync
- [ ] Company-side analytics (funnel conversion per drive)

---

<p align="center">Built for campuses that want placements to run on data, not spreadsheets.</p>
