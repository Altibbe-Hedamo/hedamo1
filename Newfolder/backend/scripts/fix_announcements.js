require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAndFixAnnouncements() {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to database');

    // First, check if the table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'announcements'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Creating announcements table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS announcements (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          recipients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Check current announcements
    console.log('\nChecking current announcements...');
    const result = await client.query('SELECT id, title, recipients FROM announcements');
    console.log('Current announcements:', result.rows);

    // Add 'hvp' to recipients if not present
    for (const row of result.rows) {
      if (!row.recipients || !row.recipients.includes('hvp')) {
        console.log(`\nUpdating announcement ${row.id}: ${row.title}`);
        const newRecipients = row.recipients ? [...row.recipients, 'hvp'] : ['hvp'];
        await client.query(
          'UPDATE announcements SET recipients = $1 WHERE id = $2',
          [newRecipients, row.id]
        );
        console.log('Updated recipients to:', newRecipients);
      }
    }

    // Verify the updates
    console.log('\nVerifying updates...');
    const verifyResult = await client.query('SELECT id, title, recipients FROM announcements');
    console.log('Updated announcements:', verifyResult.rows);

    console.log('\nDone! All announcements now include HVP recipients.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      client.release();
    }
    pool.end();
  }
}

checkAndFixAnnouncements(); 