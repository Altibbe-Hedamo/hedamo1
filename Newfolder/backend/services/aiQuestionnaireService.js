const fetch = require('node-fetch');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBuAt4y6edPg5KBw1vRFdiZoXbEZCiIWBI';
const GEMINI_MODEL = 'gemini-1.5-pro';

// Data points per section based on the NestJS controller
const DATA_POINTS = {
  'Product Identity & Claims': [
    'Full product name',
    'Brand name',
    'Claims',
  ],
  'Agriculture': [
    'Seed source and variety',
    'Seed treatment (chemical, biological, none)',
    'GMO status',
    'Soil type and preparation',
    'Tillage method',
    'Fertilizer type and application',
    'Pest and disease management (chemicals, IPM, organic)',
    'Irrigation method',
    'Crop rotation and cover cropping',
    'Harvest method and timing',
    'Post-harvest handling and storage',
    'Traceability system',
  ],
  'Dairy': [
    'Breed and source of animals',
    'Feed composition and sourcing',
    'Animal health and welfare practices',
    'Antibiotic and hormone use',
    'Milking process and hygiene',
    'Milk storage and transport',
    'Processing steps (pasteurization, churning, etc.)',
    'Additives or preservatives',
    'Packaging and shelf life',
    'Traceability system',
  ],
  'Packaged Foods': [
    'Ingredient sourcing and traceability',
    'Ingredient processing (refining, extraction, etc.)',
    'Additives, preservatives, colorants, sweeteners',
    'Ultra-processed ingredient presence',
    'Manufacturing process',
    'Packaging type and safety',
    'Shelf life and storage',
    'Labeling and health claims',
    'Traceability system',
  ],
  'Cosmetics': [
    'Ingredient sourcing and extraction',
    'Ingredient safety and allergen status',
    'Formulation process',
    'Preservative and colorant use',
    'Animal testing policy',
    'Safety and efficacy testing',
    'Packaging sustainability',
    'Traceability system',
  ],
  'Textiles': [
    'Fiber source and type',
    'Seed treatment (if plant-based)',
    'Cultivation and harvesting',
    'Dyeing and finishing process',
    'Chemical use in processing',
    'Labor practices and certifications',
    'Water and energy use',
    'Waste management',
    'Traceability system',
  ],
  'Meat & Poultry': [
    'No pork',
    'No non-halal/kosher (if required)',
    'No banned antibiotics or hormones',
  ],
  'Ethical, Social, and Environmental Impact': [
    'Labor practices and working conditions',
    'Environmental impact and sustainability',
    'Social responsibility initiatives',
    'Community impact and engagement',
    'Carbon footprint and emissions',
    'Waste reduction and circular economy',
  ],
  'Certifications & Supporting Documents': [
    'Quality certifications (ISO, HACCP, etc.)',
    'Organic/natural certifications',
    'Fair trade certifications',
    'Environmental certifications',
    'Third-party audit reports',
    'Compliance documentation',
  ]
};

// In-memory session state (for demo; use DB/Redis for production)
const sessionState = {};
const MAX_FOLLOWUPS = 3;

class AIQuestionnaireService {
  constructor() {
    this.sessionState = sessionState;
  }

