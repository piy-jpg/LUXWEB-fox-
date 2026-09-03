# Lumière Beauty — Frontend Architecture

This folder contains the complete client-facing web application for Lumière Beauty, organized for easy navigation and development.

## Directory Structure

```text
frontend/
├── index.html            # Landing / Home page (hero, featured, rituals, newsletter)
├── shop.html             # Product catalog (search, filter by category/price, sorting)
├── collections.html      # Seasonal collections showcase (tabs, lookbook masonry)
├── about.html            # Brand story, philosophy, founders & sustainability
├── reviews.html          # Verified customer reviews, ratings breakdown & review modal
├── README.md             # This developer guide
│
├── css/                  # Stylesheets
│   ├── shared.css        # Global CSS variables, reset, navbar, footer, cart & toast
│   ├── home.css          # Base home page layouts and components
│   ├── home-v2.css       # Enhanced home page animations, parralax & glassmorphism
│   ├── shop.css          # Shop catalog styles, grid, filter pill controls
│   ├── collections.css   # Seasonal lookbook, editorial layout & tab animations
│   ├── about.css         # Split layouts, story timeline, founder quote styles
│   ├── reviews.css       # Rating breakdown bars, review cards & form styling
│   └── styles.css        # Legacy global stylesheet backup
│
├── js/                   # Client-side scripts
│   ├── shared.js         # Shared product catalog (`PRODUCTS`), global cart state, toast
│   ├── app.js            # General application logic and helper modules
│   ├── home.js           # Lightweight homepage particle background
│   ├── home-v2.js        # Dynamic home animations, magnetic buttons, countdowns
│   ├── shop.js           # Live product filtering, sorting, price range & search
│   ├── collections.js    # Interactive collection switcher and tab updates
│   └── reviews.js        # Dynamic star filters, search, review submit handler
│
└── images/               # Media and photographic assets
    ├── home_hero_v2.jpg
    ├── hero_banner_1788328324240.jpg
    ├── makeup_products_1788328354838.jpg
    ├── model_portrait_1788328392448.jpg
    ├── perfume_collection_1788328378783.jpg
    ├── skincare_products_1788328338930.jpg
    ├── about_hero.jpg
    ├── collections_hero.jpg
    └── reviews_hero.jpg
```

## Running the Frontend

To view the website locally, serve the `frontend/` directory using any local static web server, for example:

```bash
# Using Python
python3 -m http.server 8000 --directory frontend

# Or using Node.js
npx serve frontend
```

Then open `http://localhost:8000` in your browser.
