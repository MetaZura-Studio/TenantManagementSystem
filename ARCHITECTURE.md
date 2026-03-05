# Architecture & Folder Structure Guide

## Overview

This document describes the production-ready folder structure for the Tenant Management Admin Portal.

## Folder Structure

```
├── app/
│   ├── (app)/                    # Authenticated app shell group
│   │   ├── layout.tsx           # AppShell + providers
│   │   ├── dashboard/
│   │   ├── tenants/
│   │   ├── branches/
│   │   ├── plans/
│   │   ├── tenant-subscriptions/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── currency/
│   │   └── settings/
│   ├── layout.tsx                # Root layout (theme, html/body)
│   ├── globals.css
│   ├── not-found.tsx
│   └── error.tsx
│
├── components/
│   ├── ui/                       # shadcn generated components (do not edit unless necessary)
│   └── shared/                   # App-wide reusable components
│       ├── app-shell/
│       │   ├── AppShell.tsx
│       │   ├── Sidebar.tsx
│       │   ├── Topbar.tsx
│       │   ├── NavItems.ts      # Single source of truth for nav config
│       │   └── index.ts
│       ├── data-table/
│       │   ├── DataTable.tsx
│       │   └── index.ts
│       ├── forms/
│       ├── feedback/
│       │   ├── ConfirmDialog.tsx
│       │   ├── EmptyState.tsx
│       │   ├── ModernEmptyState.tsx
│       │   ├── Skeletons.tsx
│       │   └── index.ts
│       ├── badges/
│       │   ├── StatusBadge.tsx
│       │   └── index.ts
│       ├── cards/
│       │   ├── GlassCard.tsx
│       │   ├── StatCard.tsx
│       │   └── index.ts
│       ├── breadcrumbs/
│       │   ├── Breadcrumbs.tsx
│       │   └── index.ts
│       └── page-header/
│           ├── PageHeader.tsx
│           └── index.ts
│
├── features/                     # Feature modules (each owns its UI, types, schemas, hooks)
│   ├── tenants/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── constants/
│   ├── branches/
│   ├── plans/
│   ├── subscriptions/
│   ├── users/
│   ├── roles/
│   ├── invoices/
│   ├── payments/
│   ├── currency/
│   └── settings/
│
├── lib/
│   ├── api/                      # Async wrappers used by React Query
│   │   ├── index.ts
│   │   ├── tenants.api.ts
│   │   ├── branches.api.ts
│   │   └── ... (feature-specific API files)
│   ├── store/                    # Zustand slices + persistence
│   │   ├── index.ts
│   │   ├── persist.ts
│   │   ├── tenants.slice.ts
│   │   └── ... (feature-specific slices)
│   ├── query/                    # React Query client + keys
│   │   ├── queryClient.ts
│   │   └── queryKeys.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── format.ts
│   │   └── index.ts
│   └── auth/                     # Mock auth + permission checks
│       ├── session.ts
│       └── permissions.ts
│
├── config/
│   ├── env.ts                    # Environment variable parsing
│   └── app.ts                    # App constants
│
└── types/                        # Only truly global types
```

## Key Principles

### 1. Separation of Concerns
- **UI Components** (`components/shared/`): Reusable, app-wide components
- **Feature Modules** (`features/`): Domain-specific code (components, hooks, types, schemas)
- **Data Layer** (`lib/`): API wrappers, state management, utilities
- **Configuration** (`config/`): App constants and environment variables

### 2. Feature Modules
Each feature module (`features/<module>/`) should contain:
- `components/` - Feature-specific UI components
- `hooks/` - React Query hooks and custom hooks
- `schemas/` - Zod validation schemas
- `types/` - TypeScript types/interfaces
- `constants/` - Feature-specific constants

### 3. Naming Conventions
- **Components**: PascalCase (e.g., `TenantList.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `use-tenants.ts`)
- **API files**: kebab-case with `.api.ts` suffix (e.g., `tenants.api.ts`)
- **Types**: PascalCase (e.g., `Tenant.ts`)
- **Schemas**: camelCase with `Schema` suffix (e.g., `tenantSchema`)

### 4. Path Aliases
- `@/components/*` → `components/*`
- `@/features/*` → `features/*`
- `@/lib/*` → `lib/*`
- `@/config/*` → `config/*`
- `@/types/*` → `types/*`

## How to Add a New Feature

1. **Create feature folder structure**:
   ```bash
   features/my-feature/
     ├── components/
     ├── hooks/
     ├── schemas/
     ├── types/
     └── constants/
   ```

2. **Add types** (`features/my-feature/types/index.ts`):
   ```typescript
   export interface MyFeature {
     id: string
     name: string
   }
   ```

3. **Add schema** (`features/my-feature/schemas/index.ts`):
   ```typescript
   import { z } from "zod"
   export const myFeatureSchema = z.object({...})
   ```

4. **Add API** (`lib/api/my-feature.api.ts`):
   ```typescript
   import { useStore } from "@/lib/store"
   export const myFeatureApi = { getAll, getById, create, update, delete }
   ```

5. **Add store slice** (`lib/store/my-feature.slice.ts`):
   ```typescript
   export const useMyFeatureStore = create(...)
   ```

6. **Add hooks** (`features/my-feature/hooks/use-my-feature.ts`):
   ```typescript
   export function useMyFeatures() {
     return useQuery({ queryKey: queryKeys.myFeature.all, queryFn: myFeatureApi.getAll })
   }
   ```

7. **Create page** (`app/(app)/my-feature/page.tsx`):
   ```typescript
   import { MyFeatureList } from "@/features/my-feature/components/MyFeatureList"
   export default function MyFeaturePage() {
     return <MyFeatureList />
   }
   ```

## How to Add a New Route

1. Create route folder: `app/(app)/my-route/`
2. Add `page.tsx` that imports feature component
3. Update `components/shared/app-shell/NavItems.ts` to include navigation

## Migration Status

### ✅ Completed
- [x] Created folder structure
- [x] Moved shared components to `components/shared/`
- [x] Created lib structure (`utils/`, `query/`, `auth/`)
- [x] Created config folder
- [x] Updated path aliases in tsconfig.json

### 🔄 In Progress
- [ ] Split `lib/api/index.ts` into feature-specific API files
- [ ] Split `lib/store/index.ts` into feature-specific slices
- [ ] Split `lib/types.ts` and `lib/schemas.ts` into feature modules
- [ ] Move app routes to `app/(app)/`
- [ ] Update all imports across codebase

### 📝 Next Steps
1. Complete API file splitting
2. Complete store slice splitting
3. Move types and schemas to feature modules
4. Reorganize app routes
5. Update all imports
6. Test all routes and functionality

## Notes

- All route URLs are preserved exactly
- No functionality is removed
- Zustand store, TanStack Query, RHF + Zod forms continue to work
- After migration, app must run with `npm run dev` with zero runtime errors
