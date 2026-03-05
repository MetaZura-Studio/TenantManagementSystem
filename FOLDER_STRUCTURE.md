# Folder Structure - Tenant Management System

**Last Updated:** Current production-ready structure

## Complete Directory Tree

```
Tenant Management/
│
├── app/                                    # Next.js App Router
│   ├── (app)/                              # Route group (does not affect URLs)
│   │   ├── layout.tsx                      # AppShell wrapper for all routes
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx                   # Dashboard route (thin wrapper)
│   │   │
│   │   ├── tenants/                       # Tenant Management routes
│   │   │   ├── page.tsx                   # List route
│   │   │   ├── new/
│   │   │   │   └── page.tsx               # Create route
│   │   │   └── [tenantId]/
│   │   │       ├── page.tsx               # Detail route
│   │   │       └── edit/
│   │   │           └── page.tsx           # Edit route
│   │   │
│   │   ├── branches/                      # Branch Management routes
│   │   │   ├── page.tsx                   # List route
│   │   │   ├── new/
│   │   │   │   └── page.tsx               # Create route
│   │   │   └── [branchId]/
│   │   │       └── edit/
│   │   │           └── page.tsx           # Edit route
│   │   │
│   │   ├── plans/                         # Plans Management routes
│   │   │   ├── page.tsx                   # List route
│   │   │   ├── new/
│   │   │   │   └── page.tsx               # Create route
│   │   │   └── [planId]/
│   │   │       └── edit/
│   │   │           └── page.tsx           # Edit route
│   │   │
│   │   ├── tenant-subscriptions/          # Subscription Management routes
│   │   │   ├── page.tsx                   # List route
│   │   │   ├── new/
│   │   │   │   └── page.tsx               # Create route
│   │   │   ├── upgrade/
│   │   │   │   └── page.tsx               # Upgrade wizard route
│   │   │   └── [subscriptionId]/
│   │   │       ├── page.tsx               # Detail route
│   │   │       └── edit/
│   │   │           └── page.tsx           # Edit route
│   │   │
│   │   ├── users/                         # User Management routes
│   │   │   ├── page.tsx                   # List route
│   │   │   ├── new/
│   │   │   │   └── page.tsx               # Create route
│   │   │   └── [userId]/
│   │   │       ├── page.tsx               # Detail route
│   │   │       └── edit/
│   │   │           └── page.tsx           # Edit route
│   │   │
│   │   ├── roles/                         # Role Management routes
│   │   │   ├── page.tsx                   # List route
│   │   │   ├── new/
│   │   │   │   └── page.tsx               # Create route
│   │   │   └── [roleId]/
│   │   │       ├── page.tsx               # Detail route
│   │   │       └── edit/
│   │   │           └── page.tsx           # Edit route
│   │   │
│   │   ├── invoices/                      # Invoice Management routes
│   │   │   ├── page.tsx                   # List route
│   │   │   ├── new/
│   │   │   │   └── page.tsx               # Create route
│   │   │   └── [invoiceId]/
│   │   │       ├── page.tsx               # Detail route
│   │   │       └── edit/
│   │   │           └── page.tsx           # Edit route
│   │   │
│   │   ├── payments/                      # Payment Management routes
│   │   │   ├── page.tsx                   # List route
│   │   │   └── [paymentId]/
│   │   │       └── page.tsx               # Detail route
│   │   │
│   │   ├── currency/                      # Currency Management routes
│   │   │   └── page.tsx                   # Currency lookup route
│   │   │
│   │   └── settings/                      # Settings routes
│   │       └── page.tsx                   # Settings route
│   │
│   ├── layout.tsx                         # Root layout (html/body + providers)
│   ├── page.tsx                           # Home page (redirects to dashboard)
│   ├── not-found.tsx                      # 404 page
│   ├── providers.tsx                      # App providers (seed data)
│   └── globals.css                        # Global styles and CSS variables
│
├── components/                            # React components
│   │
│   ├── shared/                            # Shared reusable components
│   │   ├── app-shell/                     # Application shell components
│   │   │   ├── AppShell.tsx               # Main app shell wrapper
│   │   │   ├── Sidebar.tsx                # Sidebar navigation
│   │   │   ├── Topbar.tsx                 # Top header bar
│   │   │   ├── NavItems.ts                # Navigation items configuration
│   │   │   └── index.ts                   # Barrel export
│   │   │
│   │   ├── badges/                        # Badge components
│   │   │   ├── StatusBadge.tsx            # Status badge component
│   │   │   └── index.ts                   # Barrel export
│   │   │
│   │   ├── breadcrumbs/                   # Breadcrumb components
│   │   │   ├── Breadcrumbs.tsx            # Breadcrumb navigation
│   │   │   └── index.ts                   # Barrel export
│   │   │
│   │   ├── cards/                         # Card components
│   │   │   ├── GlassCard.tsx              # Glassmorphism card component
│   │   │   ├── StatCard.tsx               # Statistics card component
│   │   │   └── index.ts                   # Barrel export
│   │   │
│   │   ├── data-table/                    # Data table components
│   │   │   ├── DataTable.tsx              # TanStack Table wrapper
│   │   │   └── index.ts                   # Barrel export
│   │   │
│   │   ├── feedback/                      # Feedback components
│   │   │   ├── ConfirmDialog.tsx          # Confirmation dialog
│   │   │   ├── EmptyState.tsx             # Empty state component
│   │   │   ├── ModernEmptyState.tsx       # Modern empty state
│   │   │   ├── Skeletons.tsx              # Loading skeleton components
│   │   │   ├── use-toast.ts               # Toast notification hook
│   │   │   └── index.ts                   # Barrel export
│   │   │
│   │   ├── forms/                         # Form components (future)
│   │   │
│   │   ├── page-header/                   # Page header components
│   │   │   ├── PageHeader.tsx             # Page header with breadcrumbs
│   │   │   └── index.ts                   # Barrel export
│   │   │
│   │   └── providers/                     # Provider components
│   │       └── QueryProvider.tsx          # TanStack Query provider
│   │
│   ├── ui/                                # shadcn/ui base components
│   │   ├── alert-dialog.tsx               # Alert dialog component
│   │   ├── badge.tsx                      # Badge component
│   │   ├── button.tsx                     # Button component
│   │   ├── calendar.tsx                   # Calendar component
│   │   ├── card.tsx                       # Card component
│   │   ├── checkbox.tsx                   # Checkbox component
│   │   ├── date-picker.tsx                # Date picker component
│   │   ├── dialog.tsx                     # Dialog component
│   │   ├── dropdown-menu.tsx              # Dropdown menu component
│   │   ├── form.tsx                       # Form component (React Hook Form)
│   │   ├── input.tsx                      # Input component
│   │   ├── label.tsx                      # Label component
│   │   ├── popover.tsx                    # Popover component
│   │   ├── select.tsx                     # Select component
│   │   ├── switch.tsx                     # Switch component
│   │   ├── table.tsx                      # Table component
│   │   ├── tabs.tsx                       # Tabs component
│   │   ├── textarea.tsx                   # Textarea component
│   │   ├── toast.tsx                      # Toast component
│   │   └── toaster.tsx                    # Toast provider
│   │
│   └── theme-provider.tsx                 # Theme provider component
│
├── features/                              # Feature modules (domain logic)
│   │
│   ├── tenants/                           # Tenants feature module
│   │   ├── components/                    # Tenant-specific components
│   │   ├── constants/                     # Tenant constants
│   │   ├── hooks/                         # Tenant React Query hooks
│   │   │   ├── use-tenants.ts            # Get tenants hook
│   │   │   ├── use-tenant.ts             # Get single tenant hook
│   │   │   ├── use-create-tenant.ts      # Create tenant hook
│   │   │   ├── use-update-tenant.ts      # Update tenant hook
│   │   │   ├── use-delete-tenant.ts      # Delete tenant hook
│   │   │   └── index.ts                   # Barrel export
│   │   ├── pages/                         # Tenant page components
│   │   │   ├── TenantsListPage.tsx       # Tenants list page
│   │   │   ├── CreateTenantPage.tsx       # Create tenant page
│   │   │   ├── TenantDetailPage.tsx      # Tenant details page
│   │   │   ├── EditTenantPage.tsx        # Edit tenant page
│   │   │   └── index.ts                   # Barrel export
│   │   ├── schemas/                       # Tenant Zod schemas
│   │   │   └── index.ts                   # Tenant validation schemas
│   │   └── types/                         # Tenant TypeScript types
│   │       └── index.ts                   # Tenant type definitions
│   │
│   ├── branches/                          # Branches feature module
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   │   ├── use-branches.ts           # Get branches hook
│   │   │   ├── use-branch.ts             # Get single branch hook
│   │   │   ├── use-create-branch.ts      # Create branch hook
│   │   │   ├── use-update-branch.ts      # Update branch hook
│   │   │   ├── use-delete-branch.ts      # Delete branch hook
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── BranchesListPage.tsx      # Branches list page
│   │   │   ├── CreateBranchPage.tsx      # Create branch page
│   │   │   ├── EditBranchPage.tsx        # Edit branch page
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── index.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── plans/                             # Plans feature module
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   │   ├── use-plans.ts              # Get plans hook
│   │   │   ├── use-plan.ts               # Get single plan hook
│   │   │   ├── use-create-plan.ts        # Create plan hook
│   │   │   ├── use-update-plan.ts        # Update plan hook
│   │   │   ├── use-delete-plan.ts        # Delete plan hook
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── PlansListPage.tsx         # Plans list page
│   │   │   ├── CreatePlanPage.tsx        # Create plan page
│   │   │   ├── EditPlanPage.tsx          # Edit plan page
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── index.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── tenant-subscriptions/              # Subscriptions feature module
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   │   ├── use-subscriptions.ts      # Get subscriptions hook
│   │   │   ├── use-subscription.ts      # Get single subscription hook
│   │   │   ├── use-create-subscription.ts # Create subscription hook
│   │   │   ├── use-update-subscription.ts # Update subscription hook
│   │   │   ├── use-delete-subscription.ts # Delete subscription hook
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── SubscriptionsListPage.tsx # Subscriptions list page
│   │   │   ├── CreateSubscriptionPage.tsx # Create subscription page
│   │   │   ├── SubscriptionDetailPage.tsx # Subscription details page
│   │   │   ├── EditSubscriptionPage.tsx  # Edit subscription page
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── index.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── users/                             # Users feature module
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   │   ├── use-users.ts              # Get users hook
│   │   │   ├── use-user.ts               # Get single user hook
│   │   │   ├── use-create-user.ts        # Create user hook
│   │   │   ├── use-update-user.ts        # Update user hook
│   │   │   ├── use-delete-user.ts        # Delete user hook
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── UsersListPage.tsx         # Users list page
│   │   │   ├── CreateUserPage.tsx        # Create user page
│   │   │   ├── UserDetailPage.tsx        # User details page
│   │   │   ├── EditUserPage.tsx          # Edit user page
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── index.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── roles/                             # Roles feature module
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   │   ├── use-roles.ts              # Get roles hook
│   │   │   ├── use-role.ts               # Get single role hook
│   │   │   ├── use-create-role.ts        # Create role hook
│   │   │   ├── use-update-role.ts        # Update role hook
│   │   │   ├── use-delete-role.ts        # Delete role hook
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── RolesListPage.tsx         # Roles list page
│   │   │   ├── CreateRolePage.tsx        # Create role page
│   │   │   ├── RoleDetailPage.tsx        # Role details page
│   │   │   ├── EditRolePage.tsx          # Edit role page
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── index.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── invoices/                          # Invoices feature module
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   │   ├── use-invoices.ts           # Get invoices hook
│   │   │   ├── use-invoice.ts            # Get single invoice hook
│   │   │   ├── use-create-invoice.ts     # Create invoice hook
│   │   │   ├── use-update-invoice.ts     # Update invoice hook
│   │   │   ├── use-delete-invoice.ts     # Delete invoice hook
│   │   │   ├── use-invoice-lines.ts      # Invoice line items hooks
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── InvoicesListPage.tsx      # Invoices list page
│   │   │   ├── CreateInvoicePage.tsx     # Create invoice page
│   │   │   ├── InvoiceDetailPage.tsx     # Invoice details page
│   │   │   ├── EditInvoicePage.tsx       # Edit invoice page
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── index.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── payments/                          # Payments feature module
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   │   ├── use-payments.ts           # Get payments hook
│   │   │   ├── use-payment.ts            # Get single payment hook
│   │   │   ├── use-create-payment.ts     # Create payment hook
│   │   │   ├── use-update-payment.ts     # Update payment hook
│   │   │   ├── use-delete-payment.ts     # Delete payment hook
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── PaymentsListPage.tsx      # Payments list page
│   │   │   ├── PaymentDetailPage.tsx      # Payment details page
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── index.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── currency/                          # Currency feature module
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   │   ├── use-currencies.ts         # Get currencies hook
│   │   │   ├── use-update-currency.ts    # Update currency hook
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── CurrencyListPage.tsx      # Currency list page
│   │   │   └── index.ts
│   │   ├── schemas/
│   │   │   └── index.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   └── settings/                          # Settings feature module
│       ├── components/
│       ├── constants/
│       ├── hooks/
│       │   ├── use-settings.ts            # Get settings hook
│       │   ├── use-update-setting.ts     # Update setting hook
│       │   └── index.ts
│       ├── pages/
│       │   ├── SettingsPage.tsx           # Settings page
│       │   └── index.ts
│       ├── schemas/
│       └── types/
│           └── index.ts
│
├── lib/                                   # Library and utilities
│   │
│   ├── api/                               # API layer (simulated backend)
│   │   ├── tenants.api.ts                # Tenant API functions
│   │   ├── branches.api.ts               # Branch API functions
│   │   ├── plans.api.ts                  # Plan API functions
│   │   ├── tenant-subscriptions.api.ts   # Subscription API functions
│   │   ├── users.api.ts                  # User API functions
│   │   ├── roles.api.ts                  # Role API functions
│   │   ├── invoices.api.ts               # Invoice API functions
│   │   ├── invoice-lines.api.ts          # Invoice line API functions
│   │   ├── payments.api.ts               # Payment API functions
│   │   ├── currencies.api.ts             # Currency API functions
│   │   ├── settings.api.ts               # Settings API functions
│   │   └── index.ts                      # Barrel export
│   │
│   ├── auth/                              # Authentication utilities
│   │   ├── session.ts                    # Session management
│   │   └── permissions.ts                # Permission checking
│   │
│   ├── query/                             # React Query configuration
│   │   ├── queryClient.ts                # Query client setup
│   │   └── queryKeys.ts                  # Query key factory
│   │
│   ├── store/                             # Zustand store slices
│   │   ├── tenants.slice.ts              # Tenant store slice
│   │   ├── branches.slice.ts             # Branch store slice
│   │   ├── plans.slice.ts                # Plan store slice
│   │   ├── tenant-subscriptions.slice.ts # Subscription store slice
│   │   ├── users.slice.ts                # User store slice
│   │   ├── roles.slice.ts                # Role store slice
│   │   ├── invoices.slice.ts             # Invoice store slice
│   │   ├── payments.slice.ts             # Payment store slice
│   │   ├── currencies.slice.ts           # Currency store slice
│   │   ├── settings.slice.ts             # Settings store slice
│   │   └── index.ts                      # Store composition
│   │
│   ├── utils/                             # Utility functions
│   │   ├── cn.ts                          # Class name utility (clsx + tailwind-merge)
│   │   ├── format.ts                      # Formatting utilities
│   │   └── index.ts                       # Barrel export
│   │
│   └── seed.ts                            # Seed data generator
│
├── config/                                # Configuration files
│   ├── app.ts                             # App configuration constants
│   └── env.ts                             # Environment configuration
│
├── types/                                 # Global TypeScript types
│   └── index.ts                           # Shared type definitions
│
├── .gitignore                             # Git ignore rules
├── .eslintrc.json                         # ESLint configuration
├── .prettierrc                            # Prettier configuration
├── next.config.js                         # Next.js configuration
├── next-env.d.ts                          # Next.js TypeScript definitions
├── package.json                           # NPM dependencies and scripts
├── package-lock.json                      # NPM lock file
├── postcss.config.js                      # PostCSS configuration
├── tailwind.config.js                     # Tailwind CSS configuration
├── tsconfig.json                          # TypeScript configuration
│
├── README.md                              # Project README
├── ARCHITECTURE.md                        # Architecture documentation
├── FUNCTIONS_DOCUMENTATION.md             # Functions documentation
├── MODULAR_DEVELOPMENT_GUIDE.md           # Modular development guide
└── FOLDER_STRUCTURE.md                    # This file (folder structure)
```

