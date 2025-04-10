// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();
const saltRounds = 10;
const secret = process.env.JWT_SECRET || '25ebfda6090e52777f56d7268113f90549457c90b8c23d1c4225bccd0df0445e';

// Sign Up endpoint
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hash]
    );
    const user = result.rows[0];
    // Auto login the user after sign up
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '24h' });
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sign up failed', error: err.message });
  }
});

// Login Endpoint 
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT id, name, email, password FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '24h' });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
