/**
 * Vercel Serverless Function Entry Point
 * Routes all /api/* requests to the Express backend application
 */
const app = require('../backend/server');

module.exports = app;