  stripCodeBlock(text) {
    return text.replace(/^```json\s*|^```\s*|```$/gim, '').trim();
  }

  detectSector(productName, description, category) {
    const text = `${productName} ${description} ${category}`.toLowerCase();
    if (text.includes('lip balm') || text.includes('cream') || text.includes('cosmetic') || text.includes('lotion') || text.includes('shampoo')) return 'Cosmetics';
    if (text.includes('milk') || text.includes('cheese') || text.includes('dairy') || text.includes('ghee') || text.includes('butter')) return 'Dairy';
    if (text.includes('textile') || text.includes('fabric') || text.includes('cotton') || text.includes('yarn')) return 'Textiles';
    if (text.includes('meat') || text.includes('poultry') || text.includes('chicken') || text.includes('egg')) return 'Meat & Poultry';
    if (text.includes('food') || text.includes('snack') || text.includes('beverage') || text.includes('packaged')) return 'Packaged Foods';
    if (text.includes('seed') || text.includes('crop') || text.includes('farm') || text.includes('agriculture') || text.includes('vegetable') || text.includes('fruit')) return 'Agriculture';
    return 'Product Identity & Claims'; // fallback
  }

  async fetchWithRetry(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const optionsWithTimeout = {
          ...options,
          signal: controller.signal
        };
        
        const response = await fetch(url, optionsWithTimeout);
        clearTimeout(timeoutId);
        
        if (response.ok) {
          return response.json();
        }
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error: ${response.status}`);
        }
      } catch (error) {
        console.log(`🔄 Retry ${i + 1}/${retries} failed:`, error.message);
        if (i === retries - 1) throw error;
        await new Promise(res => setTimeout(res, delay * (i + 1)));
      }
    }
  }

  getUncoveredDataPoints(state, flow) {
    const uncovered = [];
    for (const section of flow) {
      for (const dp of DATA_POINTS[section]) {
        const key = `${section}:${dp}`;
        if (!state.covered[key] && !(state.askLater && state.askLater[key])) {
          uncovered.push(`- ${section}: ${dp}`);
        }
      }
    }
    return uncovered;
  }

  async getSubcategories(productName, commercialName, category, subcategories) {
    const prompt = `Given the product name: "${productName}" (commercial name: "${commercialName}") and the category: "${category}", which of the following subcategories are most relevant?

Provided Subcategories:
${subcategories.join('\n- ')}

Return ONLY a JSON array of strings containing the most relevant subcategories from the provided list. Do not suggest any subcategories not in the list.`;

    const data = await this.fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 128 },
      }),
    });

    let aiSubcats = [];
    try {
      const content = data?.candidates?.[0]?.content;
      let text = '';
      if (content?.parts && Array.isArray(content.parts) && content.parts[0]?.text) {
        text = content.parts[0].text;
      } else if (typeof content?.text === 'string') {
        text = content.text;
      }
      if (text) {
        const cleanText = this.stripCodeBlock(text);
        aiSubcats = JSON.parse(cleanText);
      }
    } catch (e) {
      aiSubcats = [];
    }
    return { subcategories: aiSubcats };
  }

  async checkEligibility(eligibilityData) {
    const { productName, commercialName, category, subcategories, description, location, companyName, email } = eligibilityData;
    
    const promptLines = [
      'You are a world-class product eligibility AI. Given the following product details, analyze if the product is eligible for traceability reporting.',
      '',
      'Product Details:',
      `- Product Name: ${productName}`,
      `- Commercial Name: ${commercialName}`,
      `- Category: ${category}`,
      `- Subcategories: ${subcategories.join(', ')}`,
      `- Description: ${description}`,
      `- Location: ${location}`,
      `- Company Name: ${companyName}`,
      '',
      'Eligibility Rules (Internal Use Only - Do Not Mention to User):',
      '- Only India is serviceable.',
      '- We do not accept: Alcohol, Tobacco, Pork, Ultra-Processed Products, products with artificial preservatives, banned substances, or those made with excessive extractions.',
      '',
      'Special Instructions for Questioning & Response:',
      '- **CRITICAL RULE: Clarify, Then Assess.**',
      "- If you have **even the slightest doubt** about a product's eligibility, **do NOT immediately mark it as ineligible.**",
      "- Instead, your primary response should be to **generate 1-3 targeted, clarifying follow-up questions**. Return `eligible: true` with these questions.",
      "- **Only mark a product as `eligible: false` if the user's initial description provides clear, unambiguous evidence of a rule violation**.",
      "- Never ask direct 'yes/no' questions about negative topics.",
      '- Instead, ask for information that allows you to determine compliance. Use positive framing.',
      '',
      'Return a JSON object: { "eligible": true/false, "reason": "...", "log": ["step 1", "step 2", ...], "questions": ["..."] }'
    ];

    const prompt = promptLines.join('\n');
    const data = await this.fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 256 },
      }),
    });

    let result = { eligible: false, reason: 'AI analysis failed.', log: [], questions: [] };
    try {
      result = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json\s*|```/g, '').trim());
    } catch (e) {
      // Fallback if JSON parsing fails
    }
    
    return result;
  }

  async getNextStep(context, conversation, sessionId, productData) {
    console.log('🤖 AI Service - getNextStep called');
    console.log('🎯 AI Service - Context received:', {
      productName: context.productName,
      category: context.category,
      hasHorizonData: context.hasHorizonData,
      certifications: context.certifications,
      subcategories: context.subcategories
    });
    console.log('🎯 AI Service - ProductData received:', productData ? {
      name: productData.name,
      has_horizon_data: productData.has_horizon_data
    } : 'NULL');
    
    const sid = sessionId || `${context.productName}_${context.email}`;
    if (!this.sessionState[sid]) {
      this.sessionState[sid] = { 
        covered: {},
        askLater: {},
        askLaterOrder: [],
        currentSectionIndex: 0,
        sectionCompleteness: {}
      };
    }
    const state = this.sessionState[sid];

    // Mark the last question's data point as covered or ask later
    if (conversation.length > 0) {
      const lastEntry = conversation[conversation.length - 1];
      const key = `${lastEntry.section}:${lastEntry.dataPoint}`;
      
      if (/will upload later|ask later|later/i.test(lastEntry.answer)) {
        state.askLater[key] = {
          section: lastEntry.section,
          dataPoint: lastEntry.dataPoint,
          question: lastEntry.question
        };
        if (!state.askLaterOrder.includes(key)) {
          state.askLaterOrder.push(key);
        }
      } else {
        state.covered[key] = true;
        delete state.askLater[key];
        const index = state.askLaterOrder.indexOf(key);
        if (index > -1) {
          state.askLaterOrder.splice(index, 1);
        }
      }
    }
    
    // Use product data to determine the main category
    const mainCategory = this.detectSector(
      productData?.name || context.productName, 
      productData?.description || context.description || '', 
      productData?.category || context.category || ''
    );

    const conversationFlow = [
      'Product Identity & Claims',
      mainCategory,
      'Ethical, Social, and Environmental Impact',
      'Certifications & Supporting Documents'
    ].filter((v, i, a) => a.indexOf(v) === i);

    // Get current section based on deep dive approach
    let currentSection = conversationFlow[state.currentSectionIndex];
    
    // Check if current section is complete
    const sectionDataPoints = DATA_POINTS[currentSection] || [];
    const coveredInSection = sectionDataPoints.filter(dp => {
      const key = `${currentSection}:${dp}`;
      return state.covered[key] || state.askLater[key];
    }).length;
    
    const sectionCompleteness = (coveredInSection / sectionDataPoints.length) * 100;
    state.sectionCompleteness[currentSection] = sectionCompleteness;
    
    // If current section is complete (>95%), move to next section
    if (sectionCompleteness >= 95 && state.currentSectionIndex < conversationFlow.length) {
      state.currentSectionIndex++;
      if (state.currentSectionIndex < conversationFlow.length) {
        currentSection = conversationFlow[state.currentSectionIndex];
      }
    }

    // Only consider data points from the current section for the main flow
    let uncoveredInCurrentSection = [];
    if (state.currentSectionIndex < conversationFlow.length) {
      for (const dp of DATA_POINTS[currentSection] || []) {
        const key = `${currentSection}:${dp}`;
        if (!state.covered[key] && !(state.askLater && state.askLater[key])) {
          uncoveredInCurrentSection.push(`- ${currentSection}: ${dp}`);
        }
      }
    }

    // If all sections are done, enter Ask Later phase
    const inAskLaterPhase = state.currentSectionIndex >= conversationFlow.length;
    const uncoveredDataPoints = inAskLaterPhase ? this.getUncoveredDataPoints(state, conversationFlow) : uncoveredInCurrentSection;

    // If no uncovered data points, check if we have "Ask Later" questions
    if (uncoveredDataPoints.length === 0) {
      if (state.askLaterOrder && state.askLaterOrder.length > 0) {
        const askLaterKey = state.askLaterOrder[0];
        const askLaterItem = state.askLater[askLaterKey];
        
        if (askLaterItem) {
          delete state.askLater[askLaterKey];
          state.askLaterOrder.shift();
          
          const totalQuestions = Object.values(DATA_POINTS).flat().length;
          const completedQuestions = Object.keys(state.covered).length;
          const progress = ((completedQuestions) / totalQuestions) * 100;
          
          return {
            nextQuestion: `[Revisiting] ${askLaterItem.question}`,
            currentSection: askLaterItem.section,
            currentDataPoint: askLaterItem.dataPoint,
            progress,
            isAskLaterQuestion: true
          };
        }
      }
      
      return { isComplete: true };
    }

    // Build context for Gemini prompt with product data
    const productContext = productData ? `
Product Context from Database:
- Product Name: ${productData.name}
- Company: ${productData.company_name}
- Category: ${productData.category}
- Description: ${productData.description || 'N/A'}
- Location: ${productData.location || 'N/A'}
- Claims: ${productData.claims || 'N/A'}
- Certifications: ${productData.certifications || 'N/A'}
` : '';

    const GEMINI_PROMPT = `
--- CRITICAL RULE: One Data Point, One Question ---
Never combine multiple data points or topics into a single question. If a data point requires several details, ask about each detail in a separate, focused question, one after the other.

--- CRITICAL INTENT RULE ---
Before asking the next question, analyze the user's most recent answer:
- If the answer already provides details for multiple data points, mark those as covered and do not ask for them again.
- Only ask for information that is truly missing, unclear, or ambiguous.
- If the answer is vague, ask for clarification or a specific missing detail.

--- CRITICAL CLARITY RULE ---
- Always keep questions simple and easy to understand.
- If a data point is broad, provide a helper text or example to guide the user.
- Every question must include a short, user-friendly helper text that suggests what kind of details the user could include in their answer.
- Avoid referencing too many details or combining multiple context points in a single question.
- Prefer general, open-ended questions that allow the user to answer in their own words.
- Only add specific context if it is essential for clarity.
- Example: "Can you describe your traceability system for AB Organics red tomatoes?"  
  Helper text: "For example, do you use barcodes, batch numbers, digital records, or any other method to track your tomatoes from farm to consumer?"

--- CRITICAL FLOW RULE ---
- Always ask about the next uncovered data point in the order they appear in the section’s data point list.
- Do not jump between topics or reorder questions unless the user’s answer already covers a future data point.
- If a user’s answer covers multiple data points, mark them as covered and move to the next uncovered one in order.

--- QUANTUM-INSPIRED HEDAMO AI SYSTEM - DEEP DIVE MODE ---
You are Hedamo AI, using a DEEP DIVE approach to thoroughly explore each section before moving to the next. You're currently focused on completing the "${currentSection}" section.

--- DEEP DIVE STRATEGY ---
**FOCUS:** Stay within the current section "${currentSection}" until it's thoroughly explored
**ANTICIPATE:** Analyze answers to anticipate which data points WITHIN THIS SECTION create the most logical flow
**CONNECT:** Create natural transitions between related data points in the same section
**DEPTH:** Ask follow-up questions when answers reveal opportunities for deeper exploration

--- CONVERSATION HISTORY ---
${conversation.map(c => `Q: ${c.question}\nA: ${c.answer}`).join('\n')}

--- CURRENT SECTION FOCUS: ${currentSection} ---
Remaining data points in this section (in order):
${(DATA_POINTS[currentSection] || []).filter(dp => {
  const key = `${currentSection}:${dp}`;
  return !state.covered[key] && !(state.askLater && state.askLater[key]);
}).map((dp, idx) => `${idx + 1}. ${dp}`).join('\n')}

Section Completeness: ${state.sectionCompleteness[currentSection] || 0}%

--- DEEP DIVE FLOW RULES ---
- Stay within ${currentSection} section unless it's >95% complete
- Always select the next uncovered data point in order for this section
- Do not jump between topics or reorder questions unless the user’s answer already covers a future data point
- Build depth by exploring related aspects within the section
- Only suggest moving to next section when current is thoroughly covered

--- YOUR TASK ---
Generate a JSON object for the next question that DEEP DIVES into ${currentSection}:
1. "section": Should be "${currentSection}" (stay focused on current section)
2. "dataPoint": The next uncovered data point from ${currentSection} (in order)
3. "question": A focused, simple, and general question that builds on previous answers within this section (ONE DATA POINT ONLY)
4. "helperText": A short, user-friendly helper text or example that guides the user on what details to include in their answer
5. "anticipatedTopics": 5-7 data points FROM ${currentSection} that logically follow
6. "reasoning": Why this creates depth in understanding ${currentSection}
7. "flowStrategy": How this maintains deep dive focus while building comprehensive understanding
`;

    // Always select the next uncovered data point in order for the current section
    let nextDataPoint = null;
    for (const dp of DATA_POINTS[currentSection] || []) {
      const key = `${currentSection}:${dp}`;
      if (!state.covered[key] && !(state.askLater && state.askLater[key])) {
        nextDataPoint = dp;
        break;
      }
    }

    const questionRes = await this.fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: GEMINI_PROMPT }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 256 }
      }),
    });

    // Create enhanced fallback question using context
    const productName = context.productName !== 'Unknown Product' ? context.productName : 'your product';
    const hasRichContext = context.hasHorizonData && context.category !== 'General' && context.certifications?.length > 0;
    
    const missingFields = [];
    if (!context.productName || context.productName === 'Unknown Product') missingFields.push('product name');
    if (!context.category || context.category === 'General') missingFields.push('category');
    if (!context.subcategories || context.subcategories.length === 0) missingFields.push('subcategories');
    if (!context.certifications || context.certifications.length === 0) missingFields.push('certifications');
    if (!context.companyName || context.companyName === 'Unknown Company') missingFields.push('company name');
    if (!context.location || context.location === 'Unknown Location') missingFields.push('location');

    let fallbackQuestion = '';
    if (missingFields.length > 0) {
      fallbackQuestion = `Please provide the following missing information about your product: ${missingFields.join(', ')}.`;
    } else if (hasRichContext) {
      fallbackQuestion = `I see you have "${productName}" from ${context.companyName} in the ${context.category} category. Your product has been pre-assessed for ${context.subcategories.join(', ')} with certifications including ${context.certifications.join(', ')}. To complete your comprehensive intake assessment, can you tell me more about the specific production methods and quality control processes you use for this ${productName}?`;
    } else {
      fallbackQuestion = `Can you tell me about your product "${productName}" from ${context.companyName}? Please provide any details about what it is and what makes it special.`;
    }
    
    console.log('🎯 AI Service - Generated fallback question:', fallbackQuestion);
    console.log('🎯 AI Service - Using rich context:', hasRichContext);

    let result = {
      question: fallbackQuestion,
      section: mainCategory,
      dataPoint: DATA_POINTS[mainCategory] ? DATA_POINTS[mainCategory][0] : 'Product Information',
      anticipatedTopics: [],
      reasoning: hasRichContext ? 'Building on horizon form eligibility assessment data' : 'Starting with basic product information to understand the product',
      flowStrategy: 'Sequential data collection'
    };

    try {
      const content = questionRes?.candidates?.[0]?.content;
      if (content?.parts && Array.isArray(content.parts) && content.parts[0]?.text) {
        const parsed = JSON.parse(content.parts[0].text.replace(/```json\s*|```/g, '').trim());
        result = {
          question: parsed.question || result.question,
          section: parsed.section || result.section,
          dataPoint: parsed.dataPoint || result.dataPoint,
          anticipatedTopics: parsed.anticipatedTopics || [],
          reasoning: parsed.reasoning || 'Starting with basic product information',
          flowStrategy: parsed.flowStrategy || 'Sequential data collection'
        };
      } else {
        console.log('No valid AI response, using fallback question');
      }
    } catch (e) {
      console.error('Error parsing Gemini response:', e);
      console.log('Using fallback question for', productData?.name || context.productName);
    }
    
    const overallProgress = (Object.keys(state.covered).length / Object.values(DATA_POINTS).flat().length) * 100;
    const currentSectionProgress = state.sectionCompleteness[currentSection] || 0;

    return { 
      nextQuestion: result.question, 
      currentSection: result.section, 
      currentDataPoint: result.dataPoint, 
      progress: overallProgress,
      sectionProgress: currentSectionProgress,
      currentSectionIndex: state.currentSectionIndex,
      totalSections: conversationFlow.length,
      anticipatedTopics: result.anticipatedTopics,
      reasoning: result.reasoning,
      flowStrategy: result.flowStrategy,
      deepDiveMode: true,
      helperText: result.helperText || '',
      productContext: productData || {}
    };
  }

  async generateReport(context, conversation) {
    if (!context || !conversation || conversation.length === 0) {
      throw new Error('Missing or empty context/conversation data.');
    }

    const summaryPrompt = `You are a world-class product transparency analyst. Using the following product information and the full Q&A history from a deep-dive questionnaire, write a detailed, positive, and comprehensive transparency report.

Product Information:
- Product Name: ${context.productName}
- Commercial Name: ${context.commercialName}
- Category: ${context.category}
- Subcategories: ${context.subcategories?.join(', ') || 'N/A'}
- Description: ${context.description}
- Location: ${context.location}
- Company: ${context.companyName}

Collected Evidence (Q&A):
${conversation.map((item, index) => `${index + 1}. Section: ${item.section} | Topic: ${item.dataPoint} | Q: ${item.question} | A: ${item.answer}`).join('\n')}

Write the report as a narrative, not as a Q&A. Highlight all the good points and best practices.`;

    const firPrompt = `Based on the conversation data, create a comprehensive Product FIR (First Information Report) for the product. 

Product Details:
- Product Name: ${context.productName}
- Commercial Name: ${context.commercialName}
- Category: ${context.category}
- Description: ${context.description}
- Company: ${context.companyName}
- Location: ${context.location}

Conversation Data:
${conversation.map((item, index) => `${index + 1}. Section: ${item.section} | Topic: ${item.dataPoint} | Answer: ${item.answer}`).join('\n')}

Create a formal Product FIR with clear sections and actionable recommendations.`;

    // Parallelize the two API calls
    const [summaryData, firData] = await Promise.all([
      this.fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: summaryPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
        }),
      }),
      this.fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: firPrompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
        }),
      })
    ]);

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
      throw new Error('Failed to parse response from AI service.');
    }

    return {
      conversationSummary: conversationSummary || 'Unable to generate conversation summary.',
      productFIR: productFIR || 'Unable to generate Product FIR.',
    };
  }

  // Clear session state for a given session ID
  clearSession(sessionId) {
    if (this.sessionState[sessionId]) {
      delete this.sessionState[sessionId];
    }
  }

  // Get session state for debugging
  getSessionState(sessionId) {
    return this.sessionState[sessionId] || null;
  }
}

module.exports = AIQuestionnaireService; 