# Deployment (Free) — Vercel + TiDB Serverless (MySQL) + Prisma

This repo is **Next.js 14 (App Router)** with **Prisma** configured for **MySQL** (`prisma/schema.prisma`), so the simplest free deployment is:

- App hosting: **Vercel**
- Database: **TiDB Serverless** (MySQL-compatible)

## 1) Create the database (TiDB Serverless)

1. Create a TiDB Serverless cluster.
2. Create a database (schema) name (e.g. `tms`).
3. Copy the **MySQL connection string** (it will include TLS/SSL settings).

You will use it as:

- `DATABASE_URL` = your TiDB connection string

## 2) Initialize the schema on the remote DB (one-time)

This repo currently doesn’t include Prisma migrations, so the fastest way to create tables is:

```bash
npm install
npx prisma generate
npx prisma db push
```

Run that locally with `DATABASE_URL` pointing at the **remote TiDB** database.

## 3) Deploy the app (Vercel)

1. Push the project to GitHub (or GitLab/Bitbucket).
2. In Vercel, “Add New Project” → import the repo.
3. Framework preset should auto-detect **Next.js**.
4. Add environment variables:
   - `DATABASE_URL` (TiDB MySQL URL)
   - `AUTH_SECRET` (long random string; required in production)
   - Optional: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
5. Deploy.

### Important
- Because `postinstall` runs `prisma generate`, Vercel should build cleanly.
- If the app throws DB errors after deploy, it usually means the remote DB schema wasn’t created yet — re-run `npx prisma db push` against the remote DB.

## 4) Manager login (defaults)

On the first login attempt, the API will auto-seed a super admin user if it doesn’t exist yet:

- Email: `ADMIN_EMAIL` (default `admin@example.com`)
- Password: `ADMIN_PASSWORD` (default `admin123`)

## Env template

See `ENV.example`.

