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
│   ├── tenant-subscriptions/
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

### 3.1. Route and Feature Module Naming Rule
**CRITICAL**: Route folder names and feature module names must match exactly.
- Route: `app/(app)/tenant-subscriptions/` → Feature: `features/tenant-subscriptions/`
- Route: `app/(app)/users/` → Feature: `features/users/`
- This ensures consistency and prevents confusion during parallel development.
- API files and store slices must also match: `lib/api/tenant-subscriptions.api.ts`, `lib/store/tenant-subscriptions.slice.ts`

### 4. Path Aliases
- `@/components/*` → `components/*`
- `@/features/*` → `features/*`
- `@/lib/*` → `lib/*`
- `@/config/*` → `config/*`
- `@/types/*` → `types/*`

## Module Ownership & Parallel Development

### Module Ownership Rules

**Each feature module is self-contained and owned by one developer:**

1. **Module Boundaries**: 
   - Modules should NOT import from other feature modules
   - Use `components/shared/` for cross-module UI needs
   - Use `lib/api/` and `lib/store/` for data layer

2. **File Ownership**:
   - `features/<module>/**` - Owned by module developer
   - `lib/api/<module>.api.ts` - Owned by module developer
   - `lib/store/<module>.slice.ts` - Owned by module developer
   - `app/<module>/**` - Thin wrappers, owned by module developer
   - `components/shared/**` - Shared ownership, requires team review for changes

3. **Conflict Prevention**:
   - Each developer works on separate modules
   - Shared components require PR review
   - Store composition (`lib/store/index.ts`) - coordinate changes

### Thin Route Wrapper Rule

**All app route files must be thin wrappers** that only:
1. Import the corresponding page component from `features/<module>/pages`
2. Pass route params as props where needed
3. Render the page component (AppShell is provided by `app/(app)/layout.tsx`)

**DO NOT** put feature logic in route files. All logic belongs in `features/<module>/pages/`.

### Backward Compatibility Files

**DO NOT** create backward compatibility barrel files in `lib/`:
- ❌ `lib/types.ts` - Use feature-specific types: `@/features/<module>/types`
- ❌ `lib/schemas.ts` - Use feature-specific schemas: `@/features/<module>/schemas`
- ❌ `lib/utils.ts` - Use `@/lib/utils` which resolves to `lib/utils/index.ts`

All imports must use the correct source paths directly.

### Global UI Hooks

**Global UI hooks** (like `useToast`) belong in `components/shared/feedback/`:
- ✅ `components/shared/feedback/use-toast.ts`
- ✅ Export via `components/shared/feedback/index.ts`
- Import: `import { toast } from "@/components/shared/feedback/use-toast"`

**DO NOT** place global hooks in a root `hooks/` directory.

## How to Add a New Feature Module

1. **Create feature folder structure**:
   ```bash
   features/my-feature/
     ├── components/
     ├── hooks/
     │   ├── use-my-features.ts
     │   ├── use-my-feature.ts
     │   ├── use-create-my-feature.ts
     │   ├── use-update-my-feature.ts
     │   ├── use-delete-my-feature.ts
     │   └── index.ts
     ├── pages/
     │   ├── MyFeaturesListPage.tsx
     │   ├── CreateMyFeaturePage.tsx
     │   ├── MyFeatureDetailPage.tsx
     │   ├── EditMyFeaturePage.tsx
     │   └── index.ts
     ├── schemas/
     │   └── index.ts
     ├── types/
     │   └── index.ts
     └── constants/
   ```

2. **Add types** (`features/my-feature/types/index.ts`):
   ```typescript
   export interface MyFeature {
     id: string
     name: string
     createdAt: string
     updatedAt: string
   }
   ```

3. **Add schema** (`features/my-feature/schemas/index.ts`):
   ```typescript
   import { z } from "zod"
   export const myFeatureSchema = z.object({
     name: z.string().min(1, "Name is required"),
   })
   ```

4. **Add API** (`lib/api/my-feature.api.ts`):
   ```typescript
   import { useStore } from "@/lib/store"
   import type { MyFeature } from "@/features/my-feature/types"
   
   const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
   
   export const myFeatureApi = {
     getAll: async (): Promise<MyFeature[]> => {
       await delay(300)
       return useStore.getState().myFeatures
     },
     getById: async (id: string): Promise<MyFeature | undefined> => {
       await delay(200)
       return useStore.getState().myFeatures.find((f) => f.id === id)
     },
     create: async (feature: Omit<MyFeature, "id" | "createdAt" | "updatedAt">): Promise<MyFeature> => {
       await delay(400)
       const newFeature: MyFeature = {
         ...feature,
         id: `feature-${Date.now()}`,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
       }
       useStore.getState().addMyFeature(newFeature)
       return newFeature
     },
     update: async (id: string, updates: Partial<MyFeature>): Promise<MyFeature> => {
       await delay(400)
       const feature = useStore.getState().myFeatures.find((f) => f.id === id)
       if (!feature) throw new Error("Feature not found")
       const updated = { ...feature, ...updates, updatedAt: new Date().toISOString() }
       useStore.getState().updateMyFeature(id, updated)
       return updated
     },
     delete: async (id: string): Promise<void> => {
       await delay(300)
       useStore.getState().deleteMyFeature(id)
     },
   }
   ```

