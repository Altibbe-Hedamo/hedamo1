const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function alterAgentsTable() {
  const client = await pool.connect();
  try {
    console.log('Starting agents table alteration...');

    // Begin transaction
    await client.query('BEGIN');

    // Add new columns
    console.log('Adding new columns...');
    await client.query(`
      ALTER TABLE agents
      ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
      ADD COLUMN IF NOT EXISTS referral_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS experience_years INTEGER
    `);

    // Add index on referral_id
    console.log('Creating index on referral_id...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_agents_referral_id 
      ON agents(referral_id)
    `);

    // Add comments to columns
    console.log('Adding column comments...');
    await client.query(`
      COMMENT ON COLUMN agents.linkedin_url IS 'LinkedIn profile URL of the agent';
      COMMENT ON COLUMN agents.referral_id IS 'Optional referral ID used during signup';
      COMMENT ON COLUMN agents.experience_years IS 'Number of years of experience as an agent'
    `);

    // Commit transaction
    await client.query('COMMIT');
    console.log('Agents table alteration completed successfully!');

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error altering agents table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
alterAgentsTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 