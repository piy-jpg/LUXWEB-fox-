# Lumière Beauty — Full-Stack Project

Welcome to the **Lumière Beauty** luxury cosmetics, skincare, and fragrance project repository.

## Architecture Overview

This project is organized into four distinct architectural layers, designed for maintainability, scalability, and developer clarity:

```text
/Applications/schooly/
├── frontend/                     # Client-side static application
│   ├── css/                      # Stylesheets (shared, pages)
│   ├── js/                       # Client JavaScript modules
│   ├── images/                   # Media assets
│   └── *.html                    # HTML page templates
│
├── backend/                      # Node.js / Express API layer
│   ├── config/                   # App configuration & DB connections
│   ├── controllers/              # Business logic & request handlers
│   ├── models/                   # Data models
│   ├── routes/                   # API endpoint routing
│   └── middleware/               # Express middleware (logging, errors)
│
├── database/                     # Database management
│   ├── schemas/                  # Relational database schemas
│   ├── migrations/               # Versioned migration SQL scripts
│   └── seeds/                    # Seed datasets (SQL & JSON)
│
└── other/                        # Supporting materials & tooling
    ├── docs/                     # Architecture & API specifications
    ├── design/                   # Brand style guides & design tokens
    └── scripts/                  # Automation & setup scripts
```

## Quick Start Guide

### 1. Frontend
To preview the frontend locally:
```bash
# Using Python
python3 -m http.server 8000 --directory frontend

# Or using Node
npx serve frontend
```
Visit `http://localhost:8000` to interact with the luxury storefront.

### 2. Backend API
To run the backend server:
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
The server will start on `http://localhost:5000` by default.

### 3. Database
See [database/README.md](database/README.md) for instructions on applying migrations and seeding the database.

---
For detailed documentation on each layer, refer to:
- [Frontend Guide](frontend/README.md)
- [Backend Guide](backend/README.md)
- [Database Guide](database/README.md)
- [Documentation & Tools Guide](other/README.md)
