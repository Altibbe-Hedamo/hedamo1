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

    // Get all users
    const usersQuery = `
      SELECT 
        id,
        email,
        phone,
        signup_type,
        password,
        status,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC;
    `;
    
    console.log('Executing query to fetch users...');
    const usersResult = await client.query(usersQuery);
    
    console.log('Users in database:');
    console.log('==================');
    console.log(`Total users: ${usersResult.rows.length}\n`);

    if (usersResult.rows.length === 0) {
      console.log('No users found in the database');
      return;
    }

    usersResult.rows.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log('------------------');
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Phone: ${user.phone}`);
      console.log('password', user.password);
      console.log(`Signup Type: ${user.signup_type}`);
      console.log(`Status: ${user.status}`);
      console.log(`Created At: ${user.created_at}`);
      console.log(`Updated At: ${user.updated_at}`);
      console.log('\n');
    });

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