-- Migration to add 'slp' to signup_type constraint
-- Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_signup_type_check;

-- Add the new constraint with all existing types plus 'slp'
ALTER TABLE users ADD CONSTRAINT users_signup_type_check 
CHECK (signup_type IN ('agent', 'admin', 'client', 'employee', 'hr', 'channel_partner', 'hap', 'hrb', 'slp')); 