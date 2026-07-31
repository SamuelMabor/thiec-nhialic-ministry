const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('📊 Database Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_NAME:', process.env.DB_NAME);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'thiec_nhialic',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // ✅ Fixes self-signed certificate
      }
    }
  }
);

console.log('✅ Database configuration ready');

module.exports = sequelize;
