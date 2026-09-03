# Lumière Beauty — Backend API

RESTful API backend for Lumière Beauty ecommerce platform built with Node.js and Express.

## Directory Structure

```text
backend/
├── config/               # Configuration settings
│   └── db.js             # Database connection setup
├── controllers/          # Request handlers & logic
│   ├── productController.js
│   ├── cartController.js
│   └── reviewController.js
├── models/               # Data model schemas
│   ├── Product.js
│   ├── Review.js
│   └── Order.js
├── routes/               # API route definitions
│   ├── productRoutes.js  # /api/products
│   ├── reviewRoutes.js   # /api/reviews
│   └── cartRoutes.js     # /api/cart
├── middleware/           # Custom middleware
│   ├── errorHandler.js   # Centralized error handler
│   └── logger.js         # HTTP request logging
├── .env.example          # Environment variables template
├── package.json          # Node dependencies & scripts
├── server.js             # Application entry point
└── README.md             # This document
```

## Setup & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Products
- `GET /api/products` — Retrieve list of products (supports `?category=`, `?search=`, `?minPrice=`, `?maxPrice=`, `?sort=`)
- `GET /api/products/:id` — Retrieve a single product by ID

### Reviews
- `GET /api/reviews` — Retrieve customer reviews (supports `?rating=`, `?category=`)
- `POST /api/reviews` — Submit a new review

### Cart & Checkout
- `POST /api/cart/calculate` — Calculate cart total, subtotal, and shipping fee

### System
- `GET /api/health` — Service health check & uptime
