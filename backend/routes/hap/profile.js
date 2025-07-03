const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');

// Create a new pool instance using environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'Uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get HAP Profile
router.get('/user', authenticateToken, async (req, res) => {
  let client;
  try {
    // Verify user is a HAP
    if (req.user.signup_type !== 'hap') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only HAP can access this endpoint.' 
      });
    }

    client = await pool.connect();
    
    // Get profile for the HAP user
    const result = await client.query(
      `SELECT p.*, u.email, u.phone 
       FROM profiles p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.user_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching HAP profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  } finally {
    if (client) client.release();
  }
});

// Update HAP Profile
router.put('/:id', authenticateToken, upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'cancelled_cheque', maxCount: 1 },
  { name: 'certifications', maxCount: 5 },
  { name: 'other_documents', maxCount: 5 }
]), async (req, res) => {
  let client;
  try {
    // Verify user is a HAP
    if (req.user.signup_type !== 'hap') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only HAP can access this endpoint.' 
      });
    }

    const { id } = req.params;
    const files = req.files;
    const {
      fullName,
      dateOfBirth,
      gender,
      mobileNumber,
      emailAddress,
      currentAddress,
      permanentAddress,
      idNumber,
      bankAccountNumber,
      ifscCode,
      highestQualification,
      institution,
      yearOfCompletion,
      yearsOfExperience,
      currentOccupation
    } = req.body;

    client = await pool.connect();

    // Check if profile exists and belongs to the user
    const profileCheck = await client.query(
      'SELECT * FROM profiles WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or you do not have permission to edit it'
      });
    }

    // Update profile
    const updateQuery = `
      UPDATE profiles 
      SET 
        full_name = $1,
        date_of_birth = $2,
        gender = $3,
        mobile_number = $4,
        email_address = $5,
        current_address = $6,
        permanent_address = $7,
        id_number = $8,
        bank_account_number = $9,
        ifsc_code = $10,
        highest_qualification = $11,
        institution = $12,
        year_of_completion = $13,
        years_of_experience = $14,
        current_occupation = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16 AND user_id = $17
      RETURNING *
    `;

    const updateValues = [
      fullName,
      dateOfBirth,
      gender,
      mobileNumber,
      emailAddress,
      currentAddress,
      permanentAddress,
      idNumber,
      bankAccountNumber,
      ifscCode,
      highestQualification,
      institution,
      yearOfCompletion,
      yearsOfExperience,
      currentOccupation,
      id,
      req.user.id
    ];

    const result = await client.query(updateQuery, updateValues);

    // Update files if provided
    if (files) {
      const fileUpdates = [];
      if (files.photo) {
        fileUpdates.push(client.query(
          'UPDATE profiles SET photo_path = $1 WHERE id = $2',
          [files.photo[0].filename, id]
        ));
      }
      if (files.selfie) {
        fileUpdates.push(client.query(
          'UPDATE profiles SET selfie_path = $1 WHERE id = $2',
          [files.selfie[0].filename, id]
        ));
      }
      if (files.resume) {
        fileUpdates.push(client.query(
          'UPDATE profiles SET resume_path = $1 WHERE id = $2',
          [files.resume[0].filename, id]
        ));
      }
      if (files.cancelled_cheque) {
        fileUpdates.push(client.query(
          'UPDATE profiles SET cancelled_cheque_path = $1 WHERE id = $2',
          [files.cancelled_cheque[0].filename, id]
        ));
      }
      if (files.certifications) {
        const certificationPaths = files.certifications.map(file => file.filename).join(',');
        fileUpdates.push(client.query(
          'UPDATE profiles SET certifications = $1 WHERE id = $2',
          [certificationPaths, id]
        ));
      }
      if (files.other_documents) {
        const otherDocPaths = files.other_documents.map(file => file.filename).join(',');
        fileUpdates.push(client.query(
          'UPDATE profiles SET other_documents = $1 WHERE id = $2',
          [otherDocPaths, id]
        ));
      }

      await Promise.all(fileUpdates);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating HAP profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  } finally {
    if (client) client.release();
  }
});

module.exports = router; 