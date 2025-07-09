const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const AIQuestionnaireService = require('../../services/aiQuestionnaireService');
const router = express.Router();

// Initialize AI service
const aiService = new AIQuestionnaireService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/intake-files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// Advanced AI Questionnaire endpoint - quantum-inspired deep dive approach
router.post('/intake-questionnaire', upload.single('file'), async (req, res) => {
  const { pool } = req.app.locals;
  const userId = req.user?.id;
  
  try {
    const {
      session_id,
      product_id,
      user_response,
      category,
      sub_categories,
      product_name,
      company_name,
      location,
      conversation = []
    } = req.body;

    // Get product data from database to enhance AI context
    let productData = null;
    if (product_id) {
      const client = await pool.connect();
      try {
        const productQuery = `
          SELECT p.*, c.name as company_name, c.location as company_location
          FROM products p
          JOIN company c ON p.company_id = c.id
          WHERE p.id = $1 AND c.created_by = $2
        `;
        const productResult = await client.query(productQuery, [product_id, userId]);
        if (productResult.rows.length > 0) {
          productData = productResult.rows[0];
        }
        client.release();
      } catch (dbError) {
        console.error('Error fetching product data:', dbError);
        if (client) client.release();
      }
    }

    // Build context from request and product data
    const context = {
      productName: productData?.name || product_name || 'Unknown Product',
      commercialName: productData?.name || product_name || 'Unknown Product',
      category: productData?.category || category || 'General',
      subcategories: sub_categories ? JSON.parse(sub_categories) : ['General'],
      description: productData?.description || 'Product description',
      location: productData?.location || company_location || location || 'Unknown Location',
      companyName: productData?.company_name || company_name || 'Unknown Company',
      email: req.user?.email || 'user@example.com'
    };

    // If this is the first call, return the first question
    if (!user_response && conversation.length === 0) {
      const nextStep = await aiService.getNextStep(context, [], session_id, productData);
      
      if (nextStep.isComplete) {
        return res.json({
          success: true,
          completed: true,
          message: 'Questionnaire completed'
        });
      }

      return res.json({
        success: true,
        message: nextStep.nextQuestion,
        currentSection: nextStep.currentSection,
        currentDataPoint: nextStep.currentDataPoint,
        progress: nextStep.progress,
        sectionProgress: nextStep.sectionProgress,
        helperText: nextStep.helperText,
        anticipatedTopics: nextStep.anticipatedTopics,
        reasoning: nextStep.reasoning,
        deepDiveMode: true
      });
    }

    // Process user response and get next question
    const updatedConversation = [...conversation];
    if (user_response) {
      // Add the user's response to conversation history
      const lastQuestion = conversation.length > 0 ? conversation[conversation.length - 1] : null;
      if (lastQuestion && !lastQuestion.answer) {
        lastQuestion.answer = user_response;
      } else {
        // This shouldn't happen, but handle gracefully
        updatedConversation.push({
          question: 'Previous question',
          answer: user_response,
          section: 'Unknown',
          dataPoint: 'Unknown'
        });
      }
    }

    // Handle file upload
    if (req.file) {
      const fileResponse = `[File uploaded: ${req.file.originalname}]`;
      if (updatedConversation.length > 0) {
        updatedConversation[updatedConversation.length - 1].answer = fileResponse;
      }
    }

    // Get next step from AI service
    const nextStep = await aiService.getNextStep(context, updatedConversation, session_id, productData);

    if (nextStep.isComplete) {
      // Generate final reports
      const reports = await aiService.generateReport(context, updatedConversation);
      
      return res.json({
        success: true,
        completed: true,
        answers: updatedConversation.map(c => c.answer),
        report: reports.conversationSummary,
        firReport: reports.productFIR,
        conversation: updatedConversation
      });
    }

    // Add the new question to conversation
    updatedConversation.push({
      question: nextStep.nextQuestion,
      answer: '',
      section: nextStep.currentSection,
      dataPoint: nextStep.currentDataPoint
    });

    res.json({
      success: true,
      message: nextStep.nextQuestion,
      currentSection: nextStep.currentSection,
      currentDataPoint: nextStep.currentDataPoint,
      progress: nextStep.progress,
      sectionProgress: nextStep.sectionProgress,
      conversation: updatedConversation,
      helperText: nextStep.helperText,
      anticipatedTopics: nextStep.anticipatedTopics,
      reasoning: nextStep.reasoning,
      deepDiveMode: true,
      isAskLaterQuestion: nextStep.isAskLaterQuestion
    });

  } catch (error) {
    console.error('Advanced AI Questionnaire error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process questionnaire',
      details: error.message
    });
  }
});

