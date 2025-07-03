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

// Get announcements for HVP agents
router.get('/', authenticateToken, async (req, res) => {
  let client;
  try {
    console.log('=== Agent Announcements Request ===');
    console.log('User:', req.user);
    
    // Verify user is an agent
    if (req.user.signup_type !== 'agent') {
      console.log('Access denied: User is not an agent');
      return res.status(403).json({ 
        error: 'Access denied. Only agents can access this endpoint.' 
      });
    }
    
    client = await pool.connect();
    console.log('Database connected');
    
    // First, let's check what's in the announcements table
    const allAnnouncements = await client.query('SELECT * FROM announcements');
    console.log('All announcements in database:', allAnnouncements.rows);
    
    // Get announcements specifically for HVP
    const result = await client.query(
      `SELECT * FROM announcements 
       WHERE 'hvp' = ANY(recipients) 
       AND recipients IS NOT NULL 
       AND array_length(recipients, 1) > 0
       ORDER BY created_at DESC`
    );
    
    console.log('Query result for HVP announcements:', result.rows);
    console.log('Number of HVP announcements:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('No HVP announcements found. Checking recipients array format...');
      const recipientsCheck = await client.query('SELECT id, title, recipients FROM announcements');
      console.log('Recipients format check:', recipientsCheck.rows);
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error in GET /agent/announcements:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
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

module.exports = router; 