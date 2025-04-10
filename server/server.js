// backend/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api', bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
