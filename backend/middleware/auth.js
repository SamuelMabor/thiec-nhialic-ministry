const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findByPk(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = auth;