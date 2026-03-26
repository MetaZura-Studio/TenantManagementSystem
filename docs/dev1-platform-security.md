# Dev1 Platform & Security (Auth + RBAC + API Authorization)

This document defines the **Dev1-owned** platform/security surface area and the **integration contract** for other developers (Dev2/Dev3) to use without causing merge conflicts.

## Scope (Dev1 owns)

- **Authentication & session management**
  - Login/logout endpoints
  - Session retrieval (`/api/auth/me`)
  - Cookie/session handling
- **RBAC**
  - Permission model definition
  - Role → permissions mapping resolution
  - `hasPermission(...)` implementation used by UI and API
- **API-level authorization**
  - Shared helpers for route handlers (`requireSession`, `requirePermission`)
  - Standard error response format for 401/403
- **Route protection**
  - `middleware.ts` for protecting app pages

## Non-scope (Dev1 does NOT own)

Dev1 should **not** implement or modify business logic for:
- Plans / subscriptions / pricing (Dev2)
- Invoices / payments / invoice send flow (Dev3)
- Tenants/branches domain logic (Dev2)

## File ownership boundaries

### Dev1 may modify

- `lib/auth/session.ts`
- `lib/auth/permissions.ts`
- `lib/utils/rbac.ts`
- `lib/store/roles.slice.ts` *(only if needed for RBAC UI; avoid touching other slices)*
- `lib/api/roles.api.ts`
- `features/roles/**`

### Dev1 may create

- `middleware.ts`
- `app/api/auth/**/route.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/auth/logout/route.ts`
  - `app/api/auth/me/route.ts`
- `app/api/_platform/**`
  - `app/api/_platform/auth.ts` *(shared auth/authz helpers)*
  - `app/api/_platform/http.ts` *(optional response helpers)*

### Dev1 should avoid touching (merge conflict magnets)

- `lib/api/index.ts`
- `lib/store/index.ts`
- `components/shared/**` *(unless absolutely required for auth gating; prefer `lib/auth/*`)*
- Any `features/*` module other than `features/roles/**`

## Permission model (contract)

### Canonical permission strings

Dev1’s canonical permission strings match existing constants in `lib/auth/permissions.ts`, e.g.:
- `tenants:view`
- `plans:update`
- `invoices:create`

**Important:** Dev2/Dev3 should reference permission strings via constants (preferred) rather than re-typing strings in their modules.

### Role → permission resolution (non-admin)

Current Dev1 implementation resolves non-admin permissions via a simple, deterministic mapping in:
- `lib/auth/rbac-model.ts`

This is a **placeholder** until MySQL-backed roles/permissions are implemented.

Supported roles (case-insensitive):
- `admin` → `["*"]` (all permissions)
- `tenant_manager`
- `commercial_manager`
- `user_manager`
- `finance_manager`
- `viewer` (read-only)

Dev login simulates “real” users by assigning role **based on email** in `app/api/auth/login/route.ts`.

```ts
await fetch("/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "finance.manager@example.com", password }),
})
```

### “Print” permission

Decision pending:
- If “print” is a real capability, Dev1 will add and document permissions like `invoices:print` or a `PRINT` action per module.
- If not needed, it will not be enforced.

## API auth & authz integration contract (for Dev2/Dev3)

Dev1 will provide **shared helpers** in `app/api/_platform/auth.ts`.

### Expected helper APIs

- `requireSession(request)` → returns session (or throws/returns 401)
- `requirePermission(request, permission)` → asserts session + permission (or throws/returns 403)

Dev2/Dev3 will wrap each API route handler with the appropriate permission check.

### Copy/paste snippet for route handlers (Dev2/Dev3)

Use this exact pattern at the top of each handler:

```ts
import { requirePermission, PERMISSIONS } from "@/app/api/_platform/auth"

export async function GET() {
  const auth = requirePermission(PERMISSIONS.TENANTS.VIEW)
  if (!auth.ok) return auth.response

  // ... your logic ...
}
```

Notes:
- `requirePermission(...)` reads the httpOnly cookie via `next/headers` on the server.
- If you only need authentication (not authorization), use `requireSession()`.

### Standardized auth errors

Dev1 will standardize the following responses:
- `401 Unauthorized`: no valid session
- `403 Forbidden`: session exists, but permission check fails

## UI enforcement (low-conflict rules)

- Dev1 will **not** edit Dev2/Dev3 pages to add gates.
- Dev1 will provide a small, reusable gate primitive (hook or component) that Dev2/Dev3 can optionally adopt later.
- For deadline safety, **API-level RBAC is the source of truth**; UI gating is “best effort”.

## Local development notes

- This repo currently runs with `npm run dev` and no backend. Dev1 will introduce API routes under `app/api/`.
- MySQL connectivity and schema are owned by Dev2/Dev3 per plan; Dev1 will only add the minimal DB access utilities needed for auth/session if the team agrees.

## Security hardening notes (Dev1)

### Required env vars (production)

- `AUTH_SECRET` (server-only): used to sign/verify the session cookie token
  - Required when `NODE_ENV=production`
  - Recommended: 32+ chars
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (server-only): dev bootstrap credentials
  - For production, replace the login implementation with real user auth

