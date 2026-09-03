# Lumière Beauty — REST API Specification

This document details the public and internal REST endpoints provided by the Lumière backend service.

---

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.lumierebeauty.com/api`

---

## Endpoints

### 1. Products

#### `GET /api/products`
Retrieves products matching optional query filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by slug (`skincare`, `makeup`, `fragrance`) |
| `search` | string | Text search on product title and description |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `sort` | string | Sorting: `price-asc`, `price-desc`, `name-asc` |

**Response (200 OK):**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": 1,
      "name": "Radiance Glow Serum",
      "category": "skincare",
      "categoryLabel": "Skincare",
      "desc": "Vitamin C & hyaluronic acid blend for glass-skin luminosity",
      "price": 128,
      "oldPrice": null,
      "badge": "Bestseller",
      "badgeType": "best",
      "stars": 5,
      "img": "images/skincare_products_1788328338930.jpg"
    }
  ]
}
```

#### `GET /api/products/:id`
Retrieves a single product by numeric identifier.

---

### 2. Reviews

#### `GET /api/reviews`
Retrieves customer reviews.

**Query Parameters:**
- `rating`: integer (1-5)
- `category`: string

#### `POST /api/reviews`
Submit a customer review.

**Request Body:**
```json
{
  "author": "Elena Rostova",
  "location": "Milan, Italy",
  "rating": 5,
  "title": "Pure Elegance",
  "comment": "The lipstick lasts throughout dinner effortlessly.",
  "category": "makeup"
}
```

---

### 3. Cart & Checkout

#### `POST /api/cart/calculate`
Calculates subtotal, applies free shipping threshold ($100), and returns final total.

**Request Body:**
```json
{
  "items": [
    { "id": 1, "price": 128, "qty": 1 }
  ]
}
```
