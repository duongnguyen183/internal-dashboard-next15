# Internal Dashboard (Next.js)

Demo internal dashboard to showcase routing, CRUD, loading/error states, and cookie-based auth.

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Route Handlers (API)

## Features

- Login / Logout (demo cookie auth)
- Dashboard layout with sidebar + topbar
- Orders CRUD:
  - List + search + pagination
  - Create new order
  - Order detail + edit
  - Delete
- Loading / error states

## Routing

- Public
  - `/` (public home)
  - `/login`
- Protected (requires cookie `auth=true`)
  - `/dashboard`
  - `/dashboard/orders`
  - `/dashboard/orders/new`
  - `/dashboard/orders/[id]`

## Auth flow (demo)

- Login page calls `POST /api/auth` → sets cookie `auth=true`
- Dashboard layout checks cookie via `cookies()` and redirects to `/login` if missing
- Logout uses `/api/auth/logout` to clear cookie

## SSR vs Client Components

- Dashboard layout / pages are Server Components by default
- Orders list page uses `"use client"` because it needs interactivity (search, modal, optimistic UI)
- Order detail page fetches data on server and passes to `OrderEditorClient` (client) for editing

## API design

- `GET /api/orders?q=&page=&limit=` list orders
- `POST /api/orders` create order
- `GET /api/orders/[id]` get one order (supports internal id or OD-xxxx)
- `PUT /api/orders/[id]` update
- `DELETE /api/orders/[id]` delete

## Development

```bash
npm install
npm run dev
```
