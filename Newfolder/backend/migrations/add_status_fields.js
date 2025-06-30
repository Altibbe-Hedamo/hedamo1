const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function addStatusFields() {
  const client = await pool.connect();
  try {
    console.log('Starting to add status fields to users table...');

    // Begin transaction
    await client.query('BEGIN');

    // Add new columns
    console.log('Adding new status columns...');
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'active')),
      ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'active'))
    `);

    // Add comments to columns
    console.log('Adding column comments...');
    await client.query(`
      COMMENT ON COLUMN users.kyc_status IS 'KYC verification status of the user';
      COMMENT ON COLUMN users.payment_status IS 'Payment verification status of the user'
    `);

    // Create indexes
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
      CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status)
    `);

    // Commit transaction
    await client.query('COMMIT');
    console.log('Successfully added status fields to users table!');

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error adding status fields:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute the migration
addStatusFields()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 