const { Sequelize } = require('sequelize');
require('dotenv').config();

// Check if we have DB_URL (Render) or individual variables
let sequelize;

if (process.env.DB_URL) {
  // Use DB_URL (Render's preferred method)
  console.log('📊 Using DB_URL for database connection');
  sequelize = new Sequelize(
    process.env.DB_URL,
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
          rejectUnauthorized: false
        }
      }
    }
  );
} else {
  // Use individual variables (local development)
  console.log('📊 Using individual DB_* variables for database connection');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'thiec_nhialic',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
