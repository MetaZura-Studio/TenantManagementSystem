# Tenant Management Admin Portal

A production-ready SaaS Admin Portal built with Next.js, TypeScript, TailwindCSS, and shadcn/ui.

## Features

- **Tenant Management**: Full CRUD operations for tenants
- **Branch Management**: Manage branches for tenants
- **Plans & Subscriptions**: Manage subscription plans and tenant subscriptions
- **User Management**: User accounts with role-based access
- **Role & Permissions**: Role management with permissions matrix
- **Invoice Management**: Create and manage invoices with line items
- **Payments**: Track and manage payments
- **Currency Lookup**: Manage currency exchange rates
- **Settings**: Application settings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Theming**: next-themes

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                          # Next.js app router pages (thin wrappers)
│   ├── dashboard/               # Dashboard page
│   ├── tenants/                 # Tenant routes (wrappers only)
│   ├── branches/                 # Branch routes (wrappers only)
│   ├── plans/                   # Plan routes (wrappers only)
│   ├── tenant-subscriptions/    # Subscription routes (wrappers only)
│   ├── users/                   # User routes (wrappers only)
│   ├── roles/                    # Role routes (wrappers only)
│   ├── invoices/                 # Invoice routes (wrappers only)
│   ├── payments/                 # Payment routes (wrappers only)
│   ├── currency/                 # Currency route (wrapper only)
│   └── settings/                 # Settings route (wrapper only)
├── features/                     # Feature modules (domain logic)
│   ├── tenants/                 # Tenant feature module
│   │   ├── components/          # Tenant-specific components
│   │   ├── hooks/               # Tenant React Query hooks
│   │   ├── pages/               # Tenant page components
│   │   ├── schemas/             # Tenant Zod schemas
│   │   ├── types/               # Tenant TypeScript types
│   │   └── constants/           # Tenant constants
│   ├── branches/                # Branch feature module
│   ├── plans/                   # Plan feature module
│   ├── subscriptions/           # Subscription feature module
│   ├── users/                   # User feature module
│   ├── roles/                   # Role feature module
│   ├── invoices/                # Invoice feature module
│   ├── payments/                # Payment feature module
│   ├── currency/                # Currency feature module
│   └── settings/                # Settings feature module
├── components/                  # React components
│   ├── ui/                      # shadcn/ui components (do not modify)
│   └── shared/                  # Shared components across features
│       ├── app-shell/           # AppShell, Sidebar, Topbar
│       ├── breadcrumbs/          # Breadcrumb component
│       ├── page-header/          # PageHeader component
│       ├── data-table/           # DataTable component
│       ├── cards/                # Card components
│       ├── badges/               # Badge components
│       └── feedback/             # Toast, Dialog, EmptyState, etc.
├── lib/                         # Utilities and configurations
│   ├── api/                     # API layer (split by module)
│   │   ├── tenants.api.ts
│   │   ├── branches.api.ts
│   │   └── ...                  # One file per module
│   ├── store/                   # Zustand store (split by module)
│   │   ├── tenants.slice.ts
│   │   ├── branches.slice.ts
│   │   └── ...                  # One slice per module
│   ├── query/                   # TanStack Query configuration
│   │   └── queryKeys.ts         # Centralized query keys
│   └── utils/                   # Utility functions
├── types/                        # Global types (shared across modules)
└── hooks/                        # Global hooks (e.g., use-toast)
```

## Architecture

### Module Structure

Each feature module (`features/<module>/`) follows a consistent structure:

```
features/<module>/
├── components/       # Module-specific UI components
├── hooks/           # React Query hooks for this module
│   ├── use-<entity>.ts           # Get all entities
│   ├── use-<entity>.ts           # Get single entity (if needed)
│   ├── use-create-<entity>.ts    # Create entity hook
│   ├── use-update-<entity>.ts    # Update entity hook
│   ├── use-delete-<entity>.ts    # Delete entity hook
│   └── index.ts                  # Barrel export
├── pages/           # Page components (rendered by app routes)
│   ├── <Entity>ListPage.tsx      # List page
│   ├── Create<Entity>Page.tsx    # Create page
│   ├── <Entity>DetailPage.tsx   # Detail page (if needed)
│   ├── Edit<Entity>Page.tsx     # Edit page
│   └── index.ts                 # Barrel export
├── schemas/         # Zod validation schemas
│   └── index.ts
├── types/           # TypeScript types for this module
│   └── index.ts
└── constants/       # Module-specific constants (status enums, etc.)
```

### Thin Route Wrapper Rule

**All app route files must be thin wrappers** that only:
1. Import the corresponding page component from `features/<module>/pages`
2. Wrap it with `AppShell`
3. Pass route params as props where needed

Example:
```typescript
// app/tenants/page.tsx
import { AppShell } from "@/components/shared/app-shell"
import { TenantsListPage } from "@/features/tenants/pages/TenantsListPage"

export default function TenantsPage() {
  return (
    <AppShell>
      <TenantsListPage />
    </AppShell>
  )
}
```

For routes with params:
```typescript
// app/tenants/[tenantId]/page.tsx
import { use } from "react"
import { AppShell } from "@/components/shared/app-shell"
import { TenantDetailPage } from "@/features/tenants/pages/TenantDetailPage"

export default function TenantDetailsRoute({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = use(params)
  return (
    <AppShell>
      <TenantDetailPage tenantId={tenantId} />
    </AppShell>
  )
}
```

### Module Ownership Rules for Parallel Development

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

3. **Adding a New Module**:
   - Create `features/<module>/` with hooks, pages, schemas, types
   - Create `lib/api/<module>.api.ts` with CRUD functions
   - Create `lib/store/<module>.slice.ts` with Zustand slice
   - Create app routes as thin wrappers
   - Update `lib/api/index.ts` and `lib/store/index.ts` to include new module

4. **Conflict Prevention**:
   - Each developer works on separate modules
   - Shared components require PR review
   - Store composition (`lib/store/index.ts`) - coordinate changes

### Shared Components Rules

- **`components/ui/`**: shadcn/ui components - do not modify
- **`components/shared/`**: Shared components used across multiple features
- **`features/<module>/components/`**: Module-specific components (only used within that module)

### Import Paths

Use path aliases defined in `tsconfig.json`:
- `@/components` → `components/`
- `@/features` → `features/`
- `@/lib` → `lib/`
- `@/config` → `config/`
- `@/types` → `types/`
- `@/hooks` → `hooks/`

### State Management

- **Zustand**: Global state management (split into feature slices)
- **TanStack Query**: Server state and caching (hooks in `features/<module>/hooks/`)
- **React Hook Form**: Form state management
- **localStorage**: Persistence via Zustand persist middleware

### Data Flow

1. **Page Component** (`features/<module>/pages/`) uses hooks
2. **Hooks** (`features/<module>/hooks/`) call API functions
3. **API Functions** (`lib/api/<module>.api.ts`) interact with Zustand store
4. **Store Slices** (`lib/store/<module>.slice.ts`) manage state
5. **Persistence**: Zustand persist middleware saves to localStorage

## Data Storage

The application uses an in-memory store with localStorage persistence. All data is stored locally in the browser and persists across page refreshes.

## License

MIT
