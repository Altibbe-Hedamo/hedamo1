const express = require('express');
const router = express.Router();
const pool = require('../../db'); // Use shared pool
const authenticateToken = require('../../middleware/auth').authenticateToken;
const checkAccess = require('../../middleware/auth').checkAccess;

// GET /api/dashboard
router.get('/', authenticateToken, checkAccess(['admin']), async (req, res) => {
  try {
    const client = await pool.connect();

    // Fetch stats
    const agentsResult = await client.query(
      'SELECT COUNT(*) AS count FROM users WHERE signup_type = $1 AND status = $2',
      ['agent', 'active']
    );
    const productsResult = await client.query(
      'SELECT COUNT(*) AS count FROM products WHERE status = $1',
      ['active']
    );
    const reportsResult = await client.query(
      'SELECT COUNT(*) AS count FROM products WHERE report_status = $1',
      ['pending']
    );
    const revenueResult = await client.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = $1',
      ['completed']
    );

    const stats = [
      {
        name: 'Total Agents',
        value: agentsResult.rows[0].count,
        change: '+5%',
        changeType: 'positive',
      },
      {
        name: 'Active Products',
        value: productsResult.rows[0].count,
        change: '+3%',
        changeType: 'positive',
      },
      {
        name: 'Pending Reports',
        value: reportsResult.rows[0].count,
        change: '-2%',
        changeType: 'negative',
      },
      {
        name: 'Revenue',
        value: `$${parseFloat(revenueResult.rows[0].total).toFixed(2)}`,
        change: '+10%',
        changeType: 'positive'
      },
    ];

    // Fetch recent activities
    const activitiesResult = await client.query(
      `SELECT a.action, a.created_at, u.email AS user
       FROM activities a
       JOIN users u ON a.user_id = u.id
       WHERE u.signup_type = $1
       ORDER BY a.created_at DESC
       LIMIT 5`,
      ['admin']
    );

    const activities = activitiesResult.rows.map(row => ({
      action: row.action,
      time: new Date(row.created_at).toISOString(),
      user: row.user,
    }));

    client.release();
    res.json({ success: true, stats, activities });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;