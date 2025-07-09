const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
});

async function applyIntakeConversationsMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting intake_conversations table migration...');
    
    // Read the SQL migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'create_intake_conversations_table.sql'),
      'utf8'
    );
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Successfully created intake_conversations table with indexes and triggers');
    
    // Verify the table was created
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'intake_conversations'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Table intake_conversations verified successfully');
      
      // Check indexes
      const indexCheck = await client.query(`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'intake_conversations' 
        AND schemaname = 'public';
      `);
      
      console.log('📊 Created indexes:', indexCheck.rows.map(row => row.indexname));
      
      // Check triggers
      const triggerCheck = await client.query(`
        SELECT trigger_name FROM information_schema.triggers 
        WHERE event_object_table = 'intake_conversations';
      `);
      
      console.log('⚡ Created triggers:', triggerCheck.rows.map(row => row.trigger_name));
      
    } else {
      console.error('❌ Table verification failed');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
applyIntakeConversationsMigration(); 