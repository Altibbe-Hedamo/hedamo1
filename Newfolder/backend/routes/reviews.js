const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjust path if needed

// Get all reviews for a specific slug
router.get('/', async (req, res) => {
  const { slug } = req.query;
  try {
    const result = await pool.query(
      'SELECT quote, name, title FROM reviews WHERE slug = $1 ORDER BY created_at DESC',
      [slug || 'general']
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Add a new review for a specific slug
router.post('/', async (req, res) => {
  const { quote, name, title, slug } = req.body;
  if (!quote || !name || !title || !slug) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO reviews (quote, name, title, slug) VALUES ($1, $2, $3, $4) RETURNING quote, name, title, slug',
      [quote, name, title, slug]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add review' });
  }
});

module.exports = router; 