const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkReferralCodes() {
  const client = await pool.connect();
  try {
    console.log('Checking referral codes...');

    // Check if column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'referral_code'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('Referral code column does not exist. Creating it...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN referral_code VARCHAR(32) UNIQUE
      `);
      console.log('Referral code column created successfully');
    } else {
      console.log('Referral code column exists');
    }

    // Check channel partners without referral codes
    const result = await client.query(`
      SELECT id, email, referral_code 
      FROM users 
      WHERE signup_type = 'channel_partner'
    `);

    console.log('\nChannel Partner Referral Codes:');
    console.log('--------------------------------');
    result.rows.forEach(user => {
      console.log(`User ${user.email}: ${user.referral_code || 'No referral code'}`);
    });

  } catch (error) {
    console.error('Error checking referral codes:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

checkReferralCodes()
  .then(() => {
    console.log('\nCheck completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  }); 