// Save conversation to database
router.post('/save-intake-conversation', async (req, res) => {
  const { pool } = req.app.locals;
  const userId = req.user?.id;

  try {
    const { productId, answers, report, firReport, sessionId } = req.body;

    const client = await pool.connect();

    try {
      // Get company_id from product
      const productQuery = `
        SELECT p.company_id, c.name as company_name
        FROM products p
        JOIN company c ON p.company_id = c.id
        WHERE p.id = $1
      `;
      const productResult = await client.query(productQuery, [productId]);

      if (productResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      const companyId = productResult.rows[0].company_id;

      // Check if conversation already exists
      const existingQuery = `
        SELECT id FROM intake_conversations 
        WHERE product_id = $1 AND user_id = $2 AND status = 'active'
      `;
      const existingResult = await client.query(existingQuery, [productId, userId]);

      let conversationId;

      if (existingResult.rows.length > 0) {
        // Update existing conversation
        conversationId = existingResult.rows[0].id;
        const updateQuery = `
          UPDATE intake_conversations 
          SET answers = $1, summary_report = $2, fir_report = $3, 
              status = 'completed', completed_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
          RETURNING id
        `;
        await client.query(updateQuery, [
          JSON.stringify(answers), 
          report, 
          firReport || null, 
          conversationId
        ]);
      } else {
        // Create new conversation
        const insertQuery = `
          INSERT INTO intake_conversations (
            product_id, company_id, user_id, session_id, answers, 
            summary_report, fir_report, status, completed_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed', CURRENT_TIMESTAMP)
          RETURNING id
        `;
        const insertResult = await client.query(insertQuery, [
          productId, companyId, userId, sessionId,
          JSON.stringify(answers), report, firReport || null
        ]);
        conversationId = insertResult.rows[0].id;
      }

      client.release();

      res.json({
        success: true,
        conversationId: conversationId,
        message: 'Conversation saved successfully'
      });

    } catch (dbError) {
      client.release();
      throw dbError;
    }

  } catch (error) {
    console.error('Save conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save conversation',
      details: error.message
    });
  }
});

// Get existing conversation for a product
router.get('/intake-conversations/:productId', async (req, res) => {
  const { pool } = req.app.locals;
  const userId = req.user?.id;
  const { productId } = req.params;

  try {
    const client = await pool.connect();

    const query = `
      SELECT ic.*, p.name as product_name, c.name as company_name
      FROM intake_conversations ic
      JOIN products p ON ic.product_id = p.id
      JOIN company c ON ic.company_id = c.id
      WHERE ic.product_id = $1 AND ic.user_id = $2 
      AND ic.status IN ('completed', 'active')
      ORDER BY ic.updated_at DESC
      LIMIT 1
    `;

    const result = await client.query(query, [productId, userId]);
    client.release();

    if (result.rows.length > 0) {
      const conversation = result.rows[0];
      res.json({
        success: true,
        conversation: {
          id: conversation.id,
          productId: conversation.product_id,
          companyId: conversation.company_id,
          answers: conversation.answers,
          report: conversation.summary_report,
          firReport: conversation.fir_report,
          createdAt: conversation.created_at,
          updatedAt: conversation.updated_at
        }
      });
    } else {
      res.json({
        success: true,
        conversation: null
      });
    }

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation',
      details: error.message
    });
  }
});

// Generate Summary PDF
router.post('/generate-summary-pdf', async (req, res) => {
  const { pool } = req.app.locals;

  try {
    const { conversationId, answers, report, productData } = req.body;

    const pdfPath = await generateSummaryPDF(conversationId, answers, report, productData);

    // Update conversation with PDF path
    const client = await pool.connect();
    await client.query(
      'UPDATE intake_conversations SET summary_pdf_path = $1 WHERE id = $2',
      [pdfPath, conversationId]
    );
    client.release();

    res.json({
      success: true,
      pdfPath: pdfPath,
      message: 'Summary PDF generated successfully'
    });

  } catch (error) {
    console.error('Generate Summary PDF error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary PDF',
      details: error.message
    });
  }
});

// Generate FIR PDF
router.post('/generate-fir-pdf', async (req, res) => {
  const { pool } = req.app.locals;

  try {
    const { conversationId, firReport, productData } = req.body;

    const pdfPath = await generateFIRPDF(conversationId, firReport, productData);

    // Update conversation with FIR PDF path
    const client = await pool.connect();
    await client.query(
      'UPDATE intake_conversations SET fir_pdf_path = $1 WHERE id = $2',
      [pdfPath, conversationId]
    );
    client.release();

    res.json({
      success: true,
      pdfPath: pdfPath,
      message: 'FIR PDF generated successfully'
    });

  } catch (error) {
    console.error('Generate FIR PDF error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate FIR PDF',
      details: error.message
    });
  }
});

