# AI-Powered Intake Form Setup Guide

## Overview
This document outlines the setup required for the AI-powered intake form system that has been implemented for the Company portal.

## Features Implemented

### 1. Frontend Components
- **CompanyIntakeForm.tsx**: AI-powered questionnaire interface
- Route added to CompanyPortal: `/company-portal/intake-form/:productId`
- Integration with existing "Complete Intake Form" button on CompanyProductPage

### 2. Backend Components
- **routes/company/intakeForm.js**: Complete backend API for AI questionnaire
- Database integration for storing conversations
- PDF generation for summary and FIR reports
- File upload support for documents and audio

### 3. Database Schema
- **intake_conversations table**: Stores all questionnaire data, reports, and PDF paths
- Full JSONB support for storing Q&A conversations
- Automatic timestamps and triggers

## Required Setup Steps

### 1. Install Dependencies
```bash
cd Newfolder/backend
npm install pdfkit
```
✅ **COMPLETED** - PDFKit has been installed

### 2. Database Migration
Run the following SQL in your PostgreSQL database:

```sql
-- Create intake_conversations table for storing AI questionnaire data
CREATE TABLE IF NOT EXISTS intake_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES company(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    
    -- Q&A Data
    answers JSONB NOT NULL DEFAULT '[]',  -- Array of {question, response, timestamp}
    
    -- Reports
    summary_report TEXT,
    fir_report TEXT,
    
    -- PDF file paths
    summary_pdf_path VARCHAR(500),
    fir_pdf_path VARCHAR(500),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    completed_at TIMESTAMP,
    
    -- Metadata
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_intake_conversations_product_id ON intake_conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_intake_conversations_company_id ON intake_conversations(company_id);
CREATE INDEX IF NOT EXISTS idx_intake_conversations_user_id ON intake_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_intake_conversations_session_id ON intake_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_intake_conversations_status ON intake_conversations(status);
CREATE INDEX IF NOT EXISTS idx_intake_conversations_created_at ON intake_conversations(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_intake_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_intake_conversations_updated_at ON intake_conversations;
CREATE TRIGGER update_intake_conversations_updated_at
    BEFORE UPDATE ON intake_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_intake_conversations_updated_at();
```

### 3. Create Required Directories
The system will automatically create these directories, but you can create them manually if needed:
```bash
mkdir -p uploads/intake-files
mkdir -p pdfs
```

### 4. Environment Variables
Ensure your backend has access to the AI service URL. The system is configured to use:
- AI Service: `https://chatsystem-xudw.onrender.com/chats`

### 5. Frontend Dependencies
The frontend uses existing dependencies. Ensure these are installed:
- react-icons (for FiMic, FiUpload, FiDownload)
- react-toastify (for notifications)

## API Endpoints

### Company Intake Form Endpoints
All endpoints require authentication and are prefixed with `/api/company/`:

1. **POST** `/intake-questionnaire` - AI questionnaire processing
2. **POST** `/save-intake-conversation` - Save conversation to database  
3. **GET** `/intake-conversations/:productId` - Get existing conversation
4. **POST** `/generate-summary-pdf` - Generate summary PDF
5. **POST** `/generate-fir-pdf` - Generate FIR PDF
6. **GET** `/download-pdf/:conversationId/:type` - Download PDF files
7. **GET** `/products/:id` - Get company product details

## How It Works

### 1. User Flow
1. User clicks "Complete Intake Form" button on product page
2. System checks for existing conversations for that product
3. If exists, shows completed results with PDF downloads
4. If new, starts category selection or uses product category
5. AI-powered questionnaire begins with dynamic questions
6. User can respond via text, file upload, or voice recording
7. AI processes responses and generates follow-up questions
8. On completion, generates summary and FIR reports
9. PDFs are automatically generated and stored
10. User can download reports and restart if needed

### 2. Data Flow
1. Frontend sends responses to `/intake-questionnaire`
2. Backend forwards to external AI service
3. AI returns next question or completion status
4. On completion, conversation saved to database
5. PDFs generated asynchronously
6. File paths stored in database
7. User can download via secure endpoints

### 3. AI Integration
- Integrates with existing AI service at `https://chatsystem-xudw.onrender.com/chats`
- Supports text responses, file uploads, and voice input
- Generates both summary reports and FIR (First Information Report)
- Handles product categorization and compliance checking

## Security Features
- Authentication required for all endpoints
- User can only access their own company's products
- File upload restrictions (images, PDFs, documents only)
- CSRF protection on sensitive operations
- Secure PDF download with proper headers

## Error Handling
- Comprehensive error logging
- User-friendly error messages
- Fallback for AI service failures
- Database transaction management
- File cleanup on errors

## Testing
To test the system:
1. Ensure database migration is complete
2. Start the backend server
3. Login as a company user
4. Navigate to a product page
5. Click "Complete Intake Form"
6. Follow the AI questionnaire flow

## Notes
- The system maintains conversation history
- PDFs are generated using PDFKit library
- File uploads stored in `uploads/intake-files/`
- Generated PDFs stored in `pdfs/` directory
- Supports multiple product categories and subcategories
- FIR reports generated for specific categories (food, cosmetics, pharmaceuticals)

## Troubleshooting
1. **Database Connection Issues**: Check PostgreSQL credentials and connection
2. **AI Service Errors**: Verify external service availability
3. **PDF Generation Fails**: Check file permissions and disk space
4. **File Upload Issues**: Verify upload directory exists and has write permissions
5. **Authentication Errors**: Ensure JWT tokens are properly configured 