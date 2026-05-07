require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Konfigurasi Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/produk', require('./routes/produk.routes'));

// Middleware penanganan error secara global
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
