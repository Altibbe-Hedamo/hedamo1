const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('../../middleware/auth');

// Create a new pool instance using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to check and add column if it doesn't exist
async function ensureColumnExists(client, tableName, columnName, columnType) {
  const columnCheck = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    );
  `, [tableName, columnName]);

  if (!columnCheck.rows[0].exists) {
    console.log(`Column ${columnName} does not exist, adding it...`);
    try {
      // For recipients column, add it with a default empty array
      if (columnName === 'recipients') {
        await client.query(`
          ALTER TABLE ${tableName}
          ADD COLUMN ${columnName} ${columnType} DEFAULT ARRAY[]::TEXT[];
        `);
      } else {
        await client.query(`
          ALTER TABLE ${tableName}
          ADD COLUMN ${columnName} ${columnType};
        `);
      }
    } catch (error) {
      console.error(`Error adding column ${columnName}:`, error);
      throw error;
    }
  }
}

// Get all announcements
router.get('/', authenticateToken, async (req, res) => {
  let client;
  try {
    console.log('Fetching announcements for user:', req.user);
    client = await pool.connect();
    
    // First check if the table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'announcements'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Announcements table does not exist, creating it...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS announcements (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          recipients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      // Ensure all required columns exist
      await ensureColumnExists(client, 'announcements', 'title', 'VARCHAR(255) NOT NULL');
      await ensureColumnExists(client, 'announcements', 'content', 'TEXT NOT NULL');
      await ensureColumnExists(client, 'announcements', 'recipients', 'TEXT[] NOT NULL');
      await ensureColumnExists(client, 'announcements', 'created_by', 'INTEGER REFERENCES users(id)');
      await ensureColumnExists(client, 'announcements', 'created_at', 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
      await ensureColumnExists(client, 'announcements', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
    }

    // Add a test announcement if none exist
    const countResult = await client.query('SELECT COUNT(*) FROM announcements');
    if (parseInt(countResult.rows[0].count) === 0) {
      console.log('No announcements found, creating a test announcement...');
      await client.query(
        'INSERT INTO announcements (title, content, recipients, created_by) VALUES ($1, $2, $3, $4)',
        [
          'Welcome to HVP Portal',
          'This is a test announcement for HVP agents. Welcome to the portal!',
          ['hvp'],
          1 // Assuming user ID 1 is an admin
        ]
      );
    }

    const result = await client.query(
      'SELECT * FROM announcements ORDER BY created_at DESC'
    );
    
    console.log('Found announcements:', result.rows);
    console.log('Number of announcements:', result.rows.length);
    console.log('First announcement recipients:', result.rows[0]?.recipients);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error in GET /announcements:', error);
    res.status(500).json({ 
      error: 'Failed to fetch announcements',
      details: error.message 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Create a new announcement
router.post('/', authenticateToken, async (req, res) => {
  const { title, content, recipients } = req.body;
  let client;
  
  console.log('Received request body:', req.body);
  console.log('User from request:', req.user);
  
  if (!title || !content || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
    console.log('Validation failed:', { 
      hasTitle: !!title, 
      hasContent: !!content, 
      hasRecipients: !!recipients, 
      isArray: Array.isArray(recipients),
      recipientsLength: recipients?.length 
    });
    return res.status(400).json({ 
      error: 'Title, content, and at least one recipient are required' 
    });
  }

  try {
    console.log('Creating announcement:', { title, content, recipients, userId: req.user.id });
    client = await pool.connect();
    console.log('Database client connected');
    
    // First check if the table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'announcements'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Announcements table does not exist, creating it...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS announcements (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          recipients TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      // Ensure all required columns exist
      await ensureColumnExists(client, 'announcements', 'title', 'VARCHAR(255) NOT NULL');
      await ensureColumnExists(client, 'announcements', 'content', 'TEXT NOT NULL');
      await ensureColumnExists(client, 'announcements', 'recipients', 'TEXT[] NOT NULL');
      await ensureColumnExists(client, 'announcements', 'created_by', 'INTEGER REFERENCES users(id)');
      await ensureColumnExists(client, 'announcements', 'created_at', 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
      await ensureColumnExists(client, 'announcements', 'updated_at', 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
    }
    
    const result = await client.query(
      'INSERT INTO announcements (title, content, recipients, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, recipients, req.user.id]
    );
    
    console.log('Announcement created:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in POST /announcements:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      where: error.where
    });
    res.status(500).json({ 
      error: 'Failed to create announcement',
      details: error.message 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router; 