const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function createAcceptedProductsTable() {
  try {
    console.log('Creating accepted_products table...');
    
    const sqlPath = path.join(__dirname, 'create_accepted_products_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ accepted_products table created successfully!');
    
    // Verify the table was created
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'accepted_products'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification successful!');
    } else {
      console.log('❌ Table verification failed!');
    }
    
  } catch (error) {
    console.error('❌ Error creating accepted_products table:', error);
  } finally {
    await pool.end();
  }
}

createAcceptedProductsTable(); 