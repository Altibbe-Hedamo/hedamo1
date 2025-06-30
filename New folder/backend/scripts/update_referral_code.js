const { Pool } = require('pg');
const crypto = require('crypto');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function generateReferralCode() {
  return crypto.randomBytes(6).toString('hex'); // 12-char hex string
}

async function updateReferralCodes() {
  const client = await pool.connect();
  try {
    console.log('Starting referral code update...');

    // Begin transaction
    await client.query('BEGIN');

    // Get all channel partners without referral codes
    const result = await client.query(`
      SELECT id 
      FROM users 
      WHERE signup_type = 'channel_partner' 
      AND (referral_code IS NULL OR referral_code = '')
    `);

    console.log(`Found ${result.rows.length} channel partners without referral codes`);

    // Update each channel partner with a unique referral code
    for (const row of result.rows) {
      const referralCode = await generateReferralCode();
      await client.query(
        'UPDATE users SET referral_code = $1 WHERE id = $2',
        [referralCode, row.id]
      );
      console.log(`Updated user ${row.id} with referral code ${referralCode}`);
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('Referral code update completed successfully!');

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
    console.log('Update completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Update failed:', error);
    process.exit(1);
  }); 