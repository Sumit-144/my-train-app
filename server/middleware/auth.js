// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || '25ebfda6090e52777f56d7268113f90549457c90b8c23d1c4225bccd0df0445e';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token' });
    req.user = decoded; 
    next();
  });
}

module.exports = authMiddleware;