## File Count Summary

### App Routes (32 files)
- **Dashboard**: 1 route (`/dashboard`)
- **Tenants**: 4 routes (`/tenants`, `/tenants/new`, `/tenants/[id]`, `/tenants/[id]/edit`)
- **Branches**: 3 routes (`/branches`, `/branches/new`, `/branches/[id]/edit`)
- **Plans**: 3 routes (`/plans`, `/plans/new`, `/plans/[id]/edit`)
- **Tenant Subscriptions**: 5 routes (`/tenant-subscriptions`, `/tenant-subscriptions/new`, `/tenant-subscriptions/[id]`, `/tenant-subscriptions/[id]/edit`, `/tenant-subscriptions/upgrade`)
- **Users**: 4 routes (`/users`, `/users/new`, `/users/[id]`, `/users/[id]/edit`)
- **Roles**: 4 routes (`/roles`, `/roles/new`, `/roles/[id]`, `/roles/[id]/edit`)
- **Invoices**: 4 routes (`/invoices`, `/invoices/new`, `/invoices/[id]`, `/invoices/[id]/edit`)
- **Payments**: 2 routes (`/payments`, `/payments/[id]`)
- **Currency**: 1 route (`/currency`)
- **Settings**: 1 route (`/settings`)

### Feature Modules (10 modules)
Each module contains:
- **Hooks**: 2-6 React Query hooks per module
- **Pages**: 1-4 page components per module
- **Types**: TypeScript type definitions
- **Schemas**: Zod validation schemas
- **Components**: Feature-specific UI components (optional)
- **Constants**: Feature-specific constants (optional)

