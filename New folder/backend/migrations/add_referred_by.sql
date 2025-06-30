-- Add referred_by column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(32) REFERENCES users(referral_code);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- Add comment to explain the column
COMMENT ON COLUMN users.referred_by IS 'Referral code of the channel partner who referred this user'; 