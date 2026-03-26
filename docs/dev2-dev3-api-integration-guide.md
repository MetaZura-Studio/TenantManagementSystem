# Dev2/Dev3 Integration Guide (Auth + RBAC + API Authorization)

This guide explains how to integrate your module APIs with Dev1’s **auth + RBAC** without touching Dev1-owned files.

## 1) Do not edit (Dev1-owned)

Do not modify these files/directories:
- `lib/auth/**`
- `app/api/_platform/**`
- `app/api/auth/**`
- `middleware.ts`
- `docs/dev1-platform-security.md`, `docs/merging-notes-dev1.md`

If you need changes here, request them from Dev1 to avoid merge conflicts.

## 2) What Dev2/Dev3 should build

You will create your own route handlers under:
- `app/api/<module>/**/route.ts`

Examples:
- `app/api/tenants/route.ts`
- `app/api/tenants/[tenantId]/route.ts`
- `app/api/invoices/route.ts`
- `app/api/invoices/[invoiceId]/send/route.ts`

## 3) How to protect a route (copy/paste)

### AuthN only (requires login)

```ts
import { requireSession } from "@/app/api/_platform/auth"

export async function GET() {
  const auth = requireSession()
  if (!auth.ok) return auth.response

  // ... your logic ...
}
```

### AuthN + AuthZ (requires permission)

```ts
import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"

export async function POST() {
  const auth = requirePermission(PERMISSIONS.TENANTS.CREATE)
  if (!auth.ok) return auth.response

  // ... your logic ...
}
```

Notes:
- `requirePermission(...)` returns **401** if not logged in, **403** if missing permission.
- Prefer `PERMISSIONS.<MODULE>.<ACTION>` constants (do not hardcode strings).

## 4) Which permission to use?

Use the mapping in:
- `docs/dev1-platform-security.md` → “Recommended permission mapping (routes → permissions)”

Rule of thumb:
- `GET` → `*.VIEW`
- `POST` → `*.CREATE`
- `PATCH/PUT` → `*.UPDATE`
- `DELETE` → `*.DELETE`

## 5) Local dev: env vars you may need

Required in **production**:
- `AUTH_SECRET` (server-only)

For local dev (defaults exist):
- `ADMIN_EMAIL` default `admin@example.com`
- `ADMIN_PASSWORD` default `admin123`

## 6) Quick test plan (expected 200/401/403)

### A) Unauthenticated request should be 401

- Call your route without logging in:
  - Expected: **401** with `{ error: { code: "UNAUTHORIZED", ... } }`

### B) Viewer role should be 403 for creates/updates/deletes

1. Login as viewer (dev-only behavior supported by Dev1):
   - `POST /api/auth/login` with JSON `{ email, password, role: "viewer" }`
2. Call a write endpoint (e.g. create tenant):
   - Expected: **403** with `{ error: { code: "FORBIDDEN", ... } }`

### C) Admin should be 200

1. Login with default admin credentials (no role field, or role `admin`)
2. Call the same endpoint
   - Expected: **200** (or **201** for creates)

## 7) Common pitfalls

- Do not import Zustand store (`lib/store/index.ts`) into `app/api/**` handlers.
  - Those stores persist via localStorage and are not safe for server route handlers.
- Don’t implement your own permission logic.
  - Always call `requirePermission(...)` from Dev1.

