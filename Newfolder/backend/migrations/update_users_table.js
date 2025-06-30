const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateUsersTable() {
  const client = await pool.connect();
  try {
    console.log('Starting users table update...');

    // Begin transaction
    await client.query('BEGIN');

    // Add new columns
    console.log('Adding new columns...');
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS company_website VARCHAR(255)
    `);

    // Add comments to columns
    console.log('Adding column comments...');
    await client.query(`
      COMMENT ON COLUMN users.address IS 'Complete address of the user/company';
      COMMENT ON COLUMN users.company_name IS 'Name of the company (for channel partners)';
      COMMENT ON COLUMN users.company_website IS 'Website URL of the company (for channel partners)'
    `);

    // Create index
    console.log('Creating index on company_name...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_company_name 
      ON users(company_name)
    `);

    // Commit transaction
    await client.query('COMMIT');
    console.log('Users table update completed successfully!');

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error updating users table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
updateUsersTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 