-- Add referral_code to users table for channel partner referral system
ALTER TABLE users ADD COLUMN referral_code VARCHAR(32) UNIQUE;
-- Optionally, you can set NOT NULL and a default if you want every user to have one 