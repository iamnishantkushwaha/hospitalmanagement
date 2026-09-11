# Sunrise Hospital — Patient Management System (Demo)

A demo Hospital & Patient Management System built as a single Next.js full-stack
application. See `Hospital_Patient_Management_Master_Project_Document.docx` for the
complete specification (architecture, modules, database, API, phase plan).

Stack: Next.js (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL ·
Auth.js (NextAuth) · Vercel.

## Getting started

1. Copy `.env.example` to `.env` and set `DATABASE_URL` to a PostgreSQL connection
   string (Neon or Supabase recommended) and a random `AUTH_SECRET`
   (`npx auth secret`).
2. Install dependencies and set up the database:

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) and sign in with any demo
   account (password `demo1234`):

   | Role | Email |
   | --- | --- |
   | Admin | admin@demo.local |
   | Receptionist | reception@demo.local |
   | Doctor | doctor@demo.local |
   | Nurse | nurse@demo.local |
   | Lab Technician | lab@demo.local |
   | Pharmacist | pharmacy@demo.local |
   | Billing Staff | billing@demo.local |

## Build status

Following the phase-wise plan in the master document:

- [x] Phase 0 — Foundation (Next.js, Tailwind, shadcn/ui, Prisma schema)
- [x] Phase 1 — App shell & auth (login, roles, protected routes, sidebar/topbar, dashboard shell, demo accounts)
- [ ] Phase 2 — Hospital + Patients
- [ ] Phase 3 — Appointments
- [ ] Phase 4 — OPD
- [ ] Phase 5 — IPD + Lab + Pharmacy
- [ ] Phase 6 — Billing
- [ ] Phase 7 — Dashboard polish + reports

## Deployment

Deploy to Vercel with an external managed PostgreSQL database (Neon/Supabase).
Set `DATABASE_URL` and `AUTH_SECRET` as Vercel environment variables, then run
`prisma migrate deploy` against the production database before/at first deploy.
