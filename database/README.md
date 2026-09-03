# Lumière Beauty — Database Architecture

This directory houses the database schema, versioned migrations, and initial seed datasets for the Lumière platform.

## Directory Structure

```text
database/
├── schemas/
│   └── schema.sql        # Full DDL schema (PostgreSQL / MySQL compatible)
├── migrations/           # Incremental versioned migration files
│   ├── 001_create_products.sql
│   ├── 002_create_reviews.sql
│   └── 003_create_orders.sql
├── seeds/                # Seed data for development & testing
│   ├── seed_products.sql # SQL inserts for 12 core luxury beauty products
│   └── seed_products.json# JSON representation of catalog
└── README.md             # This guide
```

## Tables Overview

1. **`categories`**: Product classifications (`skincare`, `makeup`, `fragrance`).
2. **`products`**: Full product details, prices, badges, images, inventory stock.
3. **`reviews`**: Verified customer reviews, ratings, comments, and timestamps.
4. **`orders`**: Customer checkout orders, total calculations, and fulfillment status.
5. **`order_items`**: Individual line items associated with each order.

## Running Migrations & Seeding

### PostgreSQL
```bash
# Create database
createdb lumiere_db

# Run full schema
psql -d lumiere_db -f schemas/schema.sql

# Seed data
psql -d lumiere_db -f seeds/seed_products.sql
```

### Or using Docker Compose (Recommended)
```bash
docker run --name lumiere-pg -e POSTGRES_DB=lumiere_db -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:16
psql -h localhost -U postgres -d lumiere_db -f schemas/schema.sql
psql -h localhost -U postgres -d lumiere_db -f seeds/seed_products.sql
```
