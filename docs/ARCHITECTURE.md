# Easy Money — Product Architecture

## Vision

Modern personal finance platform focused on **financial clarity**, **automation**, and **visual insights**. Users should understand their financial situation in under 5 seconds when opening the app.

- **Mobile-first**, responsive for desktop  
- **Language:** UI in Brazilian Portuguese (pt-BR), code in English  
- **Currency:** BRL (R$ 1.500,00 format)  
- **i18n:** Prepared for internationalization, default locale `pt-BR`

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                         │
│  App Router │ React │ TypeScript │ Tailwind │ Shadcn UI │ Recharts │
├─────────────────────────────────────────────────────────────────┤
│  app/           → Routes, layouts, pages                          │
│  components/    → UI components, layout, dashboard               │
│  lib/           → Utils, i18n, shared logic                       │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API LAYER (Next.js API Routes)               │
│  controllers/   → HTTP handlers, request/response                 │
│  services/      → Business logic, orchestration                   │
│  repositories/  → Data access, Prisma queries                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                    │
│  Prisma ORM │ PostgreSQL │ NextAuth (sessions/users)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Principles

1. **Separation of concerns:** Controllers → Services → Repositories  
2. **Clean code:** Single responsibility, small modules  
3. **SaaS-ready:** Multi-user, auth, cloud DB, future plans (subscriptions, premium, mobile)

---

## Module Map

| Module              | Purpose                                      |
|---------------------|----------------------------------------------|
| Dashboard (Painel)   | Summary cards, charts, 50/30/20, alerts      |
| Income (Receitas)   | Fixed + variable (freelancer) income         |
| Expenses (Despesas) | Expenses, categories, recurring, status     |
| Budget (Orçamento)  | 50/30/20 rule, limits, progress              |
| Cashflow Timeline   | Upcoming expenses/incomes, projections       |
| Freelancer Tracker  | Payments by client, status, totals           |
| Insights (AI)       | Smart insights, predictions                  |
| Prediction          | End-of-month balance, projections            |
| Investment Simulator| Monthly amount, rate, years → future value   |
| Calendar            | Due dates, payments, recurring               |

---

## Folder Structure

```
easy-money/
├── app/
│   ├── [locale]/              # i18n routes (future)
│   ├── (auth)/                # Auth routes (login, register)
│   ├── (dashboard)/           # Protected dashboard routes
│   ├── api/                   # API routes → controllers
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # Shadcn + base components
│   ├── layout/                # Header, sidebar, shell
│   └── dashboard/             # Dashboard-specific components
├── lib/
│   ├── controllers/           # API request handlers
│   ├── services/              # Business logic
│   ├── repositories/          # Prisma / data access
│   ├── utils/                 # Helpers (cn, currency, etc.)
│   ├── i18n/                  # Translations (pt-BR, etc.)
│   └── db.ts                  # Prisma client singleton
├── prisma/
│   └── schema.prisma          # Database schema
├── types/
│   └── index.ts               # Shared TypeScript types
├── docs/
│   └── ARCHITECTURE.md        # This file
└── public/
```

---

## Data Flow

1. **Request** → Next.js API route (`app/api/...`)  
2. **Controller** → Validates input, calls service  
3. **Service** → Business rules, calls repository(ies)  
4. **Repository** → Prisma queries, returns entities  
5. **Response** → JSON back to frontend  

---

## Security & Auth

- **NextAuth:** Sessions, credentials or OAuth  
- **Authorization:** User-scoped data (all queries filtered by `userId`)  
- **Env:** `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`  

---

## Next Phases

1. ~~Architecture + folder structure~~  
2. ~~Database schema (Prisma + PostgreSQL)~~  
3. Backend API structure  
4. Authentication (NextAuth)  
5. Frontend layout + i18n  
6. Dashboard UI  
7. Finance modules (income, expenses, budget)  
8. Insights system  
