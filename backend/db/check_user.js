require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkUser(email) {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('Connected to database successfully\n');

    // Get user details
    const userQuery = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        signup_type,
        status,
        created_at,
        updated_at
      FROM users
      WHERE email = $1;
    `;
    
    const userResult = await client.query(userQuery, [email]);
    
    console.log('User details:');
    console.log('==================');
    
    if (userResult.rows.length === 0) {
      console.log('No user found with email:', email);
    } else {
      const user = userResult.rows[0];
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.first_name} ${user.last_name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Phone: ${user.phone}`);
      console.log(`Signup Type: ${user.signup_type}`);
      console.log(`Status: ${user.status}`);
      console.log(`Created At: ${user.created_at}`);
      console.log(`Updated At: ${user.updated_at}`);
    }

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as an argument');
  process.exit(1);
}

checkUser(email); 