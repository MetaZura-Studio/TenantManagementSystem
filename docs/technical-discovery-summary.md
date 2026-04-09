# Technical Discovery Summary (Dishdasha Admin)

## 1. PROJECT OVERVIEW

- **Type of application**: Admin web application for managing tenants, subscriptions/plans, users/roles, invoices/payments, and supporting lookups/settings.
- **Main purpose of the admin panel**:
  - Create/manage **Tenants** and their **Branches**
  - Create/manage **Plans** and **Tenant Subscriptions**
  - Create/manage **Users** and **Roles/Permissions**
  - Create/manage **Invoices** and **Payments**
  - Manage **Currency Lookup**
  - View **Dashboard** KPIs derived from database
  - Configure **Settings** (currently client-side)
- **Main stack used (confirmed)**:
  - **Next.js 14** (App Router)
  - **TypeScript**, **React 18**
  - **Prisma ORM** (MySQL/TiDB provider)
  - **TanStack Query** (data fetching/caching)
  - **TanStack Table** (tables)
  - **Zod** + **React Hook Form** (form validation/handling)
  - **Tailwind** + **shadcn/ui** + **Radix UI**
  - **Zustand** exists in codebase (some legacy/mock slices still present)
- **Frontend-only vs full-stack**: **Full-stack** in a single Next.js app.
  - **Backend** is implemented via **Next.js Route Handlers** under `app/api/**`.
  - **Database** access is via `lib/server/prisma.ts`.

---

## 2. MODULES CURRENTLY DEVELOPED

Below is what exists in the codebase now (pages under `app/(app)/**` and feature pages under `features/**/pages/**`).

### Dashboard
- **Screens/pages**: `/dashboard` (`app/(app)/dashboard/page.tsx`)
- **Operations implemented**:
  - Read-only KPI aggregation via Prisma (counts/aggregates)
- **Data shown**:
  - Total tenants, active subscriptions, pending invoices, monthly revenue, success-rate KPIs, recent activity (audit logs + recent users), top plans by active subs
- **Backend status**: **Connected to real database (Prisma)**.

### Tenants
- **Screens/pages**:
  - List: `/tenants`
  - Create: `/tenants/new`
  - Detail: `/tenants/[tenantId]`
  - Edit: `/tenants/[tenantId]/edit`
- **Operations implemented**:
  - List, create, view, update, soft delete
  - Optional tenant logo upload stored under `public/uploads/tenant-logos/**`
  - Auto-create “Main Branch” on tenant create (branch_code `MAIN`)
- **Data managed**:
  - Tenant code/slug, shop names, owner details, contact person, address fields, invoice prefix/logo, subscription status + dates, soft-delete
- **Backend status**: **Connected to real backend + DB** (`/api/tenants`, `/api/tenants/:id`).

### Branches
- **Screens/pages**:
  - List: `/branches` (supports tenantId query param from UI navigation)
  - Create: `/branches/new`
  - Edit: `/branches/[branchId]/edit`
- **Operations implemented**: list, create, update, delete
- **Data managed**:
  - tenantId, branchCode, names, address fields, phone/contactName/status/remarks
- **Backend status**: **Connected to real backend + DB** (`/api/branches`, `/api/branches/:id`).

### Plans
- **Screens/pages**:
  - List: `/plans`
  - Create: `/plans/new`
  - Edit: `/plans/[planId]/edit`
- **Operations implemented**: list, create, update, delete
- **Data managed**:
  - planCode, names, description, billingCycle, currencyCode, monthlyPrice/yearlyPrice, limits (maxBranches/maxUsers), isActive/featuresJson
- **Backend status**: **Connected to real backend + DB** (`/api/plans`, `/api/plans/:id`).

### Tenant Subscriptions
- **Screens/pages**:
  - List: `/tenant-subscriptions`
  - Create: `/tenant-subscriptions/new`
  - Detail: `/tenant-subscriptions/[subscriptionId]`
  - Edit: `/tenant-subscriptions/[subscriptionId]/edit`
  - Upgrade flow page: `/tenant-subscriptions/upgrade`
