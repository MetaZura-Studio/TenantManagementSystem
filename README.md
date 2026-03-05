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
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── tenants/          # Tenant management pages
│   ├── branches/         # Branch management pages
│   ├── plans/            # Plan management pages
│   ├── tenant-subscriptions/  # Subscription pages
│   ├── users/            # User management pages
│   ├── roles/            # Role management pages
│   ├── invoices/         # Invoice management pages
│   ├── payments/         # Payment pages
│   ├── currency/         # Currency lookup page
│   └── settings/         # Settings page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── ...              # Custom components
├── lib/                  # Utilities and configurations
│   ├── api/             # API simulation layer
│   ├── store/           # Zustand stores
│   ├── types.ts         # TypeScript types
│   └── schemas.ts       # Zod schemas
└── hooks/               # Custom React hooks
```

## Data Storage

The application uses an in-memory store with localStorage persistence. All data is stored locally in the browser and persists across page refreshes.

## License

MIT
