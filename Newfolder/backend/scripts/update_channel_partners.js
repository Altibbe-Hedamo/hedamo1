const { Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function generateReferralCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6-char hex string
}

async function updateChannelPartners() {
  const client = await pool.connect();
  try {
    console.log('Starting channel partner update...');

    // Begin transaction
    await client.query('BEGIN');

    // Read and execute the migration SQL
    const migrationPath = path.join(__dirname, '../migrations/add_channel_partner_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await client.query(migrationSQL);
    console.log('Executed migration SQL');

    // Get all channel partners without referral codes
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
        referralCode = await generateReferralCode();
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

    // Commit transaction
    await client.query('COMMIT');
    console.log('Successfully updated all channel partners');

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error updating channel partners:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Run the update
updateChannelPartners().catch(console.error); 