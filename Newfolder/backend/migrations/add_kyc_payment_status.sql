-- Add kyc_payment_status column to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS kyc_payment_status VARCHAR(20) DEFAULT 'pending';

-- Add kyc_plan_type column to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS kyc_plan_type VARCHAR(20) DEFAULT 'basic';

-- Update existing records to have 'pending' status and 'basic' plan
UPDATE agents SET kyc_payment_status = 'pending', kyc_plan_type = 'basic' WHERE kyc_payment_status IS NULL; 