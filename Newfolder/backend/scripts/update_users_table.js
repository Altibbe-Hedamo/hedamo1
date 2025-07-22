const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection configuration
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateUsersTable() {
  let client;
  try {
    console.log('Starting users table update...');
    client = await pool.connect();

    // Begin transaction
    await client.query('BEGIN');

    // Add new columns
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS referral_code VARCHAR(32) UNIQUE,
      ADD COLUMN IF NOT EXISTS referred_by VARCHAR(32),
      ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS website VARCHAR(255),
      ADD COLUMN IF NOT EXISTS address TEXT;
    `);
    console.log('Added new columns to users table');

    // Add comments
    await client.query(`
      COMMENT ON COLUMN users.referral_code IS 'Unique referral code for channel partners';
      COMMENT ON COLUMN users.referred_by IS 'Referral code of the channel partner who referred this user';
      COMMENT ON COLUMN users.company_name IS 'Company name for channel partners';
      COMMENT ON COLUMN users.website IS 'Company website for channel partners';
      COMMENT ON COLUMN users.address IS 'Company address for channel partners';
    `);
    console.log('Added column comments');

    // Add indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
      CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
    `);
    console.log('Created indexes');

    // Only allow agent, admin, client, employee, hr, and channel_partner in signup_type constraint. Remove any HAP/HRB references.
    await client.query(`
      DO $$ 
      BEGIN
        -- Drop existing constraint if it exists
        BEGIN
          ALTER TABLE users DROP CONSTRAINT IF EXISTS users_signup_type_check;
        EXCEPTION
          WHEN undefined_object THEN
            NULL;
        END;

        -- Add new constraint
        ALTER TABLE users ADD CONSTRAINT users_signup_type_check 
        CHECK (signup_type IN ('agent', 'admin', 'client', 'employee', 'hr', 'channel_partner'));
      END $$;
    `);
    console.log('Updated signup_type constraint');

    // Generate referral codes for existing channel partners
    const result = await client.query(`
      SELECT id, email 
      FROM users 
      WHERE signup_type = 'channel_partner' 
      AND (referral_code IS NULL OR referral_code = '')
    `);

    console.log(`Found ${result.rows.length} channel partners without referral codes`);

    // Generate and update referral codes
    for (const user of result.rows) {
      let referralCode;
      let isUnique = false;
      
      // Keep generating until we get a unique code
      while (!isUnique) {
        referralCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const checkResult = await client.query(
          'SELECT id FROM users WHERE referral_code = $1',
          [referralCode]
        );
        isUnique = checkResult.rows.length === 0;
      }

      await client.query(
        'UPDATE users SET referral_code = $1 WHERE id = $2',
        [referralCode, user.id]
      );
      console.log(`Updated referral code for user ${user.email}: ${referralCode}`);
    }

    // Add foreign key constraint for referred_by
    await client.query(`
      DO $$ 
      BEGIN
        -- Drop existing constraint if it exists
        BEGIN
          ALTER TABLE users DROP CONSTRAINT IF EXISTS users_referred_by_fkey;
        EXCEPTION
          WHEN undefined_object THEN
            NULL;
        END;

        -- Add new constraint
        ALTER TABLE users ADD CONSTRAINT users_referred_by_fkey 
        FOREIGN KEY (referred_by) REFERENCES users(referral_code);
      END $$;
    `);
    console.log('Added foreign key constraint for referred_by');

    // Commit transaction
    await client.query('COMMIT');
    console.log('Successfully updated users table');

    // Verify the changes
    const tableInfo = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.log('\nUpdated table structure:');
    console.table(tableInfo.rows);

  } catch (error) {
    // Rollback transaction on error
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error updating users table:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the update
updateUsersTable().catch(console.error); 