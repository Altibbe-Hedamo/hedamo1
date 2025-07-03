const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

function generateReferralCode() {
  // Generate a 6-character random string
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

async function updateReferralCodes() {
  const client = await pool.connect();
  try {
    console.log('Starting referral code update...');

    // Begin transaction
    await client.query('BEGIN');

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
        referralCode = generateReferralCode();
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
    console.log('Successfully updated all referral codes');

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error updating referral codes:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the update
updateReferralCodes()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 