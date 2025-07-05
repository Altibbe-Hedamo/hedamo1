-- Drop the trigger that tries to update non-existent updated_at field on profiles table
DROP TRIGGER IF EXISTS set_profiles_timestamp ON profiles; 