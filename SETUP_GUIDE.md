# LUMIÈRE LUXURY BEAUTY — Production Setup & Architecture Guide

Welcome to the **Lumière** Haute Beauty E-Commerce platform. This document covers complete instructions for local development, relational database configuration, authentication security, role-based access control (RBAC), inventory transaction management, and production cloud deployment.

---

## 1. System Architecture Overview

```
                               ┌──────────────────────────────────────────────┐
                               │             LUMIÈRE CLIENT LAYER             │
                               └──────────────────────┬───────────────────────┘
                                                      │
                    ┌─────────────────────────────────┼─────────────────────────────────┐
                    ▼                                 ▼                                 ▼
         ┌─────────────────────┐           ┌─────────────────────┐           ┌─────────────────────┐
         │ Storefront Pages    │           │ Customer Account    │           │ Admin / Staff Portal│
         │ - index.html        │           │ - auth.html         │           │ - /admin/index.html │
         │ - shop.html         │           │ - account.html      │           │ - /admin/products   │
         │ - new-arrivals.html │           │   * Orders & Track  │           │ - /admin/inventory  │
         │ - collections.html  │           │   * Addresses CRUD  │           │ - /admin/orders     │
         │ - about.html        │           │   * Wishlist sync   │           │ - /admin/customers  │
         │ - reviews.html      │           │   * Profile & Pass  │           │ - /admin/staff (RBAC│
         └──────────┬──────────┘           └──────────┬──────────┘           │ - /admin/analytics  │
                    │                                 │                      │ - /admin/settings   │
                    │                                 │                      └──────────┬──────────┘
                    └─────────────────────────────────┼─────────────────────────────────┘
                                                      │ HTTP / REST API (JWT Bearer / Session)
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │           EXPRESS.JS BACKEND API             │
                               │  - Rate Limiting & Helmet Security           │
                               │  - Auth & Password Hashing (bcrypt)          │
                               │  - RBAC Middleware (roles & permissions)     │
                               │  - Transactional Inventory Service           │
                               │  - Audit Logger Middleware                   │
                               └──────────────────────┬───────────────────────┘
                                                      │
                               ┌──────────────────────┴───────────────────────┐
                               │           RELATIONAL DATABASE LAYER          │
                               │  PostgreSQL (Prod) / SQLite (Local Dev)      │
                               │  18 Tables with FKs, Indexes & Constraints   │
                               └──────────────────────────────────────────────┘
```

---

## 2. Pre-Configured Demo Credentials

The database comes pre-seeded with 5 accounts ready for instant testing:

| Role | Email | Password | Permissions & Access Scope |
| :--- | :--- | :--- | :--- |
| **OWNER** | `owner@lumiere.com` | `LumiereOwner2026!` | **Full Superuser** (all 12 permissions): Products, Inventory, Orders, Clients, Staff RBAC, Analytics, System Settings & Audit Logs |
| **MANAGER** | `manager@lumiere.com` | `Lumiere2026!` | Products, Inventory adjustments, Orders, Clients, Analytics (*Staff & Store Settings locked*) |
| **INVENTORY_STAFF** | `inventory@lumiere.com` | `Lumiere2026!` | Real-time stock status, physical stock adjustments, stock history (*Orders & Staff locked*) |
| **ORDER_STAFF** | `orders@lumiere.com` | `Lumiere2026!` | Order status pipeline, tracking numbers, packing & customer directory (*Staff & Settings locked*) |
| **CUSTOMER** | `customer@lumiere.com` | `Lumiere2026!` | Personal client portal (`/account.html`), orders & live tracking, wishlist sync, addresses (*Strictly locked out of `/admin`*) |

---

## 3. Environment Variables Configuration

Create or update `backend/.env`:

```ini
# Server Port
PORT=5001
NODE_ENV=development

# JWT Secret Key (generate a strong 64-char key in production)
JWT_SECRET=lumiere_luxury_secret_jwt_key_2026

# Database Connection
# Leave empty for zero-config local SQLite (persisted at database/lumiere.db)
# Provide standard connection string for PostgreSQL (Supabase, Neon, RDS, etc.)
# DATABASE_URL=postgresql://user:password@ep-host.neon.tech/lumiere?sslmode=require

# Email Notifications (Optional for order dispatch emails)
GMAIL_USER=piyushverma730929@gmail.com
GMAIL_APP_PASS=rkpccfpucbdqmwqs
ATELIER_CONCIERGE_EMAIL=piyushverma730929@gmail.com
```

---

## 4. How to Run Locally

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Initialize Database & Seed Catalog
The initialization runner verifies the 18-table schema, seeds the 5 default users, 12 permissions, 51 luxury products with initial stock, and sample orders:
```bash
node database/init.js
```

### 3. Run the Automated Verification Suite
Verify database integrity, RBAC security gates, and inventory concurrency:
```bash
node test_suite.js
```

### 4. Start the Application Server
```bash
node server.js
```
The server will start at `http://localhost:5001`.

### 5. Access the Platform
- **Storefront Boutique**: `http://localhost:5001`
- **Customer Authentication**: `http://localhost:5001/auth.html`
- **Customer Client Atelier**: `http://localhost:5001/account.html`
- **Executive Admin Portal**: `http://localhost:5001/admin/index.html`

---

## 5. Relational Database Schema (18 Tables)

The schema is defined in [`database/schemas/schema.sql`](database/schemas/schema.sql):

