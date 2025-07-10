const express = require('express');
const router = express.Router();
const { generateAndSaveReport } = require('../services/reportGeneratorService');

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

module.exports = router;
