-- Drop the table if it exists to ensure clean creation
DROP TABLE IF EXISTS announcements;

-- Create the announcements table
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    headline VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    recipients TEXT[] NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster queries
CREATE INDEX idx_announcements_created_at ON announcements(created_at);
CREATE INDEX idx_announcements_created_by ON announcements(created_by); 