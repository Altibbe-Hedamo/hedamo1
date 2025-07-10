const express = require('express');
const router = express.Router();
const { generateAndSaveReport } = require('../services/reportGeneratorService');
const { pool } = require('../db'); // Added missing import for pool

router.post('/generate-report', async (req, res) => {
    const { acceptedProductId } = req.body;

    if (!acceptedProductId) {
        return res.status(400).json({ error: 'acceptedProductId is required.' });
    }

    try {
        const reports = await generateAndSaveReport(acceptedProductId);
        res.json(reports);
    } catch (error) {
        console.error('Error generating report:', error.message);
        res.status(500).json({ error: 'Failed to generate report.' });
    }
});

router.get('/report-status/:acceptedProductId', async (req, res) => {
    const { acceptedProductId } = req.params;

    if (!acceptedProductId) {
        return res.status(400).json({ error: 'acceptedProductId is required.' });
    }

    try {
        const result = await pool.query('SELECT summary, fir_report FROM accepted_products WHERE id = $1', [acceptedProductId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        const { summary, fir_report } = result.rows[0];

        if (summary && fir_report) {
            res.json({ status: 'complete', summary, fir_report });
        } else {
            res.json({ status: 'pending' });
        }
    } catch (error) {
        console.error('Error checking report status:', error);
        res.status(500).json({ error: 'Failed to check report status.' });
    }
});

module.exports = router;
