const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']; // Header: Authorization: Bearer <token>
  if (!token) return res.status(401).json({ message: 'Access Denied: No token provided' });

  try {
    const actualToken = token.split(' ')[1]; // "Bearer <token>"
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded; // req.user.id = user._id
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};











