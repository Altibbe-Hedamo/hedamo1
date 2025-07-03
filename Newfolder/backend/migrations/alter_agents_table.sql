-- Add new columns to agents table
ALTER TABLE agents
ADD COLUMN linkedin_url VARCHAR(255),
ADD COLUMN referral_id VARCHAR(50),
ADD COLUMN experience_years INTEGER;

-- Add index on referral_id for faster lookups
CREATE INDEX idx_agents_referral_id ON agents(referral_id);

-- Add comment to explain the columns
COMMENT ON COLUMN agents.linkedin_url IS 'LinkedIn profile URL of the agent';
COMMENT ON COLUMN agents.referral_id IS 'Optional referral ID used during signup';
COMMENT ON COLUMN agents.experience_years IS 'Number of years of experience as an agent'; 