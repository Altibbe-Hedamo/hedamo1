const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'myapp_db_owner',
  password: 'myapp_db_owner',
  host: 'localhost',
  database: 'myapp_db',
  port: 5432
});

async function migrate() {
  const client = await pool.connect();
  try {
    // Read and execute the SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', 'create_announcements_table.sql'),
      'utf8'
    );
    
    await client.query(sql);
    console.log('Announcements table created successfully');
  } catch (error) {
    console.error('Error creating announcements table:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate(); 