const { Pool } = require('pg');
require('dotenv').config();

const updatePaymentStatus = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const client = await pool.connect();
    console.log('Connected to database successfully');

    // Begin transaction
    await client.query('BEGIN');

    // Update payment history status to completed
    const updateResult = await client.query(
      `UPDATE payment_history 
       SET status = 'completed',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = 51
       RETURNING *;`
    );

    if (updateResult.rows.length === 0) {
      throw new Error('Payment record not found');
    }

    // Update agent's KYC status
    await client.query(
      `UPDATE agents 
       SET kyc_payment_status = 'paid',
           kyc_plan_type = 'basic'
       WHERE user_id = 100;`
    );

    // Update user's payment_status
    await client.query(
      `UPDATE users 
       SET payment_status = 'active'
       WHERE id = 100;`
    );

    // Commit transaction
    await client.query('COMMIT');
    console.log('Payment status updated successfully');

    // Show the updated record
    const result = await client.query(
      `SELECT 
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
      WHERE ph.id = 51;`
    );

    console.log('\nUpdated Payment Record:');
    console.log('----------------------');
    const row = result.rows[0];
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

    client.release();
  } catch (error) {
    console.error('Error updating payment status:', error);
    // Rollback transaction on error
    await client.query('ROLLBACK');
  } finally {
    await pool.end();
  }
};

// Run the function
updatePaymentStatus()
  .then(() => {
    console.log('\nScript completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 