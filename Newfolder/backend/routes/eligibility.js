const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../db');

// Make sure to set your GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to store accepted product in database
const storeAcceptedProduct = async (formData, decision, reason) => {
  try {
    const { category, subCategory, productName, companyName, location, email, certifications } = formData;
    
    const query = `
      INSERT INTO accepted_products 
      (category, sub_categories, product_name, company_name, location, email, certifications, decision, reason)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    
    const values = [
      category,
      subCategory,
      productName,
      companyName,
      location,
      email,
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

router.get('/accepted-products/:email', async (req, res) => {
    try {
        const { email } = req.params;
        
        const query = `
            SELECT * FROM accepted_products 
            WHERE email = $1 
            ORDER BY created_at DESC
        `;
        
        const result = await pool.query(query, [email]);
        
        res.json({
            success: true,
            products: result.rows
        });
    } catch (error) {
        console.error('Error fetching accepted products:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch accepted products.' 
        });
    }
});

// Deep Product Analysis with Gemini AI
router.post('/analyze-product', async (req, res) => {
    try {
        const { product_name, category, sub_categories, company_name, location } = req.body;
        
        if (!product_name || !category || !company_name) {
            return res.status(400).json({
                success: false,
                error: 'Product name, category, and company name are required'
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        
        const analysisPrompt = `
You are a world-class product analyst specializing in deep product analysis and transparency reporting. 

Given the following product information:
- Product Name: "${product_name}"
- Category: "${category}"
- Sub-categories: "${sub_categories ? sub_categories.join(', ') : 'N/A'}"
- Company Name: "${company_name}"
- Location: "${location || 'N/A'}"

Your task is to generate 5-7 deep, insightful questions that will help understand this product better. These questions should:

1. **Be specific to the product type and category**
2. **Focus on transparency, quality, and compliance**
3. **Cover different aspects: production, ingredients, certifications, environmental impact, etc.**
4. **Be practical and answerable by the company**
5. **Help build trust and demonstrate product quality**

For each question, provide:
- The question itself
- Why this question is important for this specific product
- What insights it will provide

Return your response as a JSON object with this structure:
{
  "analysis": {
    "product_overview": "Brief analysis of what this product likely is and its market context",
    "key_considerations": ["List of 3-4 key areas to focus on for this product type"],
    "questions": [
      {
        "question": "The specific question",
        "importance": "Why this question matters for this product",
        "insights": "What valuable information this will reveal"
      }
    ]
  }
}

Make the questions highly relevant to the specific product and category. For example:
- For food products: focus on ingredients, processing, certifications, safety
- For cosmetics: focus on ingredients, testing, safety, sustainability
- For textiles: focus on materials, dyeing, labor practices, environmental impact
- For agricultural products: focus on farming methods, certifications, traceability
`;

        const result = await model.generateContent(analysisPrompt);
        const response = await result.response;
        const text = await response.text();

        // Clean the response to get valid JSON
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        let jsonResponse;
        
        try {
            jsonResponse = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            // Fallback response
            jsonResponse = {
                analysis: {
                    product_overview: `Analysis of ${product_name} from ${company_name}`,
                    key_considerations: [
                        "Product quality and safety standards",
                        "Compliance with industry regulations",
                        "Transparency in production processes",
                        "Environmental and social impact"
                    ],
                    questions: [
                        {
                            question: `What are the main ingredients or components of ${product_name}?`,
                            importance: "Understanding product composition is fundamental for quality assessment",
                            insights: "Will reveal the product's core materials and their quality"
                        },
                        {
                            question: `What quality control measures are in place for ${product_name}?`,
                            importance: "Quality control ensures consistent product standards",
                            insights: "Will show the company's commitment to product quality"
                        },
                        {
                            question: `What certifications or quality standards does ${product_name} meet?`,
                            importance: "Certifications demonstrate compliance with industry standards",
                            insights: "Will reveal the product's regulatory compliance and quality assurance"
                        }
                    ]
                }
            };
        }

        res.json({
            success: true,
            data: jsonResponse.analysis
        });

    } catch (error) {
        console.error('Error with Gemini AI analysis:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to analyze product with AI.' 
        });
    }
});

module.exports = router; 