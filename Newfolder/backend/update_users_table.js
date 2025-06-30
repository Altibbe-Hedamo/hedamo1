const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function updateUsersTable() {
  const client = await pool.connect();
  try {
    console.log('Starting users table update...');

    // Add new columns
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
      ADD COLUMN IF NOT EXISTS pincode VARCHAR(6),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS referral_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS experience_years INTEGER;
    `);
    console.log('Added new columns to users table');

    // Add comments
    await client.query(`
      COMMENT ON COLUMN users.linkedin_url IS 'LinkedIn profile URL for agents';
      COMMENT ON COLUMN users.pincode IS '6-digit pincode of agent location';
      COMMENT ON COLUMN users.city IS 'City of agent location';
      COMMENT ON COLUMN users.state IS 'State of agent location';
      COMMENT ON COLUMN users.referral_id IS 'Optional referral ID for agents';
      COMMENT ON COLUMN users.experience_years IS 'Years of experience for agents';
    `);
    console.log('Added column comments');

    // Add check constraints
    await client.query(`
      DO $$ 
      BEGIN
        -- Drop existing constraints if they exist
        BEGIN
          ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_pincode;
          ALTER TABLE users DROP CONSTRAINT IF EXISTS valid_experience_years;
        EXCEPTION
          WHEN undefined_object THEN
            NULL;
        END;

        -- Add new constraints
        ALTER TABLE users
        ADD CONSTRAINT valid_pincode CHECK (pincode ~ '^[0-9]{6}$'),
        ADD CONSTRAINT valid_experience_years CHECK (experience_years >= 0 AND experience_years <= 50);
      END $$;
    `);
    console.log('Added check constraints');

    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_referral_id ON users(referral_id);
    `);
    console.log('Created index on referral_id');

    // Verify the changes
    const tableInfo = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log('\nUpdated table structure:');
    console.table(tableInfo.rows);

    console.log('\nUsers table update completed successfully!');

  } catch (error) {
    console.error('Error updating users table:', error);
    throw error;
  } finally {
    await client.release();
    await pool.end();
  }
}

// Run the update
updateUsersTable()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 