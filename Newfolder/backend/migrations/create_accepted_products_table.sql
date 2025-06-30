CREATE TABLE IF NOT EXISTS accepted_products (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    sub_categories TEXT[] NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    certifications TEXT[],
    decision VARCHAR(20) NOT NULL DEFAULT 'accepted',
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_accepted_products_category ON accepted_products(category);
CREATE INDEX IF NOT EXISTS idx_accepted_products_company ON accepted_products(company_name);
CREATE INDEX IF NOT EXISTS idx_accepted_products_created_at ON accepted_products(created_at); 