- **Operations implemented**: list, create, update, delete; plus UI helpers (activate/suspend/cancel/expire via PATCH)
- **Data managed**:
  - tenantId, planId, status, start/end/period dates, auto-lock date, currency, unit price, autoRenew/cancelAtPeriodEnd, notes/overrideNotes
  - UI contains discountAmount/discountPercent fields; backend currently maps subscription discount fields as `0` in `rowToSubscription` (see API section).
- **Backend status**: **Connected to real backend + DB** (`/api/tenant-subscriptions`, `/api/tenant-subscriptions/:id`).

### Users
- **Screens/pages**:
  - List: `/users`
  - Create: `/users/new`
  - Detail: `/users/[userId]`
  - Edit: `/users/[userId]/edit`
- **Operations implemented**: list, create, update, delete
- **Data managed**:
  - tenantId, branchId (optional in UI but backend resolves “Main Branch” if missing), roleId, identity fields, contact/address, status, password handling (hashing)
- **Backend status**: **Connected to real backend + DB** (`/api/users`, `/api/users/:id`).

### Roles / Permissions
- **Screens/pages**:
  - List: `/roles`
  - Create: `/roles/new`
  - Detail: `/roles/[roleId]`
  - Edit: `/roles/[roleId]/edit`
- **Operations implemented**: list, create, update, delete
- **Data managed**:
  - Role name/description/status
  - Permission matrix persisted into `permissions` + `role_permissions`
- **Backend status**: **Connected to real backend + DB** (`/api/roles`, `/api/roles/:roleId`) + store uses Prisma.

### Invoices
- **Screens/pages**:
  - List: `/invoices`
  - Create: `/invoices/new`
  - Detail: `/invoices/[invoiceId]`
  - Edit: `/invoices/[invoiceId]/edit`
  - Print: `/invoices/[invoiceId]/print`
- **Operations implemented**:
  - list, create, update, delete
  - invoice lines: list/create/update/delete (nested routes)
  - PDF route exists (`/api/invoices/:invoiceId/pdf`) and send route exists (`/api/invoices/:invoiceId/send`) (details not fully inspected in this pass)
  - On invoice create: if totals are 0, server derives totals from selected subscription `unit_price` and may create a default subscription line item
- **Backend status**:
  - **Route handler** delegates to an internal store (`app/api/invoices/_store.ts`) which uses **Prisma** (real DB).

### Payments
- **Screens/pages**:
  - List: `/payments`
  - Detail: `/payments/[paymentId]`
- **Operations implemented**: list, create, update, delete
- **Business logic**:
  - After create/update/delete payment, recomputes invoice `paid_amount`, `amount_due`, and invoice `status` based on successful payments
- **Backend status**:
  - **Route handler** delegates to an internal store (`app/api/payments/_store.ts`) which uses **Prisma** (real DB).

### Currency Lookup
- **Screens/pages**: `/currency`
- **Operations implemented**: list, create, update (KWD base currency protected) (based on existing route presence)
- **Backend status**: **Connected to real backend + DB** (`/api/currencies`, `/api/currencies/:code`).

### Settings
- **Screens/pages**: `/settings`
- **Operations implemented**:
  - Read/update settings via `lib/api/settings.api.ts`
  - Includes “Form required fields” JSON settings (used to drive required indicators/validation behavior)
- **Backend status**: **Mock/client-only**.
  - Uses Zustand store (`lib/store/settings.slice.ts`) and in-memory defaults.
  - **Not found in current codebase**: any `/api/settings` route handler.

### Profile
- **Screens/pages**: `/profile`
- **Backend status**: Not inspected in detail; page exists.

---

## 3. DATABASE AND DATA MODEL

