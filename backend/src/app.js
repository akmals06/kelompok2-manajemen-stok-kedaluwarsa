const env = require('./config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const corsOptions = require('./config/cors');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

// Routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/produk', require('./modules/produk/produk.routes'));

// 404 handler — harus setelah semua routes
app.use(notFoundMiddleware);

// Error handler — harus paling terakhir
app.use(errorMiddleware);

module.exports = app;
