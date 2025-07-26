-- Drop tables in reverse dependency order with CASCADE where needed
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS intake_questionnaires CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS company CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  signup_type VARCHAR(50) NOT NULL CHECK (signup_type IN ('agent', 'admin', 'client', 'employee', 'hr', 'channel_partner', 'hap', 'hrb', 'slp')),
  hashed_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  password VARCHAR(255),
  alt_phone VARCHAR(20),
  time_zone VARCHAR(50),
  pref VARCHAR(50),
  referral VARCHAR(50),
  registered_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  file_no INTEGER,
  year INTEGER,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reset_token_expiry TIMESTAMP,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_phone CHECK (phone ~* '^\+?[1-9]\d{1,14}$')
);

-- Create trigger for users table
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create files table
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  file_no INTEGER NOT NULL,
  emp_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  year INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create agents table (for /api/agent-profile)
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  address TEXT,
  work_location VARCHAR(255),
  kyc_status VARCHAR(50) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT agents_user_id_unique UNIQUE (user_id)
);

-- Create trigger for agents table
CREATE TRIGGER set_agents_timestamp
BEFORE UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create profiles table
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  mobile_number TEXT NOT NULL,
  email_address TEXT NOT NULL,
  current_address TEXT NOT NULL,
  permanent_address TEXT,
  photo_path TEXT NOT NULL,
  selfie_path TEXT NOT NULL,
  id_number TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  cancelled_cheque_path TEXT NOT NULL,
  highest_qualification TEXT NOT NULL,
  institution TEXT NOT NULL,
  year_of_completion TEXT NOT NULL,
  certifications TEXT,
  years_of_experience TEXT NOT NULL,
  current_occupation TEXT,
  reference_details TEXT,
  primary_sectors TEXT NOT NULL,
  regions_covered TEXT NOT NULL,
  languages_spoken TEXT NOT NULL,
  client_base_size TEXT,
  expected_audit_volume TEXT,
  devices_available TEXT NOT NULL,
  internet_quality TEXT NOT NULL,
  digital_tool_comfort TEXT NOT NULL,
  criminal_record TEXT NOT NULL DEFAULT 'No',
  criminal_details TEXT,
  conflict_of_interest TEXT,
  accept_code_of_conduct BOOLEAN NOT NULL,
  training_willingness TEXT NOT NULL DEFAULT 'Yes',
  training_mode TEXT,
  availability TEXT,
  additional_skills TEXT,
  comments TEXT,
  resume_path TEXT NOT NULL,
  other_documents TEXT,
  completion_percentage INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for profiles table
CREATE TRIGGER set_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

-- Create company table
CREATE TABLE company (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  current_market TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'under_review')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for company table
CREATE TRIGGER set_company_timestamp
BEFORE UPDATE ON company
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company_id INTEGER REFERENCES company(id) ON DELETE SET NULL,
  category INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  brands TEXT NOT NULL,
  location VARCHAR(255),
  sku VARCHAR(100),
  price DECIMAL(10,2),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'info_requested')),
  report_status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for products table
CREATE TRIGGER set_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create product_images table
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  file VARCHAR(255) NOT NULL,
  position INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  company_id INTEGER REFERENCES company(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  agent_commission DECIMAL(10,2),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_favorites table
CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL,
  item_type VARCHAR(50) NOT NULL DEFAULT 'product' CHECK (item_type = 'product'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create intake_questionnaires table
CREATE TABLE intake_questionnaires (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for intake_questionnaires table
CREATE TRIGGER set_intake_questionnaires_timestamp
BEFORE UPDATE ON intake_questionnaires
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Orders table for agent tasks/orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP,
    assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure assigned_by is an admin
    CONSTRAINT orders_assigned_by_admin CHECK (
        NOT EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = assigned_by 
            AND u.user_type != 'admin'
        )
    ),
    -- Ensure assigned_to is an agent
    CONSTRAINT orders_assigned_to_agent CHECK (
        NOT EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = assigned_to 
            AND u.user_type != 'agent'
        )
    )
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add indexes for better query performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_priority ON orders(priority);
CREATE INDEX idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX idx_orders_due_date ON orders(due_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email_address);
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON profiles(mobile_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_company_created_by ON company(created_by);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

-- Insert sample categories
INSERT INTO categories (name) VALUES
  ('Electronics'),
  ('Clothing'),
  ('Books')
ON CONFLICT DO NOTHING;

Insert test admin user
INSERT INTO users (
  first_name, last_name, email, phone, signup_type, status, password
) VALUES (
  'Admin', 'User', 'admin@gmail.com', '+1234567890', 'admin', 'active',
  '$2b$10$Bmm9q1D.PWJHeKwyfbc4JuSMc3cssqKszjXzyteV6Qfuq9AL4rRdS'
) ON CONFLICT (email) DO NOTHING;

-- INSERT INTO users (
--   first_name, last_name, email, phone, signup_type, status, password
-- ) VALUES (
--   'HR', 'User', 'hr@gmail.com', '9059876451', 'employee', 'active',
--   '$2b$10$n2xDSCMwLGaCpThE1wm5u.esTXzQrRUU0o/60saHLpFzO65Fnj96S'
-- ) ON CONFLICT (email) DO NOTHING;


-- Modify products table to enforce specific report_status values
ALTER TABLE products
  ALTER COLUMN report_status SET DEFAULT 'none',
  ADD CONSTRAINT check_report_status CHECK (report_status IN ('none', 'intake_pending', 'intake_completed', 'ground_pending', 'ground_completed'));

-- Create product_progress table
CREATE TABLE product_progress (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  intake_form_completed BOOLEAN DEFAULT FALSE,
  ground_questionnaire_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for product_progress table
CREATE TRIGGER set_product_progress_timestamp
BEFORE UPDATE ON product_progress
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_progress_product_id ON product_progress(product_id);
CREATE INDEX IF NOT EXISTS idx_product_progress_user_id ON product_progress(user_id);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  session_id TEXT PRIMARY KEY,
  history JSONB,
  answers JSONB,
  completed BOOLEAN DEFAULT FALSE,
  attempts JSONB
);

-- Example category table (repeat for each category: food, clothing, cosmetics, etc.)
CREATE TABLE IF NOT EXISTS food (
  id SERIAL PRIMARY KEY,
  subcategory_name TEXT NOT NULL,
  content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clothing (
  id SERIAL PRIMARY KEY,
  subcategory_name TEXT NOT NULL,
  content TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cosmetics (
  id SERIAL PRIMARY KEY,
  subcategory_name TEXT NOT NULL,
  content TEXT NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_food_subcategory_name ON food(subcategory_name);
CREATE INDEX IF NOT EXISTS idx_clothing_subcategory_name ON clothing(subcategory_name);
CREATE INDEX IF NOT EXISTS idx_cosmetics_subcategory_name ON cosmetics(subcategory_name);