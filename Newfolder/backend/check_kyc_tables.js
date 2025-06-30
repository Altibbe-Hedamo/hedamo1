const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkTables() {
  try {
    // Check Aadhar details
    console.log('\n=== Aadhar Details ===');
    const aadharResult = await pool.query('SELECT * FROM aadhar_details');
    console.log(aadharResult.rows);

    // Check PAN details
    console.log('\n=== PAN Details ===');
    const panResult = await pool.query('SELECT * FROM pan_details');
    console.log(panResult.rows);

    // Check Bank details
    console.log('\n=== Bank Details ===');
    const bankResult = await pool.query('SELECT * FROM bank_details');
    console.log(bankResult.rows);

  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await pool.end();
  }
}

checkTables(); 