require('dotenv').config();
const { sequelize } = require('./models');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected!');

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin exists
    const [existing] = await sequelize.query("SELECT * FROM admins WHERE username = 'admin'");
    
    if (existing.length > 0) {
      console.log('✅ Admin already exists. Updating password...');
      await sequelize.query(`
        UPDATE admins 
        SET password = '${hashedPassword}', "updatedAt" = NOW()
        WHERE username = 'admin'
      `);
      console.log('✅ Password reset to: admin123');
    } else {
      console.log('📝 Creating admin user...');
      await sequelize.query(`
        INSERT INTO admins (username, email, password, role, "createdAt", "updatedAt")
        VALUES (
          'admin',
          'admin@thiecnhialic.org',
          '${hashedPassword}',
          'admin',
          NOW(),
          NOW()
        )
      `);
      console.log('✅ Admin created successfully!');
    }

    // Verify
    const [verify] = await sequelize.query("SELECT id, username, email, role FROM admins WHERE username = 'admin'");
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Admin setup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Admin Details:');
    console.log(`   ID: ${verify[0].id}`);
    console.log(`   Username: ${verify[0].username}`);
    console.log(`   Email: ${verify[0].email}`);
    console.log(`   Role: ${verify[0].role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
