const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function addChannelPartnerFields() {
  const client = await pool.connect();
  try {
    console.log('Starting channel partner fields migration...');

    // Begin transaction
    await client.query('BEGIN');

    // Add new columns for channel partners
    console.log('Adding new columns...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS website VARCHAR(255),
      ADD COLUMN IF NOT EXISTS address TEXT;
    `);

    // Add comments to columns
    console.log('Adding column comments...');
    await client.query(`
      COMMENT ON COLUMN users.company_name IS 'Company name for channel partners';
      COMMENT ON COLUMN users.website IS 'Company website URL for channel partners';
      COMMENT ON COLUMN users.address IS 'Complete address for channel partners';
    `);

    // Create index on company_name for faster searches
    console.log('Creating index on company_name...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_company_name ON users(company_name);
    `);

    // Commit transaction
    await client.query('COMMIT');
    console.log('Channel partner fields migration completed successfully!');

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error adding channel partner fields:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
addChannelPartnerFields()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 