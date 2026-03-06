# Authentication (Phase 4)

NextAuth v4 with **Credentials** provider (email + password) and **JWT** session strategy.

## Setup

1. Set in `.env`:
   - `NEXTAUTH_URL` — e.g. `http://localhost:3000`
   - `NEXTAUTH_SECRET` — e.g. `openssl rand -base64 32`
   - `DATABASE_URL` — PostgreSQL (used by Prisma adapter and register)

2. Run migrations so `users` has `passwordHash` (optional for credentials users).

## Flow

- **Register:** `POST /api/auth/register` → creates `User` with `passwordHash` (bcrypt).
- **Login:** User signs in with email/password → NextAuth Credentials provider validates → JWT stored in cookie.
- **Protected API:** Controllers call `getSessionUserId(request)` which uses `getToken({ req: request })` to read the JWT and return `userId`.

## Routes

| Path | Description |
|------|-------------|
| `/login` | Login form (redirects to `callbackUrl` or `/dashboard`) |
| `/register` | Registration form |
| `/dashboard` | Protected; redirects to `/login` if not authenticated |
| `/api/auth/[...nextauth]` | NextAuth handlers (signin, signout, session, etc.) |
| `/api/auth/register` | Create account (email, password, name) |

## Session in API

In Route Handlers, the request is passed to controllers so they can call `getSessionUserId(request)`. The JWT cookie is sent by the browser on same-origin requests.
