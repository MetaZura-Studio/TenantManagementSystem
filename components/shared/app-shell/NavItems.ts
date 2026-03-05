import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  FileText,
  DollarSign,
  Settings,
  Shield,
  Globe,
} from "lucide-react"

export interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tenant Management",
    icon: Building2,
    children: [
      { title: "Tenants List", href: "/tenants", icon: Users },
      { title: "Create Tenant", href: "/tenants/new", icon: Users },
      { title: "Branches", href: "/branches", icon: Building2 },
    ],
  },
  {
    title: "Plans & Subscriptions",
    icon: CreditCard,
    children: [
      { title: "Plans List", href: "/plans", icon: CreditCard },
      { title: "Tenant Subscription", href: "/tenant-subscriptions", icon: CreditCard },
    ],
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Roles",
    href: "/roles",
    icon: Shield,
  },
  {
    title: "Invoice Management",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: DollarSign,
  },
  {
    title: "Currency Lookup",
    href: "/currency",
    icon: Globe,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]
