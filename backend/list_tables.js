const { Pool } = require('pg');
require('dotenv').config();

const listTables = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const client = await pool.connect();
    console.log('Connected to database successfully');

    // Query to get all tables in the public schema
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nTables in the database:');
    console.log('----------------------');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });

    client.release();
  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    await pool.end();
  }
};

// Run the function
listTables()
  .then(() => {
    console.log('\nScript completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 