const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function applyMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Applying questions_and_answers migration to accepted_products table...');
    
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'add_questions_and_answers_to_accepted_products.sql'), 
      'utf8'
    );
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('Migration completed successfully!');
    
    // Verify the column was added
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'accepted_products' 
      AND column_name = 'questions_and_answers'
    `);
    
    if (result.rows.length > 0) {
      console.log('Verification successful - questions_and_answers column exists:');
      console.log(result.rows[0]);
    } else {
      console.log('Warning: questions_and_answers column not found after migration');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  applyMigration()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { applyMigration };
