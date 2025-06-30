const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const authenticateToken = require('../../middleware/auth').authenticateToken;
const checkAccess = require('../../middleware/auth').checkAccess;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB || 'myapp_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// GET /api/payments
router.get('/', authenticateToken, checkAccess(['admin']), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT p.id, p.product_id, p.amount, p.status, p.created_at AS date,
              prod.name AS product_name, p.agent_commission AS method
       FROM payments p
       LEFT JOIN products prod ON p.product_id = prod.id
       WHERE p.status != $1`,
      ['pending']
    );

    const payments = result.rows.map(row => ({
      id: row.id,
      product_id: row.product_id,
      product_name: row.product_name,
      amount: row.amount,
      status: row.status,
      date: new Date(row.date).toLocaleDateString(),
      method: row.method ? 'Commission' : 'Direct',
      reason: row.status === 'failed' ? 'Payment gateway error' : undefined,
    }));

    client.release();
    res.json(payments);
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch payments' });
  }
});

// POST /api/payments/:id/process
router.post('/:id/process', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      ['completed', id]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    res.json({ success: true, message: 'Payment processed' });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ success: false, error: 'Failed to process payment' });
  }
});

module.exports = router;