### Shared Components
- **App Shell**: 5 files (AppShell, Sidebar, Topbar, NavItems, index)
- **Badges**: 2 files (StatusBadge, index)
- **Breadcrumbs**: 2 files (Breadcrumbs, index)
- **Cards**: 3 files (GlassCard, StatCard, index)
- **Data Table**: 2 files (DataTable, index)
- **Feedback**: 6 files (ConfirmDialog, EmptyState, ModernEmptyState, Skeletons, use-toast, index)
- **Page Header**: 2 files (PageHeader, index)
- **Providers**: 1 file (QueryProvider)

### UI Components (20 shadcn/ui components)
- alert-dialog, badge, button, calendar, card, checkbox, date-picker, dialog, dropdown-menu, form, input, label, popover, select, switch, table, tabs, textarea, toast, toaster

### API Layer (12 files)
- One API file per module + invoice-lines.api.ts
- All exported via `lib/api/index.ts`

### Store Layer (11 files)
- One store slice per module
- Composed in `lib/store/index.ts`

## Key Architectural Principles

### 1. Route Groups
- All app routes are under `app/(app)/` route group
- Route group does NOT affect URL paths
- URLs remain: `/dashboard`, `/tenants`, `/tenant-subscriptions`, etc.

### 2. Thin Route Wrappers
- All route files are minimal wrappers
- They only import and render feature page components
- No business logic in route files
- AppShell is provided by `app/(app)/layout.tsx`