### Cookie / CSRF expectations

- Session is stored in an **httpOnly cookie** (`tms_session`) with `SameSite=Lax`.
- With `SameSite=Lax`, the cookie is **not sent on cross-site POST requests**, which provides baseline CSRF mitigation for state-changing endpoints.
- If we later need cross-site usage or more complex flows, add an explicit CSRF token strategy.

## Recommended permission mapping (routes → permissions)

This section answers “**what permission should I check for this endpoint?**” so Dev2/Dev3 can implement API authorization consistently.

General rules:
- **List / read**: use `*.VIEW`
- **Create**: use `*.CREATE`
- **Update**: use `*.UPDATE`
- **Delete**: use `*.DELETE`
- If an endpoint performs multiple operations, check the **strongest** permission (or check both).

### Tenants (Dev2)

- `GET /api/tenants` → `PERMISSIONS.TENANTS.VIEW`
- `GET /api/tenants/:id` → `PERMISSIONS.TENANTS.VIEW`
- `POST /api/tenants` → `PERMISSIONS.TENANTS.CREATE`
- `PUT/PATCH /api/tenants/:id` → `PERMISSIONS.TENANTS.UPDATE`
- `DELETE /api/tenants/:id` → `PERMISSIONS.TENANTS.DELETE`

### Branches (Dev2)

- `GET /api/branches` → `PERMISSIONS.BRANCHES.VIEW`
- `GET /api/branches/:id` → `PERMISSIONS.BRANCHES.VIEW`
- `POST /api/branches` → `PERMISSIONS.BRANCHES.CREATE`
- `PUT/PATCH /api/branches/:id` → `PERMISSIONS.BRANCHES.UPDATE`
- `DELETE /api/branches/:id` → `PERMISSIONS.BRANCHES.DELETE`

### Plans (Dev2)

- `GET /api/plans` → `PERMISSIONS.PLANS.VIEW`
- `GET /api/plans/:id` → `PERMISSIONS.PLANS.VIEW`
- `POST /api/plans` → `PERMISSIONS.PLANS.CREATE`
- `PUT/PATCH /api/plans/:id` → `PERMISSIONS.PLANS.UPDATE`
- `DELETE /api/plans/:id` → `PERMISSIONS.PLANS.DELETE`

### Tenant subscriptions (Dev2)

- `GET /api/subscriptions` → `PERMISSIONS.SUBSCRIPTIONS.VIEW`
- `GET /api/subscriptions/:id` → `PERMISSIONS.SUBSCRIPTIONS.VIEW`
- `POST /api/subscriptions` → `PERMISSIONS.SUBSCRIPTIONS.CREATE`
- `PUT/PATCH /api/subscriptions/:id` → `PERMISSIONS.SUBSCRIPTIONS.UPDATE`
- `DELETE /api/subscriptions/:id` → `PERMISSIONS.SUBSCRIPTIONS.DELETE`

### Users (Dev3 per plan; if Dev2 owns, keep same mapping)

- `GET /api/users` → `PERMISSIONS.USERS.VIEW`
- `GET /api/users/:id` → `PERMISSIONS.USERS.VIEW`
- `POST /api/users` → `PERMISSIONS.USERS.CREATE`
- `PUT/PATCH /api/users/:id` → `PERMISSIONS.USERS.UPDATE`
- `DELETE /api/users/:id` → `PERMISSIONS.USERS.DELETE`

### Roles (Dev1)

- `GET /api/roles` → `PERMISSIONS.ROLES.VIEW`
- `GET /api/roles/:id` → `PERMISSIONS.ROLES.VIEW`
- `POST /api/roles` → `PERMISSIONS.ROLES.CREATE`
- `PUT/PATCH /api/roles/:id` → `PERMISSIONS.ROLES.UPDATE`
- `DELETE /api/roles/:id` → `PERMISSIONS.ROLES.DELETE`

### Invoices (Dev3)

- `GET /api/invoices` → `PERMISSIONS.INVOICES.VIEW`
- `GET /api/invoices/:id` → `PERMISSIONS.INVOICES.VIEW`
- `POST /api/invoices` → `PERMISSIONS.INVOICES.CREATE`
- `PUT/PATCH /api/invoices/:id` → `PERMISSIONS.INVOICES.UPDATE`
- `DELETE /api/invoices/:id` → `PERMISSIONS.INVOICES.DELETE`
- `POST /api/invoices/:id/send` → **Recommended:** `PERMISSIONS.INVOICES.UPDATE` (status change) or a dedicated `invoices:send` if we add it later
- `GET /api/invoices/:id/print` → **Pending decision:** either `INVOICES.VIEW` or a dedicated `invoices:print`

### Payments (Dev3)

- `GET /api/payments` → `PERMISSIONS.PAYMENTS.VIEW`
- `GET /api/payments/:id` → `PERMISSIONS.PAYMENTS.VIEW`
- `POST /api/payments` → `PERMISSIONS.PAYMENTS.CREATE`
- `PUT/PATCH /api/payments/:id` → `PERMISSIONS.PAYMENTS.UPDATE`
- `DELETE /api/payments/:id` → `PERMISSIONS.PAYMENTS.DELETE`

