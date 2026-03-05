# Complete Functions Documentation

This document provides a comprehensive reference for all functions, methods, and utilities in the Tenant Management Admin Portal codebase.

---

## Table of Contents

1. [API Functions](#api-functions)
2. [Store Functions (Zustand)](#store-functions-zustand)
3. [Utility Functions](#utility-functions)
4. [Schema Validators](#schema-validators)
5. [Seed Functions](#seed-functions)
6. [Authentication Functions](#authentication-functions)
7. [Query Functions](#query-functions)
8. [Component Functions](#component-functions)

---

## API Functions

**Location:** `lib/api/index.ts`

All API functions simulate backend calls with artificial delays. They interact with the Zustand store to persist data to localStorage.

### Tenants API

#### `tenantsApi.getAll()`
- **Description:** Retrieves all tenants from the store
- **Returns:** `Promise<Tenant[]>`
- **Delay:** 300ms
- **Usage:**
  ```typescript
  const tenants = await tenantsApi.getAll()
  ```

#### `tenantsApi.getById(id: string)`
- **Description:** Retrieves a single tenant by ID
- **Parameters:**
  - `id: string` - The tenant ID
- **Returns:** `Promise<Tenant | undefined>`
- **Delay:** 200ms
- **Usage:**
  ```typescript
  const tenant = await tenantsApi.getById("tenant-001")
  ```

#### `tenantsApi.create(tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">)`
- **Description:** Creates a new tenant with auto-generated ID and timestamps
- **Parameters:**
  - `tenant: Omit<Tenant, "id" | "createdAt" | "updatedAt">` - Tenant data without system fields
- **Returns:** `Promise<Tenant>`
- **Delay:** 400ms
- **Usage:**
  ```typescript
  const newTenant = await tenantsApi.create({
    tenantName: "Acme Corp",
    contactPerson: "John Doe",
    email: "john@acme.com",
    // ... other fields
  })
  ```

#### `tenantsApi.update(id: string, updates: Partial<Tenant>)`
- **Description:** Updates an existing tenant
- **Parameters:**
  - `id: string` - The tenant ID
  - `updates: Partial<Tenant>` - Partial tenant data to update
- **Returns:** `Promise<Tenant>`
- **Delay:** 400ms
- **Throws:** `Error` if tenant not found
- **Usage:**
  ```typescript
  const updated = await tenantsApi.update("tenant-001", { status: "Inactive" })
  ```

#### `tenantsApi.delete(id: string)`
- **Description:** Deletes a tenant by ID
- **Parameters:**
  - `id: string` - The tenant ID
- **Returns:** `Promise<void>`
- **Delay:** 300ms
- **Usage:**
  ```typescript
  await tenantsApi.delete("tenant-001")
  ```

### Branches API

#### `branchesApi.getAll()`
- **Description:** Retrieves all branches
- **Returns:** `Promise<Branch[]>`
- **Delay:** 300ms

#### `branchesApi.getById(id: string)`
- **Description:** Retrieves a single branch by ID
- **Parameters:**
  - `id: string` - The branch ID
- **Returns:** `Promise<Branch | undefined>`
- **Delay:** 200ms

#### `branchesApi.create(branch: Omit<Branch, "id" | "createdAt" | "updatedAt">)`
- **Description:** Creates a new branch
- **Parameters:**
  - `branch: Omit<Branch, "id" | "createdAt" | "updatedAt">` - Branch data
- **Returns:** `Promise<Branch>`
- **Delay:** 400ms

#### `branchesApi.update(id: string, updates: Partial<Branch>)`
- **Description:** Updates an existing branch
- **Parameters:**
  - `id: string` - The branch ID
  - `updates: Partial<Branch>` - Partial branch data
- **Returns:** `Promise<Branch>`
- **Delay:** 400ms
- **Throws:** `Error` if branch not found

#### `branchesApi.delete(id: string)`
- **Description:** Deletes a branch by ID
- **Parameters:**
  - `id: string` - The branch ID
- **Returns:** `Promise<void>`
- **Delay:** 300ms

### Plans API

#### `plansApi.getAll()`
- **Description:** Retrieves all subscription plans
- **Returns:** `Promise<Plan[]>`
- **Delay:** 300ms

#### `plansApi.getById(id: string)`
- **Description:** Retrieves a single plan by ID
- **Parameters:**
  - `id: string` - The plan ID
- **Returns:** `Promise<Plan | undefined>`
- **Delay:** 200ms

#### `plansApi.create(plan: Omit<Plan, "id" | "createdAt" | "updatedAt">)`
- **Description:** Creates a new subscription plan
- **Parameters:**
  - `plan: Omit<Plan, "id" | "createdAt" | "updatedAt">` - Plan data
- **Returns:** `Promise<Plan>`
- **Delay:** 400ms

#### `plansApi.update(id: string, updates: Partial<Plan>)`
- **Description:** Updates an existing plan
- **Parameters:**
  - `id: string` - The plan ID
  - `updates: Partial<Plan>` - Partial plan data
- **Returns:** `Promise<Plan>`
- **Delay:** 400ms
- **Throws:** `Error` if plan not found

#### `plansApi.delete(id: string)`
- **Description:** Deletes a plan by ID
- **Parameters:**
  - `id: string` - The plan ID
- **Returns:** `Promise<void>`
- **Delay:** 300ms

### Subscriptions API

#### `subscriptionsApi.getAll()`
- **Description:** Retrieves all tenant subscriptions
- **Returns:** `Promise<TenantSubscription[]>`
- **Delay:** 300ms

#### `subscriptionsApi.getById(id: string)`
- **Description:** Retrieves a single subscription by ID
- **Parameters:**
  - `id: string` - The subscription ID
- **Returns:** `Promise<TenantSubscription | undefined>`
- **Delay:** 200ms

#### `subscriptionsApi.create(subscription: Omit<TenantSubscription, "id" | "createdAt" | "updatedAt">)`
- **Description:** Creates a new subscription
- **Parameters:**
  - `subscription: Omit<TenantSubscription, "id" | "createdAt" | "updatedAt">` - Subscription data
- **Returns:** `Promise<TenantSubscription>`
- **Delay:** 400ms

#### `subscriptionsApi.update(id: string, updates: Partial<TenantSubscription>)`
- **Description:** Updates an existing subscription
- **Parameters:**
  - `id: string` - The subscription ID
  - `updates: Partial<TenantSubscription>` - Partial subscription data
- **Returns:** `Promise<TenantSubscription>`
- **Delay:** 400ms
- **Throws:** `Error` if subscription not found

#### `subscriptionsApi.delete(id: string)`
- **Description:** Deletes a subscription by ID
- **Parameters:**
  - `id: string` - The subscription ID
- **Returns:** `Promise<void>`
- **Delay:** 300ms

### Users API

#### `usersApi.getAll()`
- **Description:** Retrieves all users
- **Returns:** `Promise<User[]>`
- **Delay:** 300ms

#### `usersApi.getById(id: string)`
- **Description:** Retrieves a single user by ID
- **Parameters:**
  - `id: string` - The user ID
- **Returns:** `Promise<User | undefined>`
- **Delay:** 200ms

#### `usersApi.create(user: Omit<User, "id" | "createdAt" | "updatedAt">)`
- **Description:** Creates a new user
- **Parameters:**
  - `user: Omit<User, "id" | "createdAt" | "updatedAt">` - User data
- **Returns:** `Promise<User>`
- **Delay:** 400ms

#### `usersApi.update(id: string, updates: Partial<User>)`
- **Description:** Updates an existing user
- **Parameters:**
  - `id: string` - The user ID
  - `updates: Partial<User>` - Partial user data
- **Returns:** `Promise<User>`
- **Delay:** 400ms
- **Throws:** `Error` if user not found

#### `usersApi.delete(id: string)`
- **Description:** Deletes a user by ID
- **Parameters:**
  - `id: string` - The user ID
- **Returns:** `Promise<void>`
- **Delay:** 300ms

### Roles API

#### `rolesApi.getAll()`
- **Description:** Retrieves all roles
- **Returns:** `Promise<Role[]>`
- **Delay:** 300ms

#### `rolesApi.getById(id: string)`
- **Description:** Retrieves a single role by ID
- **Parameters:**
  - `id: string` - The role ID
- **Returns:** `Promise<Role | undefined>`
- **Delay:** 200ms

#### `rolesApi.create(role: Omit<Role, "id" | "createdAt" | "updatedAt">)`
- **Description:** Creates a new role
- **Parameters:**
  - `role: Omit<Role, "id" | "createdAt" | "updatedAt">` - Role data
- **Returns:** `Promise<Role>`
- **Delay:** 400ms

#### `rolesApi.update(id: string, updates: Partial<Role>)`
- **Description:** Updates an existing role
- **Parameters:**
  - `id: string` - The role ID
  - `updates: Partial<Role>` - Partial role data
- **Returns:** `Promise<Role>`
- **Delay:** 400ms
- **Throws:** `Error` if role not found

#### `rolesApi.delete(id: string)`
- **Description:** Deletes a role by ID
- **Parameters:**
  - `id: string` - The role ID
- **Returns:** `Promise<void>`
- **Delay:** 300ms

### Invoices API

#### `invoicesApi.getAll()`
- **Description:** Retrieves all invoices
- **Returns:** `Promise<Invoice[]>`
- **Delay:** 300ms

#### `invoicesApi.getById(id: string)`
- **Description:** Retrieves a single invoice by ID
- **Parameters:**
  - `id: string` - The invoice ID
- **Returns:** `Promise<Invoice | undefined>`
- **Delay:** 200ms

#### `invoicesApi.create(invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">)`
- **Description:** Creates a new invoice
- **Parameters:**
  - `invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">` - Invoice data
- **Returns:** `Promise<Invoice>`
- **Delay:** 400ms

#### `invoicesApi.update(id: string, updates: Partial<Invoice>)`
- **Description:** Updates an existing invoice
- **Parameters:**
  - `id: string` - The invoice ID
  - `updates: Partial<Invoice>` - Partial invoice data
- **Returns:** `Promise<Invoice>`
- **Delay:** 400ms
- **Throws:** `Error` if invoice not found

#### `invoicesApi.delete(id: string)`
- **Description:** Deletes an invoice by ID
- **Parameters:**
  - `id: string` - The invoice ID
- **Returns:** `Promise<void>`
- **Delay:** 300ms

### Invoice Lines API

#### `invoiceLinesApi.getByInvoiceId(invoiceId: string)`
- **Description:** Retrieves all invoice lines for a specific invoice
- **Parameters:**
  - `invoiceId: string` - The invoice ID
- **Returns:** `Promise<InvoiceLine[]>`
- **Delay:** 200ms

#### `invoiceLinesApi.create(line: Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">)`
- **Description:** Creates a new invoice line item
- **Parameters:**
  - `line: Omit<InvoiceLine, "id" | "createdAt" | "updatedAt">` - Invoice line data
- **Returns:** `Promise<InvoiceLine>`
- **Delay:** 300ms

#### `invoiceLinesApi.update(id: string, updates: Partial<InvoiceLine>)`
- **Description:** Updates an existing invoice line
- **Parameters:**
  - `id: string` - The invoice line ID
  - `updates: Partial<InvoiceLine>` - Partial invoice line data
- **Returns:** `Promise<InvoiceLine>`
- **Delay:** 300ms
- **Throws:** `Error` if invoice line not found

#### `invoiceLinesApi.delete(id: string)`
- **Description:** Deletes an invoice line by ID
- **Parameters:**
  - `id: string` - The invoice line ID
- **Returns:** `Promise<void>`
- **Delay:** 200ms

### Payments API

#### `paymentsApi.getAll()`
- **Description:** Retrieves all payments
- **Returns:** `Promise<Payment[]>`
- **Delay:** 300ms

#### `paymentsApi.getById(id: string)`
- **Description:** Retrieves a single payment by ID
- **Parameters:**
  - `id: string` - The payment ID
- **Returns:** `Promise<Payment | undefined>`
- **Delay:** 200ms

#### `paymentsApi.create(payment: Omit<Payment, "id" | "createdAt" | "updatedAt">)`
- **Description:** Creates a new payment record
- **Parameters:**
  - `payment: Omit<Payment, "id" | "createdAt" | "updatedAt">` - Payment data
- **Returns:** `Promise<Payment>`
- **Delay:** 400ms

#### `paymentsApi.update(id: string, updates: Partial<Payment>)`
- **Description:** Updates an existing payment
- **Parameters:**
  - `id: string` - The payment ID
  - `updates: Partial<Payment>` - Partial payment data
- **Returns:** `Promise<Payment>`
- **Delay:** 400ms
- **Throws:** `Error` if payment not found

#### `paymentsApi.delete(id: string)`
- **Description:** Deletes a payment by ID
- **Parameters:**
  - `id: string` - The payment ID
- **Returns:** `Promise<void>`
- **Delay:** 300ms

### Currencies API

#### `currenciesApi.getAll()`
- **Description:** Retrieves all currency exchange rates
- **Returns:** `Promise<CurrencyRate[]>`
- **Delay:** 300ms

#### `currenciesApi.update(id: string, updates: Partial<CurrencyRate>)`
- **Description:** Updates an existing currency exchange rate
- **Parameters:**
  - `id: string` - The currency ID
  - `updates: Partial<CurrencyRate>` - Partial currency data
- **Returns:** `Promise<CurrencyRate>`
- **Delay:** 400ms
- **Throws:** `Error` if currency not found
- **Note:** Automatically updates `lastUpdated` timestamp

---

## Store Functions (Zustand)

**Location:** `lib/store/index.ts`

The Zustand store manages application state with localStorage persistence. All state changes are automatically persisted.

### Store Hook

#### `useStore()`
- **Description:** React hook to access and update the Zustand store
- **Returns:** `StoreState & StoreActions`
- **Usage:**
  ```typescript
  const { tenants, addTenant } = useStore()
  ```

### Tenants Store Actions

#### `setTenants(tenants: Tenant[])`
- **Description:** Replaces the entire tenants array
- **Parameters:**
  - `tenants: Tenant[]` - Array of tenant objects

#### `addTenant(tenant: Tenant)`
- **Description:** Adds a new tenant to the store
- **Parameters:**
  - `tenant: Tenant` - Complete tenant object

#### `updateTenant(id: string, tenant: Partial<Tenant>)`
- **Description:** Updates an existing tenant by ID
- **Parameters:**
  - `id: string` - The tenant ID
  - `tenant: Partial<Tenant>` - Partial tenant data to merge

#### `deleteTenant(id: string)`
- **Description:** Removes a tenant from the store
- **Parameters:**
  - `id: string` - The tenant ID

### Branches Store Actions

#### `setBranches(branches: Branch[])`
- **Description:** Replaces the entire branches array

#### `addBranch(branch: Branch)`
- **Description:** Adds a new branch to the store

#### `updateBranch(id: string, branch: Partial<Branch>)`
- **Description:** Updates an existing branch by ID

#### `deleteBranch(id: string)`
- **Description:** Removes a branch from the store

### Plans Store Actions

#### `setPlans(plans: Plan[])`
- **Description:** Replaces the entire plans array

#### `addPlan(plan: Plan)`
- **Description:** Adds a new plan to the store

#### `updatePlan(id: string, plan: Partial<Plan>)`
- **Description:** Updates an existing plan by ID

#### `deletePlan(id: string)`
- **Description:** Removes a plan from the store

### Subscriptions Store Actions

#### `setSubscriptions(subscriptions: TenantSubscription[])`
- **Description:** Replaces the entire subscriptions array

#### `addSubscription(subscription: TenantSubscription)`
- **Description:** Adds a new subscription to the store

#### `updateSubscription(id: string, subscription: Partial<TenantSubscription>)`
- **Description:** Updates an existing subscription by ID

#### `deleteSubscription(id: string)`
- **Description:** Removes a subscription from the store

### Users Store Actions

#### `setUsers(users: User[])`
- **Description:** Replaces the entire users array

#### `addUser(user: User)`
- **Description:** Adds a new user to the store

#### `updateUser(id: string, user: Partial<User>)`
- **Description:** Updates an existing user by ID

#### `deleteUser(id: string)`
- **Description:** Removes a user from the store

### Roles Store Actions

#### `setRoles(roles: Role[])`
- **Description:** Replaces the entire roles array

#### `addRole(role: Role)`
- **Description:** Adds a new role to the store

#### `updateRole(id: string, role: Partial<Role>)`
- **Description:** Updates an existing role by ID

#### `deleteRole(id: string)`
- **Description:** Removes a role from the store

### Invoices Store Actions

#### `setInvoices(invoices: Invoice[])`
- **Description:** Replaces the entire invoices array

#### `addInvoice(invoice: Invoice)`
- **Description:** Adds a new invoice to the store

#### `updateInvoice(id: string, invoice: Partial<Invoice>)`
- **Description:** Updates an existing invoice by ID

#### `deleteInvoice(id: string)`
- **Description:** Removes an invoice from the store

### Invoice Lines Store Actions

#### `setInvoiceLines(lines: InvoiceLine[])`
- **Description:** Replaces the entire invoice lines array

#### `addInvoiceLine(line: InvoiceLine)`
- **Description:** Adds a new invoice line to the store

#### `updateInvoiceLine(id: string, line: Partial<InvoiceLine>)`
- **Description:** Updates an existing invoice line by ID

#### `deleteInvoiceLine(id: string)`
- **Description:** Removes an invoice line from the store

### Payments Store Actions

#### `setPayments(payments: Payment[])`
- **Description:** Replaces the entire payments array

#### `addPayment(payment: Payment)`
- **Description:** Adds a new payment to the store

#### `updatePayment(id: string, payment: Partial<Payment>)`
- **Description:** Updates an existing payment by ID

#### `deletePayment(id: string)`
- **Description:** Removes a payment from the store

### Currencies Store Actions

#### `setCurrencies(currencies: CurrencyRate[])`
- **Description:** Replaces the entire currencies array

#### `updateCurrency(id: string, currency: Partial<CurrencyRate>)`
- **Description:** Updates an existing currency by ID

### Settings Store Actions

#### `setSettings(settings: Settings[])`
- **Description:** Replaces the entire settings array

#### `updateSetting(key: string, value: string, category: string)`
- **Description:** Updates or creates a setting
- **Parameters:**
  - `key: string` - Setting key
  - `value: string` - Setting value
  - `category: string` - Setting category
- **Note:** Creates a new setting if key doesn't exist, updates existing setting otherwise

---

## Utility Functions

**Location:** `lib/utils/`

### Class Name Utility

#### `cn(...inputs: ClassValue[])`
- **Location:** `lib/utils/cn.ts`
- **Description:** Merges Tailwind CSS class names, handling conflicts intelligently
- **Parameters:**
  - `...inputs: ClassValue[]` - Variable number of class value inputs (strings, objects, arrays)
- **Returns:** `string` - Merged class name string
- **Usage:**
  ```typescript
  const className = cn("px-4", "py-2", { "bg-blue-500": isActive })
  ```

### Formatting Functions

#### `formatCurrency(amount: number, currency?: string)`
- **Location:** `lib/utils/format.ts`
- **Description:** Formats a number as currency using Intl.NumberFormat
- **Parameters:**
  - `amount: number` - The amount to format
  - `currency: string` - Currency code (default: "USD")
- **Returns:** `string` - Formatted currency string (e.g., "$1,234.56")
- **Usage:**
  ```typescript
  formatCurrency(1234.56, "USD") // "$1,234.56"
  formatCurrency(1000, "EUR") // "€1,000.00"
  ```

#### `formatDate(date: Date | string)`
- **Location:** `lib/utils/format.ts`
- **Description:** Formats a date as MM/DD/YYYY
- **Parameters:**
  - `date: Date | string` - Date object or ISO string
- **Returns:** `string` - Formatted date string (e.g., "12/31/2023")
- **Usage:**
  ```typescript
  formatDate(new Date()) // "12/31/2023"
  formatDate("2023-12-31T00:00:00Z") // "12/31/2023"
  ```

#### `formatDateTime(date: Date | string)`
- **Location:** `lib/utils/format.ts`
- **Description:** Formats a date with time as MM/DD/YYYY, HH:MM AM/PM
- **Parameters:**
  - `date: Date | string` - Date object or ISO string
- **Returns:** `string` - Formatted date-time string (e.g., "12/31/2023, 10:30 AM")
- **Usage:**
  ```typescript
  formatDateTime(new Date()) // "12/31/2023, 10:30 AM"
  ```

---

## Schema Validators

**Location:** `lib/schemas.ts`

All schemas use Zod for runtime validation. These are used with React Hook Form for form validation.

### `tenantSchema`
- **Type:** `z.ZodObject`
- **Description:** Validates tenant form data
- **Fields:**
  - `tenantName: string` (min 1)
  - `contactPerson: string` (min 1)
  - `email: string` (valid email)
  - `phone: string` (min 1)
  - `address?: string`
  - `city?: string`
  - `state?: string`
  - `zipCode?: string`
  - `country?: string`
  - `status: "Active" | "Inactive"`
  - `ownerName: string` (min 1)
  - `ownerEmail: string` (valid email)
  - `ownerPhone: string` (min 1)
  - `ownerType: "Indv" | "Company"`
  - `remarks?: string`

### `branchSchema`
- **Type:** `z.ZodObject`
- **Description:** Validates branch form data
- **Fields:**
  - `tenantId: string` (min 1)
  - `branchName: string` (min 1)
  - `phoneNumber: string` (min 1)
  - `email?: string` (valid email or empty)
  - `contactPerson?: string`
  - `addressLine1: string` (min 1)
  - `addressLine2?: string`
  - `city: string` (min 1)
  - `stateProvince: string` (min 1)
  - `zipPostalCode: string` (min 1)
  - `branchStatus: "Active" | "Inactive"`
  - `remarks?: string`

### `planSchema`
- **Type:** `z.ZodObject`
- **Description:** Validates plan form data
- **Fields:**
  - `planCode: string` (min 1)
  - `planName: string` (min 1)
  - `description?: string`
  - `billingCycle: "Monthly" | "Yearly"`
  - `currency: string` (min 1)
  - `price: number` (min 0)
  - `setupFee: number` (min 0)
  - `trialDays: number` (min 0)
  - `gracePeriodDays: number` (min 0)
  - `displayOrder: number` (min 0)
  - `isActive: boolean`

### `subscriptionSchema`
- **Type:** `z.ZodObject`
- **Description:** Validates subscription form data
- **Fields:**
  - `tenantId: string` (min 1)
  - `planId: string` (min 1)
  - `status: "Active" | "Expired" | "Pending" | "TRIALING" | "PAST_DUE" | "CANCELED"`
  - `startDate: string` (min 1)
  - `currentPeriodStart: string` (min 1)
  - `currentPeriodEnd: string` (min 1)
  - `canceledAt?: string`
  - `trialStart?: string`
  - `trialEnd?: string`
  - `billingCurrency: string` (min 1)
  - `unitPrice: number` (min 0)
  - `discountAmount: number` (min 0)
  - `discountPercent: number` (0-100)
  - `autoRenew: boolean`
  - `cancelAtPeriodEnd: boolean`
  - `notes?: string`

### `userSchema`
- **Type:** `z.ZodObject`
- **Description:** Validates user form data
- **Fields:**
  - `username: string` (min 1)
  - `password?: string` (min 6 characters)
  - `email: string` (valid email)
  - `mobile: string` (min 1)
  - `firstName?: string`
  - `lastName?: string`
  - `tenantId: string` (min 1)
  - `branchId?: string`
  - `roleId: string` (min 1)
  - `status: "Active" | "Inactive"`

### `roleSchema`
- **Type:** `z.ZodObject`
- **Description:** Validates role form data
- **Fields:**
  - `roleName: string` (min 1)
  - `description?: string`
  - `status: "Active" | "Inactive"`
  - `permissions: Array<{ module: string, view: boolean, create: boolean, edit: boolean, delete: boolean }>`

### `invoiceSchema`
- **Type:** `z.ZodObject`
- **Description:** Validates invoice form data
- **Fields:**
  - `tenantId: string` (min 1)
  - `subscriptionId: string` (min 1)
  - `periodStart: string` (min 1)
  - `periodEnd: string` (min 1)
  - `issueDate: string` (min 1)
  - `dueDate: string` (min 1)
  - `currency: string` (min 1)
  - `notes?: string`

### `invoiceLineSchema`
- **Type:** `z.ZodObject`
- **Description:** Validates invoice line item form data
- **Fields:**
  - `lineType: "SUBSCRIPTION" | "TAX" | "DISCOUNT" | "OTHER"`
  - `description: string` (min 1)
  - `quantity: number` (min 0)
  - `unitPrice: number` (min 0)
  - `sortOrder: number` (min 0)

### `paymentSchema`
- **Type:** `z.ZodObject`
- **Description:** Validates payment form data
- **Fields:**
  - `tenantId: string` (min 1)
  - `invoiceId?: string`
  - `subscriptionId?: string`
  - `amount: number` (min 0)
  - `currency: string` (min 1)
  - `status: "Paid" | "Pending" | "Failed" | "Completed" | "PARTIALLY_PAID" | "ISSUED"`
  - `paymentMethod: "Credit Card" | "Bank Transfer" | "Cash" | "Other"`
  - `provider?: string`
  - `providerTransactionId?: string`
  - `paidAt?: string`
  - `failureReason?: string`

### `currencyRateSchema`
- **Type:** `z.ZodObject`
- **Description:** Validates currency rate form data
- **Fields:**
  - `currencyCode: string` (min 1)
  - `currencyName: string` (min 1)
  - `exchangeRate: number` (min 0)

---

## Seed Functions

**Location:** `lib/seed.ts`

### `seedData()`
- **Description:** Initializes the store with default seed data if collections are empty
- **Returns:** `void`
- **Seeds:**
  - **Currencies:** USD, EUR, GBP, JPY, KWD with exchange rates
  - **Roles:** Admin, Tenant Manager, User Manager, Finance Manager with permissions
  - **Plans:** Basic Plan, Pro Plan, Enterprise Plan
  - **Tenants:** Global Corp, Tech Solutions, Innovate Ltd
- **Usage:**
  ```typescript
  import { seedData } from "@/lib/seed"
  seedData()
  ```
- **Note:** Only seeds if collections are empty (idempotent)

---

## Authentication Functions

**Location:** `lib/auth/`

### Session Functions

#### `getSession()`
- **Location:** `lib/auth/session.ts`
- **Description:** Returns the current mock session
- **Returns:** `Session`
- **Session Structure:**
  ```typescript
  {
    user: {
      id: string
      name: string
      email: string
      role: string
    }
  }
  ```
- **Usage:**
  ```typescript
  const session = getSession()
  console.log(session.user.name) // "Admin User"
  ```

### Permission Functions

#### `hasPermission(permission: string)`
- **Location:** `lib/auth/permissions.ts`
- **Description:** Checks if the current user has a specific permission
- **Parameters:**
  - `permission: string` - Permission string (e.g., "tenants:view")
- **Returns:** `boolean`
- **Note:** Currently returns `true` for all permissions (mock implementation)

#### `canAccess(module: string, action: string)`
- **Location:** `lib/auth/permissions.ts`
- **Description:** Checks if the current user can perform an action on a module
- **Parameters:**
  - `module: string` - Module name (e.g., "tenants")
  - `action: string` - Action name (e.g., "view")
- **Returns:** `boolean`
- **Usage:**
  ```typescript
  if (canAccess("tenants", "create")) {
    // Show create button
  }
  ```

### Permission Constants

**Location:** `lib/auth/permissions.ts`

The `PERMISSIONS` object contains permission strings for all modules:

```typescript
PERMISSIONS.TENANTS.VIEW      // "tenants:view"
PERMISSIONS.TENANTS.CREATE    // "tenants:create"
PERMISSIONS.TENANTS.UPDATE    // "tenants:update"
PERMISSIONS.TENANTS.DELETE    // "tenants:delete"
// Similar for BRANCHES, PLANS, SUBSCRIPTIONS, USERS, ROLES, INVOICES, PAYMENTS
```

---

## Query Functions

**Location:** `lib/query/`

### Query Client

#### `getQueryClient()`
- **Location:** `lib/query/queryClient.ts`
- **Description:** Returns a singleton QueryClient instance for TanStack Query
- **Returns:** `QueryClient`
- **Configuration:**
  - `staleTime: 60 * 1000` (1 minute)
- **Usage:**
  ```typescript
  const queryClient = getQueryClient()
  ```

#### `queryClient`
- **Location:** `lib/query/queryClient.ts`
- **Description:** Exported singleton instance for backward compatibility
- **Type:** `QueryClient`

---

## Component Functions

### App Shell Components

#### `AppShell({ children })`
- **Location:** `components/shared/app-shell/AppShell.tsx`
- **Description:** Main application shell wrapper with sidebar and topbar
- **Parameters:**
  - `children: React.ReactNode` - Page content
- **Returns:** `JSX.Element`

#### `Sidebar()`
- **Location:** `components/shared/app-shell/Sidebar.tsx`
- **Description:** Collapsible sidebar navigation component
- **Returns:** `JSX.Element`
- **Features:**
  - Collapsible/expandable
  - Active route highlighting
  - Nested navigation support
  - Search functionality

#### `Topbar()`
- **Location:** `components/shared/app-shell/Topbar.tsx`
- **Description:** Top navigation bar with search and user menu
- **Returns:** `JSX.Element`
- **Features:**
  - Global search
  - Notifications icon
  - User dropdown menu
  - Theme toggle

### Data Display Components

#### `DataTable<TData, TValue>({ columns, data, ...props })`
- **Location:** `components/shared/data-table/DataTable.tsx`
- **Description:** TanStack Table wrapper with sorting, filtering, pagination
- **Parameters:**
  - `columns: ColumnDef<TData, TValue>[]` - Table column definitions
  - `data: TData[]` - Table data array
  - Additional TanStack Table props
- **Returns:** `JSX.Element`
- **Features:**
  - Sorting
  - Filtering
  - Pagination
  - Column visibility toggle

#### `StatusBadge({ status, variant, className })`
- **Location:** `components/shared/badges/StatusBadge.tsx`
- **Description:** Displays status with color-coded badge
- **Parameters:**
  - `status: string` - Status text
  - `variant?: "default" | "success" | "warning" | "danger" | "info"`
  - `className?: string`
- **Returns:** `JSX.Element`

#### `StatCard({ title, value, change, icon, trend, ...props })`
- **Location:** `components/shared/cards/StatCard.tsx`
- **Description:** Dashboard statistic card component
- **Parameters:**
  - `title: string` - Card title
  - `value: string | number` - Main value
  - `change?: string` - Change indicator
  - `icon?: React.ReactNode` - Icon component
  - `trend?: "up" | "down" | "neutral"`
  - Additional props
- **Returns:** `JSX.Element`

#### `GlassCard({ variant, className, children, ...props })`
- **Location:** `components/shared/cards/GlassCard.tsx`
- **Description:** Glassmorphism card component with backdrop blur
- **Parameters:**
  - `variant?: "default" | "elevated" | "subtle" | "interactive"`
  - `className?: string`
  - `children: React.ReactNode`
  - Additional Card props
- **Returns:** `JSX.Element`

### Navigation Components

#### `Breadcrumbs({ items, className })`
- **Location:** `components/shared/breadcrumbs/Breadcrumbs.tsx`
- **Description:** Breadcrumb navigation component
- **Parameters:**
  - `items: BreadcrumbItem[]` - Array of breadcrumb items
  - `className?: string`
- **Returns:** `JSX.Element`
- **BreadcrumbItem Structure:**
  ```typescript
  {
    label: string
    href?: string
  }
  ```

#### `PageHeader({ title, subtitle, breadcrumbs, actions, tabs })`
- **Location:** `components/shared/page-header/PageHeader.tsx`
- **Description:** Page header with title, breadcrumbs, and action buttons
- **Parameters:**
  - `title: string` - Page title
  - `subtitle?: string` - Page subtitle
  - `breadcrumbs?: BreadcrumbItem[]` - Breadcrumb items
  - `actions?: React.ReactNode` - Action buttons
  - `tabs?: React.ReactNode` - Tab navigation
- **Returns:** `JSX.Element`

### Feedback Components

#### `ConfirmDialog({ open, onOpenChange, title, description, onConfirm, confirmText, cancelText })`
- **Location:** `components/shared/feedback/ConfirmDialog.tsx`
- **Description:** Confirmation dialog for destructive actions
- **Parameters:**
  - `open: boolean` - Dialog open state
  - `onOpenChange: (open: boolean) => void` - Open state handler
  - `title: string` - Dialog title
  - `description?: string` - Dialog description
  - `onConfirm: () => void` - Confirm callback
  - `confirmText?: string` - Confirm button text (default: "Confirm")
  - `cancelText?: string` - Cancel button text (default: "Cancel")
- **Returns:** `JSX.Element`

#### `EmptyState({ title, description, action, icon, className })`
- **Location:** `components/shared/feedback/EmptyState.tsx`
- **Description:** Empty state component for empty lists
- **Parameters:**
  - `title: string` - Empty state title
  - `description?: string` - Empty state description
  - `action?: React.ReactNode` - Action button
  - `icon?: React.ReactNode` - Icon component
  - `className?: string`
- **Returns:** `JSX.Element`

#### `ModernEmptyState({ title, description, action, icon, className })`
- **Location:** `components/shared/feedback/ModernEmptyState.tsx`
- **Description:** Modern styled empty state component
- **Parameters:** Same as `EmptyState`
- **Returns:** `JSX.Element`

#### `Skeletons({ count, className })`
- **Location:** `components/shared/feedback/Skeletons.tsx`
- **Description:** Skeleton loading placeholders
- **Parameters:**
  - `count?: number` - Number of skeletons (default: 3)
  - `className?: string`
- **Returns:** `JSX.Element`

### Form Components

#### `DatePicker({ date, onDateChange, ...props })`
- **Location:** `components/ui/date-picker.tsx`
- **Description:** Date picker component using react-day-picker
- **Parameters:**
  - `date?: Date` - Selected date
  - `onDateChange?: (date: Date | undefined) => void` - Date change handler
  - Additional calendar props
- **Returns:** `JSX.Element`

### Provider Components

#### `QueryProvider({ children })`
- **Location:** `components/shared/providers/QueryProvider.tsx`
- **Description:** TanStack Query provider wrapper
- **Parameters:**
  - `children: React.ReactNode` - App children
- **Returns:** `JSX.Element`
- **Usage:**
  ```typescript
  <QueryProvider>
    <App />
  </QueryProvider>
  ```

#### `ThemeProvider({ children, attribute, defaultTheme, enableSystem, disableTransitionOnChange })`
- **Location:** `components/theme-provider.tsx`
- **Description:** next-themes provider for dark/light mode
- **Parameters:**
  - `children: React.ReactNode`
  - `attribute?: string` - HTML attribute for theme (default: "class")
  - `defaultTheme?: string` - Default theme (default: "system")
  - `enableSystem?: boolean` - Enable system theme detection
  - `disableTransitionOnChange?: boolean` - Disable transitions on theme change
- **Returns:** `JSX.Element`

### Toast System

#### `Toaster()`
- **Location:** `components/ui/toaster.tsx`
- **Description:** Toast notification container component
- **Returns:** `JSX.Element`
- **Usage:** Add to root layout

#### `useToast()`
- **Location:** `hooks/use-toast.ts`
- **Description:** Hook to show toast notifications
- **Returns:** `{ toast: (props) => void }`
- **Usage:**
  ```typescript
  const { toast } = useToast()
  toast({
    title: "Success",
    description: "Operation completed",
  })
  ```

---

## Navigation Configuration

**Location:** `components/shared/app-shell/NavItems.ts`

### `navItems`
- **Type:** `NavItem[]`
- **Description:** Array of navigation items for the sidebar
- **Structure:**
  ```typescript
  interface NavItem {
    title: string
    href?: string
    icon: LucideIcon
    children?: NavItem[]
  }
  ```
- **Modules:**
  - Dashboard
  - Tenant Management (Tenants, Branches)
  - Plans & Subscriptions (Plans, Tenant Subscriptions)
  - Users
  - Roles
  - Invoice Management
  - Payments
  - Currency Lookup
  - Settings

---

## Constants

### Modules
**Location:** `lib/types.ts`

```typescript
MODULES = [
  "Dashboard",
  "Tenant Management",
  "Plans & Subscriptions",
  "Users",
  "Roles",
  "Invoice Management",
  "Payments",
  "Currency Lookup",
  "Settings",
]
```

### Permission Actions
**Location:** `lib/types.ts`

```typescript
PERMISSION_ACTIONS = ["view", "create", "edit", "delete"]
```

---

## Type Definitions

All TypeScript interfaces and types are defined in `lib/types.ts`. Key types include:

- `Tenant`
- `Branch`
- `Plan`
- `TenantSubscription`
- `User`
- `Role`
- `Permission`
- `Invoice`
- `InvoiceLine`
- `Payment`
- `CurrencyRate`
- `Settings`

Union types for statuses:
- `TenantStatus`
- `SubscriptionStatus`
- `UserStatus`
- `PaymentStatus`
- `InvoiceStatus`
- `PlanStatus`
- `BillingCycle`
- `OwnerType`
- `PaymentMethod`
- `LineType`

---

## Usage Examples

### Complete CRUD Flow Example

```typescript
import { tenantsApi } from "@/lib/api"
import { useStore } from "@/lib/store"
import { tenantSchema } from "@/lib/schemas"
import { useToast } from "@/hooks/use-toast"

// Create tenant
const createTenant = async (data: TenantFormData) => {
  try {
    const validated = tenantSchema.parse(data)
    const newTenant = await tenantsApi.create(validated)
    toast({ title: "Success", description: "Tenant created" })
    return newTenant
  } catch (error) {
    toast({ title: "Error", description: "Failed to create tenant" })
    throw error
  }
}

// Read tenants
const { data: tenants } = useQuery({
  queryKey: ["tenants"],
  queryFn: tenantsApi.getAll,
})

// Update tenant
const updateTenant = async (id: string, updates: Partial<Tenant>) => {
  const updated = await tenantsApi.update(id, updates)
  return updated
}

// Delete tenant
const deleteTenant = async (id: string) => {
  await tenantsApi.delete(id)
  toast({ title: "Success", description: "Tenant deleted" })
}
```

### Store Usage Example

```typescript
import { useStore } from "@/lib/store"

function TenantList() {
  const { tenants, addTenant, updateTenant, deleteTenant } = useStore()
  
  const handleAdd = () => {
    addTenant({
      id: "new-id",
      tenantName: "New Tenant",
      // ... other fields
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  
  return (
    <div>
      {tenants.map(tenant => (
        <div key={tenant.id}>{tenant.tenantName}</div>
      ))}
    </div>
  )
}
```

---

## Notes

1. **Persistence:** All store changes are automatically persisted to localStorage via Zustand's `persist` middleware.

2. **API Simulation:** All API functions include artificial delays to simulate network requests. In production, replace these with actual API calls.

3. **Type Safety:** All functions are fully typed with TypeScript. Use the schemas for runtime validation.

4. **Error Handling:** API functions throw errors when entities are not found. Always wrap API calls in try-catch blocks.

5. **Idempotent Operations:** Seed function only adds data if collections are empty, making it safe to call multiple times.

6. **Component Props:** All components accept standard React props including `className` for styling customization.

---

## Version

**Document Version:** 1.0.0  
**Last Updated:** 2024  
**Codebase Version:** 0.1.0
