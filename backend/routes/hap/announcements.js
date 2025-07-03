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

// Get announcements for HAP
router.get('/', authenticateToken, async (req, res) => {
  let client;
  try {
    console.log('=== HAP Announcements Request ===');
    console.log('User:', req.user);
    
    // Verify user is a HAP
    if (req.user.signup_type !== 'hap') {
      console.log('Access denied: User is not a HAP');
      return res.status(403).json({ 
        error: 'Access denied. Only HAP can access this endpoint.' 
      });
    }
    
    client = await pool.connect();
    console.log('Database connected');
    
    // Get announcements specifically for HAP
    const result = await client.query(
      `SELECT * FROM announcements 
       WHERE 'hap' = ANY(recipients) 
       AND recipients IS NOT NULL 
       AND array_length(recipients, 1) > 0
       ORDER BY created_at DESC`
    );
    
    console.log('Query result for HAP announcements:', result.rows);
    console.log('Number of HAP announcements:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('No HAP announcements found. Checking recipients array format...');
      const recipientsCheck = await client.query('SELECT id, title, recipients FROM announcements');
      console.log('Recipients format check:', recipientsCheck.rows);
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error in GET /hap/announcements:', error);
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