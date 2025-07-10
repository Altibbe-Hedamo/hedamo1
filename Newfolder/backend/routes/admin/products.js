const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const authenticateToken = require('../../middleware/auth').authenticateToken;
const checkAccess = require('../../middleware/auth').checkAccess;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cv6yGeh0zRkP@ep-tiny-boat-a8cfehhv-pooler.eastus2.azure.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});



// POST /api/products/:id/verify
router.post('/:id/verify', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE products SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      ['complete', id]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product verified' });
  } catch (error) {
    console.error('Verify product error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify product' });
  }
});

// POST /api/products/:id/request-info
router.post('/:id/request-info', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE products SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      ['info_requested', id]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product info requested' });
  } catch (error) {
    console.error('Request product info error:', error);
    res.status(500).json({ success: false, error: 'Failed to request product info' });
  }
});

// GET /api/products
router.get('/', authenticateToken, checkAccess(['admin']), async (req, res) => {
  try {
    const client = await pool.connect();
    const { sort } = req.query;
    let orderBy = 'p.created_at DESC'; // Default sort by recent
    if (sort === 'recent') {
      orderBy = 'p.created_at DESC';
    } else if (sort === 'name') {
      orderBy = 'p.name ASC';
    }
    
    const result = await client.query(
      `SELECT p.id, p.name, p.company_id, p.category, p.brands, p.report_status, p.status,
              u.id AS agent_id, u.first_name || ' ' || u.last_name AS agent_name
       FROM products p
       JOIN company c ON p.company_id = c.id
       JOIN users u ON c.created_by = u.id
       WHERE u.signup_type = $1
       ORDER BY ${orderBy}`,
      ['agent']
    );

    const products = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      company_id: row.company_id,
      category: row.category,
      brands: row.brands,
      report_status: row.report_status,
      status: row.status,
      agent_id: row.agent_id,
      agent_name: row.agent_name,
      ground_report: row.report_status === 'completed',
      payment_status: row.status === 'active' ? 'Paid' : 'Pending',
      audit_progress: row.status === 'audit' ? 50 : row.status === 'complete' ? 100 : 0,
    }));

    client.release();
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

router.get('/accepted-products', authenticateToken, checkAccess(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, product_name, company_name, category, created_at, summary, fir_report FROM accepted_products WHERE summary IS NOT NULL AND fir_report IS NOT NULL ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch accepted products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch accepted products' });
  }
});

module.exports = router;