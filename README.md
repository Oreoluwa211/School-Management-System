# 🏫 Goodnews Private College — School Management System

> A full-stack school management system for a Nigerian secondary school — public website, online admissions with Paystack payments, and three role-based portals (Admin, Staff, Student).

**Excellence · Faith · Integrity**

---

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Demo Credentials](#demo-credentials)
- [Roadmap](#roadmap)
- [Design System](#design-system)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Goodnews Private College (GPC) is a JSS1–SS3 Nigerian secondary school. This system digitizes the full student lifecycle:

```
Parent applies online → Admin reviews → Approved → Parent pays (Paystack) →
Student account auto-created → Login + acceptance letter emailed →
Student resumes → Staff teach, mark attendance, submit results →
Admin collates results → Report cards published → Student/parent views online
```

It's built around four audiences:

| Audience | Where They Land |
|---|---|
| Prospective parents | Public website + admission form |
| School administrators | Admin Portal |
| Teachers | Staff Portal |
| Enrolled students | Student Portal |

---

## Features

### 🌐 Public Website
- Landing page with live stats, news, extracurriculars, anthem & pledge, newsletter signup
- About page (mission, vision, core values, code of conduct)
- 4-step online admission form with document uploads (passport, birth certificate, medical report, academic report)
- Application tracking by reference number

### 👑 Admin Portal
- Dashboard with live enrollment/staff/fee stats and activity feed
- Application review — approve/reject with automated parent emails
- Academic lifecycle — sessions, terms, end-of-year class promotion
- Result collation — auto-calculated positions, broadsheets, published report cards
- Financial dashboard — collections, debtors, fee schedules
- User management — create/suspend staff & student accounts
- Notice board — targeted announcements (all / students / staff / specific class)
- Timetable & course material uploads

### 👩‍🏫 Staff Portal
- Personal teaching dashboard with today's schedule
- Result entry — CA (0–40) + Exam (0–60) with live grade calculation
- Daily attendance logging
- Lesson notes/plans tracker
- Course material uploads for assigned classes
- Staff notice board & academic calendar

### 🎓 Student Portal
- Academic dashboard — position, average, countdown to exams
- Full report card viewer (CA/Exam/Total/Grade/Remarks, teacher & principal comments)
- E-Library with filters (textbooks, past questions, notes, videos) + CBT system launch link
- Fee payment history + Paystack "Pay Now"
- Personal attendance record
- Notice board & interactive academic calendar

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5 / CSS3 / JavaScript (vanilla) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Auth | JWT (access + rotating refresh tokens), bcryptjs |
| Email | Nodemailer (Gmail SMTP) |
| Payments | Paystack |
| File Storage | Cloudinary |
| Security | Helmet, CORS, express-rate-limit |

> Want a React/Next.js + Prisma + TypeScript version instead? See [`/docs/ai-builder-prompts.md`](./docs/ai-builder-prompts.md) for phased prompts that regenerate this same system in that stack using an AI app builder.

---

## Project Structure

```
goodnews-college/
├── frontend/
│   ├── index.html              # Public landing page
│   ├── about.html              # About page
│   ├── admission.html          # 4-step admission form
│   ├── login.html              # Unified login (role-aware redirect)
│   ├── admin-dashboard.html    # Admin Portal
│   ├── staff-portal.html       # Staff Portal
│   ├── student-portal.html     # Student Portal
│   └── gpc-api.js              # Shared API client (auth guard + all endpoint calls)
│
├── backend/
│   ├── src/
│   │   ├── server.js                    # Express entry point
│   │   ├── config/
│   │   │   ├── db.js                    # PostgreSQL connection pool
│   │   │   ├── setupDb.js               # Creates all tables
│   │   │   └── seedDb.js                # Seeds demo data
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── admissionController.js
│   │   │   └── resultController.js
│   │   ├── middleware/
│   │   │   ├── auth.js                  # protect() + authorize()
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   └── index.js                 # All API routes
│   │   └── utils/
│   │       ├── jwt.js
│   │       └── email.js                 # HTML email templates
│   ├── .env.example
│   └── package.json
│
└── docs/
    ├── architecture.md          # Full feature/schema/API spec
    └── ai-builder-prompts.md    # Phased prompts for AI app builders
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- A Gmail account (for transactional email) or other SMTP provider
- A Paystack account (test keys are fine for development)

### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/goodnews-college.git
cd goodnews-college/backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Fill in your database credentials, JWT secrets, SMTP credentials, and Paystack keys (see [Environment Variables](#environment-variables)).

### 3. Create & Seed the Database
```sql
-- in psql
CREATE DATABASE goodnews_db;
```
```bash
npm run db:setup   # creates all 19+ tables
npm run db:seed    # seeds sessions, terms, classes, subjects, demo accounts
```

### 4. Run the Backend
```bash
npm run dev         # http://localhost:5000/api
```

### 5. Run the Frontend
```bash
cd ../frontend
npx serve .          # or use VS Code Live Server
```
Open `login.html` in your browser. Demo accounts work even if the backend is offline (built-in demo-mode fallback) — see [Demo Credentials](#demo-credentials).

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default `5000`) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `JWT_SECRET` | Signs access tokens (32+ random chars) |
| `JWT_REFRESH_SECRET` | Signs refresh tokens (different from above) |
| `JWT_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes (default `7d` / `30d`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Email sending (Gmail App Password recommended) |
| `EMAIL_FROM` | Display name/address for outgoing mail |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Document/file storage |
| `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY` | Payment processing |
| `FRONTEND_URL` | Used in email links and CORS allowlist |

Full template in [`backend/.env.example`](./backend/.env.example).

---

## Database Schema

19 core tables. Full column-level detail in [`docs/architecture.md`](./docs/architecture.md). Summary:

```
users · refresh_tokens · academic_sessions · terms · classes · subjects
staff · staff_subject_assignments
admissions · students · attendance
results · report_cards
timetables · course_materials · lesson_notes
notices · payments · fee_schedules · library_resources · audit_logs
```

Grading: CA (0–40) + Exam (0–60) = Total (0–100), mapped to WAEC-style grades A(75+) B(65+) C(55+) D(45+) E(40+) F(<40).

---

## API Reference

Base URL: `/api`

| Group | Example Endpoints |
|---|---|
| Auth | `POST /auth/login` · `POST /auth/refresh` · `GET /auth/me` |
| Admissions | `POST /admissions` (public) · `PATCH /admissions/:id/status` · `POST /admissions/:id/enroll` |
| Results | `GET /results/my-classes` · `POST /results/class/:cId/subject/:sId` · `POST /results/collate/:classId` |
| Notices | `GET /notices` · `POST /notices` |
| Payments | `POST /payments/webhook` · `GET /payments/student` |
| Utility | `GET /classes` · `GET /subjects` · `GET /sessions/current` · `GET /health` |

Full endpoint list with request/response shapes: [`docs/architecture.md`](./docs/architecture.md#key-api-endpoints).

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@goodnewscollege.edu.ng` | `Admin@GPC2025` |
| Staff | `e.adeyemi@goodnewscollege.edu.ng` | `Staff@GPC2025` |
| Student | `c.okafor@students.goodnewscollege.edu.ng` | `Student@GPC2025` |

> ⚠️ Seed credentials only. Rotate or remove before any production deployment.

---

## Roadmap

Built so far: public website, admission pipeline, Admin/Staff/Student portals (core flows).

Planned / in progress:
- [ ] Academic lifecycle — sessions/terms CRUD + automated class promotion
- [ ] User management module (admin-initiated account creation/suspension)
- [ ] Financial dashboard — debtor list, fee schedules, receipts
- [ ] Daily attendance logging (staff) + attendance record (student)
- [ ] CBT system integration link from E-Library
- [ ] PDF report cards & acceptance letters
- [ ] Broadsheet CSV export
- [ ] Paystack webhook signature verification
- [ ] Automated daily birthday notices (cron job)

See [`docs/ai-builder-prompts.md`](./docs/ai-builder-prompts.md) for phased implementation prompts covering each of these.

---

## Design System

| Token | Value |
|---|---|
| Primary (Admin/Student) | Navy `#0a1628` + Gold `#c9a84c` |
| Primary (Staff alt.) | Forest `#1a3328` + Sage `#4a8070` + Gold |
| Headings | Playfair Display / Cormorant Garamond |
| Body | DM Sans / Nunito / Outfit |
| Currency | Nigerian Naira (₦) |

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/attendance-module`)
3. Commit with clear messages
4. Open a PR describing what changed and why

Please keep new features consistent with the existing schema and naming conventions documented in `docs/architecture.md`.


*Built for Goodnews Private College — Excellence · Faith · Integrity*
