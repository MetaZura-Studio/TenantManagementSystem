# Modular Development Guide
## Tenant Management Admin Portal

**Version:** 1.0.0  
**Last Updated:** 2024  
**Purpose:** Enable parallel development by dividing the application into independent, well-defined modules

---

## Table of Contents

1. [Overview](#overview)
2. [Module Architecture](#module-architecture)
3. [Module Breakdown](#module-breakdown)
4. [Dependencies & Integration Points](#dependencies--integration-points)
5. [Development Workflow](#development-workflow)
6. [Task Assignment Guide](#task-assignment-guide)
7. [Module Interfaces](#module-interfaces)
8. [Testing Strategy](#testing-strategy)
9. [Integration Checklist](#integration-checklist)

---

## Overview

This document breaks down the Tenant Management Admin Portal into **10 independent modules** that can be developed in parallel. Each module is self-contained with clear boundaries, interfaces, and dependencies.

### Key Principles

1. **Module Independence**: Each module can be developed independently with minimal coordination
2. **Clear Interfaces**: Well-defined APIs and contracts between modules
3. **Shared Foundation**: Common infrastructure (UI components, utilities) shared across modules
4. **Parallel Development**: Multiple developers can work simultaneously on different modules
5. **Incremental Integration**: Modules can be integrated one at a time

### Development Team Structure

- **Foundation Team** (1-2 developers): Shared components, utilities, infrastructure
- **Module Teams** (1 developer per module): Feature-specific development
- **Integration Team** (1 developer): Module integration and testing

---

## Module Architecture

### Module Structure

Each module follows this structure:

```
features/<module-name>/
├── components/          # Module-specific UI components
├── hooks/              # React Query hooks and custom hooks
├── schemas/            # Zod validation schemas
├── types/              # TypeScript types/interfaces
└── constants/          # Module-specific constants

lib/api/
└── <module>.api.ts     # API functions for the module

lib/store/
└── <module>.slice.ts   # Zustand store slice

app/
└── <module>/           # Next.js routes for the module
    ├── page.tsx        # List page
    ├── new/
    │   └── page.tsx    # Create page
    ├── [id]/
    │   ├── page.tsx    # Detail page
    │   └── edit/
    │       └── page.tsx # Edit page
```

### Shared Infrastructure

All modules depend on these shared resources (DO NOT MODIFY):

- `components/shared/` - Reusable UI components
- `components/ui/` - shadcn/ui components
- `lib/utils/` - Utility functions
- `lib/query/` - Query client
- `lib/auth/` - Authentication utilities
- `config/` - App configuration

---

## Module Breakdown

### Module 1: Foundation & Infrastructure ⚠️ **CRITICAL - DEVELOP FIRST**

**Priority:** 🔴 Critical  
**Complexity:** Medium  
**Estimated Time:** 3-5 days  
**Dependencies:** None  
**Blocks:** All other modules

#### Components
- ✅ App Shell (Sidebar, Topbar, Layout)
- ✅ Shared UI Components (DataTable, Forms, Dialogs)
- ✅ Utility Functions
- ✅ Theme System
- ✅ Query Client Setup

#### Files
- `components/shared/app-shell/`
- `components/shared/data-table/`
- `components/shared/feedback/`
- `components/shared/badges/`
- `components/shared/cards/`
- `lib/utils/`
- `lib/query/`
- `lib/auth/`
- `app/layout.tsx`
- `app/providers.tsx`

#### Deliverables
- [ ] App shell with navigation
- [ ] DataTable component with sorting/filtering/pagination
- [ ] Form components integrated with React Hook Form
- [ ] Toast notification system
- [ ] Theme provider (dark/light mode)
- [ ] Query client configured
- [ ] All shared utilities exported

#### Developer Assignment
- **Recommended:** Senior developer or team lead
- **Skills:** React, TypeScript, Next.js, UI/UX

---

### Module 2: Dashboard

**Priority:** 🟡 High  
**Complexity:** Low  
**Estimated Time:** 2-3 days  
**Dependencies:** Module 1 (Foundation), Module 3 (Tenants), Module 4 (Subscriptions), Module 7 (Invoices), Module 8 (Payments)  
**Can Start:** After Module 1 is complete

#### Features
- Statistics cards (total tenants, subscriptions, revenue, etc.)
- Recent activity feed
- Quick actions
- Charts/graphs (optional)

#### Files
- `app/dashboard/page.tsx`
- `components/shared/cards/StatCard.tsx` (if not in Foundation)

#### API Dependencies
- `tenantsApi.getAll()` - Count tenants
- `subscriptionsApi.getAll()` - Count subscriptions
- `invoicesApi.getAll()` - Calculate revenue
- `paymentsApi.getAll()` - Payment statistics

#### Deliverables
- [ ] Dashboard page with stat cards
- [ ] Real-time data from store
- [ ] Responsive layout
- [ ] Loading states

#### Developer Assignment
- **Recommended:** Junior to Mid-level developer
- **Skills:** React, TypeScript, Data visualization (optional)

---

### Module 3: Tenants Management

**Priority:** 🟡 High  
**Complexity:** Medium  
**Estimated Time:** 4-5 days  
**Dependencies:** Module 1 (Foundation)  
**Can Start:** After Module 1 is complete

#### Features
- List tenants with filters (status, subscription status)
- Create new tenant
- Edit tenant
- View tenant details
- Delete tenant (with confirmation)
- Search functionality

#### Files
```
features/tenants/
├── components/
│   ├── TenantList.tsx
│   ├── TenantForm.tsx
│   ├── TenantFilters.tsx
│   └── TenantDetails.tsx
├── hooks/
│   └── use-tenants.ts
├── schemas/
│   └── tenant.schema.ts
├── types/
│   └── tenant.types.ts
└── constants/
    └── tenant.constants.ts

lib/api/
└── tenants.api.ts

lib/store/
└── tenants.slice.ts

app/tenants/
├── page.tsx
├── new/page.tsx
├── [tenantId]/page.tsx
└── [tenantId]/edit/page.tsx
```

#### API Functions Required
```typescript
tenantsApi.getAll()
tenantsApi.getById(id)
tenantsApi.create(data)
tenantsApi.update(id, data)
tenantsApi.delete(id)
```

#### Store Actions Required
```typescript
setTenants(tenants)
addTenant(tenant)
updateTenant(id, updates)
deleteTenant(id)
```

#### Deliverables
- [ ] Complete CRUD operations
- [ ] List page with filters and search
- [ ] Create form with validation
- [ ] Edit form with pre-filled data
- [ ] Detail page with all tenant information
- [ ] Delete confirmation dialog
- [ ] Toast notifications for all actions
- [ ] Loading and error states

#### Developer Assignment
- **Recommended:** Mid-level developer
- **Skills:** React, TypeScript, Form handling, CRUD operations

---

### Module 4: Branches Management

**Priority:** 🟢 Medium  
**Complexity:** Low-Medium  
**Estimated Time:** 3-4 days  
**Dependencies:** Module 1 (Foundation), Module 3 (Tenants)  
**Can Start:** After Module 3 is complete (needs tenant dropdown)

#### Features
- List branches with tenant filter
- Create new branch (requires tenant selection)
- Edit branch
- Delete branch
- View branch details

#### Files
```
features/branches/
├── components/
│   ├── BranchList.tsx
│   ├── BranchForm.tsx
│   ├── BranchFilters.tsx
│   └── BranchDetails.tsx
├── hooks/
│   └── use-branches.ts
├── schemas/
│   └── branch.schema.ts
├── types/
│   └── branch.types.ts
└── constants/
    └── branch.constants.ts

lib/api/
└── branches.api.ts

lib/store/
└── branches.slice.ts

app/branches/
├── page.tsx
├── new/page.tsx
└── [branchId]/edit/page.tsx
```

#### API Functions Required
```typescript
branchesApi.getAll()
branchesApi.getById(id)
branchesApi.create(data)
branchesApi.update(id, data)
branchesApi.delete(id)
```

#### Dependencies
- **Tenants API**: `tenantsApi.getAll()` - For tenant dropdown in forms

#### Deliverables
- [ ] Complete CRUD operations
- [ ] Tenant filter in list page
- [ ] Tenant dropdown in create/edit forms
- [ ] Form validation
- [ ] Delete confirmation
- [ ] Toast notifications

#### Developer Assignment
- **Recommended:** Junior to Mid-level developer
- **Skills:** React, TypeScript, Form handling

---

### Module 5: Plans Management

**Priority:** 🟡 High  
**Complexity:** Medium  
**Estimated Time:** 3-4 days  
**Dependencies:** Module 1 (Foundation)  
**Can Start:** After Module 1 is complete

#### Features
- List subscription plans
- Create new plan
- Edit plan
- Delete plan
- Plan status toggle (Active/Inactive)
- Billing cycle selection (Monthly/Yearly)

#### Files
```
features/plans/
├── components/
│   ├── PlanList.tsx
│   ├── PlanForm.tsx
│   ├── PlanFilters.tsx
│   └── PlanDetails.tsx
├── hooks/
│   └── use-plans.ts
├── schemas/
│   └── plan.schema.ts
├── types/
│   └── plan.types.ts
└── constants/
    └── plan.constants.ts

lib/api/
└── plans.api.ts

lib/store/
└── plans.slice.ts

app/plans/
├── page.tsx
├── new/page.tsx
└── [planId]/edit/page.tsx
```

#### API Functions Required
```typescript
plansApi.getAll()
plansApi.getById(id)
plansApi.create(data)
plansApi.update(id, data)
plansApi.delete(id)
```

#### Deliverables
- [ ] Complete CRUD operations
- [ ] Billing cycle selector
- [ ] Currency selection
- [ ] Price and setup fee inputs
- [ ] Trial days and grace period configuration
- [ ] Status toggle
- [ ] Form validation

#### Developer Assignment
- **Recommended:** Mid-level developer
- **Skills:** React, TypeScript, Form handling, Business logic

---

### Module 6: Tenant Subscriptions

**Priority:** 🟡 High  
**Complexity:** High  
**Estimated Time:** 5-6 days  
**Dependencies:** Module 1 (Foundation), Module 3 (Tenants), Module 5 (Plans)  
**Can Start:** After Modules 3 and 5 are complete

#### Features
- List subscriptions with filters
- Create new subscription
- Edit subscription
- View subscription details
- Update subscription status
- **Upgrade Plan Wizard** (3-step flow)
- Subscription cancellation
- Auto-renewal toggle

#### Files
```
features/subscriptions/
├── components/
│   ├── SubscriptionList.tsx
│   ├── SubscriptionForm.tsx
│   ├── SubscriptionFilters.tsx
│   ├── SubscriptionDetails.tsx
│   ├── StatusUpdateModal.tsx
│   └── UpgradeWizard/
│       ├── Step1SelectPlan.tsx
│       ├── Step2Review.tsx
│       └── Step3Confirm.tsx
├── hooks/
│   └── use-subscriptions.ts
├── schemas/
│   └── subscription.schema.ts
├── types/
│   └── subscription.types.ts
└── constants/
    └── subscription.constants.ts

lib/api/
└── subscriptions.api.ts

lib/store/
└── subscriptions.slice.ts

app/tenant-subscriptions/
├── page.tsx
├── new/page.tsx
├── [subscriptionId]/page.tsx
├── [subscriptionId]/edit/page.tsx
└── upgrade/page.tsx
```

#### API Functions Required
```typescript
subscriptionsApi.getAll()
subscriptionsApi.getById(id)
subscriptionsApi.create(data)
subscriptionsApi.update(id, data)
subscriptionsApi.delete(id)
```

#### Dependencies
- **Tenants API**: `tenantsApi.getAll()` - For tenant selection
- **Plans API**: `plansApi.getAll()` - For plan selection and upgrade wizard

#### Special Features
- **Upgrade Wizard**: 3-step process
  1. Select new plan
  2. Review changes and pricing
  3. Confirm upgrade
- **Status Update Modal**: Quick status change without full edit

#### Deliverables
- [ ] Complete CRUD operations
- [ ] Tenant and plan filters
- [ ] Status update modal
- [ ] Upgrade wizard (3 steps)
- [ ] Subscription period management
- [ ] Trial period handling
- [ ] Auto-renewal toggle
- [ ] Cancellation flow

#### Developer Assignment
- **Recommended:** Senior developer
- **Skills:** React, TypeScript, Complex forms, Multi-step wizards, Business logic

---

### Module 7: Users Management

**Priority:** 🟢 Medium  
**Complexity:** Medium  
**Estimated Time:** 4-5 days  
**Dependencies:** Module 1 (Foundation), Module 3 (Tenants), Module 4 (Branches), Module 9 (Roles)  
**Can Start:** After Modules 3, 4, and 9 are complete

#### Features
- List users with filters
- Create new user
- Edit user
- View user details
- Delete user
- Tenant and branch assignment
- Role assignment

#### Files
```
features/users/
├── components/
│   ├── UserList.tsx
│   ├── UserForm.tsx
│   ├── UserFilters.tsx
│   └── UserDetails.tsx
├── hooks/
│   └── use-users.ts
├── schemas/
│   └── user.schema.ts
├── types/
│   └── user.types.ts
└── constants/
    └── user.constants.ts

lib/api/
└── users.api.ts

lib/store/
└── users.slice.ts

app/users/
├── page.tsx
├── new/page.tsx
├── [userId]/page.tsx
└── [userId]/edit/page.tsx
```

#### API Functions Required
```typescript
usersApi.getAll()
usersApi.getById(id)
usersApi.create(data)
usersApi.update(id, data)
usersApi.delete(id)
```

#### Dependencies
- **Tenants API**: `tenantsApi.getAll()` - For tenant dropdown
- **Branches API**: `branchesApi.getAll()` - For branch dropdown
- **Roles API**: `rolesApi.getAll()` - For role dropdown

#### Deliverables
- [ ] Complete CRUD operations
- [ ] Tenant, branch, and role filters
- [ ] Password field (create only, optional on edit)
- [ ] User status toggle
- [ ] Form validation
- [ ] Delete confirmation

#### Developer Assignment
- **Recommended:** Mid-level developer
- **Skills:** React, TypeScript, Form handling, User management

---

### Module 8: Roles & Permissions

**Priority:** 🟡 High  
**Complexity:** High  
**Estimated Time:** 5-6 days  
**Dependencies:** Module 1 (Foundation)  
**Can Start:** After Module 1 is complete

#### Features
- List roles
- Create new role
- Edit role
- View role details
- Delete role
- **Permissions Matrix** (interactive grid)
- Module-based permissions (view, create, edit, delete)

#### Files
```
features/roles/
├── components/
│   ├── RoleList.tsx
│   ├── RoleForm.tsx
│   ├── RoleFilters.tsx
│   ├── RoleDetails.tsx
│   └── PermissionsMatrix.tsx
├── hooks/
│   └── use-roles.ts
├── schemas/
│   └── role.schema.ts
├── types/
│   └── role.types.ts
└── constants/
    ├── role.constants.ts
    └── permissions.constants.ts

lib/api/
└── roles.api.ts

lib/store/
└── roles.slice.ts

app/roles/
├── page.tsx
├── new/page.tsx
├── [roleId]/page.tsx
└── [roleId]/edit/page.tsx
```

#### API Functions Required
```typescript
rolesApi.getAll()
rolesApi.getById(id)
rolesApi.create(data)
rolesApi.update(id, data)
rolesApi.delete(id)
```

#### Special Features
- **Permissions Matrix**: 
  - Rows: Modules (Dashboard, Tenants, Plans, etc.)
  - Columns: Actions (View, Create, Edit, Delete)
  - Checkboxes for each permission
  - "Select All" functionality per module/action

#### Deliverables
- [ ] Complete CRUD operations
- [ ] Permissions matrix component
- [ ] Interactive checkbox grid
- [ ] Select all per module
- [ ] Select all per action
- [ ] Form validation
- [ ] Permission preview

#### Developer Assignment
- **Recommended:** Senior developer
- **Skills:** React, TypeScript, Complex UI interactions, Permission systems

---

### Module 9: Invoices Management

**Priority:** 🟡 High  
**Complexity:** High  
**Estimated Time:** 6-7 days  
**Dependencies:** Module 1 (Foundation), Module 3 (Tenants), Module 6 (Subscriptions)  
**Can Start:** After Modules 3 and 6 are complete

#### Features
- List invoices with filters
- Create new invoice
- Edit invoice
- View invoice details
- Delete invoice
- **Invoice Line Items CRUD** (inline editing)
- Live calculations (subtotal, tax, total)
- Invoice status management

#### Files
```
features/invoices/
├── components/
│   ├── InvoiceList.tsx
│   ├── InvoiceForm.tsx
│   ├── InvoiceFilters.tsx
│   ├── InvoiceDetails.tsx
│   └── InvoiceLineItems.tsx
├── hooks/
│   └── use-invoices.ts
├── schemas/
│   ├── invoice.schema.ts
│   └── invoice-line.schema.ts
├── types/
│   ├── invoice.types.ts
│   └── invoice-line.types.ts
└── constants/
    └── invoice.constants.ts

lib/api/
├── invoices.api.ts
└── invoice-lines.api.ts

lib/store/
├── invoices.slice.ts
└── invoice-lines.slice.ts

app/invoices/
├── page.tsx
├── new/page.tsx
├── [invoiceId]/page.tsx
└── [invoiceId]/edit/page.tsx
```

#### API Functions Required
```typescript
invoicesApi.getAll()
invoicesApi.getById(id)
invoicesApi.create(data)
invoicesApi.update(id, data)
invoicesApi.delete(id)

invoiceLinesApi.getByInvoiceId(invoiceId)
invoiceLinesApi.create(data)
invoiceLinesApi.update(id, data)
invoiceLinesApi.delete(id)
```

#### Dependencies
- **Tenants API**: `tenantsApi.getAll()` - For tenant selection
- **Subscriptions API**: `subscriptionsApi.getAll()` - For subscription selection

#### Special Features
- **Line Items Management**:
  - Add/Edit/Delete line items inline
  - Line types: Subscription, Tax, Discount, Other
  - Quantity and unit price inputs
  - Automatic calculation (quantity × unit price)
  - Sort order management
- **Live Calculations**:
  - Subtotal (sum of all line items)
  - Tax calculation
  - Discount application
  - Total calculation

#### Deliverables
- [ ] Complete CRUD operations
- [ ] Invoice line items CRUD
- [ ] Inline line item editing
- [ ] Live calculations
- [ ] Invoice period management
- [ ] Due date tracking
- [ ] Status management
- [ ] PDF export (optional)

#### Developer Assignment
- **Recommended:** Senior developer
- **Skills:** React, TypeScript, Complex forms, Calculations, Financial logic

---

### Module 10: Payments Management

**Priority:** 🟢 Medium  
**Complexity:** Medium  
**Estimated Time:** 4-5 days  
**Dependencies:** Module 1 (Foundation), Module 3 (Tenants), Module 7 (Invoices), Module 6 (Subscriptions)  
**Can Start:** After Modules 3, 6, and 7 are complete

#### Features
- List payments with filters
- Create new payment
- View payment details
- Update payment status
- Payment method selection
- Provider transaction tracking
- Payment failure handling

#### Files
```
features/payments/
├── components/
│   ├── PaymentList.tsx
│   ├── PaymentForm.tsx
│   ├── PaymentFilters.tsx
│   ├── PaymentDetails.tsx
│   └── PaymentStatusUpdate.tsx
├── hooks/
│   └── use-payments.ts
├── schemas/
│   └── payment.schema.ts
├── types/
│   └── payment.types.ts
└── constants/
    └── payment.constants.ts

lib/api/
└── payments.api.ts

lib/store/
└── payments.slice.ts

app/payments/
├── page.tsx
├── [paymentId]/page.tsx
└── new/page.tsx (optional)
```

#### API Functions Required
```typescript
paymentsApi.getAll()
paymentsApi.getById(id)
paymentsApi.create(data)
paymentsApi.update(id, data)
paymentsApi.delete(id)
```

#### Dependencies
- **Tenants API**: `tenantsApi.getAll()` - For tenant selection
- **Invoices API**: `invoicesApi.getAll()` - For invoice selection
- **Subscriptions API**: `subscriptionsApi.getAll()` - For subscription selection

#### Special Features
- **Status Update**: Quick status change modal
- **Payment Methods**: Credit Card, Bank Transfer, Cash, Other
- **Provider Integration**: Track external payment provider transactions
- **Failure Handling**: Failure reason tracking

#### Deliverables
- [ ] Complete CRUD operations
- [ ] Payment status update modal
- [ ] Payment method selection
- [ ] Provider transaction ID tracking
- [ ] Failure reason handling
- [ ] Payment date tracking
- [ ] Currency support

#### Developer Assignment
- **Recommended:** Mid-level developer
- **Skills:** React, TypeScript, Form handling, Payment processing logic

---

### Module 11: Currency Lookup

**Priority:** 🟢 Low  
**Complexity:** Low  
**Estimated Time:** 2-3 days  
**Dependencies:** Module 1 (Foundation)  
**Can Start:** After Module 1 is complete

#### Features
- List currency exchange rates
- Edit exchange rate (modal)
- Currency code and name display
- Last updated timestamp

#### Files
```
features/currency/
├── components/
│   ├── CurrencyList.tsx
│   └── CurrencyRateEditModal.tsx
├── hooks/
│   └── use-currencies.ts
├── schemas/
│   └── currency.schema.ts
├── types/
│   └── currency.types.ts
└── constants/
    └── currency.constants.ts

lib/api/
└── currencies.api.ts

lib/store/
└── currencies.slice.ts

app/currency/
└── page.tsx
```

#### API Functions Required
```typescript
currenciesApi.getAll()
currenciesApi.update(id, data)
```

#### Deliverables
- [ ] Currency list table
- [ ] Edit rate modal
- [ ] Exchange rate input
- [ ] Last updated display
- [ ] Form validation

#### Developer Assignment
- **Recommended:** Junior developer
- **Skills:** React, TypeScript, Simple forms

---

### Module 12: Settings

**Priority:** 🟢 Low  
**Complexity:** Low  
**Estimated Time:** 2-3 days  
**Dependencies:** Module 1 (Foundation)  
**Can Start:** After Module 1 is complete

#### Features
- Tabbed settings interface
- Category-based settings organization
- Save settings to store
- Settings persistence

#### Files
```
features/settings/
├── components/
│   ├── SettingsPage.tsx
│   └── SettingsTabs.tsx
├── hooks/
│   └── use-settings.ts
├── schemas/
│   └── settings.schema.ts
├── types/
│   └── settings.types.ts
└── constants/
    └── settings.constants.ts

lib/store/
└── settings.slice.ts

app/settings/
└── page.tsx
```

#### Store Actions Required
```typescript
setSettings(settings)
updateSetting(key, value, category)
```

#### Deliverables
- [ ] Tabbed settings interface
- [ ] Category organization
- [ ] Settings form
- [ ] Save functionality
- [ ] Settings persistence

#### Developer Assignment
- **Recommended:** Junior developer
- **Skills:** React, TypeScript, Form handling

---

## Dependencies & Integration Points

### Dependency Graph

```
Foundation (Module 1)
    ├── Dashboard (Module 2) ──→ Tenants, Subscriptions, Invoices, Payments
    ├── Tenants (Module 3)
    │   └── Branches (Module 4)
    │   └── Subscriptions (Module 6)
    │   └── Users (Module 7)
    │   └── Invoices (Module 9)
    │   └── Payments (Module 10)
    ├── Plans (Module 5)
    │   └── Subscriptions (Module 6)
    ├── Roles (Module 8)
    │   └── Users (Module 7)
    ├── Subscriptions (Module 6)
    │   └── Invoices (Module 9)
    │   └── Payments (Module 10)
    ├── Currency (Module 11)
    └── Settings (Module 12)
```

### Critical Path

1. **Foundation** (Module 1) - Must be completed first
2. **Tenants** (Module 3) - Blocks many other modules
3. **Plans** (Module 5) - Blocks Subscriptions
4. **Roles** (Module 8) - Blocks Users
5. **Subscriptions** (Module 6) - Blocks Invoices and Payments
6. **Branches** (Module 4) - Blocks Users
7. **Invoices** (Module 9) - Blocks Payments
8. **Users** (Module 7) - Can start after Tenants, Branches, Roles
9. **Payments** (Module 10) - Can start after Invoices
10. **Dashboard** (Module 2) - Can start after data modules
11. **Currency** (Module 11) - Independent
12. **Settings** (Module 12) - Independent

### Parallel Development Opportunities

**Phase 1 (After Foundation):**
- Tenants (Module 3) ✅
- Plans (Module 5) ✅
- Roles (Module 8) ✅
- Currency (Module 11) ✅
- Settings (Module 12) ✅

**Phase 2 (After Phase 1):**
- Branches (Module 4) - Needs Tenants ✅
- Subscriptions (Module 6) - Needs Tenants + Plans ✅

**Phase 3 (After Phase 2):**
- Users (Module 7) - Needs Tenants + Branches + Roles ✅
- Invoices (Module 9) - Needs Tenants + Subscriptions ✅

**Phase 4 (After Phase 3):**
- Payments (Module 10) - Needs Tenants + Invoices + Subscriptions ✅
- Dashboard (Module 2) - Needs data from multiple modules ✅

---

## Development Workflow

### 1. Setup Phase

**Foundation Team:**
```bash
# Clone repository
git clone <repo-url>
cd tenant-management-admin

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Module Teams:**
```bash
# Create feature branch
git checkout -b feature/module-name

# Create module folder structure
mkdir -p features/module-name/{components,hooks,schemas,types,constants}
```

### 2. Development Phase

**For each module:**

1. **Define Types** (`features/<module>/types/index.ts`)
   ```typescript
   export interface ModuleEntity {
     id: string
     // ... fields
   }
   ```

2. **Create Schema** (`features/<module>/schemas/index.ts`)
   ```typescript
   import { z } from "zod"
   export const moduleSchema = z.object({...})
   ```

3. **Implement API** (`lib/api/<module>.api.ts`)
   ```typescript
   export const moduleApi = {
     getAll: async () => {...},
     getById: async (id) => {...},
     create: async (data) => {...},
     update: async (id, data) => {...},
     delete: async (id) => {...},
   }
   ```

4. **Create Store Slice** (`lib/store/<module>.slice.ts`)
   ```typescript
   export const useModuleStore = create(...)
   ```

5. **Build Components** (`features/<module>/components/`)
   - List component
   - Form component
   - Detail component
   - Filters component

6. **Create Hooks** (`features/<module>/hooks/use-<module>.ts`)
   ```typescript
   export function useModules() {
     return useQuery({
       queryKey: ["modules"],
       queryFn: moduleApi.getAll,
     })
   }
   ```

7. **Create Pages** (`app/<module>/`)
   - List page
   - Create page
   - Edit page
   - Detail page

### 3. Testing Phase

**For each module:**

1. **Unit Tests** (optional)
   - Test API functions
   - Test store actions
   - Test utility functions

2. **Component Tests** (optional)
   - Test form validation
   - Test user interactions
   - Test error states

3. **Integration Tests**
   - Test full CRUD flow
   - Test module integration with dependencies
   - Test error handling

### 4. Integration Phase

**Integration Team:**

1. **Merge Module Branch**
   ```bash
   git checkout main
   git merge feature/module-name
   ```

2. **Update Navigation** (`components/shared/app-shell/NavItems.ts`)
   - Add module to navigation items

3. **Test Integration**
   - Verify module appears in sidebar
   - Test navigation between modules
   - Test shared components work with module

4. **Update Documentation**
   - Update module status in this document
   - Document any API changes

---

## Task Assignment Guide

### Recommended Team Structure

**Team Size:** 4-6 developers

**Option 1: Small Team (4 developers)**
- Developer 1: Foundation + Dashboard + Currency + Settings
- Developer 2: Tenants + Branches + Users
- Developer 3: Plans + Subscriptions + Payments
- Developer 4: Roles + Invoices

**Option 2: Medium Team (6 developers)**
- Developer 1: Foundation (Lead)
- Developer 2: Tenants + Branches
- Developer 3: Plans + Subscriptions
- Developer 4: Users + Roles
- Developer 5: Invoices + Payments
- Developer 6: Dashboard + Currency + Settings

**Option 3: Large Team (8+ developers)**
- Assign one developer per module
- Foundation developer coordinates integration

### Skill-Based Assignment

| Module | Recommended Skill Level | Key Skills |
|--------|----------------------|------------|
| Foundation | Senior | React, TypeScript, Next.js, UI/UX |
| Dashboard | Junior-Mid | React, Data visualization |
| Tenants | Mid | React, TypeScript, CRUD |
| Branches | Junior-Mid | React, Forms |
| Plans | Mid | React, Business logic |
| Subscriptions | Senior | React, Complex forms, Wizards |
| Users | Mid | React, User management |
| Roles | Senior | React, Permission systems |
| Invoices | Senior | React, Financial logic, Calculations |
| Payments | Mid | React, Payment processing |
| Currency | Junior | React, Simple forms |
| Settings | Junior | React, Forms |

### Task Breakdown Template

For each module, create a task list:

```markdown
## Module X: [Module Name]

### Backend/Data Layer (1-2 days)
- [ ] Create types (`features/<module>/types/`)
- [ ] Create schemas (`features/<module>/schemas/`)
- [ ] Implement API (`lib/api/<module>.api.ts`)
- [ ] Create store slice (`lib/store/<module>.slice.ts`)
- [ ] Create hooks (`features/<module>/hooks/`)

### UI Components (2-3 days)
- [ ] List component with filters
- [ ] Form component (create/edit)
- [ ] Detail component
- [ ] Filter component
- [ ] Any special components (modals, wizards, etc.)

### Pages (1-2 days)
- [ ] List page
- [ ] Create page
- [ ] Edit page
- [ ] Detail page

### Integration (1 day)
- [ ] Add to navigation
- [ ] Test integration with dependencies
- [ ] Fix any integration issues
- [ ] Update documentation

**Total Estimated Time:** X days
```

---

## Module Interfaces

### API Interface Contract

All modules must implement this interface:

```typescript
interface ModuleApi {
  getAll: () => Promise<Entity[]>
  getById: (id: string) => Promise<Entity | undefined>
  create: (data: CreateEntityInput) => Promise<Entity>
  update: (id: string, data: Partial<Entity>) => Promise<Entity>
  delete: (id: string) => Promise<void>
}
```

### Store Interface Contract

All store slices must implement:

```typescript
interface ModuleStore {
  entities: Entity[]
  setEntities: (entities: Entity[]) => void
  addEntity: (entity: Entity) => void
  updateEntity: (id: string, updates: Partial<Entity>) => void
  deleteEntity: (id: string) => void
}
```

### Component Interface Contract

All list components must:
- Accept `data: Entity[]` prop
- Handle loading state
- Handle error state
- Support filtering and search
- Support sorting and pagination (via DataTable)

All form components must:
- Use React Hook Form
- Use Zod schema for validation
- Show validation errors
- Handle submit and cancel
- Show loading state during submission

### Hook Interface Contract

All query hooks must:
- Return TanStack Query result object
- Use consistent query keys
- Handle errors gracefully
- Support refetching

---

## Testing Strategy

### Unit Testing

**API Functions:**
```typescript
describe("tenantsApi", () => {
  it("should get all tenants", async () => {
    const tenants = await tenantsApi.getAll()
    expect(tenants).toBeDefined()
  })
})
```

**Store Actions:**
```typescript
describe("tenantStore", () => {
  it("should add tenant", () => {
    const store = useStore.getState()
    store.addTenant(mockTenant)
    expect(store.tenants).toContain(mockTenant)
  })
})
```

### Integration Testing

**Full CRUD Flow:**
```typescript
describe("Tenant CRUD", () => {
  it("should create, read, update, delete tenant", async () => {
    // Create
    const created = await tenantsApi.create(mockData)
    expect(created.id).toBeDefined()
    
    // Read
    const retrieved = await tenantsApi.getById(created.id)
    expect(retrieved).toEqual(created)
    
    // Update
    const updated = await tenantsApi.update(created.id, { status: "Inactive" })
    expect(updated.status).toBe("Inactive")
    
    // Delete
    await tenantsApi.delete(created.id)
    const deleted = await tenantsApi.getById(created.id)
    expect(deleted).toBeUndefined()
  })
})
```

### Component Testing

**Form Validation:**
```typescript
describe("TenantForm", () => {
  it("should validate required fields", async () => {
    render(<TenantForm />)
    fireEvent.click(screen.getByText("Submit"))
    expect(await screen.findByText("Tenant name is required")).toBeInTheDocument()
  })
})
```

---

## Integration Checklist

### Pre-Integration Checklist (for each module)

- [ ] All types defined and exported
- [ ] All schemas created and tested
- [ ] API functions implemented and tested
- [ ] Store slice created and tested
- [ ] Hooks created and tested
- [ ] Components created and styled
- [ ] Pages created and routed
- [ ] Form validation working
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Toast notifications working
- [ ] Delete confirmations working
- [ ] Responsive design verified
- [ ] Dark mode support verified

### Integration Checklist (Integration Team)

- [ ] Module branch merged to main
- [ ] Navigation updated
- [ ] Routes accessible
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Dependencies resolved
- [ ] Shared components work correctly
- [ ] Module integrates with dependencies
- [ ] Data persists correctly
- [ ] Performance acceptable
- [ ] Documentation updated

### Post-Integration Checklist

- [ ] Module tested end-to-end
- [ ] All CRUD operations work
- [ ] Filters and search work
- [ ] Forms validate correctly
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Toast notifications appear
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Code reviewed
- [ ] Documentation updated

---

## Communication & Coordination

### Daily Standup

**Each developer should report:**
- Module they're working on
- Progress since last standup
- Blockers or dependencies needed
- Estimated completion time

### Weekly Sync

**Review:**
- Completed modules
- Modules in progress
- Upcoming dependencies
- Integration schedule
- Any architecture decisions needed

### Code Review Process

1. **Create Pull Request**
   - Title: `[Module Name] - Feature Implementation`
   - Description: List of changes, dependencies, testing notes

2. **Review Checklist**
   - [ ] Code follows project conventions
   - [ ] Types are properly defined
   - [ ] Forms validate correctly
   - [ ] Error handling implemented
   - [ ] No console errors
   - [ ] Responsive design
   - [ ] Dark mode support

3. **Merge Requirements**
   - At least one approval
   - All checks passing
   - No merge conflicts

### Conflict Resolution

**If two modules need the same shared component:**
1. Discuss in team meeting
2. Decide if component should be in `components/shared/`
3. Create shared component first
4. Both modules use shared component

**If API contract needs to change:**
1. Discuss impact on dependent modules
2. Update API contract documentation
3. Notify dependent module developers
4. Coordinate update timing

---

## Timeline & Milestones

### Phase 1: Foundation (Week 1)
- **Module 1:** Foundation & Infrastructure
- **Deliverable:** Complete app shell, shared components, utilities
- **Blockers:** None
- **Dependencies:** None

### Phase 2: Core Modules (Weeks 2-3)
- **Modules:** Tenants, Plans, Roles, Currency, Settings
- **Deliverable:** 5 independent modules complete
- **Blockers:** Foundation must be complete
- **Dependencies:** None (can develop in parallel)

### Phase 3: Dependent Modules (Weeks 4-5)
- **Modules:** Branches, Subscriptions
- **Deliverable:** 2 modules that depend on Phase 2 modules
- **Blockers:** Tenants (for Branches), Tenants + Plans (for Subscriptions)
- **Dependencies:** Modules from Phase 2

### Phase 4: Complex Modules (Weeks 6-7)
- **Modules:** Users, Invoices
- **Deliverable:** 2 complex modules
- **Blockers:** Multiple dependencies
- **Dependencies:** Tenants, Branches, Roles (for Users); Tenants, Subscriptions (for Invoices)

### Phase 5: Final Modules (Week 8)
- **Modules:** Payments, Dashboard
- **Deliverable:** Final 2 modules
- **Blockers:** Invoices (for Payments), Multiple modules (for Dashboard)
- **Dependencies:** Previous phases

### Phase 6: Integration & Testing (Week 9)
- **Activities:** Integration testing, bug fixes, performance optimization
- **Deliverable:** Fully integrated application

---

## Risk Mitigation

### Common Risks

1. **Dependency Delays**
   - **Risk:** Module A depends on Module B, but B is delayed
   - **Mitigation:** Create mock data/stubs for dependencies, develop in parallel

2. **API Contract Changes**
   - **Risk:** API contract changes break dependent modules
   - **Mitigation:** Document API contracts early, version APIs, communicate changes

3. **Integration Issues**
   - **Risk:** Modules don't integrate smoothly
   - **Mitigation:** Regular integration checkpoints, shared component library, consistent patterns

4. **Performance Issues**
   - **Risk:** Application becomes slow with many modules
   - **Mitigation:** Code splitting, lazy loading, performance testing

5. **UI/UX Inconsistencies**
   - **Risk:** Modules look different or behave inconsistently
   - **Mitigation:** Shared component library, design system, code reviews

---

## Success Criteria

### Module Completion Criteria

A module is considered complete when:
- ✅ All CRUD operations work
- ✅ Forms validate correctly
- ✅ Error handling implemented
- ✅ Loading states shown
- ✅ Toast notifications work
- ✅ Responsive design verified
- ✅ Dark mode supported
- ✅ Code reviewed and approved
- ✅ Documentation updated
- ✅ Integration tested

### Project Completion Criteria

The project is complete when:
- ✅ All 12 modules implemented
- ✅ All modules integrated
- ✅ No console errors
- ✅ No TypeScript errors
- ✅ All routes accessible
- ✅ Navigation works correctly
- ✅ Data persists correctly
- ✅ Performance acceptable
- ✅ Documentation complete
- ✅ Code reviewed

---

## Appendix

### Module Priority Matrix

| Module | Priority | Complexity | Dependencies | Can Start After |
|--------|----------|------------|--------------|-----------------|
| Foundation | Critical | Medium | None | Day 1 |
| Tenants | High | Medium | Foundation | Day 4 |
| Plans | High | Medium | Foundation | Day 4 |
| Roles | High | High | Foundation | Day 4 |
| Subscriptions | High | High | Tenants + Plans | Day 8 |
| Invoices | High | High | Tenants + Subscriptions | Day 12 |
| Users | Medium | Medium | Tenants + Branches + Roles | Day 10 |
| Payments | Medium | Medium | Tenants + Invoices | Day 16 |
| Branches | Medium | Low-Medium | Tenants | Day 8 |
| Dashboard | High | Low | Multiple modules | Day 18 |
| Currency | Low | Low | Foundation | Day 4 |
| Settings | Low | Low | Foundation | Day 4 |

### Estimated Effort (Person-Days)

| Module | Estimated Days | Min | Max |
|--------|---------------|-----|-----|
| Foundation | 4 | 3 | 5 |
| Dashboard | 2.5 | 2 | 3 |
| Tenants | 4.5 | 4 | 5 |
| Branches | 3.5 | 3 | 4 |
| Plans | 3.5 | 3 | 4 |
| Subscriptions | 5.5 | 5 | 6 |
| Users | 4.5 | 4 | 5 |
| Roles | 5.5 | 5 | 6 |
| Invoices | 6.5 | 6 | 7 |
| Payments | 4.5 | 4 | 5 |
| Currency | 2.5 | 2 | 3 |
| Settings | 2.5 | 2 | 3 |
| **Total** | **51** | **45** | **58** |

### Team Velocity Assumptions

- **Small Team (4 devs):** ~20 person-days per week = 2.5-3 weeks
- **Medium Team (6 devs):** ~30 person-days per week = 1.5-2 weeks
- **Large Team (8+ devs):** ~40 person-days per week = 1-1.5 weeks

*Note: These estimates assume parallel development and may vary based on team experience and module complexity.*

---

**Document Version:** 1.0.0  
**Last Updated:** 2024  
**Maintained By:** Development Team Lead