### ORM + configuration (confirmed)
- **ORM**: Prisma (`prisma/schema.prisma`)
- **Datasource**: MySQL-compatible (`provider = "mysql"`) using `DATABASE_URL`
- **Client**: `lib/server/prisma.ts` (singleton PrismaClient)

### Tables/entities found (confirmed from `prisma/schema.prisma`)
- **Core commercial entities**:
  - `tenants`
  - `branches`
  - `plans`
  - `tenant_subscriptions`
  - `currencies`
- **Identity/RBAC**:
  - `users`
  - `roles`
  - `permissions`
  - `role_permissions` (join)
  - `super_admin_users`
- **Billing**:
  - `invoices`
  - `invoice_lines`
  - `payments`
- **Operational/support**:
  - `audit_logs`
  - `feature_flags`
  - `broadcast_messages`

### Important fields / keys / relationships (high-signal)
- **Primary keys**
  - Most tables: `id` int autoincrement PK
  - `currencies`: `code` varchar PK
- **Tenant scoping fields**
  - `tenant_id` exists in: `branches`, `users`, `roles` (nullable), `tenant_subscriptions`, `invoices`, `payments`, `audit_logs` (nullable), `feature_flags` (nullable), `broadcast_messages` (nullable)
- **Branch scoping fields**
  - `branch_id` exists in `users` (required in schema)
- **Key uniqueness**
  - `tenants`: unique `tenant_code`, `slug`, `owner_email`
  - `branches`: unique `(tenant_id, branch_code)`
  - `users`: unique `user_code`, plus unique `(tenant_id, email)` and `(tenant_id, username)`
  - `tenant_subscriptions`: unique `subscription_code`
  - `invoices`: unique `invoice_code`, `invoice_number`
  - `payments`: unique `payment_code`, `payment_reference`, `transaction_id` (nullable)
  - `permissions`: unique `(module_key, action_key)`
  - `role_permissions`: unique `(role_id, permission_id)`
- **Status/enums**
  - Stored as `String` in DB for most status fields (no Prisma enums defined).
  - Notable status fields: `tenants.subscription_status`, `tenant_subscriptions.status`, `users.status`, `roles.status`, `invoices.status`, `payments.status`

### Missing relationships / inconsistencies visible
- **Foreign keys in Prisma schema**: The Prisma models shown are mostly scalar fields; explicit Prisma `@relation` fields are not defined in the schema shown.
  - This suggests schema was introspected without relations or relations were not modeled; relational integrity may be enforced at DB level but is not declared in Prisma schema file as relations.
- **Multi-tenancy enforcement**: Many entities have `tenant_id`, but API handlers often query globally without filtering by tenant. (See section 6.)
- **Tenant subscription discount fields**: DB model has no discount columns; UI schema includes discount fields. Backend maps them as 0 in subscription mapping.

---

## 4. EXISTING BACKEND / API STATUS

### Backend exists? (confirmed)
- **Yes**: Next.js Route Handlers under `app/api/**`.
- **DB access**: Prisma via `lib/server/prisma.ts`.
- **Validation layer**:
  - UI validation: **Zod** schemas under `features/**/schemas`.
  - API validation: generally **minimal** (checks required fields, parse ints/dates). No shared server-side Zod validation layer found in the inspected routes.

### Existing API routes (confirmed from `app/api/**`)
- **Auth**
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- **Tenants**
  - `GET /api/tenants`
  - `POST /api/tenants` (supports multipart for logo)
  - `GET /api/tenants/:id`
  - `PUT /api/tenants/:id` (supports multipart for logo)
  - `DELETE /api/tenants/:id` (soft delete)
- **Branches**
  - `GET /api/branches`
  - `POST /api/branches`
  - `GET /api/branches/:id`
  - `PATCH /api/branches/:id`
  - `DELETE /api/branches/:id`
- **Plans**
  - `GET /api/plans`
  - `POST /api/plans`
  - `GET /api/plans/:id`
  - `PATCH /api/plans/:id`
  - `DELETE /api/plans/:id`
