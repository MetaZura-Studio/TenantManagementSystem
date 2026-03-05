import { useStore } from "./store"
import type { Tenant } from "@/features/tenants/types"
import type { Branch } from "@/features/branches/types"
import type { Plan } from "@/features/plans/types"
import type { TenantSubscription } from "@/features/tenant-subscriptions/types"
import type { User } from "@/features/users/types"
import type { Role } from "@/features/roles/types"
import type { CurrencyRate } from "@/features/currency/types"
import { MODULES } from "@/types"

export function seedData() {
  const store = useStore.getState()

  // Seed Currencies
  if (store.currencies.length === 0) {
    const currencies: CurrencyRate[] = [
      {
        id: "currency-usd",
        currencyCode: "USD",
        currencyName: "United States Dollar",
        exchangeRate: 1.0,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "currency-eur",
        currencyCode: "EUR",
        currencyName: "Euro",
        exchangeRate: 0.95,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "currency-gbp",
        currencyCode: "GBP",
        currencyName: "British Pound",
        exchangeRate: 0.82,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "currency-jpy",
        currencyCode: "JPY",
        currencyName: "Japanese Yen",
        exchangeRate: 150.0,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "currency-kwd",
        currencyCode: "KWD",
        currencyName: "Kuwaiti Dinar",
        exchangeRate: 0.31,
        lastUpdated: new Date().toISOString(),
      },
    ]
    store.setCurrencies(currencies)
  }

  // Seed Roles
  if (store.roles.length === 0) {
    const adminPermissions = MODULES.map((module) => ({
      module,
      view: true,
      create: true,
      edit: true,
      delete: true,
    }))

    const roles: Role[] = [
      {
        id: "role-admin",
        roleName: "Admin",
        description: "Full access to all features and settings.",
        status: "Active",
        permissions: adminPermissions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "role-tenant-manager",
        roleName: "Tenant Manager",
        description: "Manages tenants, branches, and subscriptions.",
        status: "Active",
        permissions: MODULES.map((module) => ({
          module,
          view: true,
          create: module === "Tenant Management" || module === "Plans & Subscriptions",
          edit: module === "Tenant Management" || module === "Plans & Subscriptions",
          delete: false,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "role-user-manager",
        roleName: "User Manager",
        description: "Manages user accounts and roles.",
        status: "Active",
        permissions: MODULES.map((module) => ({
          module,
          view: true,
          create: module === "Users" || module === "Roles",
          edit: module === "Users" || module === "Roles",
          delete: module === "Users" || module === "Roles",
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "role-finance-manager",
        roleName: "Finance Manager",
        description: "Manages invoices and payments.",
        status: "Active",
        permissions: MODULES.map((module) => ({
          module,
          view: true,
          create: module === "Invoice Management" || module === "Payments",
          edit: module === "Invoice Management" || module === "Payments",
          delete: false,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    store.setRoles(roles)
  }

  // Seed Plans
  if (store.plans.length === 0) {
    const plans: Plan[] = [
      {
        id: "plan-001",
        planCode: "PLAN001",
        planName: "Basic Plan",
        description: "Entry-level features for individuals",
        amount: 9.99,
        billingCycle: "Monthly",
        currency: "USD",
        price: 9.99,
        setupFee: 0.0,
        trialDays: 7,
        gracePeriodDays: 7,
        status: "Active",
        displayOrder: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "plan-002",
        planCode: "PLAN002",
        planName: "Pro Plan",
        description: "Advanced features for growing teams",
        amount: 99.99,
        billingCycle: "Yearly",
        currency: "USD",
        price: 99.99,
        setupFee: 10.0,
        trialDays: 14,
        gracePeriodDays: 14,
        status: "Active",
        displayOrder: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "plan-003",
        planCode: "PLAN003",
        planName: "Enterprise Plan",
        description: "Custom solutions for large organizations",
        amount: 499.0,
        billingCycle: "Monthly",
        currency: "USD",
        price: 499.0,
        setupFee: 50.0,
        trialDays: 0,
        gracePeriodDays: 30,
        status: "Inactive",
        displayOrder: 3,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    store.setPlans(plans)
  }

  // Seed Tenants
  if (store.tenants.length === 0) {
    const tenants: Tenant[] = [
      {
        id: "tenant-001",
        tenantId: "T001",
        tenantName: "Global Corp",
        contactPerson: "John Doe",
        email: "john.doe@globalcorp.com",
        phone: "123-456-7890",
        address: "123 Main St",
        city: "Anytown",
        state: "CA",
        zipCode: "90210",
        country: "USA",
        status: "Active",
        subscriptionStatus: "Active",
        ownerName: "John Doe",
        ownerEmail: "john.doe@globalcorp.com",
        ownerPhone: "123-456-7890",
        ownerType: "Company",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "tenant-002",
        tenantId: "T002",
        tenantName: "Tech Solutions",
        contactPerson: "Jane Smith",
        email: "jane.smith@techsol.com",
        phone: "555-123-4567",
        address: "456 Oak Ave",
        city: "Tech City",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        status: "Active",
        subscriptionStatus: "Expired",
        ownerName: "Jane Smith",
        ownerEmail: "jane.smith@techsol.com",
        ownerPhone: "555-123-4567",
        ownerType: "Company",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "tenant-003",
        tenantId: "T003",
        tenantName: "Innovate Ltd",
        contactPerson: "Peter Jones",
        email: "peter.jones@innovate.com",
        phone: "555-987-6543",
        address: "789 Pine Ln",
        city: "Innovation",
        state: "TX",
        zipCode: "75001",
        country: "USA",
        status: "Inactive",
        subscriptionStatus: "Pending",
        ownerName: "Peter Jones",
        ownerEmail: "peter.jones@innovate.com",
        ownerPhone: "555-987-6543",
        ownerType: "Indv",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    store.setTenants(tenants)
  }
}
