# Dev1 Merging Notes (Platform/Security)

This file is a **merge aid**. It documents how Dev1 changes should be integrated with Dev2/Dev3 work with minimal conflicts.

## Golden rules (to prevent merge pain)

- **Dev1 only touches Dev1-owned files** (listed below).
- Dev2/Dev3 should **not** edit `lib/auth/**`, `middleware.ts`, or `app/api/_platform/**`.
- Dev1 should **avoid editing** common barrel exports (`lib/api/index.ts`, `lib/store/index.ts`) unless absolutely necessary.
- Cross-module changes should be done by **adding new files** in Dev1-owned directories, not by modifying other developers’ modules.

## Dev1-owned files (safe to merge)

### Modified by Dev1

- `lib/auth/session.ts`
- `lib/auth/permissions.ts`
- `lib/utils/rbac.ts`
- `lib/store/roles.slice.ts`
- `lib/api/roles.api.ts`
- `features/roles/**`

### Added by Dev1

- `middleware.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/_platform/auth.ts`
- `app/api/_platform/http.ts` *(optional)*

## Integration contract for Dev2/Dev3 API routes

Dev2/Dev3 will create their own route handlers under `app/api/<module>/**/route.ts`.

They should integrate RBAC by importing Dev1 helpers:
- `requireSession(request)`
- `requirePermission(request, "<module>:<action>")`

### Example (pseudocode only)

In any `app/api/.../route.ts` handler:
- Call `requirePermission(req, PERMISSIONS.TENANTS.VIEW)` before reading tenants
- Call `requirePermission(req, PERMISSIONS.PLANS.UPDATE)` before updating plans
- Return data only after authz passes

**Dev2/Dev3 should not re-implement permission logic** in their modules; they should call Dev1’s helper.

## Common merge conflicts & how to avoid them

- **Conflict: `lib/api/index.ts`**
  - Avoid by not adding exports there during feature work.
  - Prefer direct imports from `lib/api/<module>.api.ts`.
- **Conflict: `lib/store/index.ts`**
  - Avoid by not changing store composition.
  - Prefer module-local store slices, and keep wiring changes minimal.
- **Conflict: shared UI (`components/shared/**`)**
  - Avoid by keeping auth UI in Dev1-owned files.
  - If Dev2/Dev3 need UI gates, Dev1 will provide a hook/component in `lib/auth/*` to consume.

## Post-merge verification checklist

- `npm install`
- `npm run dev`
- Verify:
  - Unauthenticated access to protected pages is blocked (middleware)
  - `/api/auth/me` returns session when logged in
  - Unauthorized API calls return `401/403` consistently
  - Roles screen still loads (`features/roles/**`)

