-- Add 'hap' as a valid signup type
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_signup_type_check,
ADD CONSTRAINT users_signup_type_check 
CHECK (signup_type IN ('agent', 'admin', 'client', 'employee', 'hr', 'hap')); 