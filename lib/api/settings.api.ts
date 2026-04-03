import { useStore } from "../store"
import type { Settings } from "@/features/settings/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function nowIso() {
  return new Date().toISOString()
}

function defaultSettings(): Settings[] {
  const now = nowIso()
  return [
    // General
    {
      id: "setting-general-companyName",
      key: "companyName",
      value: "Company Name",
      category: "general",
      label: "Company name",
      type: "text",
      description: "Used on PDFs/receipts and app branding.",
      updatedAt: now,
    },
    {
      id: "setting-general-supportEmail",
      key: "supportEmail",
      value: "support@example.com",
      category: "general",
      label: "Support email",
      type: "email",
      description: "Shown in receipts and exported PDFs.",
      updatedAt: now,
    },

    // Billing
    {
      id: "setting-billing-baseCurrency",
      key: "baseCurrency",
      value: "KWD",
      category: "billing",
      label: "Base currency",
      type: "text",
      description: "The system base currency (reports and exchange rates anchor).",
      updatedAt: now,
    },
    {
      id: "setting-billing-taxRate",
      key: "taxRate",
      value: "0",
      category: "billing",
      label: "Default tax rate (%)",
      type: "number",
      description: "Default invoice tax rate when creating invoices (can be overridden).",
      updatedAt: now,
    },

    // Invoice
    {
      id: "setting-invoice-prefix",
      key: "invoicePrefix",
      value: "INV-",
      category: "invoice",
      label: "Invoice prefix",
      type: "text",
      description: "Prefix used when generating invoice numbers/codes.",
      updatedAt: now,
    },
    {
      id: "setting-invoice-terms",
      key: "invoiceTerms",
      value: "Payment due within 7 days.",
      category: "invoice",
      label: "Default invoice terms",
      type: "text",
      description: "Shown on invoice PDF exports.",
      updatedAt: now,
    },

    // Security
    {
      id: "setting-security-sessionHours",
      key: "sessionHours",
      value: "8",
      category: "security",
      label: "Session duration (hours)",
      type: "number",
      description: "How long a login session remains valid.",
      updatedAt: now,
    },

    // Features
    {
      id: "setting-features-whatsappSend",
      key: "enableWhatsappSend",
      value: "true",
      category: "features",
      label: "Enable WhatsApp send",
      type: "text",
      description: "If disabled, invoice send flow will hide WhatsApp option.",
      updatedAt: now,
    },

    // Forms (required fields matrix)
    {
      id: "setting-forms-requiredFields",
      key: "requiredFields",
      value: JSON.stringify(
        {
          tenants: {
            tenantCode: true,
            slug: true,
            shopNameEn: true,
            shopNameAr: true,
            ownerName: true,
            ownerEmail: true,
            ownerMobile: true,
            tenantType: true,
            invoicePrefix: true,
            logo: false,
            contactPerson: true,
            address: true,
            city: true,
            zipCode: true,
            country: true,
            timezone: true,
            subscriptionStatus: true,
            subscriptionStartDate: false,
            subscriptionEndDate: false,
            lockedAt: false,
            suspensionReason: false,
          },
          users: {
            tenantId: true,
            branchId: false,
            roleId: true,
            username: true,
            email: true,
            mobile: true,
            password: true,
            fullNameEn: true,
            fullNameAr: true,
            status: true,
            address: false,
            zipCode: false,
            country: false,
          },
          plans: {
            planCode: true,
            nameEn: true,
            nameAr: true,
            description: false,
            billingCycle: true,
            currencyCode: true,
            monthlyPrice: true,
            yearlyPrice: true,
            maxBranches: true,
            maxUsers: true,
            featuresJson: false,
            isActive: false,
          },
          tenantSubscriptions: {
            tenantId: true,
            planId: true,
            status: true,
            startDate: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            billingCurrency: true,
            unitPrice: true,
            endDate: false,
            discountAmount: false,
            discountPercent: false,
            autoRenew: false,
            cancelAtPeriodEnd: false,
            canceledAt: false,
            trialStart: false,
            trialEnd: false,
            notes: false,
          },
        },
        null,
        2
      ),
      category: "forms",
      label: "Form required fields",
      type: "textarea",
      description: "Controls which fields are required across the app forms (per form).",
      updatedAt: now,
    },
  ]
}

export const settingsApi = {
  getAll: async (): Promise<Settings[]> => {
    await delay(300)
    const store = useStore.getState()
    const defaults = defaultSettings()

    // Seed if empty; otherwise merge in any new default settings that were added later
    // (so existing installs pick up new categories like "forms").
    if (store.settings.length === 0) {
      store.setSettings(defaults)
      return defaults
    }

    const byKey = new Map<string, Settings>()
    for (const s of store.settings) {
      byKey.set(`${s.category}.${s.key}`, s)
    }

    let changed = false
    const merged: Settings[] = [...store.settings]
    for (const d of defaults) {
      const k = `${d.category}.${d.key}`
      if (!byKey.has(k)) {
        merged.push(d)
        changed = true
      }
    }

    if (changed) store.setSettings(merged)
    return merged
  },
  update: async (key: string, value: string, category: string): Promise<void> => {
    await delay(400)
    useStore.getState().updateSetting(key, value, category)
  },
}
