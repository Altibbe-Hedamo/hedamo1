const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSLPUsers() {
  let client;
  try {
    client = await pool.connect();
    
    // Check all SLP users
    const result = await client.query(
      'SELECT id, email, signup_type, status, created_at FROM users WHERE signup_type = $1 ORDER BY created_at DESC',
      ['slp']
    );
    
    console.log('SLP users found:', result.rows.length);
    result.rows.forEach((user, index) => {
      console.log(`SLP ${index + 1}:`, {
        id: user.id,
        email: user.email,
        signup_type: user.signup_type,
        status: user.status,
        created_at: user.created_at
      });
    });
    
  } catch (error) {
    console.error('Error checking SLP users:', error);
  } finally {
    if (client) {
      client.release();
    }
    process.exit(0);
  }
}

checkSLPUsers(); 