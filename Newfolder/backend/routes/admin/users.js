const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const authenticateToken = require('../../middleware/auth').authenticateToken;
const checkAccess = require('../../middleware/auth').checkAccess;  
const crypto = require('crypto');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

// Log when the router is loaded
console.log('Channel partner router loaded');

// GET /api/admin/users
router.get('/', authenticateToken, checkAccess(['admin']), async (req, res) => {
  console.log('GET /api/admin/users - Request received');
  console.log('User:', req.user);
  console.log('Query params:', req.query);

  let client;
  try {
    const { signup_type } = req.query;
    client = await pool.connect();
    
    let query = `
      SELECT id, first_name, last_name, email, phone, signup_type, status, created_at,
             linkedin_url, pincode, city, state, referral_id, experience_years, 
             company_name, website, address
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (signup_type) {
      query += ` AND LOWER(signup_type) = LOWER($1)`;
      params.push(signup_type);
    }

    query += ` ORDER BY created_at DESC`;

    console.log('Executing query:', query);
    console.log('Query params:', params);

    const result = await client.query(query, params);
    console.log('Query result:', result.rows.length, 'rows found');

    res.json({
      success: true,
      users: result.rows || []
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch users',
      details: error.message 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// GET /api/agents
router.get('/agents', authenticateToken, checkAccess(['admin']), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT u.id, u.first_name || ' ' || u.last_name AS name, u.email, u.status,
              c.id AS company_id, c.name AS company_name,
              p.id AS product_id, p.name AS product_name
       FROM users u
       LEFT JOIN company c ON c.created_by = u.id
       LEFT JOIN products p ON p.company_id = c.id
       WHERE u.signup_type = $1`,
      ['agent']
    );
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Fetch agents error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch agents' });
  }
});

// POST /api/agents/:id/verify
router.post('/agents/:id/verify', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND signup_type = $3 RETURNING id',
      ['active', id, 'agent']
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    res.json({ success: true, message: 'Agent verified' });
  } catch (error) {
    console.error('Verify agent error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify agent' });
  }
});

// POST /api/agents/:id/reject
router.post('/agents/:id/reject', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND signup_type = $3 RETURNING id',
      ['pending', id, 'agent']
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    res.json({ success: true, message: 'Agent rejected' });
  } catch (error) {
    console.error('Reject agent error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject agent' });
  }
});

// POST /api/companies/:id/approve
router.post('/companies/:id/approve', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE company SET updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    res.json({ success: true, message: 'Company approved' });
  } catch (error) {
    console.error('Approve company error:', error);
    res.status(500).json({ success: false, error: 'Failed to approve company' });
  }
});

// POST /api/companies/:id/review
router.post('/companies/:id/review', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id FROM company WHERE id = $1',
      [id]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    res.json({ success: true, message: 'Company review requested' });
  } catch (error) {
    console.error('Review company error:', error);
    res.status(500).json({ success: false, error: 'Failed to request company review' });
  }
});

// GET /api/channel-partner/referral-link
router.get('/referral-link', (req, res, next) => {
  console.log('\n=== Referral Link Endpoint Middleware ===');
  console.log('Time:', new Date().toISOString());
  console.log('Request URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Path:', req.path);
  console.log('User from token:', JSON.stringify(req.user, null, 2));
  next();
}, authenticateToken, async (req, res) => {
  console.log('\n=== Referral Link Endpoint Handler ===');
  console.log('Time:', new Date().toISOString());
  console.log('Request URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Path:', req.path);
  console.log('User from token:', JSON.stringify(req.user, null, 2));
  
  let client;
  try {
    const userId = req.user && req.user.id;
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('No user ID found in token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Attempting database connection...');
    client = await pool.connect();
    console.log('Database connected successfully');
    
    // First check if user is a channel partner
    const userQuery = 'SELECT signup_type, referral_code FROM users WHERE id = $1';
    console.log('Executing user query:', userQuery);
    console.log('Query parameters:', [userId]);
    
    const userResult = await client.query(userQuery, [userId]);
    console.log('User query result:', JSON.stringify(userResult.rows, null, 2));
    
    if (!userResult.rows.length) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (userResult.rows[0].signup_type !== 'channel_partner') {
      console.log('User is not a channel partner. Type:', userResult.rows[0].signup_type);
      return res.status(403).json({ error: 'Access denied. Only channel partners can access referral links.' });
    }
    
    let referralCode = userResult.rows[0].referral_code;
    
    // If no referral code exists, generate one
    if (!referralCode) {
      console.log('No referral code found, generating new one...');
      
      // Generate a unique referral code
      let isUnique = false;
      while (!isUnique) {
        referralCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const checkResult = await client.query(
          'SELECT id FROM users WHERE referral_code = $1',
          [referralCode]
        );
        isUnique = checkResult.rows.length === 0;
      }
      
      // Update the user with the new referral code
      await client.query(
        'UPDATE users SET referral_code = $1 WHERE id = $2',
        [referralCode, userId]
      );
      console.log('Generated and saved new referral code:', referralCode);
    }
    
    const baseUrl = (process.env.FRONTEND_URL || 'https://hedamo.com').replace(/\/+$/, '');
    const referralLink = `${baseUrl}/signup?ref=${referralCode}`;
    console.log('Generated referral link:', referralLink);
    
    console.log('Sending successful response');
    res.json({ referralLink });
  } catch (err) {
    console.error('Error in referral link endpoint:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    if (client) {
      client.release();
      console.log('Database connection released');
    }
    console.log('=== End of Referral Link Endpoint ===\n');
  }
});

