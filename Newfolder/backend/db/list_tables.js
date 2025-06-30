require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function listTables() {
  const client = await pool.connect();
  try {
    // Query to get all tables in the public schema
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\nExisting tables in the database:');
    console.log('-----------------------------');
    result.rows.forEach(row => {
      console.log(row.table_name);
    });
    console.log('-----------------------------\n');

    // For each table, show its columns
    for (const row of result.rows) {
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [row.table_name]);

      console.log(`\nColumns in ${row.table_name}:`);
      console.log('-----------------------------');
      columnsResult.rows.forEach(col => {
        console.log(`${col.column_name} (${col.data_type})`);
      });
      console.log('-----------------------------\n');
    }

  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    client.release();
    pool.end();
  }
}

listTables(); 