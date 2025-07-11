const express = require('express');
const router = express.Router();
const AIQuestionnaireService = require('../../services/aiQuestionnaireService');
const pool = require('../../db');

const aiService = new AIQuestionnaireService();

// File upload endpoint with OCR processing
router.post('/upload-document', aiService.upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { sessionId, currentSection, currentDataPoint } = req.body;
        
        // Process the uploaded file
        const fileProcessing = await aiService.processUploadedFile(req.file.path, req.file.mimetype);
        
        if (!fileProcessing.success) {
            return res.status(500).json({ success: false, error: fileProcessing.error });
        }

        // Analyze document for relevant information
        const documentAnalysis = await aiService.analyzeDocumentForDataPoints(
            req.file.path, 
            req.file.mimetype, 
            currentSection, 
            currentDataPoint
        );

        res.json({
            success: true,
            file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            },
            ocrResult: fileProcessing,
            analysis: documentAnalysis.success ? documentAnalysis.analysis : null,
            extractedContent: fileProcessing.extractedText
        });

    } catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ success: false, error: 'Failed to process uploaded file' });
    }
});

// Answer enhancement endpoint
router.post('/enhance-answer', async (req, res) => {
    try {
        const { question, answer, context } = req.body;

        if (!question || !answer) {
            return res.status(400).json({ success: false, error: 'Question and answer are required' });
        }

        const enhancement = await aiService.enhanceAnswer(question, answer, context);
        
        res.json({ success: true, ...enhancement });

    } catch (error) {
        console.error('Answer enhancement error:', error);
        res.status(500).json({ success: false, error: 'Failed to enhance answer' });
    }
});

// Smart questions generation based on uploaded files
router.post('/generate-smart-questions', async (req, res) => {
    try {
        const { uploadedFiles, context, currentSection } = req.body;

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ success: false, error: 'No uploaded files provided' });
        }

        const smartQuestions = await aiService.generateSmartQuestions(uploadedFiles, context, currentSection);
        
        res.json({ success: true, ...smartQuestions });

    } catch (error) {
        console.error('Smart question generation error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate smart questions' });
    }
});

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

// Endpoint to get the generated report for a specific accepted product
router.get('/report/:acceptedProductId', async (req, res) => {
    const { acceptedProductId } = req.params;
    try {
        const result = await pool.query(
            'SELECT summary, fir_report, product_name, company_name, category FROM accepted_products WHERE id = $1', 
            [acceptedProductId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const product = result.rows[0];
        
        // Check if report is generated
        if (!product.summary || !product.fir_report) {
            return res.json({ 
                success: true, 
                reportReady: false, 
                message: 'Report is being generated...',
                product: {
                    product_name: product.product_name,
                    company_name: product.company_name,
                    category: product.category
                }
            });
        }

        res.json({ 
            success: true, 
            reportReady: true,
            report: {
                summary: product.summary,
                fir_report: product.fir_report,
                product_name: product.product_name,
                company_name: product.company_name,
                category: product.category
            }
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch report.' });
    }
});

module.exports = router; 