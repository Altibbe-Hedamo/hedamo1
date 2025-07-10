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
    console.log('Applying report fields migration to accepted_products table...');
    
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'add_report_fields_to_accepted_products.sql'), 
      'utf8'
    );
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('Migration completed successfully!');
    
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
