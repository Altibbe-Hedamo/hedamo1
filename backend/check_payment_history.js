const { Pool } = require('pg');
require('dotenv').config();

const checkPaymentHistory = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const client = await pool.connect();
    console.log('Connected to database successfully');

    // Query to get all rows from payment_history
    const result = await client.query(`
      SELECT 
        ph.id,
        ph.user_id,
        u.email as user_email,
        ph.amount,
        ph.order_id,
        ph.payment_id,
        ph.status,
        ph.plan_type,
        ph.created_at,
        ph.updated_at
      FROM payment_history ph
      LEFT JOIN users u ON ph.user_id = u.id
      ORDER BY ph.created_at DESC;
    `);

    console.log('\nPayment History Records:');
    console.log('----------------------');
    console.log(`Total records: ${result.rows.length}\n`);

    result.rows.forEach((row, index) => {
      console.log(`Record #${index + 1}:`);
      console.log('----------------------');
      console.log(`ID: ${row.id}`);
      console.log(`User ID: ${row.user_id}`);
      console.log(`User Email: ${row.user_email}`);
      console.log(`Amount: ${row.amount}`);
      console.log(`Order ID: ${row.order_id}`);
      console.log(`Payment ID: ${row.payment_id}`);
      console.log(`Status: ${row.status}`);
      console.log(`Plan Type: ${row.plan_type}`);
      console.log(`Created At: ${row.created_at}`);
      console.log(`Updated At: ${row.updated_at}`);
      console.log('----------------------\n');
    });

    client.release();
  } catch (error) {
    console.error('Error fetching payment history:', error);
  } finally {
    await pool.end();
  }
};

// Run the function
checkPaymentHistory()
  .then(() => {
    console.log('\nScript completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 