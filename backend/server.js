const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const { initDatabase } = require('./database/init');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cartRoutes = require('./routes/cartRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Connect to Database & Auto-verify Schema
connectDB();
if (!process.env.VERCEL) {
  initDatabase().catch(err => console.error('[Server] DB Init error:', err.message));
}

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api', apiLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Serve Frontend Static Assets
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Route Rewrites for Clean URLs
app.get('/account', (req, res) => {
  res.sendFile(path.join(frontendPath, 'account.html'));
});

app.get('/auth', (req, res) => {
  res.sendFile(path.join(frontendPath, 'auth.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin', 'index.html'));
});

app.get('/admin/:page', (req, res, next) => {
  const pageFile = path.join(frontendPath, 'admin', `${req.params.page}.html`);
  res.sendFile(pageFile, (err) => {
    if (err) next();
  });
});

// Error Handling Middleware
app.use(errorHandler);

// Start Server (only when not running on Vercel serverless or test)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Lumière Luxury Engine] Server running at http://localhost:${PORT}`);
    console.log(`[Lumière Storefront]    http://localhost:${PORT}`);
    console.log(`[Lumière Customer Auth] http://localhost:${PORT}/auth.html`);
    console.log(`[Lumière Account]       http://localhost:${PORT}/account.html`);
    console.log(`[Lumière Admin Portal]  http://localhost:${PORT}/admin/index.html`);
  });
}

module.exports = app;