- **Tenant Subscriptions**
  - `GET /api/tenant-subscriptions`
  - `POST /api/tenant-subscriptions`
  - `GET /api/tenant-subscriptions/:id`
  - `PATCH /api/tenant-subscriptions/:id`
  - `DELETE /api/tenant-subscriptions/:id`
- **Users**
  - `GET /api/users`
  - `POST /api/users` (hashes password; creates main branch if needed)
  - `GET /api/users/:id`
  - `PATCH /api/users/:id` (optional password update)
  - `DELETE /api/users/:id`
- **Roles**
  - `GET /api/roles`
  - `POST /api/roles`
  - `GET /api/roles/:roleId`
  - `PATCH /api/roles/:roleId`
  - `DELETE /api/roles/:roleId`
- **Invoices**
  - `GET /api/invoices`
  - `POST /api/invoices`
  - `GET /api/invoices/:invoiceId`
  - `PATCH /api/invoices/:invoiceId`
  - `DELETE /api/invoices/:invoiceId`
  - `GET /api/invoices/:invoiceId/lines`
  - `POST /api/invoices/:invoiceId/lines`
  - `PATCH /api/invoices/:invoiceId/lines/:lineId`
  - `DELETE /api/invoices/:invoiceId/lines/:lineId`
  - `GET /api/invoices/:invoiceId/pdf`
  - `POST /api/invoices/:invoiceId/send`
- **Payments**
  - `GET /api/payments`
  - `POST /api/payments`
  - `GET /api/payments/:paymentId`
  - `PATCH /api/payments/:paymentId`
  - `DELETE /api/payments/:paymentId`
- **Currencies**
  - `GET /api/currencies`
  - `POST /api/currencies`
  - `PATCH /api/currencies/:code`

### Services / repositories / stores (confirmed)
- Some modules use “store” modules under API:
  - `app/api/invoices/_store.ts` → Prisma-based store functions (list/create/update/delete + invoice lines)
  - `app/api/payments/_store.ts` → Prisma-based store functions + invoice recomputation
  - `app/api/roles/_store.ts` → Prisma-based RBAC persistence (`roles`, `permissions`, `role_permissions`)
- For other modules, route files directly call Prisma.

### Mock API files / in-memory data (confirmed)
- **Settings** uses client-side Zustand store + default seed list (`lib/api/settings.api.ts`, `lib/store/settings.slice.ts`).
- Zustand slices still exist in `lib/store/**` for many modules (tenants, plans, etc.), but the inspected feature hooks primarily use `lib/api/**` (HTTP calls) + React Query.
  - Needs confirmation: whether any screens still depend on Zustand slices for core data (search results found slices exist, but not all feature pages were traced end-to-end).

---

## 5. AUTHENTICATION AND AUTHORIZATION

### Login/auth system used (confirmed)
- **Custom auth**, not NextAuth:
  - Session cookie `tms_session` is a signed token created in `app/api/_platform/auth.ts`.
  - Token payload: `{ user: {id,name,email,role,permissions?}, exp }`.
  - Cookie is `httpOnly`, `sameSite=lax`, `secure` in production.
  - Default session duration set to 8 hours in login route.

### Auth endpoints (confirmed)
- `POST /api/auth/login`
  - Supports two user types:
    - `super_admin_users` (seeded if missing)
    - `users` (tenant users)
  - Password hashing/verification uses Node `crypto` `scrypt`.
- `GET /api/auth/me`: returns session user + permissions (derived via `resolvePermissionsForRole` if not present).
- `POST /api/auth/logout`: clears session cookie.

### Authorization (RBAC) system (confirmed)
- Server enforcement:
  - Route handlers call `requirePermission(PERMISSIONS.<MODULE>.<ACTION>)` from `app/api/_platform/auth.ts`.
  - Permissions are string keys like `"tenants:view"`.
  - `requirePermission` hydrates missing permissions using `lib/auth/rbac-model.ts` role mapping.
