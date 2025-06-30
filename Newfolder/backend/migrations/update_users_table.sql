-- Add new columns for channel partners
ALTER TABLE users
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_website VARCHAR(255);

-- Add comments to explain the columns
COMMENT ON COLUMN users.address IS 'Complete address of the user/company';
COMMENT ON COLUMN users.company_name IS 'Name of the company (for channel partners)';
COMMENT ON COLUMN users.company_website IS 'Website URL of the company (for channel partners)';

-- Create index on company_name for faster searches
CREATE INDEX IF NOT EXISTS idx_users_company_name ON users(company_name); 