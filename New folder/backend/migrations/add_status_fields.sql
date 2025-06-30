-- Add new status fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'active')),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'active'));

-- Add comments to explain the columns
COMMENT ON COLUMN users.kyc_status IS 'KYC verification status of the user';
COMMENT ON COLUMN users.payment_status IS 'Payment verification status of the user';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status); 