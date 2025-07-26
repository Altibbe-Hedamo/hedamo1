const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAdminUsers() {
  let client;
  try {
    client = await pool.connect();
    
    // Check all admin users
    const result = await client.query(
      'SELECT id, email, signup_type, status, created_at FROM users WHERE signup_type = $1 ORDER BY created_at DESC',
      ['admin']
    );
    
    console.log('Admin users found:', result.rows.length);
    result.rows.forEach((user, index) => {
      console.log(`Admin ${index + 1}:`, {
        id: user.id,
        email: user.email,
        signup_type: user.signup_type,
        status: user.status,
        created_at: user.created_at
      });
    });
    
    // Also check all users with 'active' status
    const activeUsers = await client.query(
      'SELECT id, email, signup_type, status FROM users WHERE status = $1 ORDER BY signup_type, created_at DESC',
      ['active']
    );
    
    console.log('\nAll active users:', activeUsers.rows.length);
    activeUsers.rows.forEach((user, index) => {
      console.log(`Active user ${index + 1}:`, {
        id: user.id,
        email: user.email,
        signup_type: user.signup_type,
        status: user.status
      });
    });
    
  } catch (error) {
    console.error('Error checking admin users:', error);
  } finally {
    if (client) {
      client.release();
    }
    process.exit(0);
  }
}

checkAdminUsers(); 