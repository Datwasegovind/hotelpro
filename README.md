# HotelPro — Smart Restaurant Table Booking & Billing ERP System

A full-featured restaurant management ERP built with **React 18**, **React Router DOM**,
**Context API**, and **Bootstrap 5**. Data is persisted in the browser via **localStorage**,
seeded from JSON fixtures, so the whole app runs with zero backend setup.

Theme: a luxury boutique-hotel palette — onyx black, antique gold, ivory — with
Playfair Display for headings and Inter for body text.

---

## 1. Installation

Requirements: **Node.js 18+** and npm.

```bash
# 1. Unzip the project, then from the project root:
npm install

# 2. Start the dev server
npm run dev
# → opens http://localhost:5173

# 3. Production build
npm run build

# 4. Preview the production build locally
npm run preview
```

## 2. Demo Logins

The app seeds two accounts on first run (see `src/data/users.json`):

| Role     | Email                | Password      |
|----------|-----------------------|---------------|
| Admin    | admin@hotelpro.com    | admin123      |
| Customer | rohan@example.com     | customer123   |

The Login page also has **"Use Admin Demo" / "Use Guest Demo"** buttons that
autofill these credentials. New guests can also self-register from `/register`.

## 3. What's Implemented

**Public / Customer site**
- Home page — hero, popular dishes, guest reviews
- Menu — category/search filters, live cart, table selection, place order
- Table booking — date/time/guest count, live availability check, conflict prevention
- My Orders — order history, reservation history, past bills
- Auth — login, registration, role-based redirect, protected routes

**Admin ERP** (`/admin/...`, requires an ADMIN login)
- Dashboard — table/reservation/revenue stats, occupancy %, menu mix, recent activity
- Table Management — CRUD, visual floor layout with live color-coded status
- Reservations — confirm / cancel / complete bookings, search & filter
- Food Orders — POS-style order builder, kitchen status pipeline, per-order billing shortcut
- Menu Management — CRUD across 6 categories, availability toggle
- Billing — GST (5%) + service charge (5%) + discount, printable/PDF-able invoice, billing history
- Payments — transaction ledger, totals by payment method
- Employees — CRUD staff records with role & salary
- Customers — CRUD guest records, booking/order history lookup
- Reports — revenue, top-selling dishes, payment mix, booking status breakdown

## 4. Project Structure

```
src/
  assets/            (add product images here if desired)
  components/        Navbar, Sidebar, AdminLayout, Modal, StatCard, StatusBadge...
  pages/             Home, Login, Register, Menu, Booking, MyOrders
  pages/admin/       Dashboard, Tables, Bookings, Orders, MenuAdmin, Billing,
                     Payments, Employees, Customers, Reports
  context/           AuthContext, CartContext, ToastContext
  services/          storageService.js  (localStorage data layer)
  data/              tables.json, menu.json, customers.json, orders.json,
                     employees.json, bookings.json, bills.json, payments.json,
                     users.json, reviews.json
  utils/             validation.js (form rules, currency/date formatting)
  styles/            theme.css (design tokens)
  App.jsx, main.jsx
```

## 5. Data Handling

All CRUD operations go through `src/services/storageService.js`, a small wrapper
around `localStorage` with `getAll / getById / find / insert / update / remove /
resetAll`. Each collection is namespaced as `hotelpro_<collection>` and seeded
once from the matching file in `src/data/`.

To reset all demo data back to the seed state, open the browser console and run:
```js
localStorage.clear(); location.reload();
```

## 6. Future Backend Integration

The data layer is intentionally shaped like a REST client so it can be swapped
for real HTTP calls without touching the UI components. Suggested stack:

- **Backend:** Java Spring Boot REST API
- **Database:** MySQL
- **Planned endpoints:**
  `/api/users` `/api/customers` `/api/tables` `/api/menu`
  `/api/orders` `/api/bills` `/api/payments`

To migrate, replace the internals of `storageService.js` (`getAll`, `insert`,
`update`, `remove`) with `fetch`/`axios` calls to these endpoints — the page
components only call `db.*` methods, so no other file needs to change.

## 7. Notes for Portfolio Use

- Colors, type scale and the gold "seal" monogram are defined once in
  `src/styles/theme.css` as CSS variables — easy to re-theme.
- Forms use a shared `validate()` helper (`src/utils/validation.js`) so new
  fields follow the same pattern as existing ones.
- Every admin module follows the same CRUD + modal + toast pattern, so new
  modules (e.g. Inventory, Loyalty Points) can be added quickly by copying
  `pages/admin/Customers.jsx` as a template.