- Client/UI enforcement:
  - `lib/auth/permissions.ts` has a `hasPermission()` helper that reads a client-side cached session (`localStorage`) but defaults to allowing when absent (API remains enforced).
  - `useSession()` fetches `/api/auth/me` and caches to `localStorage`.

### Middleware / guards (confirmed)
- `middleware.ts`:
  - Protects non-public pages by presence of `tms_session` cookie.
  - Redirects authenticated users away from `/login` to `/dashboard` (or `next` param).
  - Does **not** block `/api/**` (API routes enforce via `requirePermission`).

### Tenant scoping logic (confirmed status)
- Authentication token payload **does not include** `tenantId`/`branchId` for tenant users (only `id,name,email,role`).
- Authorization checks are permission-string based, not tenant-scoped by default.
- **Not found in current codebase** (confirmed missing in inspected auth): automatic tenant/branch scoping at auth layer for all queries.

---

## 6. MULTI-TENANCY STRUCTURE

### Is the system multi-tenant? (confirmed)
- **Yes at the data model level**: many tables contain `tenant_id`.

### How tenant isolation is handled (confirmed)
- **Admin portal CRUD routes** generally do **not** filter by the current session’s tenant.
  - Example: `GET /api/branches` returns all branches; `GET /api/users` returns all users; `GET /api/tenant-subscriptions` returns all subscriptions; etc.
- Tenant isolation appears to be **administrative**, not enforced per-tenant user session.

### Which entities are tenant-scoped (confirmed by schema)
- `branches`, `users`, `tenant_subscriptions`, `invoices`, `payments`, and others include `tenant_id`.

### Whether queries are filtered by tenant (confirmed)
- For the inspected routes: **mostly not filtered** (global lists).
- **Needs confirmation**: whether there are any tenant-scoped list routes or query params used server-side for scoping (not seen in inspected code).

### Branch-based filtering exists? (confirmed)
- Data model includes `users.branch_id`.
- No general “branch scoping” middleware/guard found in inspected code.

### Risks if multi-tenant logic is incomplete (confirmed risk based on code)
- If a tenant-level user is intended to use client applications, current API surfaces would require additional scoping/guards to prevent cross-tenant data access.

---

## 7. BUSINESS FLOWS FOUND IN ADMIN

Only flows supported by current code paths inspected:

- **Authentication flow**
  - Login via `/login` → `POST /api/auth/login` → cookie set → `/dashboard`
  - Session hydration via `GET /api/auth/me`
- **Tenant onboarding flow**
  - Create tenant (`POST /api/tenants`) optionally with logo upload
  - System auto-creates a “Main Branch” (`branches.branch_code = "MAIN"`) during tenant create transaction
- **Branch management flow**
  - Create/update/delete branches via `/api/branches`
- **Plan management flow**
  - Create/update/delete plans via `/api/plans`
- **Subscription management flow**
  - Create subscription tied to tenant + plan; supports status updates via PATCH
- **User creation flow**
  - Create user tied to tenant + role; if branch not provided, backend creates/resolves a “Main Branch”
  - Password hashing at create (and optional reset on edit)
- **Invoice creation flow**
  - Create invoice; if totals are not computed, server derives from subscription’s `unit_price`
  - Creates a default subscription line item when subscription is provided
- **Payment recording flow**
  - Create/update/delete payment; system recomputes invoice amounts/status using successful payments aggregate

Not found in current codebase (based on inspected areas):
- Customer/measurement/order flows
- Fabric/production workflow modules
- Reports module (other than dashboard KPIs)

---

## 8. CLIENT API CANDIDATES

These are *candidate API areas* that an external/client application will likely need, based on what is implemented in admin today. This is not final endpoint design.

### Auth / Session
- **Purpose**: authenticate external app users against the same user DB.
- **Why needed**: external apps (e.g., Cutter app) need a stable auth method and a “who am I + tenant context” response.
- **Readiness**:
  - Cookie-session auth exists for admin.
  - **Not ready** for external apps out-of-the-box if cross-domain; no token-based external auth endpoints exist (see missing section).

