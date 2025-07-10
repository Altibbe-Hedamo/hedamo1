const express = require('express');
const router = express.Router();
const AIQuestionnaireService = require('../../services/aiQuestionnaireService');
const pool = require('../../db');

const aiService = new AIQuestionnaireService();

// Endpoint to get the initial state or next question
router.post('/next-step', async (req, res) => {
    try {
        const { context, conversation, sessionId, productData } = req.body;

        if (!context || !productData) {
            return res.status(400).json({ success: false, error: 'Missing context or productData' });
        }

        const result = await aiService.getNextStep(context, conversation || [], sessionId, productData, productData.id);
        
        res.json({ success: true, ...result });

    } catch (error) {
        console.error('Error getting next step:', error);
        res.status(500).json({ success: false, error: 'Failed to get next question from AI.' });
    }
});

// Endpoint to get product details for the intake form
router.get('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM accepted_products WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.error('Error fetching product for intake form:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch product details.' });
    }
});

module.exports = router; 