// GET /api/channel-partner/referrals
router.get('/referrals', authenticateToken, async (req, res) => {
  console.log('\n=== Channel Partner Referrals Endpoint ===');
  console.log('Time:', new Date().toISOString());
  console.log('User from token:', JSON.stringify(req.user, null, 2));
  
  let client;
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      console.log('No user ID found in token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    client = await pool.connect();
    
    // First verify the user is a channel partner
    const userQuery = 'SELECT referral_code FROM users WHERE id = $1 AND signup_type = $2';
    const userResult = await client.query(userQuery, [userId, 'channel_partner']);
    
    if (!userResult.rows.length) {
      console.log('User not found or not a channel partner');
      return res.status(403).json({ error: 'Access denied. Only channel partners can view referrals.' });
    }

    const referralCode = userResult.rows[0].referral_code;
    
    // Get all users who used this referral code
    const referralsQuery = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        status,
        signup_type,
        created_at as signup_date
      FROM users 
      WHERE referred_by = $1
      ORDER BY created_at DESC
    `;
    
    const referralsResult = await client.query(referralsQuery, [referralCode]);
    console.log(`Found ${referralsResult.rows.length} referrals`);
    
    // Format the response
    const referrals = referralsResult.rows.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      phone: user.phone,
      status: user.status,
      signupType: user.signup_type,
      signupDate: user.signup_date,
      totalOrders: 0, // Will be implemented when orders table is created
      totalAmount: 0  // Will be implemented when orders table is created
    }));
    
    res.json({ referrals });
    
  } catch (err) {
    console.error('Error in referrals endpoint:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// GET /api/channel-partner/referral-clients
router.get('/referral-clients', authenticateToken, async (req, res) => {
  console.log('\n=== Channel Partner Referral Clients Endpoint ===');
  console.log('Time:', new Date().toISOString());
  console.log('User from token:', JSON.stringify(req.user, null, 2));
  
  let client;
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      console.log('No user ID found in token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    client = await pool.connect();
    
    // First verify the user is a channel partner
    const userQuery = 'SELECT referral_code FROM users WHERE id = $1 AND signup_type = $2';
    const userResult = await client.query(userQuery, [userId, 'channel_partner']);
    
    if (!userResult.rows.length) {
      console.log('User not found or not a channel partner');
      return res.status(403).json({ error: 'Access denied. Only channel partners can view referral clients.' });
    }

    const referralCode = userResult.rows[0].referral_code;
    
    // Get all users who used this referral code
    const referralsQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.status,
        u.created_at as signup_date,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_amount
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.referred_by = $1
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.created_at
      ORDER BY u.created_at DESC
    `;
    
    const referralsResult = await client.query(referralsQuery, [referralCode]);
    console.log(`Found ${referralsResult.rows.length} referral clients`);
    
    // Format the response
    const clients = referralsResult.rows.map(user => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      phone: user.phone,
      status: user.status,
      signupDate: user.signup_date,
      totalOrders: parseInt(user.total_orders) || 0,
      totalAmount: parseFloat(user.total_amount) || 0
    }));
    
    res.json({ clients });
    
  } catch (err) {
    console.error('Error in referral clients endpoint:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;