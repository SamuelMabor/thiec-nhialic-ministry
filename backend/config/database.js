const { Sequelize } = require('sequelize');
require('dotenv').config();

// ✅ Use DB_URL from environment variables (Render)
const sequelize = new Sequelize(
  process.env.DB_URL, // This is the key change
  {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Render's free PostgreSQL
      }
    }
  }
);

module.exports = sequelize;
