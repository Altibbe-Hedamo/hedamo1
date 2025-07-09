-- Create intake_conversations table for storing AI questionnaire data
CREATE TABLE IF NOT EXISTS intake_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    
    -- Q&A Data
    answers JSONB NOT NULL DEFAULT '[]',  -- Array of {question, response, timestamp}
    
    -- Reports
    summary_report TEXT,
    fir_report TEXT,
    
    -- PDF file paths
    summary_pdf_path VARCHAR(500),
    fir_pdf_path VARCHAR(500),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    completed_at TIMESTAMP,
    
    -- Metadata
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_intake_conversations_product_id ON intake_conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_intake_conversations_company_id ON intake_conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_intake_conversations_user_id ON intake_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_intake_conversations_session_id ON intake_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_intake_conversations_status ON intake_conversations(status);
CREATE INDEX IF NOT EXISTS idx_intake_conversations_created_at ON intake_conversations(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_intake_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_intake_conversations_updated_at ON intake_conversations;
CREATE TRIGGER update_intake_conversations_updated_at
    BEFORE UPDATE ON intake_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_intake_conversations_updated_at(); 