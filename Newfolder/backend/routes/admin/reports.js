const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const authenticateToken = require('../../middleware/auth').authenticateToken;
const checkAccess = require('../../middleware/auth').checkAccess;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'myapp_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// GET /api/reports
router.get('/', authenticateToken, checkAccess(['admin']), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT p.id, p.name AS title, p.report_status AS status,
              u.first_name || ' ' || u.last_name AS submitted_by,
              p.updated_at AS date
       FROM products p
       JOIN company c ON p.company_id = c.id
       JOIN users u ON c.created_by = u.id
       WHERE u.signup_type = $1 AND p.report_status != $2`,
      ['agent', 'none']
    );

    const reports = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      status: row.status,
      submitted_by: row.submitted_by,
      date: new Date(row.date).toLocaleDateString(),
      reason: row.status === 'rejected' ? 'Incomplete data' : undefined,
    }));

    client.release();
    res.json(reports);
  } catch (error) {
    console.error('Fetch reports error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

// POST /api/reports/:id/approve
router.post('/:id/approve', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = reqRomans;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE products SET report_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      ['approved', id]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({ success: true, message: 'Report approved' });
  } catch (error) {
    console.error('Approve report error:', error);
    res.status(500).json({ success: false, error: 'Failed to approve report' });
  }
});

// POST /api/reports/:id/reject
router.post('/:id/reject', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE products SET report_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      ['rejected', id]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    res.json({ success: true, message: 'Report rejected' });
  } catch (error) {
    console.error('Reject report error:', error);
    res.status(500).json({ success: false, error: 'Failed to reject report' });
  }
});

module.exports = router;