const env = require('./config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const corsOptions = require('./config/cors');
const notFoundMiddleware = require('./middlewares/notFound.middleware');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Security headers
app.use(helmet());

// 4. CORS
app.use(cors(corsOptions));

// 5. Routes
// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

// Existing routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/produk', require('./modules/produk/produk.routes'));

// 6. 404 handler
app.use(notFoundMiddleware);

// 7. Error handler
app.use(errorMiddleware);

module.exports = app;
