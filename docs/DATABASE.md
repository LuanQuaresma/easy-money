# Database Schema (Phase 2)

PostgreSQL + Prisma. All monetary values stored as `Decimal(12, 2)` in BRL.

## Entities

| Model | Purpose |
|-------|--------|
| **User** | NextAuth user (id, email, name, image) |
| **Account** | OAuth provider accounts (NextAuth) |
| **Session** | User sessions (NextAuth) |
| **VerificationToken** | Email verification (NextAuth) |
| **Category** | Expense categories; type = NECESSITY \| LIFESTYLE \| INVESTMENT (50/30/20) |
| **Transaction** | Unified ledger: income/expense movements, optional link to expense/fixedIncome/freelancePayment |
| **FixedIncome** | Recurring income (salary, rent): name, amount, frequency, paymentDay |
| **FreelancePayment** | Variable income: client, project, amount, workDate, expectedPaymentDate, status (PENDING \| INVOICED \| RECEIVED \| OVERDUE) |
| **Expense** | Expense entry: name, category, amount, dueDate, recurring, paymentStatus (PAID \| PENDING \| OVERDUE) |
| **BudgetRule** | 50/30/20 per user: necessityPercent, lifestylePercent, investmentPercent |
| **FinancialInsight** | Stored insights (e.g. "Você gastou 20% mais em restaurantes") |
| **InvestmentSimulation** | Saved simulator inputs: monthlyAmount, interestRate, years (result computed on read) |

## Relations

- All finance data is scoped by `userId` (multi-tenant).
- Category → many Expenses, many Transactions.
- Transaction can optionally reference one Expense, FixedIncome, or FreelancePayment.
- BudgetRule is one per user (default 50/30/20).

## Migrations

```bash
# Create and apply migration
npm run db:migrate

# Push schema without migration files (dev)
npm run db:push
```

## Indexes

- `Transaction`: (userId, date), (userId, type)
- `Expense`: (userId, dueDate), (userId, paymentStatus)
- `FreelancePayment`: (userId, status)
- `FinancialInsight`, `InvestmentSimulation`: (userId)
