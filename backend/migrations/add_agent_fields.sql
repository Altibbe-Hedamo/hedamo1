-- Add new columns for agent details
ALTER TABLE users
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS pincode VARCHAR(6),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS referral_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS experience_years INTEGER;

-- Add comments to explain the columns
COMMENT ON COLUMN users.linkedin_url IS 'LinkedIn profile URL for agents';
COMMENT ON COLUMN users.pincode IS '6-digit pincode of agent location';
COMMENT ON COLUMN users.city IS 'City of agent location';
COMMENT ON COLUMN users.state IS 'State of agent location';
COMMENT ON COLUMN users.referral_id IS 'Optional referral ID for agents';
COMMENT ON COLUMN users.experience_years IS 'Years of experience for agents';

-- Add check constraints
ALTER TABLE users
ADD CONSTRAINT valid_pincode CHECK (pincode ~ '^[0-9]{6}$'),
ADD CONSTRAINT valid_experience_years CHECK (experience_years >= 0 AND experience_years <= 50);

-- Create index on referral_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_referral_id ON users(referral_id); 