5. **Add store slice** (`lib/store/my-feature.slice.ts`):
   ```typescript
   import { StateCreator } from "zustand"
   import type { MyFeature } from "@/features/my-feature/types"
   
   export interface MyFeatureSlice {
     myFeatures: MyFeature[]
     setMyFeatures: (features: MyFeature[]) => void
     addMyFeature: (feature: MyFeature) => void
     updateMyFeature: (id: string, feature: Partial<MyFeature>) => void
     deleteMyFeature: (id: string) => void
   }
   
   export const createMyFeatureSlice: StateCreator<MyFeatureSlice> = (set) => ({
     myFeatures: [],
     setMyFeatures: (features) => set({ myFeatures: features }),
     addMyFeature: (feature) => set((state) => ({ myFeatures: [...state.myFeatures, feature] })),
     updateMyFeature: (id, updates) =>
       set((state) => ({
         myFeatures: state.myFeatures.map((f) => (f.id === id ? { ...f, ...updates } : f)),
       })),
     deleteMyFeature: (id) =>
       set((state) => ({ myFeatures: state.myFeatures.filter((f) => f.id !== id) })),
   })
   ```

6. **Update store composition** (`lib/store/index.ts`):
   ```typescript
   import { createMyFeatureSlice, type MyFeatureSlice } from "./my-feature.slice"
   
   export type StoreState = ... & MyFeatureSlice
   
   export const useStore = create<StoreState>()(
     persist(
       (...args) => ({
         ...createMyFeatureSlice(...args),
         // ... other slices
       }),
       { name: "tenant-management-storage" }
     )
   )
   ```

7. **Add hooks** (`features/my-feature/hooks/use-my-features.ts`):
   ```typescript
   import { useQuery } from "@tanstack/react-query"
   import { myFeatureApi } from "@/lib/api/my-feature.api"
   import { queryKeys } from "@/lib/query/queryKeys"
   
   export function useMyFeatures() {
     return useQuery({
       queryKey: queryKeys.myFeature.all,
       queryFn: myFeatureApi.getAll,
     })
   }
   ```

8. **Create pages** (`features/my-feature/pages/MyFeaturesListPage.tsx`):
   ```typescript
   "use client"
   
   import { PageHeader } from "@/components/shared/page-header"
   import { DataTable } from "@/components/shared/data-table"
   import { useMyFeatures } from "../hooks"
   // ... implement list page
   ```

9. **Create app routes** (`app/my-feature/page.tsx`):
   ```typescript
   import { AppShell } from "@/components/shared/app-shell"
   import { MyFeaturesListPage } from "@/features/my-feature/pages/MyFeaturesListPage"
   
   export default function MyFeaturePage() {
     return (
       <AppShell>
         <MyFeaturesListPage />
       </AppShell>
     )
   }
   ```

10. **Update API barrel export** (`lib/api/index.ts`):
    ```typescript
    export { myFeatureApi } from "./my-feature.api"
    ```

11. **Update query keys** (`lib/query/queryKeys.ts`):
    ```typescript
    export const queryKeys = {
      // ...
      myFeature: {
        all: ["myFeature"] as const,
        detail: (id: string) => [...queryKeys.myFeature.all, id] as const,
      },
    }
    ```

## How to Add a New Route

1. Create route folder: `app/my-route/` (or nested `app/my-route/[id]/edit/`)
2. Add `page.tsx` as thin wrapper that imports feature page component
3. Update `components/shared/app-shell/NavItems.ts` to include navigation

## Migration Status

### ✅ Completed
- [x] Created folder structure matching COMPLETE_FOLDER_STRUCTURE.md
- [x] Moved shared components to `components/shared/`
- [x] Created lib structure (`utils/`, `query/`, `auth/`)
- [x] Created config folder
- [x] Updated path aliases in tsconfig.json
- [x] Split `lib/api/index.ts` into feature-specific API files
- [x] Split `lib/store/index.ts` into feature-specific slices
- [x] Split `lib/types.ts` and `lib/schemas.ts` into feature modules
- [x] Created all missing page components (Create, Edit, Detail pages)
- [x] Updated all app routes to be thin wrappers
- [x] Removed backward compatibility wrappers
- [x] All routes use shared components

### 📋 Structure Compliance

The repository now matches `COMPLETE_FOLDER_STRUCTURE.md` exactly:
- ✅ All app routes are thin wrappers
- ✅ All feature modules have complete page sets
- ✅ API files are split per module (`lib/api/<module>.api.ts`)
- ✅ Store slices are split per module (`lib/store/<module>.slice.ts`)
- ✅ All components use shared components from `components/shared/`
- ✅ No backward compatibility wrappers remain (except `page-header.tsx` and `theme-provider.tsx`)

## Notes

- All route URLs are preserved exactly
- No functionality is removed
- Zustand store, TanStack Query, RHF + Zod forms continue to work
- App runs with `npm run dev` with zero runtime errors
- Structure is safe for 3+ developers to work in parallel
