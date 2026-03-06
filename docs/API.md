# API Structure (Phase 3)

Request flow: **Route → Controller → Service → Repository → Prisma**.

## Auth (development)

Until Phase 4 (NextAuth), pass the user id via header:

- `x-user-id: <cuid>` — required for all protected endpoints.

Or set `DEV_USER_ID` in `.env` to a valid user id for development.

## Endpoints

### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/categories` | List categories for the current user |
| POST | `/api/categories` | Create category `{ name, type: "NECESSITY" \| "LIFESTYLE" \| "INVESTMENT" }` |

### Expenses

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/expenses` | List expenses. Query: `paymentStatus`, `fromDate`, `toDate` |
| POST | `/api/expenses` | Create expense `{ name, categoryId, amount, dueDate, recurring?, paymentStatus? }` |
| GET | `/api/expenses/[id]` | Get one expense |
| PATCH | `/api/expenses/[id]` | Update payment status `{ paymentStatus }` |
| DELETE | `/api/expenses/[id]` | Delete expense |

### Transactions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/transactions` | List transactions. Query: `type`, `fromDate`, `toDate` |
| POST | `/api/transactions` | Create transaction `{ amount, date, type: "INCOME" \| "EXPENSE", description?, categoryId?, ... }` |
| GET | `/api/transactions/[id]` | Get one transaction |
| DELETE | `/api/transactions/[id]` | Delete transaction |

## Response format

- Success: `200` or `201` with JSON body (entity or array).
- Error: `4xx`/`5xx` with `{ code, message, details? }`. Codes: `UNAUTHORIZED`, `BAD_REQUEST`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`.

## Folder mapping

- `app/api/**/route.ts` → HTTP handler, calls controller.
- `lib/controllers/*` → Parse request, validate (Zod), call service, return `apiSuccess` / `apiError`.
- `lib/services/*` → Business logic, call repositories.
- `lib/repositories/*` → Prisma queries, user-scoped.
