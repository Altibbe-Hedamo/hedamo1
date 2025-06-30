const { Pool } = require('pg');
require('dotenv').config();
const crypto = require('crypto');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateSignupType() {
  const client = await pool.connect();
  try {
    console.log('Starting signup_type update...');

    // Begin transaction
    await client.query('BEGIN');

    // First, drop the existing check constraint
    console.log('Dropping existing check constraint...');
    await client.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_signup_type_check
    `);

    // Add new check constraint with channel_partner included
    console.log('Adding new check constraint with channel_partner...');
    await client.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_signup_type_check 
      CHECK (signup_type IN ('agent', 'admin', 'client', 'employee', 'hr', 'hap', 'channel_partner'))
    `);

    // Commit transaction
    await client.query('COMMIT');
    console.log('Signup type update completed successfully!');

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error updating signup_type:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Function to generate a random referral code
function generateReferralCode() {
  return crypto.randomBytes(6).toString('hex'); // 12-char hex string
}

// Run the migration
updateSignupType()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 