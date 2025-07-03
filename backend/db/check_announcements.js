require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAnnouncements() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT a.*, u.first_name, u.last_name 
      FROM announcements a 
      LEFT JOIN users u ON a.created_by = u.id 
      ORDER BY a.created_at DESC;
    `);
    
    console.log('\nAnnouncements in database:');
    console.log('-----------------------------');
    result.rows.forEach(row => {
      console.log(`
ID: ${row.id}
Title: ${row.title}
Content: ${row.content}
Created by: ${row.first_name} ${row.last_name}
Created at: ${row.created_at}
-----------------------------`);
    });
  } catch (error) {
    console.error('Error checking announcements:', error);
  } finally {
    client.release();
    pool.end();
  }
}

checkAnnouncements(); 