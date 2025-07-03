require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTables() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('Connected to database successfully\n');

    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('Tables in database:');
    console.log('==================');
    tablesResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    console.log('\n');

    // Get detailed information for each table
    for (const table of tablesResult.rows) {
      console.log(`\nStructure of table: ${table.table_name}`);
      console.log('==================');

      // Get columns
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await client.query(columnsQuery, [table.table_name]);
      
      console.log('Columns:');
      columnsResult.rows.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type})${column.is_nullable === 'NO' ? ' NOT NULL' : ''}${column.column_default ? ` DEFAULT ${column.column_default}` : ''}`);
      });

      // Get constraints
      const constraintsQuery = `
        SELECT 
          conname as constraint_name,
          pg_get_constraintdef(oid) as constraint_definition
        FROM pg_constraint
        WHERE conrelid = $1::regclass;
      `;
      
      const constraintsResult = await client.query(constraintsQuery, [table.table_name]);
      
      if (constraintsResult.rows.length > 0) {
        console.log('\nConstraints:');
        constraintsResult.rows.forEach(constraint => {
          console.log(`- ${constraint.constraint_name}: ${constraint.constraint_definition}`);
        });
      }

      // Get indexes
      const indexesQuery = `
        SELECT 
          indexname as index_name,
          indexdef as index_definition
        FROM pg_indexes
        WHERE tablename = $1;
      `;
      
      const indexesResult = await client.query(indexesQuery, [table.table_name]);
      
      if (indexesResult.rows.length > 0) {
        console.log('\nIndexes:');
        indexesResult.rows.forEach(index => {
          console.log(`- ${index.index_name}: ${index.index_definition}`);
        });
      }

      console.log('\n' + '='.repeat(50) + '\n');
    }

  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

checkTables(); 