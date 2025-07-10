const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../db');
const fetch = require('node-fetch');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = "gemini-1.5-flash";

async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response.json();
      }
      console.error(`Fetch failed with status: ${response.status}`);
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed:`, error);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error('Failed to fetch from API after multiple retries.');
}

router.post('/generate-report', async (req, res) => {
  const { acceptedProductId } = req.body;

  if (!acceptedProductId) {
    return res.status(400).json({ error: 'acceptedProductId is required.' });
  }

  let productData;
  try {
    const result = await pool.query('SELECT * FROM accepted_products WHERE id = $1', [acceptedProductId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    productData = result.rows[0];
  } catch (error) {
    console.error('Error fetching product data:', error);
    return res.status(500).json({ error: 'Failed to fetch product data.' });
  }

  const { product_name, company_name, location, category, sub_categories, questions_and_answers } = productData;

  if (!questions_and_answers) {
    return res.status(400).json({ error: 'No questions and answers found for this product.' });
  }
  
  const conversation = Object.entries(questions_and_answers).map(([question, answer]) => ({ question, answer }));

  let summaryData;
  let firData;

  try {
    const summaryPrompt = `You are a world-class product transparency analyst. Using the following product information and the full Q&A history from a deep-dive questionnaire, write a detailed, positive, and comprehensive transparency report. Do NOT list the questions and answers. Instead, synthesize all the information into a well-structured, narrative report.

Your report should:
- Start with a brief introduction to the product.
- For each aspect (e.g., sourcing, production, traceability, sustainability, certifications, etc.), summarize the key points and highlight all positive practices and strengths, using the user's answers as source material.
- Use a professional, positive, and engaging tone.
- End with an overall positive assessment of the product's transparency and strengths.

Product Information:
- Product Name: ${product_name}
- Category: ${category}
- Subcategories: ${sub_categories?.join(', ') || 'N/A'}
- Location: ${location}
- Company: ${company_name}

Collected Evidence (Q&A):
${conversation.map((item, index) => `${index + 1}. Q: ${item.question} | A: ${item.answer}`).join('\n')}

Write the report as a narrative, not as a Q&A. Highlight all the good points and best practices.`;

    const firPrompt = `Based on the conversation data, create a comprehensive Product FIR (First Information Report) for the product. 

Product Details:
- Product Name: ${product_name}
- Category: ${category}
- Company: ${company_name}
- Location: ${location}

Conversation Data:
${conversation.map((item, index) => `${index + 1}. Answer: ${item.answer}`).join('\n')}

Create a formal Product FIR that includes:
1. PRODUCT IDENTIFICATION
   - Product Name and Brand
   - Category and Subcategory
   - Manufacturer/Company Details
   - Location and Contact Information

2. PRODUCT SPECIFICATIONS
   - Key Features and Claims
   - Target Market and Price Segment
   - Product Description

3. PRODUCTION & SUPPLY CHAIN
   - Manufacturing Process
   - Ingredient/Material Sourcing
   - Quality Control Measures
   - Certifications and Standards

4. COMPLIANCE & SAFETY
   - Regulatory Compliance
   - Safety Standards
   - Labeling Requirements
   - Traceability Systems

5. SUSTAINABILITY & ETHICS
   - Environmental Impact
   - Social Responsibility
   - Ethical Practices
   - Certifications

6. RISK ASSESSMENT
   - Identified Risks
   - Compliance Gaps
   - Recommendations
   - Priority Actions Required

7. SUPPORTING DOCUMENTATION
   - Required Certificates
   - Test Reports
   - Compliance Documents
   - Additional Evidence Needed

Format as a professional FIR document with clear sections and actionable recommendations.`;

    // Parallelize the two API calls
    [summaryData, firData] = await Promise.all([
      fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: summaryPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
        }),
      }),
      fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: firPrompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
        }),
      })
    ]);
  } catch (error) {
    console.error('Error fetching from Gemini API:', error);
    return res.status(503).json({ error: 'Failed to communicate with AI service.' });
  }

  let conversationSummary = '';
  let productFIR = '';

  try {
    // Extract summary
    const summaryContent = summaryData?.candidates?.[0]?.content;
    if (summaryContent?.parts && Array.isArray(summaryContent.parts) && summaryContent.parts[0]?.text) {
      conversationSummary = summaryContent.parts[0].text;
    }

    // Extract FIR
    const firContent = firData?.candidates?.[0]?.content;
    if (firContent?.parts && Array.isArray(firContent.parts) && firContent.parts[0]?.text) {
      productFIR = firContent.parts[0].text;
    }

    if (!conversationSummary || !productFIR) {
      throw new Error('Could not parse response from AI service.');
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return res.status(500).json({ error: 'Failed to parse response from AI service.' });
  }

  try {
    await pool.query('UPDATE accepted_products SET summary = $1, fir_report = $2 WHERE id = $3', [conversationSummary, productFIR, acceptedProductId]);
  } catch (error) {
    console.error('Error updating report data in DB:', error);
    return res.status(500).json({ error: 'Failed to save report to database.' });
  }

  res.json({
    conversationSummary: conversationSummary || 'Unable to generate conversation summary.',
    productFIR: productFIR || 'Unable to generate Product FIR.',
  });
});

module.exports = router;