### 3. Feature Module Structure
- Each feature module is self-contained
- Route folder names MUST match feature module names exactly
- Example: `app/(app)/tenant-subscriptions/` → `features/tenant-subscriptions/`

### 4. Naming Consistency
- **Route**: `tenant-subscriptions` → **Feature**: `tenant-subscriptions`
- **API**: `tenant-subscriptions.api.ts` → **Store**: `tenant-subscriptions.slice.ts`
- **API Export**: `tenantSubscriptionsApi` → **Slice**: `TenantSubscriptionsSlice`

### 5. No Backward Compatibility
- No `lib/types.ts`, `lib/schemas.ts`, or `lib/utils.ts` files
- All imports use proper source paths:
  - Types: `@/features/<module>/types`
  - Schemas: `@/features/<module>/schemas`
  - Utils: `@/lib/utils` (resolves to `lib/utils/index.ts`)

### 6. Global Hooks Location
- Global UI hooks belong in `components/shared/feedback/`
- Example: `use-toast.ts` is in `components/shared/feedback/use-toast.ts`
- Import: `import { toast } from "@/components/shared/feedback/use-toast"`

## Import Examples

```typescript
// App route (thin wrapper)
import { TenantsListPage } from "@/features/tenants/pages/TenantsListPage"

// Feature page component
import { useTenants } from "../hooks"
import { PageHeader } from "@/components/shared/page-header"
import { DataTable } from "@/components/shared/data-table"
import { toast } from "@/components/shared/feedback/use-toast"

// Feature hook
import { tenantsApi } from "@/lib/api/tenants.api"
import { queryKeys } from "@/lib/query/queryKeys"

// Types and schemas
import type { Tenant } from "@/features/tenants/types"
import { tenantSchema } from "@/features/tenants/schemas"

// Utils
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/utils"
```

## Route URLs (All Preserved)

- `/dashboard`
- `/tenants`, `/tenants/new`, `/tenants/[tenantId]`, `/tenants/[tenantId]/edit`
- `/branches`, `/branches/new`, `/branches/[branchId]/edit`
- `/plans`, `/plans/new`, `/plans/[planId]/edit`
- `/tenant-subscriptions`, `/tenant-subscriptions/new`, `/tenant-subscriptions/[subscriptionId]`, `/tenant-subscriptions/[subscriptionId]/edit`, `/tenant-subscriptions/upgrade`
- `/users`, `/users/new`, `/users/[userId]`, `/users/[userId]/edit`
- `/roles`, `/roles/new`, `/roles/[roleId]`, `/roles/[roleId]/edit`
- `/invoices`, `/invoices/new`, `/invoices/[invoiceId]`, `/invoices/[invoiceId]/edit`
- `/payments`, `/payments/[paymentId]`
- `/currency`
- `/settings`

This structure is production-ready, fully typed, and optimized for parallel development by multiple developers.
