-- Add email field to accepted_products table
ALTER TABLE accepted_products ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add index for email field for better query performance
CREATE INDEX IF NOT EXISTS idx_accepted_products_email ON accepted_products(email); 