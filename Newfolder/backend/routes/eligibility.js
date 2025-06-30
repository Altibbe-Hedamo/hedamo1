const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../db');

// Make sure to set your GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to store accepted product in database
const storeAcceptedProduct = async (formData, decision, reason) => {
  try {
    const { category, subCategory, productName, companyName, location, certifications } = formData;
    
    const query = `
      INSERT INTO accepted_products 
      (category, sub_categories, product_name, company_name, location, certifications, decision, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const values = [
      category,
      subCategory,
      productName,
      companyName,
      location,
      certifications || [],
      decision,
      reason
    ];
    
    const result = await pool.query(query, values);
    console.log('✅ Product stored in database with ID:', result.rows[0].id);
    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Error storing product in database:', error);
    throw error;
  }
};

const getAnalysisPrompt = (formData) => {
    const { category, subCategory, productName, companyName, location } = formData;

    let prompt = `
        Analyze the following product for eligibility based on these rules:

        Product Name: "${productName}"
        Company: "${companyName}" at "${location}"
        Category: "${category}"
        Sub-categories: "${subCategory.join(', ')}"

        Rules:
        1. For 'agriculture' or 'processed_foods' categories:
           - First, classify the product according to the NOVA food processing classification (1, 2, 3, or 4).
           - If NOVA 1 or 2: The product is ACCEPTED (check for banned substances first).
           - If NOVA 4: The product is REJECTED. Do not ask further questions.
           - If you cannot decide between NOVA 3 and 4, you MUST ask up to 3 clarifying questions to determine the classification.
           - After NOVA classification, check if the product contains alcohol, tobacco, banned substances, or harmful chemicals. If yes, the product is REJECTED.
           - For 'processed_foods' specifically: Check if the product contains artificial colors, artificial preservatives, alcohol, tobacco, or any other harmful additives. If any of these are present, the product is REJECTED.

        2. For 'meat_poultry' category:
           - If the product is 'pork', it is REJECTED.
           - Check if Halal or Kosher certifications are provided in the form data. If not provided, the product is REJECTED.
           - If certifications are provided, the product is ACCEPTED.

        3. For 'seafood' and other categories not mentioned above, there are no specific restrictions. They are ACCEPTED unless they contain banned substances.

        4. For all accepted products, provide a list of relevant certifications based on the category.

        CRITICAL: For ALL categories, if the product contains ANY ingredients derived from alcohol, tobacco, or related products, the product is REJECTED immediately.

        Your response MUST be a JSON object with one of the following structures:

        - For an accepted decision:
          { 
            "decision": "accepted", 
            "reason": "Your detailed explanation.",
            "suggested_certifications": ["NPOP", "USDA Organic", "HACCP", "FSSAI", "Halal", "Kosher", "Other International Certificates"] 
          }

        - For a rejected decision:
          { "decision": "rejected", "reason": "Your detailed explanation." }

        - If you need more information (ONLY for NOVA 3/4 ambiguity in agriculture or processed_foods):
          { "decision": "pending", "questions": ["Question 1?", "Question 2?", "Question 3?"] }

        IMPORTANT: When asking questions to differentiate NOVA 3 vs NOVA 4, use these specific question types:
        1. "What are the main ingredients of [product name]?" (to understand ingredient complexity)
        2. "Does this product contain any artificial colors, preservatives, flavor enhancers, or other chemical additives?" (to identify harmful substances)
        3. "Is any significant processing involved beyond simple mixing and baking (e.g., extensive modification of ingredients, use of numerous additives, industrial processing methods)?" (to determine processing level)
    `;

    return prompt;
};

const getResponseAnalysisPrompt = (initialData, answers) => {
    return `
        Based on the initial product information and the user's answers to follow-up questions, please make a final eligibility decision.

        Initial Product Information:
        Product Name: "${initialData.productName}"
        Category: "${initialData.category}"
        Sub-categories: "${initialData.subCategory.join(', ')}"
        Certifications: "${initialData.certifications ? initialData.certifications.join(', ') : 'None'}"

        User's Answers:
        ${JSON.stringify(answers, null, 2)}

        Rules:
        - If the answers clarify the product is NOVA 3, check for banned substances. If clean, it is ACCEPTED.
        - If the answers clarify the product is NOVA 4, it is REJECTED.

        Your response MUST be a JSON object using one of the structures below:
        - For an accepted decision:
          { 
            "decision": "accepted", 
            "reason": "Your detailed explanation.",
            "suggested_certifications": ["NPOP", "USDA Organic", "HACCP", "FSSAI", "Halal", "Kosher", "Other International Certificates"] 
          }

        - For a rejected decision:
          { "decision": "rejected", "reason": "Your detailed explanation." }
    `;
};


router.post('/check', async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = getAnalysisPrompt(req.body);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        // Clean the response to get a valid JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);

        // If product is accepted, store it in the database
        if (jsonResponse.decision === 'accepted') {
            try {
                await storeAcceptedProduct(req.body, jsonResponse.decision, jsonResponse.reason);
            } catch (dbError) {
                console.error('Failed to store accepted product:', dbError);
                // Don't fail the request if database storage fails
            }
        }

        res.json(jsonResponse);
    } catch (error) {
        console.error('Error with Gemini API:', error);
        res.status(500).json({ error: 'Failed to analyze eligibility.' });
    }
});

router.post('/respond', async (req, res) => {
    try {
        const { initialData, answers } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = getResponseAnalysisPrompt(initialData, answers);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedText);

        // If product is accepted after follow-up questions, store it in the database
        if (jsonResponse.decision === 'accepted') {
            try {
                await storeAcceptedProduct(initialData, jsonResponse.decision, jsonResponse.reason);
            } catch (dbError) {
                console.error('Failed to store accepted product:', dbError);
                // Don't fail the request if database storage fails
            }
        }

        res.json(jsonResponse);
    } catch (error) {
        console.error('Error with Gemini API:', error);
        res.status(500).json({ error: 'Failed to process response.' });
    }
});

module.exports = router; 