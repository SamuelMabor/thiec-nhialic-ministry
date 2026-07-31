const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('📊 Database Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   DB_URL exists:', !!process.env.DB_URL);

let sequelize;

try {
  if (process.env.DB_URL) {
    console.log('📊 Using DB_URL for database connection');
    
    // ✅ Fix: Parse the DB_URL and add SSL options properly
    const url = new URL(process.env.DB_URL);
    
    // Add sslmode=require if not present
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.append('sslmode', 'require');
    }
    
    const connectionString = url.toString();
    console.log('📊 Connection string configured with SSL');
    
    sequelize = new Sequelize(connectionString, {
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
          rejectUnauthorized: false // ✅ This fixes the self-signed certificate
        }
      }
    });
  } else {
    // Use individual environment variables (local development)
    console.log('📊 Using individual DB_* variables for database connection');
    sequelize = new Sequelize(
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
          ssl: process.env.NODE_ENV === 'production' ? {
            require: true,
            rejectUnauthorized: false
          } : false
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