// Download PDF
router.get('/download-pdf/:conversationId/:type', async (req, res) => {
  const { pool } = req.app.locals;
  const { conversationId, type } = req.params;

  try {
    const client = await pool.connect();
    
    const column = type === 'fir' ? 'fir_pdf_path' : 'summary_pdf_path';
    const query = `SELECT ${column} as pdf_path FROM intake_conversations WHERE id = $1`;
    const result = await client.query(query, [conversationId]);
    
    client.release();

    if (result.rows.length === 0 || !result.rows[0].pdf_path) {
      return res.status(404).json({
        success: false,
        error: 'PDF not found'
      });
    }

    const pdfPath = result.rows[0].pdf_path;
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        error: 'PDF file not found on server'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`);
    
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download PDF',
      details: error.message
    });
  }
});

// Helper functions

async function checkIfNeedsFIRReport(productId, category, pool) {
  // Logic to determine if FIR report is needed
  // For example, certain categories or product types might require FIR reports
  const firRequiredCategories = ['food', 'cosmetics', 'pharmaceuticals'];
  return firRequiredCategories.includes(category?.toLowerCase());
}

async function generateFIRReport(answers, summaryReport, productName) {
  // Generate FIR (First Information Report) based on the conversation
  const firPrompt = `
Based on the following product questionnaire data, generate a detailed FIR (First Information Report) that includes:

Product: ${productName}
Summary Report: ${summaryReport}

The FIR should include:
1. Product compliance status
2. Risk assessment
3. Regulatory requirements
4. Recommended actions
5. Next steps

Please provide a comprehensive FIR report:
  `;

  try {
    // Here you would integrate with your AI service to generate FIR
    // For now, returning a placeholder
    return `FIR REPORT - ${productName}

COMPLIANCE STATUS: Under Review
RISK LEVEL: To be determined based on detailed analysis
REGULATORY FRAMEWORK: Applicable food safety regulations

FINDINGS:
${summaryReport}

RECOMMENDATIONS:
1. Complete additional testing if required
2. Ensure all documentation is up to date
3. Follow regulatory compliance guidelines

NEXT STEPS:
- Schedule follow-up review
- Submit required documentation
- Monitor compliance status

Generated on: ${new Date().toISOString()}`;

  } catch (error) {
    console.error('Error generating FIR report:', error);
    return 'FIR report generation failed. Please contact support.';
  }
}

async function generateSummaryPDF(conversationId, answers, report, productData) {
  const pdfsDir = path.join(__dirname, '../../pdfs');
  if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir, { recursive: true });
  }

  const filename = `summary-${conversationId}-${Date.now()}.pdf`;
  const filepath = path.join(pdfsDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filepath));

    // Header
    doc.fontSize(20).text('INTAKE QUESTIONNAIRE - SUMMARY REPORT', 50, 50);
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);

    // Product Information
    doc.fontSize(16).text('Product Information', 50, 120);
    doc.fontSize(12);
    if (productData) {
      doc.text(`Product Name: ${productData.name || 'N/A'}`, 50, 150);
      doc.text(`Company: ${productData.company_name || 'N/A'}`, 50, 170);
      doc.text(`Category: ${productData.category || 'N/A'}`, 50, 190);
    }

    // Q&A Section
    doc.fontSize(16).text('Questions & Answers', 50, 230);
    let yPosition = 260;

    answers.forEach((answer, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Q${index + 1}: ${answer.question}`, 50, yPosition);
      yPosition += 20;

      doc.font('Helvetica');
      doc.text(`Answer: ${answer.response}`, 50, yPosition);
      yPosition += 40;
    });

    // Summary Report
    if (yPosition > 600) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(16).font('Helvetica-Bold').text('Summary Report', 50, yPosition);
    yPosition += 30;

    doc.fontSize(12).font('Helvetica');
    const reportLines = report.split('\n');
    reportLines.forEach(line => {
      if (yPosition > 750) {
        doc.addPage();
        yPosition = 50;
      }
      doc.text(line, 50, yPosition);
      yPosition += 15;
    });

    doc.end();

    doc.on('end', () => {
      resolve(filepath);
    });

    doc.on('error', (error) => {
      reject(error);
    });
  });
}

async function generateFIRPDF(conversationId, firReport, productData) {
  const pdfsDir = path.join(__dirname, '../../pdfs');
  if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir, { recursive: true });
  }

  const filename = `fir-${conversationId}-${Date.now()}.pdf`;
  const filepath = path.join(pdfsDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filepath));

    // Header
    doc.fontSize(20).text('FIRST INFORMATION REPORT (FIR)', 50, 50);
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80);

    // Product Information
    doc.fontSize(16).text('Product Information', 50, 120);
    doc.fontSize(12);
    if (productData) {
      doc.text(`Product Name: ${productData.name || 'N/A'}`, 50, 150);
      doc.text(`Company: ${productData.company_name || 'N/A'}`, 50, 170);
      doc.text(`Category: ${productData.category || 'N/A'}`, 50, 190);
    }

    // FIR Report Content
    doc.fontSize(16).text('FIR Report', 50, 230);
    
    let yPosition = 260;
    const reportLines = firReport.split('\n');
    
    doc.fontSize(12);
    reportLines.forEach(line => {
      if (yPosition > 750) {
        doc.addPage();
        yPosition = 50;
      }
      doc.text(line, 50, yPosition);
      yPosition += 15;
    });

    doc.end();

    doc.on('end', () => {
      resolve(filepath);
    });

    doc.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = router; 