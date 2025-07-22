require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function applyMigration() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('Connected to database');

    // Start transaction
    await client.query('BEGIN');
    console.log('Started transaction');

    // Apply the migration
    const migration = `
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_signup_type_check,
      ADD CONSTRAINT users_signup_type_check 
      CHECK (signup_type IN ('agent', 'admin', 'client', 'employee', 'hr'));
    `;

    console.log('Applying migration...');
    await client.query(migration);
    console.log('Migration applied successfully');

    // Commit transaction
    await client.query('COMMIT');
    console.log('Transaction committed');

    // Verify the change
    const verifyQuery = `
      SELECT conname, pg_get_constraintdef(oid) 
      FROM pg_constraint 
      WHERE conrelid = 'users'::regclass 
      AND conname = 'users_signup_type_check';
    `;
    const verifyResult = await client.query(verifyQuery);
    console.log('Verification result:', verifyResult.rows[0]);

  } catch (error) {
    console.error('Migration failed:', error);
    if (client) {
      console.log('Rolling back transaction...');
      await client.query('ROLLBACK');
      console.log('Transaction rolled back');
    }
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

applyMigration(); 