require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkUsers() {
  try {
    // First, let's check the table structure
    const tableInfo = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('Users table structure:');
    console.log(JSON.stringify(tableInfo.rows, null, 2));

    // Now get the users data
    const result = await pool.query('SELECT * FROM users');
    console.log('\nUsers in the database:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await pool.end();
  }
}

checkUsers(); 