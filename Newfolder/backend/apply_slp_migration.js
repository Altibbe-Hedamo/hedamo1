const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration - using the same config as db.js
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function applySLPMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Applying SLP migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_slp_to_signup_types.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('SLP migration applied successfully!');
    
    // Verify the constraint was updated
    const result = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conname = 'users_signup_type_check'
    `);
    
    if (result.rows.length > 0) {
      console.log('Updated constraint:', result.rows[0].definition);
    }
    
  } catch (error) {
    console.error('Error applying SLP migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
applySLPMigration()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 