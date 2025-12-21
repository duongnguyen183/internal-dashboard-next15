# Internal Dashboard (Next.js 15)

Internal dashboard demo application built with **Next.js 15** to practice real-world development patterns such as routing, CRUD, API Routes, and responsive UI.

This project is created as a **learning & evaluation project** to reach practical working-level skills with Next.js.

---

## 1. Overview

The application simulates a simple **internal order management system**, allowing users to:

- View a list of orders
- Create, edit, and delete orders
- Navigate to order detail pages
- Experience loading, error, and empty states

---

## 2. Tech Stack

- **Next.js 15** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **API Routes (Route Handlers)**
- **Vercel** (deployment)

---

## 3. Features

- CRUD operations for orders
- Pagination & search
- Dynamic routing (`/dashboard/orders/[id]`)
- Client & Server Components
- API Routes for data handling
- Loading & error states
- Responsive UI (desktop & mobile)
- Toast notification & confirm modal

---

## 4. Routing Structure

```txt
app/
├─ (dashboard)/
│  └─ dashboard/
│     ├─ orders/
│     │  ├─ page.tsx          # Order list
│     │  └─ [id]/
│     │     └─ page.tsx       # Order detail
│     └─ layout.tsx
├─ api/
│  └─ orders/
│     ├─ route.ts             # GET / POST
│     └─ [id]/
│        └─ route.ts          # GET / PUT / DELETE
```