Candidate API purposes:
- Login (tenant user)
- Logout
- Get current user identity
- Get “context” (user + tenant + role + subscription + limits) in one call

### Tenants
- **Purpose**: external apps need tenant profile + status + lock/subscription state.
- **Why needed**: to block access if tenant subscription is suspended/expired/locked.
- **Readiness**: tenant CRUD endpoints exist but are admin/RBAC protected and not tenant-scoped.

Candidate API purposes:
- Get tenant profile by id
- Get tenant status/subscription status/lock state

### Plans & Subscriptions (Commercial Core)
- **Purpose**: enforce entitlements (max branches/users, active subscription period, pricing metadata).
- **Why needed**: external apps must know what tenant purchased and what limits apply.
- **Readiness**:
  - Plans/subscriptions admin endpoints exist.
  - **Not ready** as-is for external consumption: no “active subscription for tenant” endpoint and no tenant-scoped guarding.

Candidate API purposes:
- Get active subscription for a tenant
- Get plan limits for a subscription
- Validate subscription belongs to tenant (server-side guard already exists in invoice create)

### Users / Staff
- **Purpose**: external apps authenticate staff and tailor UI by role.
- **Why needed**: map login user to tenant + branch + role.
- **Readiness**:
  - Users admin endpoints exist.
  - Login currently returns a simplified role `"viewer"` for tenant users; does not include tenantId/branchId/roleId context in auth token.

Candidate API purposes:
- Get user profile (includes tenantId/branchId/roleId)
- Get user role name + permissions relevant to external app

### Branches
- **Purpose**: branch list and branch assignment, if external apps are branch-specific.
- **Why needed**: staff apps often operate within a branch scope.
- **Readiness**: endpoints exist but global list is not tenant-filtered.

Candidate API purposes:
- List branches for a tenant
- Get branch details

### Invoices / Payments
- **Purpose**: show invoices, allow payment posting, status checks.
- **Why needed**: if client apps are invoice/payment facing (POS/collections).
- **Readiness**: endpoints exist; payment recomputation exists; but not tenant-scoped for external usage.

Candidate API purposes:
- List invoices for tenant
- Get invoice detail + lines
- Create payment for invoice
- Get payment history for invoice

### Currency Lookup
- **Purpose**: show currency list/exchange rates.
- **Why needed**: pricing/invoice in multi-currency environments.
- **Readiness**: DB-backed endpoints exist (auth required).

---

## 9. WHAT IS STILL MISSING BEFORE CLIENT API DESIGN

Items that cannot be confirmed (or are explicitly missing) from current code and are required to properly define client-facing APIs:

- **Client app types and roles**: which external apps exist (staff-facing vs customer-facing) and what each must do (Needs confirmation).
- **External auth method**:
  - Token-based endpoints (Bearer token) are referenced in docs but **Not found in current codebase**.
  - CORS / same-site cookie strategy for cross-domain clients (Needs confirmation).
- **Tenant scoping rules**:
  - Which endpoints must be tenant-restricted vs super-admin/global.
  - Whether tenant users should only see their own tenant’s entities (Needs confirmation; current code is largely global lists).
- **Branch scoping rules**:
  - Whether users are restricted to a branch or can act across branches (Needs confirmation).
- **Role mapping source of truth**:
  - DB roles exist; session roles are currently generic strings (`admin` / `viewer`) and permissions may be derived from `rbac-model.ts` rather than DB role assignments for tenant users (Needs confirmation of desired behavior).
- **Entitlements definition**:
  - Which subscription status values should block access
  - How to compute “active subscription” when multiple subscriptions exist (Needs confirmation)
- **Counts needed for limits**:
  - Whether limits should check “active branches/users” only; what defines active (Needs confirmation).
- **Data contracts**:
  - Exact shape of “context” payload required by external apps (Needs confirmation).
