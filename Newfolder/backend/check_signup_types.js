const { Pool } = require('pg');

// Database configuration - using the same config as db.js
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSignupTypes() {
  const client = await pool.connect();
  
  try {
    console.log('Checking current signup types in users table...');
    
    // Get all unique signup types
    const result = await client.query(`
      SELECT DISTINCT signup_type, COUNT(*) as count
      FROM users 
      GROUP BY signup_type
      ORDER BY signup_type
    `);
    
    console.log('Current signup types in database:');
    result.rows.forEach(row => {
      console.log(`- ${row.signup_type}: ${row.count} users`);
    });
    
    // Check current constraint
    const constraintResult = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conname = 'users_signup_type_check'
    `);
    
    if (constraintResult.rows.length > 0) {
      console.log('\nCurrent constraint:', constraintResult.rows[0].definition);
    }
    
  } catch (error) {
    console.error('Error checking signup types:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
checkSignupTypes()
  .then(() => {
    console.log('Check completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  }); 