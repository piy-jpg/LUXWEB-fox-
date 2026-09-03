# Lumière Beauty — System Architecture

High-level architecture documentation for the Lumière full-stack platform.

---

## 1. System Topology

```
+-------------------------------------------------------------+
|                      Client Browser                         |
|  - HTML5 / CSS3 / Vanilla ES6 (Clean Modern Luxury UI)      |
|  - LocalStorage (Cart & Wishlist persistence)               |
+-------------------------------------------------------------+
                              |
                     REST API | JSON (HTTP/HTTPS)
                              v
+-------------------------------------------------------------+
|                      Backend Service                        |
|  - Node.js & Express                                        |
|  - Middlewares: CORS, Request Logger, Error Handler        |
|  - Controllers: Products, Cart, Reviews                     |
|  - Business Logic & Cart Total Computation                  |
+-------------------------------------------------------------+
                              |
                    PostgreSQL / Database Client
                              v
+-------------------------------------------------------------+
|                      Database Layer                         |
|  - Tables: Categories, Products, Reviews, Orders            |
|  - Versioned Migrations & Seed Data                         |
+-------------------------------------------------------------+
```

---

## 2. Directory Responsibilities

| Directory | Purpose | Primary Tech |
|-----------|---------|--------------|
| `frontend/` | Storefront UI, luxury branding, responsive layouts | HTML5, CSS3, ES6 JavaScript |
| `backend/` | Application server, business rules, REST API | Node.js, Express.js |
| `database/` | Relational data persistence, schemas, migrations | SQL (PostgreSQL/MySQL), JSON |
| `other/` | Documentation, design tokens, operational scripts | Markdown, Shell scripts |
