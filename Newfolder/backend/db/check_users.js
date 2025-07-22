require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkUsers() {
  let client;
  try {
    console.log('Connecting to database...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'URL is set' : 'URL is not set');
    
    client = await pool.connect();
    console.log('Connected to database successfully\n');

    // First check if the users table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    const tableExists = await client.query(tableCheckQuery);
    console.log('Users table exists:', tableExists.rows[0].exists);

    if (!tableExists.rows[0].exists) {
      console.log('Users table does not exist in the database');
      return;
    }

    // Remove all code that queries or logs HRB users. This script should not reference HRB at all.

  } catch (error) {
    console.error('Error checking users:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

checkUsers(); 