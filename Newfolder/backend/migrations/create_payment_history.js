const { Pool } = require('pg');
require('dotenv').config();

const createPaymentHistoryTable = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Create payment_history table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        order_id VARCHAR(255) NOT NULL,
        payment_id VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'created',
        plan_type VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON payment_history(order_id);
    `);

    // Create trigger function for updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger
    await pool.query(`
      DROP TRIGGER IF EXISTS update_payment_history_updated_at ON payment_history;
      CREATE TRIGGER update_payment_history_updated_at
        BEFORE UPDATE ON payment_history
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('Payment history table created successfully');
  } catch (error) {
    console.error('Error creating payment history table:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run the migration
createPaymentHistoryTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 