- **File upload needs for external apps**:
  - Tenant logo upload exists for admin; other uploads not found (Needs confirmation).
- **Webhooks/events**:
  - No webhook mechanism found in inspected code (Not found in current codebase).
- **Pagination/search/filtering**:
  - Admin lists are currently client-side (React Table) over fetched arrays; server-side pagination not found (Needs confirmation for client API performance).

---

## 10. FINAL SUMMARY

- **Confirmed modules**
  - Dashboard, Tenants, Branches, Plans, Tenant Subscriptions, Users, Roles/Permissions, Invoices (+ lines/PDF/send routes exist), Payments, Currency Lookup, Settings (client-only)
- **Confirmed backend status**
  - Next.js route handlers exist under `app/api/**`
  - Prisma-based DB access for most modules
  - Settings is client-only mock (Zustand); no `/api/settings` found
- **Confirmed auth status**
  - Custom signed cookie session (`tms_session`) + `/api/auth/login|me|logout`
  - RBAC permission checks enforced server-side via `requirePermission`
- **Confirmed multi-tenant status**
  - Data model is multi-tenant (many `tenant_id` columns)
  - Tenant isolation is **not** broadly enforced in API queries (mostly global lists)
- **Top API domains likely needed**
  - External auth + “context” (user/tenant/role/subscription/limits)
  - Tenant profile/status
  - Subscription/plan entitlements
  - User/role lookup
  - Branch listing for tenant
  - Invoices/payments (if external apps handle billing workflows)
- **Critical gaps before implementation**
  - Decide external auth method (Bearer token vs cookie + same-site proxy)
  - Implement and enforce tenant/branch scoping rules
  - Define “active subscription” + entitlement computation rules
  - Align session role/permissions with DB roles for tenant users (if required)

---

## 11. FILES YOU REVIEWED

High-signal files/folders inspected to produce this report:

- **Project / config**
  - `package.json`
  - `next.config.js`
- **Routing (pages)**
  - `app/(app)/**/page.tsx` (sampled key modules)
  - `app/login/page.tsx`
- **Backend API**
  - `app/api/_platform/auth.ts`
  - `app/api/_platform/http.ts`
  - `app/api/auth/login/route.ts`
  - `app/api/auth/me/route.ts`
  - `app/api/auth/logout/route.ts`
  - `app/api/tenants/route.ts`
  - `app/api/tenants/[id]/route.ts`
  - `app/api/branches/route.ts`
  - `app/api/plans/route.ts`
  - `app/api/users/route.ts`
  - `app/api/users/[id]/route.ts`
  - `app/api/tenant-subscriptions/route.ts`
  - `app/api/invoices/route.ts`
  - `app/api/invoices/_store.ts`
  - `app/api/payments/route.ts`
  - `app/api/payments/_store.ts`
  - `app/api/roles/route.ts`
  - `app/api/roles/_store.ts`
- **Auth + middleware**
  - `middleware.ts`
  - `lib/auth/session.ts`
  - `lib/auth/permissions.ts`
  - `lib/auth/rbac-model.ts`
  - `lib/auth/useSession.ts`
- **Database**
  - `prisma/schema.prisma`
  - `lib/server/prisma.ts`
- **Frontend API clients + hooks**
  - `lib/api/tenants.api.ts`
  - `features/tenants/hooks/use-tenants.ts`
  - `lib/api/tenant-subscriptions.api.ts`
  - `features/tenant-subscriptions/hooks/use-subscriptions.ts`
  - `lib/api/users.api.ts`
  - `features/users/hooks/use-users.ts`
  - `lib/api/settings.api.ts`
  - `lib/store/settings.slice.ts`
- **Validation schemas (Zod)**
  - `features/tenants/schemas/index.ts`
  - `features/users/schemas/index.ts`
  - `features/tenant-subscriptions/schemas/index.ts`
  - `features/invoices/schemas/index.ts`

