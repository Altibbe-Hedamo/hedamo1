const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAgentsTable() {
  try {
    console.log('\n=== Agents Table Contents ===');
    const result = await pool.query('SELECT * FROM agents');
    console.log('Total rows:', result.rows.length);
    console.log('\nRows:');
    result.rows.forEach((row, index) => {
      console.log(`\nRow ${index + 1}:`);
      console.log(JSON.stringify(row, null, 2));
    });

  } catch (error) {
    console.error('Error checking agents table:', error);
  } finally {
    await pool.end();
  }
}

// Execute the function
checkAgentsTable()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 