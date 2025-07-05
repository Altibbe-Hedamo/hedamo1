const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function dropProfilesTrigger() {
  try {
    console.log('Dropping profiles trigger...');
    await pool.query('DROP TRIGGER IF EXISTS set_profiles_timestamp ON profiles');
    console.log('✅ Successfully dropped set_profiles_timestamp trigger');
  } catch (error) {
    console.error('❌ Error dropping trigger:', error);
  } finally {
    await pool.end();
  }
}

dropProfilesTrigger(); 