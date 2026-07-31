const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('📊 Database Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   DB_URL exists:', !!process.env.DB_URL);

let sequelize;

try {
  if (process.env.DB_URL) {
    console.log('📊 Using DB_URL for database connection');
    
    // ✅ Get the connection string
    let dbUrl = process.env.DB_URL;
    
    // ✅ Force SSL mode in the connection string
    if (!dbUrl.includes('sslmode=')) {
      dbUrl = dbUrl + (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
    }
    
    console.log('📊 SSL mode configured');
    
    // ✅ Create Sequelize instance with explicit SSL configuration
    sequelize = new Sequelize(dbUrl, {
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
      },
      // ✅ Additional options that might help
      retry: {
        match: [
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/,
          /SequelizeHostNotFoundError/,
          /SequelizeHostNotReachableError/,
          /SequelizeInvalidConnectionError/,
          /SequelizeConnectionTimedOutError/
        ],
        max: 5
      }
    });
  } else {
    // Local development
    console.log('📊 Using local database configuration');
    sequelize = new Sequelize(
      process.env.DB_NAME || 'thiec_nhialic',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: console.log,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        },
        retry: {
          match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/
          ],
          max: 3
        }
      }
    );
  }
  
  console.log('✅ Database configuration created successfully');
} catch (error) {
  console.error('❌ Error creating database configuration:', error.message);
  throw error;
}

module.exports = sequelize;
