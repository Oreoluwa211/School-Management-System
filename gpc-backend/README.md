# Goodnews Private College — Backend API

Node.js + Express + TypeScript + PostgreSQL (Prisma) backend for the GPC School Management System.

## Tech Stack

- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase) via Prisma ORM
- **Auth:** JWT (access + refresh tokens)
- **PDF:** Puppeteer
- **File uploads:** Multer
- **Security:** Helmet, express-rate-limit, xss sanitization

## Quick Start (5 steps)

### 1. Clone and install

```bash
git clone https://github.com/your-org/gpc-school-management.git
cd gpc-school-management/gpc-backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `DATABASE_URL` — your Supabase Session Pooler connection string
- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` — generate with:
```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
- `CLIENT_URL` — your frontend URL

### 3. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed demo data

```bash
npm run seed
```

This creates:
- Academic session 2024/2025 (3 terms, 2nd term current)
- 11 classes (JSS1A–SS3A), 19 subjects
- Super admin: `admin@goodnewscollege.edu.ng` / `Admin@GPC2025`
- Staff: `e.adeyemi@goodnewscollege.edu.ng` / `Staff@GPC2025`
- Student: `c.okafor@students.goodnewscollege.edu.ng` / `Student@GPC2025`

### 5. Start the server

```bash
npm run dev        # development (hot reload)
npm run build      # compile TypeScript
npm start          # production
```

API runs on `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

## API Overview

| Group | Base URL | Auth |
|-------|----------|------|
| Auth | `/api/auth` | Public |
| Admissions | `/api/admissions` | Mixed |
| Students | `/api/students` | Admin |
| Staff | `/api/staff` | Admin |
| Results | `/api/results` | Staff/Admin |
| Attendance | `/api/attendance` | Staff/Admin |
| Notices | `/api/notices` | Mixed |
| Staff Portal | `/api/staff-portal` | Staff |
| Student Portal | `/api/student-portal` | Student |
| Exports | `/api/export` | Mixed |

## Docker

```bash
docker build -t gpc-backend .
docker run -p 5000:5000 --env-file .env gpc-backend
```

## Deployment (Linux VPS)

1. Build frontend: `cd gpc-website && npm run build`
2. Copy `dist/` to `/var/www/gpc-website/dist`
3. Copy backend to server, run `npm ci --only=production`
4. Run `npx prisma generate && npx prisma db push`
5. Start with PM2: `pm2 start dist/server.js --name gpc-api`
6. Copy `nginx.conf` to `/etc/nginx/sites-available/gpc`, symlink, reload nginx

## Scheduled Jobs

- **Birthday notices** — runs daily at 7:00 AM WAT
  Posts birthday notices for students and staff automatically