1. **`roles`**: System roles (`OWNER`, `MANAGER`, `INVENTORY_STAFF`, `ORDER_STAFF`, `CUSTOMER`).
2. **`permissions`**: Fine-grained permissions (`products.view`, `products.create`, `products.edit`, `products.delete`, `inventory.view`, `inventory.adjust`, `orders.view`, `orders.update`, `customers.view`, `analytics.view`, `staff.manage`, `settings.manage`).
3. **`role_permissions`**: Many-to-many relationship mapping roles to specific permission codes.
4. **`users`**: Customer and personnel accounts with bcrypt password hashes, reset tokens, and timestamps.
5. **`user_roles`**: Many-to-many relationship mapping users to roles.
6. **`categories`**: Skincare, Makeup, Fragrance, Bath & Body, Sets.
7. **`collections`**: The Golden Aura Collection, Velvet Noir Édit, Rose de Grasse, etc.
8. **`products`**: Catalog items with unique SKUs, slugs, pricing, compare-at prices, category FKs, badges, and review scores.
9. **`product_images`**: Multi-image support per product with display ordering and primary flags.
10. **`product_variants`**: Shade, size, and formulation variants with SKU overrides.
11. **`inventory`**: Real-time physical stock (`stock_quantity`), reserved quantity (`reserved_quantity`), and threshold. Available stock is calculated as `stock_quantity - reserved_quantity`.
12. **`inventory_transactions`**: Audit trail of every stock modification (`STOCK_RECEIVED`, `ORDER_RESERVED`, `ORDER_COMPLETED`, `ORDER_CANCELLED`, `REFUND`, `DAMAGED`, `MANUAL_ADJUSTMENT`), recording delta, balance after, reference ID, reason, and operator.
13. **`orders`**: Customer orders with tracking numbers, status (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`, `Refunded`), payment status, and delivery addresses.
14. **`order_items`**: Line items linked to orders and catalog products.
15. **`addresses`**: Saved customer shipping and billing addresses.
16. **`wishlists`**: Customer wishlists.
17. **`wishlist_items`**: Saved wishlist products.
18. **`audit_logs`**: System-wide security audit trail tracking admin modifications, operator emails, roles, and JSON change payloads.

---

## 6. Strict Role-Based Access Control (RBAC) Matrix

| Permission Code | Description | OWNER | MANAGER | INVENTORY_STAFF | ORDER_STAFF | CUSTOMER |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `products.view` | View catalog products | **Yes** | **Yes** | **Yes** | **Yes** | No |
| `products.create` | Create new products | **Yes** | **Yes** | No | No | No |
| `products.edit` | Edit catalog items | **Yes** | **Yes** | No | No | No |
| `products.delete` | Archive catalog items | **Yes** | **Yes** | No | No | No |
| `inventory.view` | View real-time stock balances | **Yes** | **Yes** | **Yes** | No | No |
| `inventory.adjust` | Execute manual stock adjustments | **Yes** | **Yes** | **Yes** | No | No |
| `orders.view` | View customer orders | **Yes** | **Yes** | No | **Yes** | No |
| `orders.update` | Update order status & tracking | **Yes** | **Yes** | No | **Yes** | No |
| `customers.view` | View customer directory & spend | **Yes** | **Yes** | No | **Yes** | No |
| `analytics.view` | View revenue, AOV & sales trends | **Yes** | **Yes** | No | No | No |
| `staff.manage` | Provision staff & configure RBAC | **Yes** | No | No | No | No |
| `settings.manage` | Store configuration & audit logs | **Yes** | No | No | No | No |

> **Security Rule**: Customers attempting to access `/admin/*` or any administrative API `/api/admin/*` receive an immediate `403 Forbidden` response and are redirected to their customer portal.

---

## 7. Transactional Inventory & Overselling Prevention

All stock operations are encapsulated inside atomic database transactions (`db.transaction`):

1. **Order Placement (`ORDER_RESERVED`)**:
   - Reads available stock: `(stock_quantity - reserved_quantity)`.
   - If requested quantity exceeds available stock, the transaction aborts and returns an `Insufficient stock` error.
   - Increases `reserved_quantity`, keeping physical stock untouched until packing.
2. **Order Dispatch (`ORDER_COMPLETED`)**:
   - Order marked `Shipped` or `Delivered`.
   - Decrements both `stock_quantity` and `reserved_quantity`.
3. **Order Cancellation (`ORDER_CANCELLED` / `REFUND`)**:
   - If order was in `Pending`/`Confirmed`/`Processing`, releases `reserved_quantity`.
   - If order was already `Shipped`/`Delivered`, adds returned quantity back to `stock_quantity` under reason `REFUND`.
4. **Physical Adjustment (`STOCK_RECEIVED` / `DAMAGED` / `MANUAL_ADJUSTMENT`)**:
   - Enforces `stock_quantity + delta >= 0` to prevent negative inventory balances.

---

## 8. Deploying to Production (Vercel & PostgreSQL)

### Step 1: Provision a Cloud PostgreSQL Database
Create a free database on [Neon.tech](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres].
Copy the connection URI:
`postgresql://postgres:password@ep-host.neon.tech/lumiere?sslmode=require`

### Step 2: Set Production Environment Variables
In your Vercel Project Dashboard (or hosting provider):
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A secure 64-character random string.
- `NODE_ENV`: `production`

### Step 3: Run Seed Migration on Production
Run the initialization once to create all tables and initial catalog:
```bash
DATABASE_URL="your-neon-postgres-url" node backend/database/init.js
```

### Step 4: Deploy
Deploy via Vercel CLI or Git push:
```bash
git push origin main
```
The application will automatically switch to PostgreSQL and serve the full luxury platform!
