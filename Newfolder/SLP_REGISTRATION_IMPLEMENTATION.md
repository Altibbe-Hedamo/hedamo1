# SLP (Service Partners) Registration Implementation

## Overview
This document outlines the implementation of SLP (Service Partners) registration with OTP verification, following the same process as other user types in the Hedamo platform.

## Changes Made

### 1. Database Schema Updates
- **File**: `backend/schema.sql`
- **Change**: Added 'slp' to the signup_type constraint
- **Updated constraint**: `CHECK (signup_type IN ('agent', 'admin', 'client', 'employee', 'hr', 'channel_partner', 'hap', 'hrb', 'slp'))`

### 2. Database Migration
- **File**: `backend/migrations/add_slp_to_signup_types.sql`
- **Purpose**: Updates existing database to include 'slp' in the signup_type constraint
- **Script**: `backend/apply_slp_migration.js` - applies the migration

### 3. Backend Server Updates
- **File**: `backend/server.js`
- **Changes**:
  - Updated signup endpoint to handle SLP registration with OTP verification
  - Added SLP to the list of signup types that require password and OTP
  - Updated database insert logic to handle SLP-specific fields
  - SLP users get the same fields as agents and channel partners (linkedin_url, pincode, city, state, referral_id, experience_years, company_name, website, address)

### 4. Frontend Updates
- **File**: `frontend/src/pages/Signup.tsx`
- **Changes**:
  - Added "Service Partner (SLP)" option to the signup type dropdown
  - Updated OTP sending logic to include SLP
  - Added SLP-specific form fields:
    - LinkedIn Profile URL (required)
    - Referral ID (optional)
    - Years of Experience (required)
    - Company Name, Website, Address (from channel partner section)
  - Updated password and OTP validation for SLP users
  - Added navigation to `/slp-portal` after successful registration

## SLP Registration Flow

1. **User selects "Service Partner (SLP)"** from the signup type dropdown
2. **User fills in basic information** (name, email, phone)
3. **User clicks "Send OTP"** - OTP is sent to their email
4. **User enters OTP** and fills in SLP-specific fields:
   - LinkedIn Profile URL
   - Years of Experience
   - Referral ID (optional)
   - Company details (name, website, address)
   - Location details (pincode, city, state)
5. **User submits registration** - OTP is verified and user is created
6. **User is redirected** to `/slp-portal` after successful registration

## SLP-Specific Fields

### Required Fields
- Full Name
- Email
- Phone Number
- Password
- OTP (sent to email)
- LinkedIn Profile URL
- Years of Experience
- Company Name
- Website
- Address
- Pincode
- City
- State

### Optional Fields
- Referral ID

## Database Storage

SLP users are stored in the `users` table with:
- `signup_type`: 'slp'
- `status`: 'pending' (requires admin approval)
- All SLP-specific fields stored in the same columns as other user types

## Testing

A test script has been created at `backend/test_slp_registration.js` to verify the implementation.

## Next Steps

1. **Create SLP Portal**: Implement the `/slp-portal` route and dashboard
2. **Admin Approval**: Add admin interface to approve SLP registrations
3. **SLP Dashboard**: Create dashboard with SLP-specific features
4. **Email Templates**: Customize email templates for SLP registration

## Files Modified

### Backend
- `backend/schema.sql`
- `backend/server.js`
- `backend/migrations/add_slp_to_signup_types.sql`
- `backend/apply_slp_migration.js`
- `backend/check_signup_types.js`
- `backend/test_slp_registration.js`

### Frontend
- `frontend/src/pages/Signup.tsx`

## Migration Status

✅ Database migration applied successfully
✅ Backend server updated
✅ Frontend signup form updated
✅ OTP verification implemented
✅ SLP-specific fields added

The SLP registration feature is now fully implemented and ready for testing! 