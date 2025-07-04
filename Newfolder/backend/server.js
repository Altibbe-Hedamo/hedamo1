require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();

app.use(express.json());
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'https://hedamo1-1.onrender.com').replace(/\/$/, ''),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Block X-User-Id header
app.use((req, res, next) => {
  if (req.headers['x-user-id']) {
    console.warn(`Blocked X-User-Id header: ${req.headers['x-user-id']} for ${req.method} ${req.url}`);
    delete req.headers['x-user-id'];
  }
  next();
});

// Log req.user modifications
app.use((req, res, next) => {
  const originalUser = req.user ? JSON.stringify(req.user) : 'undefined';
  res.on('finish', () => {
    if (req.user && JSON.stringify(req.user) !== originalUser) {
      console.log(`req.user modified in ${req.method} ${req.url}: from ${originalUser} to ${JSON.stringify(req.user)}`);
    }
  });
  next();
});
// File upload directories
const uploadDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const productsUploadDir = path.join(uploadDir, 'products');
if (!fs.existsSync(productsUploadDir)) {
  fs.mkdirSync(productsUploadDir, { recursive: true });
}
const profilesUploadDir = path.join(uploadDir, 'profiles');
if (!fs.existsSync(profilesUploadDir)) {
  fs.mkdirSync(profilesUploadDir, { recursive: true });
}
const resumesUploadDir = path.join(uploadDir, 'resumes');
if (!fs.existsSync(resumesUploadDir)) {
  fs.mkdirSync(resumesUploadDir, { recursive: true });
}
app.use('/Uploads', express.static(uploadDir));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.path.includes('/api/profiles')) {
      cb(null, profilesUploadDir);
    } else if (req.path.includes('/api/careers/apply')) {
      cb(null, resumesUploadDir);
    } else {
      cb(null, productsUploadDir);
    }
  },
  filename: (req, file, cb) => {
    if (req.path.includes('/api/profiles') || req.path.includes('/api/careers/apply')) {
      const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueSuffix);
    } else {
      const ext = path.extname(file.originalname);
      const rand = Math.floor(Math.random() * 90) + 10;
      cb(null, `user_${req.user?.id || 'unknown'}_${rand}${ext}`);
    }
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

// Test database connection at startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection error:', err.message, err.stack);
    process.exit(1);
  }
  console.log('Connected to Neon database');
  release();
});

// Recipient email validation
const blockedEmailDomains = [
  'tempmail.com',
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  // Add more disposable email domains as needed
];

const validateRecipientEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  const domain = email.split('@')[1].toLowerCase();
  return !blockedEmailDomains.includes(domain);
};

// Nodemailer transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Verify email configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const verifyCsrfToken = (req, res, next) => {
  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.body.csrf_token;
  if (!csrfToken || csrfToken !== sessionToken) {
    return res.status(403).json({ success: false, error: 'Invalid CSRF token' });
  }
  next();
};

// JWT authentication
// Enhanced authenticateToken middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log(`authenticateToken: ${req.method} ${req.url} - Token: ${token ? 'Present' : 'Missing'}`);
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id || isNaN(parseInt(decoded.id, 10))) {
      console.error('authenticateToken: Invalid user ID in token', decoded);
      return res.status(401).json({ success: false, message: 'Invalid user ID in token' });
    }
    req.user = {
      id: parseInt(decoded.id, 10),
      signup_type: decoded.signup_type,
    };
    console.log(`authenticateToken: User set: ${JSON.stringify(req.user)}`);
    next();
  } catch (err) {
    console.error(`authenticateToken: Token verification failed for ${req.method} ${req.url}:`, err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
module.exports.authenticateToken = authenticateToken;


// Role-based access control
const checkAccess = (requiredRoles) => (req, res, next) => {
  console.log('checkAccess: User:', req.user, 'Required roles:', requiredRoles);
  if (!req.user || !req.user.signup_type) {
    console.error('checkAccess: Missing user or signup_type');
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  if (!requiredRoles.includes(req.user.signup_type)) {
    console.error('checkAccess: Access denied for user:', req.user);
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  next();
};
module.exports.checkAccess = checkAccess;

// Calculate profile completion percentage
const calculateCompletionPercentage = (profileData) => {
  const fields = [
    'full_name', 'date_of_birth', 'gender', 'mobile_number', 'email_address', 'current_address', 'permanent_address',
    'photo_path', 'selfie_path', 'bank_account_number', 'ifsc_code', 'cancelled_cheque_path',
    'highest_qualification', 'institution', 'year_of_completion', 'certifications', 'years_of_experience',
    'current_company', 'current_position', 'current_salary', 'expected_salary', 'notice_period',
    'preferred_locations', 'preferred_job_types', 'preferred_industries', 'preferred_roles',
    'languages_known', 'skills', 'achievements', 'references'
  ];

  const completedFields = fields.filter(field => {
    const value = profileData[field];
    return value !== null && value !== undefined && value !== '';
  });

  return Math.round((completedFields.length / fields.length) * 100);
};

// Verify Token
app.get('/api/verify-token', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const userResult = await client.query(
      'SELECT id, email, signup_type, status FROM users WHERE id = $1',
      [req.user.id]
    );
    client.release();

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        type: userResult.rows[0].signup_type,
        status: userResult.rows[0].status
      },
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify token' });
  }
});

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Add this near the top of server.js, after other imports
const csrf = require('csurf');

// Add CSRF protection middleware
const csrfProtection = csrf({ cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'strict' } });
// Add CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ success: true, csrfToken: req.csrfToken() });
});

// Add OTP storage
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
app.post('/api/send-otp', async (req, res) => {
  const { email, csrf_token } = req.body;
  let client;

  try {
    console.log('Send OTP request received:', { email });
    
    if (!email) {
      console.log('Email is missing in request');
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing:', {
        hasUser: !!process.env.EMAIL_USER,
        hasPass: !!process.env.EMAIL_PASS
      });
      return res.status(500).json({ 
        success: false, 
        error: 'Email service not configured properly',
        details: 'Please check the email configuration in the backend'
      });
    }

    client = await pool.connect();
    console.log('Database connection established');

    // Check if user exists
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      console.log('User already exists:', email);
      client.release();
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('Generated OTP:', { otp, expiry: otpExpiry });

    // Store OTP
    await client.query(
      'INSERT INTO otps (email, otp, expiry) VALUES ($1, $2, $3)',
      [email, otp, otpExpiry]
    );
    console.log('OTP stored in database');

    // Send OTP email
    try {
      console.log('Preparing to send OTP email to:', email);
      
      const mailOptions = {
        from: {
          name: 'Your App',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Your OTP for Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Your Verification Code</h2>
            <p style="font-size: 16px; color: #666;">Please use the following code to complete your registration:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
              <span style="font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #999;">This code will expire in 10 minutes.</p>
            <p style="font-size: 14px; color: #999;">If you did not request this code, please ignore this email.</p>
          </div>
        `
      };

      console.log('Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      });

      client.release();
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (emailError) {
      console.error('Email sending failed:', {
        error: emailError.message,
        stack: emailError.stack,
        code: emailError.code,
        command: emailError.command,
        responseCode: emailError.responseCode,
        response: emailError.response
      });
      client.release();
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send OTP email',
        details: emailError.message,
        code: emailError.code
      });
    }
  } catch (error) {
    console.error('Send OTP process failed:', {
      error: error.message,
      stack: error.stack,
      type: error.name
    });
    if (client) {
      client.release();
    }
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send OTP',
      details: error.message 
    });
  }
});


// Set Password
app.post('/api/set-password', async (req, res) => {
  const { hashedEmail, email, password } = req.body;
  if (!hashedEmail || !email || !password) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    const client = await pool.connect();
    const user = await client.query(
      'SELECT id, status, reset_token_expiry FROM users WHERE hashed_email = $1 AND email = $2',
      [hashedEmail, email]
    );

    if (user.rows.length === 0) {
      client.release();
      return res.status(400).json({ success: false, error: 'Invalid or expired verification link' });
    }

    const { status, reset_token_expiry } = user.rows[0];
    if (status === 'active' && reset_token_expiry && new Date() > new Date(reset_token_expiry)) {
      client.release();
      return res.status(400).json({ success: false, error: 'Reset link has expired' });
    }
    if (status !== 'pending' && status !== 'active') {
      client.release();
      return res.status(400).json({ success: false, error: 'Invalid account status' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const updateResult = await client.query(
      `UPDATE users 
       SET password = $1, status = $2, hashed_email = NULL, reset_token_expiry = NULL, 
       updated_at = CURRENT_TIMESTAMP
       WHERE email = $3
       RETURNING id, email, status`,
      [hashedPassword, status === 'pending' ? 'active' : status, email]
    );

    client.release();
    res.json({ success: true, message: 'Password set successfully' });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ success: false, error: 'Failed to set password' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });
  try {
    const client = await pool.connect();
    // Modify query to allow pending status for agents and hap users
    const user = await client.query(
      'SELECT * FROM users WHERE email = $1 AND (status = $2 OR (signup_type IN ($3, $4, $5, $6) AND status = $7))',
      [email, 'active', 'agent', 'hap', 'channel_partner', 'employee', 'pending']
    );
    console.log('User found:', user.rows.length > 0);
    console.log('User details:', {
      id: user.rows[0]?.id,
      email: user.rows[0]?.email,
      signup_type: user.rows[0]?.signup_type,
      status: user.rows[0]?.status
    });

    if (user.rows.length === 0) {
      client.release();
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.rows[0].password);
    console.log('Password match:', passwordMatch);
    if (!passwordMatch) {
      client.release();
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Log the user's signup_type before token generation
    console.log('User signup_type:', user.rows[0].signup_type);

    const token = jwt.sign(
      { 
        id: user.rows[0].id, 
        signup_type: user.rows[0].signup_type
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('Token generated with signup_type:', user.rows[0].signup_type);

    // Prepare response data
    let userResponse = {
      id: user.rows[0].id,
      email: user.rows[0].email,
      type: user.rows[0].signup_type,
      signup_type: user.rows[0].signup_type,
      status: user.rows[0].status
    };
    // If agent, include kyc_status
    if (user.rows[0].signup_type === 'agent') {
      userResponse.kyc_status = user.rows[0].kyc_status;
    }
    const responseData = {
      success: true,
      user: userResponse,
      token
    };
    console.log('Sending response:', responseData);

    client.release();
    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Failed to login' });
  }
});
// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  try {
    const client = await pool.connect();
    const user = await client.query('SELECT id, status FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      client.release();
      return res.status(400).json({ success: false, error: 'Email not found' });
    }

    if (user.rows[0].status !== 'active') {
      client.release();
      return res.status(400).json({ success: false, error: 'Account is not active' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await client.query(
      'UPDATE users SET hashed_email = $1, reset_token_expiry = $2 WHERE email = $3',
      [hashedToken, expiry, email]
    );

    const resetLink = `${process.env.FRONTEND_URL}/set-password?c=${hashedToken}&email=${encodeURIComponent(email)}`;
    try {
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Please click the link below to set a new password:</p>
          <a href="${resetLink}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        `,
      });
    } catch (emailError) {
      client.release();
      return res.status(500).json({ success: false, error: 'Failed to send reset email' });
    }

    client.release();
    res.json({ success: true, message: 'Please check your email to reset your password' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to process request' });
  }
});

// Register (Admin/Employee)
app.post('/api/register', authenticateToken, checkAccess(['admin', 'employee']), verifyCsrfToken, async (req, res) => {
  const {
    first_name,
    middle_name = '',
    last_name,
    email,
    phone,
    alt_phone = '',
    time_zone,
    pref,
    referral = '0',
    registered_by,
  } = req.body;
  const userId = req.user.id;

  try {
    const client = await pool.connect();
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );
    if (existing.rows.length > 0) {
      client.release();
      return res.status(400).json({ success: false, error: 'Email or phone number already exists' });
    }

    const fileResult = await client.query('SELECT MAX(file_no) AS max_file_no FROM files');
    const maxFileNo = fileResult.rows[0].max_file_no;
    const currentYear = 2024;

    let newFileNo;
    if (!maxFileNo || parseInt(maxFileNo.toString().slice(0, 2)) < parseInt(currentYear.toString().slice(2))) {
      newFileNo = parseInt(currentYear.toString().slice(2)) * 10000 + 1;
    } else {
      newFileNo = parseInt(maxFileNo) + 1;
    }

    await client.query(
      'INSERT INTO files (file_no, emp_id, year) VALUES ($1, $2, $3)',
      [newFileNo, userId, currentYear]
    );

    const hashedEmail = crypto.createHash('sha256').update(email).digest('hex');
    const userResult = await client.query(
      `INSERT INTO users (
        first_name, middle_name, last_name, email, phone, alt_phone, registered_by,
        file_no, year, referral, time_zone, pref, signup_type, hashed_email, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id`,
      [
        first_name, middle_name, last_name, email, phone, alt_phone, registered_by,
        newFileNo, currentYear, referral, time_zone, pref, 'client', hashedEmail, 'pending',
      ]
    );

    const newUserId = userResult.rows[0].id;
    await client.query(
      'UPDATE files SET user_id = $1 WHERE file_no = $2 AND year = $3',
      [newUserId, newFileNo, currentYear]
    );

    const passwordSettingURL = `${process.env.FRONTEND_URL}/set-password?c=${hashedEmail}&email=${encodeURIComponent(email)}`;
    try {
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Set Your Password',
        html: `
          <h2>Thank You For The Registration</h2>
          <p>Please click the link below to set your password:</p>
          <a href="${passwordSettingURL}">Set Password</a>
        `,
      });
    } catch (emailError) {
      client.release();
      return res.status(500).json({ success: false, error: 'Failed to send verification email' });
    }

    client.release();
    res.json({ success: true, message: 'Please check your email to set your password' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Failed to register user' });
  }
});

// Change Year (Admin/Employee)
app.post('/api/change-year', authenticateToken, checkAccess(['admin', 'employee']), verifyCsrfToken, async (req, res) => {
  const { year } = req.body;
  if (!['2022', '2023', '2024'].includes(year)) {
    return res.status(400).json({ success: false, error: 'Invalid year' });
  }
  res.json({ success: true, year });
});

// Update Profile
app.post('/api/update-profile', authenticateToken, upload.single('profile_image'), async (req, res) => {
  const { first_name, last_name, email, phone } = req.body;
  const userId = req.user.id;
  const image = req.file ? req.file.filename : null;

  try {
    const client = await pool.connect();
    const emailCheck = await client.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );
    if (emailCheck.rows.length > 0) {
      client.release();
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    const phoneCheck = await client.query(
      'SELECT id FROM users WHERE phone = $1 AND id != $2',
      [phone, userId]
    );
    if (phoneCheck.rows.length > 0) {
      client.release();
      return res.status(400).json({ success: false, error: 'Phone already in use' });
    }

    if (image) {
      await client.query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3, phone = $4, image = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
        [first_name, last_name, email, phone, image, userId]
      );
    } else {
      await client.query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3, phone = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
        [first_name, last_name, email, phone, userId]
      );
    }

    client.release();
    res.json({ success: true });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Get User Profile
app.get('/api/user-profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  console.log('Fetching user profile for userId:', userId);
  try {
    const client = await pool.connect();
    const userResult = await client.query(
      'SELECT id, first_name, last_name, email, phone, image, signup_type FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      client.release();
      console.log('User not found for userId:', userId);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const favResult = await client.query(
      `SELECT p.id, p.name, i.file AS image, c.name AS company_name, c.current_market,
              cat.name AS category_name
       FROM user_favorites uf
       JOIN products p ON p.id = uf.item_id
       JOIN product_images i ON i.product_id = p.id AND i.position = 1
       JOIN company c ON p.company_id = c.id
       JOIN categories cat ON p.category = cat.id
       WHERE uf.user_id = $1 AND uf.item_type = 'product' AND p.status = 'active'`,
      [userId]
    );

    client.release();
    console.log('User profile fetched:', {
      id: userResult.rows[0].id,
      email: userResult.rows[0].email,
      signup_type: userResult.rows[0].signup_type,
    });
    res.json({
      success: true,
      user: {
        id: userResult.rows[0].id,
        first_name: userResult.rows[0].first_name,
        last_name: userResult.rows[0].last_name,
        email: userResult.rows[0].email,
        phone: userResult.rows[0].phone,
        image: userResult.rows[0].image,
        type: userResult.rows[0].signup_type,
      },
      favorites: favResult.rows,
    });
  } catch (err) {
    console.error('Fetch profile error for userId:', userId, 'Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch user data' });
  }
});

// Get Agent Profile
app.get('/api/agent-profile', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = req.user.id;
  try {
    const client = await pool.connect();
    const userResult = await client.query(
      'SELECT u.first_name, u.last_name, u.email, u.phone, u.signup_type, a.address, a.work_location, a.kyc_status ' +
      'FROM users u ' +
      'LEFT JOIN agents a ON u.id = a.user_id ' +
      'WHERE u.id = $1',
      [userId]
    );

    client.release();

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    res.json({
      success: true,
      user: {
        id: userId,
        first_name: userResult.rows[0].first_name,
        last_name: userResult.rows[0].last_name,
        email: userResult.rows[0].email,
        phone: userResult.rows[0].phone,
        type: userResult.rows[0].signup_type,
        address: userResult.rows[0].address,
        work_location: userResult.rows[0].work_location,
        kyc_status: userResult.rows[0].kyc_status,
      },
    });
  } catch (error) {
    console.error('Fetch agent profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch agent profile' });
  }
});

// Create Profile
app.post(
  '/api/profiles',
  authenticateToken,
  checkAccess(['agent', 'hap', 'admin']),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'cancelled_cheque', maxCount: 1 },
    { name: 'certifications', maxCount: 5 },
    { name: 'other_documents', maxCount: 5 },
  ]),
  async (req, res) => {
    console.log('POST /api/profiles called by user:', req.user);
    console.log('Form data:', req.body);
    console.log('Files:', req.files);
    try {
      // If admin is creating the profile, use the user_id from the request body
      const userId = req.user.signup_type === 'admin' ? req.body.userId : req.user.id;
      console.log('User ID:', userId);

      const existingProfile = await pool.query('SELECT id FROM profiles WHERE user_id = $1', [userId]);
      console.log('Existing profile check:', existingProfile.rows);
      
      if (existingProfile.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User already has a profile',
        });
      }

      const files = req.files;
      console.log('Files received:', files);

      const requiredFields = [
        'fullName', 'dateOfBirth', 'mobileNumber', 'emailAddress', 'currentAddress',
        'idNumber', 'bankAccountNumber', 'ifscCode', 'highestQualification',
        'institution', 'yearOfCompletion', 'yearsOfExperience', 'primarySectors',
        'regionsCovered', 'languagesSpoken', 'devicesAvailable', 'internetQuality',
        'digitalToolComfort', 'acceptCodeOfConduct', 'trainingWillingness',
      ];

      console.log('Checking required fields...');
      const missingFields = requiredFields.filter((field) => !req.body[field]);
      console.log('Missing fields:', missingFields);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      const mobileNumber = req.body.mobileNumber;
      console.log('Mobile number:', mobileNumber);
      
      const mobileRegex = /^\+?[1-9]\d{1,14}$/;
      if (!mobileRegex.test(mobileNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number. Must start with a non-zero digit or + followed by digits (e.g., +1234567890).',
        });
      }

      console.log('Creating profile data object...');
      const profileData = {
        user_id: userId,
        full_name: req.body.fullName,
        date_of_birth: req.body.dateOfBirth,
        gender: req.body.gender,
        mobile_number: req.body.mobileNumber,
        email_address: req.body.emailAddress,
        current_address: req.body.currentAddress,
        permanent_address: req.body.permanentAddress,
        photo_path: files['photo']?.[0]?.filename,
        selfie_path: files['selfie']?.[0]?.filename,
        id_number: req.body.idNumber,
        bank_account_number: req.body.bankAccountNumber,
        ifsc_code: req.body.ifscCode,
        cancelled_cheque_path: files['cancelled_cheque']?.[0]?.filename,
        highest_qualification: req.body.highestQualification,
        institution: req.body.institution,
        year_of_completion: req.body.yearOfCompletion,
        certifications: files['certifications']?.map((f) => f.filename).join(',') || req.body.certifications,
        years_of_experience: req.body.yearsOfExperience,
        current_occupation: req.body.currentOccupation,
        reference_details: req.body.references,
        primary_sectors: req.body.primarySectors,
        regions_covered: req.body.regionsCovered,
        languages_spoken: req.body.languagesSpoken,
        client_base_size: req.body.clientBaseSize,
        expected_audit_volume: req.body.expectedAuditVolume,
        devices_available: req.body.devicesAvailable,
        internet_quality: req.body.internetQuality,
        digital_tool_comfort: req.body.digitalToolComfort,
        criminal_record: req.body.criminalRecord || 'No',
        criminal_details: req.body.criminalDetails,
        conflict_of_interest: req.body.conflictOfInterest,
        accept_code_of_conduct: req.body.acceptCodeOfConduct === 'true',
        training_willingness: req.body.trainingWillingness || 'Yes',
        training_mode: req.body.trainingMode,
        availability: req.body.availability,
        additional_skills: req.body.additionalSkills,
        comments: req.body.comments,
        resume_path: files['resume']?.[0]?.filename,
        other_documents: files['other_documents']?.map((f) => f.filename).join(','),
        completion_percentage: 0,
        status: 'pending',
      };

      console.log('Profile data created:', profileData);
      profileData.completion_percentage = calculateCompletionPercentage(profileData);
      console.log('Completion percentage calculated:', profileData.completion_percentage);

      const query = `
        INSERT INTO profiles (
          user_id, full_name, date_of_birth, gender, mobile_number, email_address, current_address, permanent_address,
          photo_path, selfie_path, id_number, bank_account_number, ifsc_code, cancelled_cheque_path,
          highest_qualification, institution, year_of_completion, certifications, years_of_experience,
          current_occupation, reference_details, primary_sectors, regions_covered, languages_spoken,
          client_base_size, expected_audit_volume, devices_available, internet_quality, digital_tool_comfort,
          criminal_record, criminal_details, conflict_of_interest, accept_code_of_conduct,
          training_willingness, training_mode, availability, additional_skills, comments, resume_path,
          other_documents, completion_percentage, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39,
          $40, $41, $42
        ) RETURNING id
      `;

      const values = [
        profileData.user_id,
        profileData.full_name,
        profileData.date_of_birth,
        profileData.gender,
        profileData.mobile_number,
        profileData.email_address,
        profileData.current_address,
        profileData.permanent_address,
        profileData.photo_path,
        profileData.selfie_path,
        profileData.id_number,
        profileData.bank_account_number,
        profileData.ifsc_code,
        profileData.cancelled_cheque_path,
        profileData.highest_qualification,
        profileData.institution,
        profileData.year_of_completion,
        profileData.certifications,
        profileData.years_of_experience,
        profileData.current_occupation,
        profileData.reference_details,
        profileData.primary_sectors,
        profileData.regions_covered,
        profileData.languages_spoken,
        profileData.client_base_size,
        profileData.expected_audit_volume,
        profileData.devices_available,
        profileData.internet_quality,
        profileData.digital_tool_comfort,
        profileData.criminal_record,
        profileData.criminal_details,
        profileData.conflict_of_interest,
        profileData.accept_code_of_conduct,
        profileData.training_willingness,
        profileData.training_mode,
        profileData.availability,
        profileData.additional_skills,
        profileData.comments,
        profileData.resume_path,
        profileData.other_documents,
        profileData.completion_percentage,
        profileData.status,
      ];

      console.log('Executing profile insert query...');
      const result = await pool.query(query, values);
      console.log('Profile insert result:', result.rows[0]);

      try {
        const adminEmails = await pool.query('SELECT email FROM users WHERE signup_type = $1', ['admin']);
        await transporter.sendMail({
          from: `"Your App" <${process.env.EMAIL_USER}>`,
          to: adminEmails.rows.map((row) => row.email),
          subject: 'New Profile for Approval',
          html: `
            <h2>New Profile Submitted</h2>
            <p>A new profile has been submitted by user ID ${userId} (${profileData.full_name}).</p>
            <p>Please review it in the admin dashboard.</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to notify admin:', emailError);
      }

      res.status(201).json({
        success: true,
        profileId: result.rows[0].id,
        status: profileData.status,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to save profile',
      });
    }
  }
);


// Get Agent Profile by User
app.get('/api/profiles/user', authenticateToken, checkAccess(['agent', 'admin', 'client', 'employee']), async (req, res) => {
  console.log(`GET /api/profiles/user - req.user: ${JSON.stringify(req.user)}`);
  
  try {
    if (!req.user || !req.user.id) {
      console.error('Missing req.user or req.user.id');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const userId = parseInt(req.user.id, 10);
    if (isNaN(userId)) {
      console.error(`Invalid user ID: ${req.user.id}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    // Fetch user profile
    const profileQuery = 'SELECT * FROM profiles WHERE user_id = $1';
    const profileResult = await pool.query(profileQuery, [userId]);

    if (profileResult.rows.length === 0) {
      console.log(`No profile found for user ID: ${userId}`);
      return res.status(200).json({
        success: true,
        profile: null,
        companies: [],
        products: [],
        message: 'Profile not found',
      });
    }

    const profile = profileResult.rows[0];

    // Fetch companies created by the user
    const companyQuery = 'SELECT id, name, status FROM company WHERE created_by = $1';
    const companyResult = await pool.query(companyQuery, [userId]);
    const companies = companyResult.rows;

    // Fetch products related to user's companies
    const productQuery = `
      SELECT p.id, p.name, p.status, p.company_id
      FROM products p
      WHERE p.company_id IN (
        SELECT id FROM company WHERE created_by = $1
      )
    `;
    const productResult = await pool.query(productQuery, [userId]);
    const products = productResult.rows;

    // Final response
    res.status(200).json({
      success: true,
      status: profile.status,
      profile,
      companies,
      products,
    });

  } catch (error) {
    console.error(`Error fetching profile for user_id=${req.user?.id}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to fetch profile: ${error.message}`,
    });
  }
});



// Update Agent Profile
app.put(
  '/api/profiles/:id',
  authenticateToken,
  checkAccess(['agent', 'employee']),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'resume', maxCount: 1 },
    { name: 'cancelled_cheque', maxCount: 1 },
    { name: 'certifications', maxCount: 5 },
    { name: 'other_documents', maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const files = req.files;

      const existingProfile = await pool.query('SELECT * FROM profiles WHERE id = $1 AND user_id = $2', [id, userId]);
      if (existingProfile.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found or you do not have permission to edit it',
        });
      }

      const currentProfile = existingProfile.rows[0];

      const profileData = {
        full_name: req.body.fullName || currentProfile.full_name,
        date_of_birth: req.body.dateOfBirth || currentProfile.date_of_birth,
        gender: req.body.gender || currentProfile.gender,
        mobile_number: req.body.mobileNumber || currentProfile.mobile_number,
        email_address: req.body.emailAddress || currentProfile.email_address,
        current_address: req.body.currentAddress || currentProfile.current_address,
        permanent_address: req.body.permanentAddress || currentProfile.permanent_address,
        photo_path: files['photo']?.[0]?.filename || currentProfile.photo_path,
        selfie_path: files['selfie']?.[0]?.filename || currentProfile.selfie_path,
        bank_account_number: req.body.bankAccountNumber || currentProfile.bank_account_number,
        ifsc_code: req.body.ifscCode || currentProfile.ifsc_code,
        cancelled_cheque_path: files['cancelled_cheque']?.[0]?.filename || currentProfile.cancelled_cheque_path,
        highest_qualification: req.body.highestQualification || currentProfile.highest_qualification,
        institution: req.body.institution || currentProfile.institution,
        year_of_completion: req.body.yearOfCompletion || currentProfile.year_of_completion,
        certifications: files['certifications']?.map((f) => f.filename).join(',') || req.body.certifications || currentProfile.certifications,
        years_of_experience: req.body.yearsOfExperience || currentProfile.years_of_experience,
        current_occupation: req.body.currentOccupation || currentProfile.current_occupation,
        reference_details: req.body.references || currentProfile.reference_details,
        primary_sectors: req.body.primarySectors || currentProfile.primary_sectors,
        regions_covered: req.body.regionsCovered || currentProfile.regions_covered,
        languages_spoken: req.body.languagesSpoken || currentProfile.languages_spoken,
        client_base_size: req.body.clientBaseSize || currentProfile.client_base_size,
        expected_audit_volume: req.body.expectedAuditVolume || currentProfile.expected_audit_volume,
        devices_available: req.body.devicesAvailable || currentProfile.devices_available,
        internet_quality: req.body.internetQuality || currentProfile.internet_quality,
        digital_tool_comfort: req.body.digitalToolComfort || currentProfile.digital_tool_comfort,
        criminal_record: req.body.criminalRecord || currentProfile.criminal_record,
        criminal_details: req.body.criminalDetails || currentProfile.criminal_details,
        conflict_of_interest: req.body.conflictOfInterest || currentProfile.conflict_of_interest,
        accept_code_of_conduct: req.body.acceptCodeOfConduct === 'true' || currentProfile.accept_code_of_conduct,
        training_willingness: req.body.trainingWillingness || currentProfile.training_willingness,
        training_mode: req.body.trainingMode || currentProfile.training_mode,
        availability: req.body.availability || currentProfile.availability,
        additional_skills: req.body.additionalSkills || currentProfile.additional_skills,
        comments: req.body.comments || currentProfile.comments,
        resume_path: files['resume']?.[0]?.filename || currentProfile.resume_path,
        other_documents: files['other_documents']?.map((f) => f.filename).join(',') || currentProfile.other_documents,
        completion_percentage: 0,
        status: 'pending',
      };

      profileData.completion_percentage = calculateCompletionPercentage(profileData);

      if (files['photo']?.[0]?.filename && currentProfile.photo_path) {
        try {
          fs.unlinkSync(path.join(profilesUploadDir, currentProfile.photo_path));
        } catch (err) {
          console.warn('Failed to delete old photo:', err);
        }
      }
      if (files['selfie']?.[0]?.filename && currentProfile.selfie_path) {
        try {
          fs.unlinkSync(path.join(profilesUploadDir, currentProfile.selfie_path));
        } catch (err) {
          console.warn('Failed to delete old selfie:', err);
        }
      }
      if (files['resume']?.[0]?.filename && currentProfile.resume_path) {
        try {
          fs.unlinkSync(path.join(profilesUploadDir, currentProfile.resume_path));
        } catch (err) {
          console.warn('Failed to delete old resume:', err);
        }
      }
      if (files['cancelled_cheque']?.[0]?.filename && currentProfile.cancelled_cheque_path) {
        try {
          fs.unlinkSync(path.join(profilesUploadDir, currentProfile.cancelled_cheque_path));
        } catch (err) {
          console.warn('Failed to delete old cancelled cheque:', err);
        }
      }

      const query = `
        UPDATE profiles SET
          full_name = $1, date_of_birth = $2, gender = $3, mobile_number = $4, email_address = $5,
          current_address = $6, permanent_address = $7, photo_path = $8, selfie_path = $9,
          bank_account_number = $10, ifsc_code = $11, cancelled_cheque_path = $12,
          highest_qualification = $13, institution = $14, year_of_completion = $15,
          certifications = $16, years_of_experience = $17, current_occupation = $18,
          reference_details = $19, primary_sectors = $20, regions_covered = $21,
          languages_spoken = $22, client_base_size = $23, expected_audit_volume = $24,
          devices_available = $25, internet_quality = $26, digital_tool_comfort = $27,
          criminal_record = $28, criminal_details = $29, conflict_of_interest = $30,
          accept_code_of_conduct = $31, training_willingness = $32, training_mode = $33,
          availability = $34, additional_skills = $35, comments = $36, resume_path = $37,
          other_documents = $38, completion_percentage = $39, status = $40,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $41 AND user_id = $42
        RETURNING id
      `;

      const values = [...Object.values(profileData), id, userId];
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found or you do not have permission to edit it',
        });
      }

      // Notify admin
      try {
        const adminEmails = await pool.query('SELECT email FROM users WHERE signup_type = $1', ['admin']);
        await transporter.sendMail({
          from: `"Your App" <${process.env.EMAIL_USER}>`,
          to: adminEmails.rows.map((row) => row.email),
          subject: 'Updated Agent Profile for Approval',
          html: `
            <h2>Company Profile Updated</h2>
            <p>Company ID ${id} (${name}) has been updated by user ID ${userId}.</p>
            <p>Please review it in the admin dashboard.</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to notify admin:', emailError);
      }

      res.status(200).json({
        success: true,
        profileId: result.rows[0].id,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  }
);

// Get Agent Profile by ID
app.get('/api/profiles/:id', authenticateToken, checkAccess(['agent', 'employee']), async (req, res) => {
  try {
    const { id } = req.params;
    const profileId = parseInt(id, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(profileId) || isNaN(userId)) {
      console.error(`Invalid profile ID: ${id} or user ID: ${req.user.id}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid profile ID or user ID',
      });
    }

    const query = `
      SELECT * FROM profiles WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [profileId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found or you do not have permission to view it',
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// Get Pending Profiles (Admin)
app.get('/api/admin/profiles', authenticateToken, checkAccess(['admin']), async (req, res) => {
  let client;
  try {
    console.log('Fetching admin profiles...');
    client = await pool.connect();
    
    // First, get all agent and HAP users with their profiles
    const usersQuery = `
      SELECT 
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.status as user_status,
        u.signup_type,
        u.linkedin_url,
        u.experience_years,
        p.id as profile_id,
        p.full_name,
        p.email_address,
        p.status as profile_status,
        p.created_at,
        p.completion_percentage,
        p.years_of_experience
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.signup_type IN ('agent', 'hap')
      ORDER BY COALESCE(p.created_at, u.created_at) DESC
    `;
    
    console.log('Executing users query...');
    const usersResult = await client.query(usersQuery);
    console.log(`Found ${usersResult.rows.length} users`);

    if (usersResult.rows.length === 0) {
      return res.json({
        success: true,
        profiles: []
      });
    }

    // Get companies for these users
    const companiesQuery = `
      SELECT 
        c.id as company_id,
        c.name as company_name,
        c.status as company_status,
        c.created_by as user_id,
        c.created_at as company_created_at
      FROM company c
      WHERE c.created_by = ANY($1)
      ORDER BY c.created_at DESC
    `;
    
    const userIds = usersResult.rows.map(row => row.user_id);
    console.log('Executing companies query for users:', userIds);
    const companiesResult = await client.query(companiesQuery, [userIds]);
    console.log(`Found ${companiesResult.rows.length} companies`);

    // Get products for these companies
    const productsQuery = `
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.status as product_status,
        p.report_status,
        p.company_id,
        p.created_at as product_created_at
      FROM products p
      WHERE p.company_id = ANY($1)
      ORDER BY p.created_at DESC
    `;
    
    const companyIds = companiesResult.rows.map(row => row.company_id);
    console.log('Executing products query for companies:', companyIds);
    const productsResult = await client.query(productsQuery, [companyIds]);
    console.log(`Found ${productsResult.rows.length} products`);

    // Process the results
    const profiles = usersResult.rows.map(user => {
      const userCompanies = companiesResult.rows.filter(c => c.user_id === user.user_id);
      const userProducts = productsResult.rows.filter(p => 
        userCompanies.some(c => c.company_id === p.company_id)
      );

      let derived_status;
      if (user.user_status === 'active') {
        derived_status = 'approved';
      } else if (user.user_status === 'rejected' || user.user_status === 'inactive') {
        derived_status = 'rejected';
      } else {
        derived_status = user.profile_status || 'pending';
      }

      return {
        id: user.profile_id || null,
        user_id: user.user_id,
        full_name: user.full_name || `${user.first_name} ${user.last_name}`,
        email_address: user.email_address || user.email,
        status: derived_status,
        user_status: user.user_status,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        signup_type: user.signup_type,
        completion_percentage: user.completion_percentage || 0,
        years_of_experience: user.experience_years || 'N/A',
        linkedin_url: user.linkedin_url || null,
        created_at: user.created_at || new Date().toISOString(),
        companies: userCompanies.map(company => ({
          company_id: company.company_id,
          company_name: company.company_name,
          company_status: company.company_status,
          created_at: company.company_created_at,
          products: userProducts
            .filter(p => p.company_id === company.company_id)
            .map(product => ({
              product_id: product.product_id,
              product_name: product.product_name,
              product_status: product.product_status,
              report_status: product.report_status,
              created_at: product.product_created_at
            }))
        }))
      };
    });

    console.log(`Returning ${profiles.length} profiles`);
    res.json({
      success: true,
      profiles: profiles
    });

  } catch (error) {
    console.error('Error in /api/admin/profiles:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch profiles',
      details: error.message
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// Approve/Reject Profile (Admin)
app.post('/api/admin/profiles/:id/approve', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  console.log('Profile approval request:', { 
    id, 
    status, 
    rejectionReason,
    rawId: id,
    parsedId: parseInt(id, 10)
  });

  // Validate profile ID
  const profileId = parseInt(id, 10);
  if (isNaN(profileId) || profileId <= 0) {
    console.error('Invalid profile ID:', { 
      id, 
      parsedId: profileId,
      isNaN: isNaN(profileId),
      isPositive: profileId > 0
    });
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid profile ID. Must be a positive number.' 
    });
  }

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid status. Must be either "approved" or "rejected"' 
    });
  }

  let client;
  try {
    client = await pool.connect();
    console.log('Connected to database');

    // First check if the profile exists
    const profileCheck = await client.query(
      'SELECT id, user_id, status FROM profiles WHERE id = $1',
      [profileId]
    );
    console.log('Profile check query result:', {
      profileId,
      rowCount: profileCheck.rowCount,
      rows: profileCheck.rows
    });

    if (profileCheck.rows.length === 0) {
      console.error('Profile not found:', { profileId });
      return res.status(404).json({ 
        success: false, 
        error: 'Profile not found',
        details: `No profile found with ID: ${profileId}`
      });
    }

    const profile = profileCheck.rows[0];
    const userId = profile.user_id;

    // Start a transaction
    await client.query('BEGIN');
    console.log('Started transaction for profile:', {
      profileId,
      userId,
      currentStatus: profile.status,
      newStatus: status
    });

    try {
      // Update the profile status
      const updateQuery = `
        UPDATE profiles
        SET status = $1, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, status, user_id
      `;
      
      console.log('Executing profile update query with params:', [status, profileId]);
      const result = await client.query(updateQuery, [status, profileId]);
      console.log('Profile update result:', result.rows[0]);

      if (result.rows.length === 0) {
        throw new Error('Failed to update profile status');
      }

      // Update user status
      console.log('Updating user status for user:', userId);
      const userUpdateResult = await client.query(
        'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, status',
        [status === 'approved' ? 'active' : 'inactive', userId]
      );
      console.log('User update result:', userUpdateResult.rows[0]);

      // Log the activity
      console.log('Logging activity');
      await client.query(
        'INSERT INTO activities (user_id, action, details) VALUES ($1, $2, $3)',
        [
          userId,
          `Profile ${status}`,
          status === 'rejected' ? `Rejection reason: ${rejectionReason}` : null
        ]
      );

      // Commit the transaction
      await client.query('COMMIT');
      console.log('Transaction committed successfully');

      // Fetch the agent's email for notification
      const userEmailResult = await client.query(
        'SELECT email, first_name, last_name FROM users WHERE id = $1',
        [userId]
      );

      if (userEmailResult.rows.length > 0) {
        const userEmail = userEmailResult.rows[0].email;
        const userName = `${userEmailResult.rows[0].first_name} ${userEmailResult.rows[0].last_name}`;

        // Send email notification
        try {
          await transporter.sendMail({
            from: `"Your App" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Your Profile Has Been ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            html: `
              <h2>Profile Status Update</h2>
              <p>Dear ${userName},</p>
              <p>Your profile has been ${status === 'approved' ? 'approved' : 'rejected'} by the admin.</p>
              ${status === 'rejected' && rejectionReason ? 
                `<p>Reason for rejection: ${rejectionReason}</p>` : ''}
              <p>Please log in to your dashboard for more details.</p>
            `
          });
          console.log('Email notification sent successfully');
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't fail the request if email fails
        }
      }

      res.json({
        success: true,
        message: `Profile ${status} successfully`,
        profile: {
          id: result.rows[0].id,
          status: result.rows[0].status,
          user_id: result.rows[0].user_id
        }
      });

    } catch (error) {
      // Rollback the transaction on error
      await client.query('ROLLBACK');
      console.error('Transaction rolled back due to error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Profile approval error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update profile status',
      details: error.message 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});


app.post('/api/companies/:id/approve', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const updateQuery = `
      UPDATE company
      SET status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, status
    `;
    const result = await pool.query(updateQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const company = result.rows[0];
    const userQuery = 'SELECT created_by FROM company WHERE id = $1';
    const userResult = await pool.query(userQuery, [id]);
    const userId = userResult.rows[0].created_by;

    // Fetch the agent's email
    const userEmailQuery = 'SELECT email FROM users WHERE id = $1';
    const userEmailResult = await pool.query(userEmailQuery, [userId]);
    const userEmail = userEmailResult.rows[0].email;

    // Log activity
    await pool.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Company ${company.name} approved by admin`]
    );

    // Notify the agent
    try {
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Your Company Has Been Approved',
        html: `
          <h2>Company Approval Update</h2>
          <p>Your company "${company.name}" has been approved by the admin.</p>
          <p>You can now proceed to create products.</p>
          <p>Please log in to your dashboard for more details.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to notify agent:', emailError);
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error('Error approving company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve company',
      details: error.message,
    });
  }
});

app.post('/api/companies/:id/review', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const updateQuery = `
      UPDATE company
      SET status = 'under_review', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, status
    `;
    const result = await pool.query(updateQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const company = result.rows[0];
    const userQuery = 'SELECT created_by FROM company WHERE id = $1';
    const userResult = await pool.query(userQuery, [id]);
    const userId = userResult.rows[0].created_by;

    // Fetch the agent's email
    const userEmailQuery = 'SELECT email FROM users WHERE id = $1';
    const userEmailResult = await pool.query(userEmailQuery, [userId]);
    const userEmail = userEmailResult.rows[0].email;

    // Log activity
    await pool.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Company ${company.name} set to under review by admin`]
    );

    // Notify the agent
    try {
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Your Company Is Under Review',
        html: `
          <h2>Company Status Update</h2>
          <p>Your company "${company.name}" is now under review by the admin.</p>
          <p>We will notify you once the review is complete.</p>
          <p>Please log in to your dashboard for more details.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to notify agent:', emailError);
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error('Error setting company to review:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set company to review',
      details: error.message,
    });
  }
});

app.post('/api/products/:id/verify', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const updateQuery = `
      UPDATE products
      SET status = 'active', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, status
    `;
    const result = await pool.query(updateQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const product = result.rows[0];
    const companyQuery = 'SELECT created_by FROM company WHERE id = (SELECT company_id FROM products WHERE id = $1)';
    const companyResult = await pool.query(companyQuery, [id]);
    const userId = companyResult.rows[0].created_by;

    // Fetch the agent's email
    const userEmailQuery = 'SELECT email FROM users WHERE id = $1';
    const userEmailResult = await pool.query(userEmailQuery, [userId]);
    const userEmail = userEmailResult.rows[0].email;

    // Log activity
    await pool.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Product ${product.name} verified by admin`]
    );

    // Notify the agent
    try {
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Your Product Has Been Verified',
        html: `
          <h2>Product Verification Update</h2>
          <p>Your product "${product.name}" has been verified by the admin.</p>
          <p>It is now active and visible.</p>
          <p>Please log in to your dashboard for more details.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to notify agent:', emailError);
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error verifying product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify product',
      details: error.message,
    });
  }
});

app.post('/api/products/:id/request-info', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;

  try {
    const updateQuery = `
      UPDATE products
      SET status = 'info_requested', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, status
    `;
    const result = await pool.query(updateQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const product = result.rows[0];
    const companyQuery = 'SELECT created_by FROM company WHERE id = (SELECT company_id FROM products WHERE id = $1)';
    const companyResult = await pool.query(companyQuery, [id]);
    const userId = companyResult.rows[0].created_by;

    // Fetch the agent's email
    const userEmailQuery = 'SELECT email FROM users WHERE id = $1';
    const userEmailResult = await pool.query(userEmailQuery, [userId]);
    const userEmail = userEmailResult.rows[0].email;

    // Log activity
    await pool.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Additional info requested for product ${product.name} by admin`]
    );

    // Notify the agent
    try {
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Additional Information Requested for Your Product',
        html: `
          <h2>Product Status Update</h2>
          <p>The admin has requested additional information for your product "${product.name}".</p>
          <p>Please update the product details in your dashboard.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to notify agent:', emailError);
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error requesting product info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to request product info',
      details: error.message,
    });
  }
});

// Agent Dashboard Stats
app.get('/api/agent/stats', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10); // Ensure userId is an integer
  console.log('userId type:', typeof userId, 'value:', userId);

  if (isNaN(userId)) {
    console.error('Invalid user ID:', req.user.id);
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  try {
    const companyCountResult = await pool.query(
      'SELECT COUNT(*) AS count FROM company WHERE created_by = $1',
      [userId]
    );
    const productCountResult = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE company_id IN (SELECT id FROM company WHERE created_by = $1)',
      [userId]
    );
    const activeProductsResult = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE status = $1 AND company_id IN (SELECT id FROM company WHERE created_by = $2)',
      ['active', userId]
    );
    const paymentSumResult = await pool.query(
      'SELECT COALESCE(SUM(agent_commission), 0) AS total FROM payments WHERE user_id = $1 AND status = $2',
      [userId, 'completed']
    );

    const companyCount = parseInt(companyCountResult.rows[0]?.count || '0', 10);
    const productCount = parseInt(productCountResult.rows[0]?.count || '0', 10);
    const activeProductCount = parseInt(activeProductsResult.rows[0]?.count || '0', 10);
    const totalEarnings = parseFloat(paymentSumResult.rows[0]?.total || '0').toFixed(2);

    res.json({
      success: true,
      stats: [
        {
          label: 'Total Companies',
          count: companyCount,
          trend: companyCount > 0 ? 'up' : 'steady',
          icon: '🏢',
          color: 'bg-blue-100',
        },
        {
          label: 'Total Products',
          count: productCount,
          trend: productCount > 0 ? 'steady' : 'steady',
          icon: '📦',
          color: 'bg-green-100',
        },
        {
          label: 'Active Products',
          count: activeProductCount,
          trend: activeProductCount > 0 ? 'up' : 'steady',
          icon: '✅',
          color: 'bg-yellow-100',
        },
        {
          label: 'Total Earnings',
          value: `$${totalEarnings}`,
          trend: parseFloat(totalEarnings) > 0 ? 'up' : 'steady',
          icon: '💰',
          color: 'bg-purple-100',
        },
      ],
    });
  } catch (error) {
    console.error('Agent stats error:', error.message, error.stack);
    res.status(500).json({ success: false, error: 'Failed to fetch stats', details: error.message });
  }
});

// Agent Recent Activities
app.get('/api/agent/activities', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  console.log('userId type:', typeof userId, 'value:', userId);

  if (isNaN(userId)) {
    console.error('Invalid user ID:', req.user.id);
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  try {
    const activitiesResult = await pool.query(
      `SELECT action, created_at 
       FROM activities 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    const activities = activitiesResult.rows.map((row) => ({
      action: row.action,
      time: new Date(row.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      icon: '📋',
    }));

    res.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error('Agent activities error:', error.message, error.stack);
    res.status(500).json({ success: false, error: 'Failed to fetch activities', details: error.message });
  }
});

// Agent Wallet
app.get('/api/agent/wallet', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = req.user.id;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT COALESCE(SUM(agent_commission), 0) AS balance FROM payments WHERE user_id = $1 AND status = $2',
      [userId, 'completed']
    );
    client.release();

    res.json({
      success: true,
      balance: parseFloat(result.rows[0].balance),
    });
  } catch (error) {
    console.error('Agent wallet error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet balance' });
  }
});

// Agent Withdraw
app.post('/api/agent/withdraw', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  try {
    const client = await pool.connect();
    const balanceResult = await client.query(
      'SELECT COALESCE(SUM(agent_commission), 0) AS balance FROM payments WHERE user_id = $1 AND status = $2',
      [userId, 'completed']
    );
    const balance = parseFloat(balanceResult.rows[0].balance);

    if (amount <= 0 || amount > balance) {
      client.release();
      return res.status(400).json({ success: false, error: 'Invalid withdrawal amount' });
    }

    await client.query(
      'INSERT INTO payments (user_id, amount, status, agent_commission) VALUES ($1, $2, $3, $4)',
      [userId, -amount, 'pending', -amount]
    );

    await client.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Requested withdrawal of $${amount.toFixed(2)}`]
    );

    client.release();
    res.json({ success: true, message: 'Withdrawal request submitted' });
  } catch (error) {
    console.error('Agent withdraw error:', error);
    res.status(500).json({ success: false, error: 'Failed to process withdrawal' });
  }
});

// Agent Companies
app.get('/api/agent/companies', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = req.user.id;
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, name, current_market, created_at, status FROM company WHERE created_by = $1',
      [userId]
    );
    client.release();

    console.log(`Fetched companies for user_id: ${userId} - Count: ${result.rows.length}`);
    res.json({
      success: true,
      companies: result.rows,
    });
  } catch (error) {
    console.error('Agent companies error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch companies' });
  }
});

// Test endpoint to check user profiles
app.get('/api/test/user-profile/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    console.log('Testing profile for user ID:', userId);
    
    // Check user details
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    console.log('User details:', userResult.rows[0]);
    
    // Check if profile exists
    const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    console.log('Profile exists:', profileResult.rows.length > 0);
    
    res.json({
      success: true,
      user: userResult.rows[0],
      profileExists: profileResult.rows.length > 0,
      profileData: profileResult.rows[0] || null
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Company Profile Management
app.get('/api/company/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    console.log('Fetching company profile for user ID:', userId);
    console.log('Request user ID:', req.user.id, 'Request user type:', req.user.signup_type);
    
    // Check user details from database to understand signup type
    const userResult = await pool.query('SELECT id, signup_type, status FROM users WHERE id = $1', [userId]);
    console.log('User from database:', userResult.rows[0]);
    
    // Check if user is accessing their own profile or has admin access
    if (parseInt(req.user.id, 10) !== userId && req.user.signup_type !== 'admin') {
      console.log('Access denied - user ID mismatch or not admin');
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const result = await pool.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [userId]
    );

    console.log('Profile query result:', result.rows.length, 'profiles found');

    if (result.rows.length === 0) {
      console.log('No profile found for user ID:', userId, 'attempting to create one...');
      
      // Get user details to create a profile
      const userDetails = userResult.rows[0];
      if (!userDetails) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      // Check if this is a company user (employee signup type)
      if (userDetails.signup_type === 'employee') {
        try {
          console.log('Creating missing profile for company user:', userId);
          
          // Get user name for profile creation
          const userNameResult = await pool.query(
            'SELECT first_name, middle_name, last_name, email, phone FROM users WHERE id = $1',
            [userId]
          );
          
          if (userNameResult.rows.length > 0) {
            const userData = userNameResult.rows[0];
            const fullName = `${userData.first_name} ${userData.middle_name || ''} ${userData.last_name}`.trim();
            
            const createProfileResult = await pool.query(
              `INSERT INTO profiles (
                user_id, full_name, date_of_birth, gender, mobile_number, email_address,
                current_address, permanent_address, photo_path, selfie_path, id_number,
                bank_account_number, ifsc_code, cancelled_cheque_path, highest_qualification,
                institution, year_of_completion, years_of_experience, current_occupation,
                primary_sectors, regions_covered, languages_spoken, client_base_size,
                expected_audit_volume, devices_available, internet_quality, digital_tool_comfort,
                criminal_record, conflict_of_interest, accept_code_of_conduct, training_willingness,
                availability, resume_path, completion_percentage, status
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
              RETURNING *`,
              [
                userId, // user_id
                fullName, // full_name
                '1900-01-01', // date_of_birth (placeholder)
                'Not specified', // gender
                userData.phone, // mobile_number
                userData.email, // email_address
                'Not specified', // current_address
                'Not specified', // permanent_address
                'default-photo.jpg', // photo_path (placeholder)
                'default-selfie.jpg', // selfie_path (placeholder)
                'Not specified', // id_number
                'Not specified', // bank_account_number
                'Not specified', // ifsc_code
                'default-cheque.jpg', // cancelled_cheque_path (placeholder)
                'Not specified', // highest_qualification
                'Not specified', // institution
                'Not specified', // year_of_completion
                '0', // years_of_experience
                'Company Representative', // current_occupation
                'Business/Corporate', // primary_sectors
                'All India', // regions_covered
                'English, Hindi', // languages_spoken
                'Not specified', // client_base_size
                'Not specified', // expected_audit_volume
                'Not specified', // devices_available
                'Not specified', // internet_quality
                'Not specified', // digital_tool_comfort
                'No', // criminal_record
                'No', // conflict_of_interest
                true, // accept_code_of_conduct
                'Yes', // training_willingness
                'Not specified', // availability
                'default-resume.pdf', // resume_path (placeholder)
                10, // completion_percentage (low since most fields are placeholders)
                'pending' // status
              ]
            );
            
            console.log('Successfully created profile for user:', userId);
            
            // Now use the newly created profile
            const newProfile = createProfileResult.rows[0];
            const companyProfile = {
              id: newProfile.id,
              name: newProfile.full_name,
              industry: newProfile.primary_sectors,
              size: newProfile.client_base_size,
              website: 'Not specified',
              description: newProfile.current_occupation,
              contact_email: newProfile.email_address,
              contact_phone: newProfile.mobile_number,
              address: newProfile.current_address,
              city: 'Not specified',
              state: 'Not specified',
              zip_code: 'Not specified',
              country: 'India',
              status: newProfile.status,
              created_at: newProfile.created_at,
              updated_at: newProfile.created_at
            };
            
            return res.json({ success: true, profile: companyProfile });
          }
        } catch (createError) {
          console.error('Error creating profile for user:', userId, createError);
        }
      }
      
      return res.status(404).json({ success: false, error: 'Company profile not found' });
    }

    const profile = result.rows[0];
    
    // Transform profile data to company format
    const companyProfile = {
      id: profile.id,
      name: profile.full_name,
      industry: profile.primary_sectors,
      size: profile.client_base_size,
      website: 'Not specified', // Not in profiles table
      description: profile.current_occupation,
      contact_email: profile.email_address,
      contact_phone: profile.mobile_number,
      address: profile.current_address,
      city: 'Not specified', // Not in profiles table
      state: 'Not specified', // Not in profiles table
      zip_code: 'Not specified', // Not in profiles table
      country: 'India',
      status: profile.status,
      created_at: profile.created_at,
      updated_at: profile.created_at // profiles table doesn't have updated_at
    };

    res.json({ success: true, profile: companyProfile });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch company profile' });
  }
});

app.put('/api/company/profile/:profileId', authenticateToken, async (req, res) => {
  try {
    const profileId = parseInt(req.params.profileId, 10);
    const { name, industry, size, website, description, contact_email, contact_phone, address, city, state, zip_code, country } = req.body;

    // Check if profile exists and user has access
    const profileCheck = await pool.query(
      'SELECT p.*, u.signup_type FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.id = $1',
      [profileId]
    );

    if (profileCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const profile = profileCheck.rows[0];
    if (parseInt(req.user.id, 10) !== profile.user_id && req.user.signup_type !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Update profile with company data
    const result = await pool.query(
      `UPDATE profiles SET 
        full_name = $1,
        primary_sectors = $2,
        client_base_size = $3,
        current_occupation = $4,
        email_address = $5,
        mobile_number = $6,
        current_address = $7,
        permanent_address = $7,
        completion_percentage = $8
      WHERE id = $9 RETURNING *`,
      [
        name || profile.full_name,
        industry || profile.primary_sectors,
        size || profile.client_base_size,
        description || profile.current_occupation,
        contact_email || profile.email_address,
        contact_phone || profile.mobile_number,
        address || profile.current_address,
        calculateCompletionPercentage({
          full_name: name || profile.full_name,
          primary_sectors: industry || profile.primary_sectors,
          client_base_size: size || profile.client_base_size,
          current_occupation: description || profile.current_occupation,
          email_address: contact_email || profile.email_address,
          mobile_number: contact_phone || profile.mobile_number,
          current_address: address || profile.current_address
        }),
        profileId
      ]
    );

    const updatedProfile = result.rows[0];
    
    // Transform back to company format
    const companyProfile = {
      id: updatedProfile.id,
      name: updatedProfile.full_name,
      industry: updatedProfile.primary_sectors,
      size: updatedProfile.client_base_size,
      website: 'Not specified',
      description: updatedProfile.current_occupation,
      contact_email: updatedProfile.email_address,
      contact_phone: updatedProfile.mobile_number,
      address: updatedProfile.current_address,
      city: 'Not specified',
      state: 'Not specified',
      zip_code: 'Not specified',
      country: 'India',
      status: updatedProfile.status,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.created_at
    };

    res.json({ success: true, profile: companyProfile });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update company profile' });
  }
});

// Add Company
app.post('/api/agent/companies', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  const { name, current_market } = req.body;

  if (!name || !current_market) {
    return res.status(400).json({ success: false, error: 'Name and current market are required' });
  }

  try {
    const insertQuery = `
      INSERT INTO company (name, current_market, created_by, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING id, name, current_market, status
    `;
    const result = await pool.query(insertQuery, [name, current_market, userId]);

    // Log activity
    await pool.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Created company: ${name}`]
    );

    res.status(201).json({
      success: true,
      company: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create company',
      details: error.message,
    });
  }
});

// Get Single Company
app.get('/api/agent/companies/:id', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  const { id } = req.params;

  try {
    const query = `
      SELECT id, name, current_market, status, created_at
      FROM company
      WHERE id = $1 AND created_by = $2
    `;
    const result = await pool.query(query, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Company not found or you do not have permission to view it',
      });
    }

    res.status(200).json({
      success: true,
      company: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company',
      details: error.message,
    });
  }
});

// Update Company
app.put('/api/agent/companies/:id', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  const { id } = req.params;
  const { name, current_market } = req.body;

  // Validate input
  if (!name || !current_market) {
    return res.status(400).json({ success: false, error: 'Name and current market are required' });
  }

  try {
    // Check if the company exists and was created by the user
    const companyQuery = `
      SELECT id, status
      FROM company
      WHERE id = $1 AND created_by = $2
    `;
    const companyResult = await pool.query(companyQuery, [id, userId]);

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Company not found or you do not have permission to edit it',
      });
    }

    // Update company details
    const updateQuery = `
      UPDATE company
      SET name = $1, current_market = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, current_market, status
    `;
    const updateResult = await pool.query(updateQuery, [name, current_market, id]);

    // Log activity
    await pool.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Updated company: ${name}`]
    );

    // Notify admin if the company status is pending
    if (companyResult.rows[0].status === 'pending') {
      try {
        const adminEmails = await pool.query('SELECT email FROM users WHERE signup_type = $1', ['admin']);
        await transporter.sendMail({
          from: `"Your App" <${process.env.EMAIL_USER}>`,
          to: adminEmails.rows.map((row) => row.email),
          subject: 'Updated Company Profile for Approval',
          html: `
            <h2>Company Profile Updated</h2>
            <p>Company ID ${id} (${name}) has been updated by user ID ${userId}.</p>
            <p>Please review it in the admin dashboard.</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to notify admin:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      company: updateResult.rows[0],
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update company',
      details: error.message,
    });
  }
});

// Agent Products
app.get('/api/agent/products', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  if (isNaN(userId)) {
    console.error('Invalid user ID:', req.user.id);
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT p.id, p.name, p.brands, p.status, p.report_status, c.name AS company_name, cat.name AS category_name,
              pp.intake_form_completed, pp.ground_questionnaire_completed
       FROM products p
       JOIN company c ON p.company_id = c.id
       JOIN categories cat ON p.category = cat.id
       LEFT JOIN product_progress pp ON p.id = pp.product_id AND pp.user_id = $1
       WHERE p.company_id IN (SELECT id FROM company WHERE created_by = $1)`,
      [userId]
    );
    client.release();

    res.json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error('Agent products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products', details: error.message });
  }
});

// Add Product
app.post(
  '/api/add-product',
  authenticateToken,
  checkAccess(['agent']),
  upload.array('images', 3), // Allow up to 3 images
  async (req, res) => {
    const userId = parseInt(req.user.id, 10);
    const {
      name,
      brands,
      companyId,
      categoryId,
      location,
      sku,
      price,
      description,
    } = req.body;

    // Validate required fields
    if (!name || !brands || !companyId || !categoryId) {
      return res.status(400).json({ success: false, error: 'Name, brands, companyId, and categoryId are required' });
    }

    try {
      // Check if the agent has an approved company
      const companyQuery = `
        SELECT id, status
        FROM company
        WHERE id = $1 AND created_by = $2 AND status = 'active'
      `;
      const companyResult = await pool.query(companyQuery, [companyId, userId]);

      if (companyResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'You must have an approved company to create a product',
        });
      }

      // Insert product into the database
      const insertProductQuery = `
        INSERT INTO products (
          name, brands, company_id, category, location, sku, price, description, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
        RETURNING id, name, brands, company_id, category, location, sku, price, description, status
      `;
      const productValues = [
        name,
        brands,
        companyId,
        categoryId,
        location || null,
        sku || null,
        price ? parseFloat(price) : null,
        description || null,
      ];
      const productResult = await pool.query(insertProductQuery, productValues);
      const productId = productResult.rows[0].id;

      // Handle image uploads
      const files = req.files;
      if (files && files.length > 0) {
        const imageInsertQuery = `
          INSERT INTO product_images (product_id, file, position)
          VALUES ($1, $2, $3)
        `;
        for (let i = 0; i < files.length; i++) {
          await pool.query(imageInsertQuery, [productId, files[i].filename, i + 1]);
        }
      }

      // Log activity
      await pool.query(
        'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
        [userId, `Created product: ${name}`]
      );

      // Notify admin
      try {
        const adminEmails = await pool.query('SELECT email FROM users WHERE signup_type = $1', ['admin']);
        await transporter.sendMail({
          from: `"Your App" <${process.env.EMAIL_USER}>`,
          to: adminEmails.rows.map((row) => row.email),
          subject: 'New Product for Approval',
          html: `
            <h2>New Product Submitted</h2>
            <p>A new product "${name}" has been submitted by user ID ${userId}.</p>
            <p>Please review it in the admin dashboard.</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to notify admin:', emailError);
      }

      res.status(201).json({
        success: true,
        product: productResult.rows[0],
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create product',
        details: error.message,
      });
    }
  }
);

// Update Product Status
app.post('/api/update-product-status', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { productId, status } = req.body;
  if (!productId || !['pending', 'active'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid product ID or status' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'UPDATE products SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [status, productId]
    );
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product status updated' });
  } catch (error) {
    console.error('Update product status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update product status' });
  }
});


app.get('/api/agent/product-progress', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  if (isNaN(userId)) {
    console.error('Invalid user ID:', req.user.id);
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  try {
    const client = await pool.connect();
    const result = await pool.query(
      `SELECT pp.product_id, pp.intake_form_completed, pp.ground_questionnaire_completed
       FROM product_progress pp
       JOIN products p ON pp.product_id = p.id
       WHERE p.company_id IN (SELECT id FROM company WHERE created_by = $1)
       AND pp.user_id = $1`,
      [userId]
    );
    client.release();

    res.json({
      success: true,
      progress: result.rows,
    });
  } catch (error) {
    console.error('Agent product progress error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch product progress', details: error.message });
  }
});



app.delete('/api/agent/products/:id', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  const { id } = req.params;

  if (isNaN(userId) || isNaN(parseInt(id, 10))) {
    console.error('Invalid user ID or product ID:', req.user.id, id);
    return res.status(400).json({ success: false, error: 'Invalid user ID or product ID' });
  }

  try {
    const client = await pool.connect();
    const profileResult = await client.query(
      'SELECT status FROM profiles WHERE user_id = $1',
      [userId]
    );

    if (profileResult.rows.length === 0 || profileResult.rows[0].status !== 'approved') {
      client.release();
      return res.status(403).json({ success: false, error: 'Profile must be approved to delete products' });
    }

    const productQuery = `
      SELECT p.id, p.status
      FROM products p
      JOIN company c ON p.company_id = c.id
      WHERE p.id = $1 AND c.created_by = $2
    `;
    const productResult = await client.query(productQuery, [id, userId]);

    if (productResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        error: 'Product not found or you do not have permission to delete it',
      });
    }

    if (productResult.rows[0].status !== 'pending') {
      client.release();
      return res.status(403).json({
        success: false,
        error: 'Only pending products can be deleted',
      });
    }

    // Delete associated product images
    const images = await client.query('SELECT file FROM product_images WHERE product_id = $1', [id]);
    for (const image of images.rows) {
      try {
        fs.unlinkSync(path.join(productsUploadDir, image.file));
      } catch (err) {
        console.warn('Failed to delete product image:', err);
      }
    }

    // Delete product and associated data (images and progress via CASCADE)
    await client.query('DELETE FROM products WHERE id = $1', [id]);

    // Log activity
    await client.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Deleted product ID ${id}`]
    );

    client.release();
    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      details: error.message,
    });
  }
});


// Get Agent Payments
app.get('/api/agent/payments', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  console.log('userId type:', typeof userId, 'value:', userId);

  if (isNaN(userId)) {
    console.error('Invalid user ID:', req.user.id);
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  try {
    const paymentsResult = await pool.query(
      `SELECT p.id, p.amount, p.agent_commission, p.status, p.created_at, 
              pr.name AS product_name, c.name AS company_name
       FROM payments p
       LEFT JOIN products pr ON p.product_id = pr.id
       LEFT JOIN company c ON p.company_id = c.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 10`,
      [userId]
    );

    const payments = paymentsResult.rows.map((row) => ({
      id: row.id,
      amount: parseFloat(row.amount).toFixed(2),
      agentCommission: row.agent_commission ? parseFloat(row.agent_commission).toFixed(2) : '0.00',
      status: row.status,
      productName: row.product_name || 'N/A',
      companyName: row.company_name || 'N/A',
      createdAt: new Date(row.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    }));

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Agent payments error:', error.message, error.stack);
    res.status(500).json({ success: false, error: 'Failed to fetch payments', details: error.message });
  }
});



app.post('/api/submit-intake-form', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  const { productId } = req.body;

  if (isNaN(userId) || !productId) {
    return res.status(400).json({ success: false, error: 'Invalid user ID or product ID' });
  }

  try {
    const client = await pool.connect();

    // Verify product exists and belongs to the user's company
    const productQuery = `
      SELECT p.id, p.status, p.report_status
      FROM products p
      JOIN company c ON p.company_id = c.id
      WHERE p.id = $1 AND c.created_by = $2
    `;
    const productResult = await client.query(productQuery, [productId, userId]);

    if (productResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ success: false, error: 'Product not found or you do not have permission' });
    }

    if (productResult.rows[0].status !== 'active') {
      client.release();
      return res.status(403).json({ success: false, error: 'Product must be active to submit intake form' });
    }

    // Check if progress record exists
    const progressQuery = `
      SELECT id, intake_form_completed
      FROM product_progress
      WHERE product_id = $1 AND user_id = $2
    `;
    const progressResult = await client.query(progressQuery, [productId, userId]);

    let progressId;
    if (progressResult.rows.length === 0) {
      // Create new progress record
      const insertProgress = `
        INSERT INTO product_progress (product_id, user_id, intake_form_completed)
        VALUES ($1, $2, TRUE)
        RETURNING id
      `;
      const insertResult = await client.query(insertProgress, [productId, userId]);
      progressId = insertResult.rows[0].id;
    } else if (!progressResult.rows[0].intake_form_completed) {
      // Update existing progress record
      const updateProgress = `
        UPDATE product_progress
        SET intake_form_completed = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $1 AND user_id = $2
        RETURNING id
      `;
      const updateResult = await client.query(updateProgress, [productId, userId]);
      progressId = updateResult.rows[0].id;
    } else {
      client.release();
      return res.status(400).json({ success: false, error: 'Intake form already completed' });
    }

    // Update report_status in products table
    const newReportStatus = progressResult.rows[0]?.ground_questionnaire_completed ? 'ground_completed' : 'intake_completed';
    await client.query(
      'UPDATE products SET report_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newReportStatus, productId]
    );

    // Log activity
    await client.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Submitted intake form for product ID ${productId}`]
    );

    client.release();
    res.status(200).json({ success: true, message: 'Intake form submitted successfully' });
  } catch (error) {
    console.error('Error submitting intake form:', error);
    res.status(500).json({ success: false, error: 'Failed to submit intake form', details: error.message });
  }
});

app.post('/api/submit-ground-questionnaire', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  const { productId } = req.body;

  if (isNaN(userId) || !productId) {
    return res.status(400).json({ success: false, error: 'Invalid user ID or product ID' });
  }

  try {
    const client = await pool.connect();

    // Verify product exists and belongs to the user's company
    const productQuery = `
      SELECT p.id, p.status, p.report_status
      FROM products p
      JOIN company c ON p.company_id = c.id
      WHERE p.id = $1 AND c.created_by = $2
    `;
    const productResult = await client.query(productQuery, [productId, userId]);

    if (productResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ success: false, error: 'Product not found or you do not have permission' });
    }

    if (productResult.rows[0].status !== 'active') {
      client.release();
      return res.status(403).json({ success: false, error: 'Product must be active to submit ground questionnaire' });
    }

    // Check if progress record exists and intake form is completed
    const progressQuery = `
      SELECT id, intake_form_completed, ground_questionnaire_completed
      FROM product_progress
      WHERE product_id = $1 AND user_id = $2
    `;
    const progressResult = await client.query(progressQuery, [productId, userId]);

    if (progressResult.rows.length === 0 || !progressResult.rows[0].intake_form_completed) {
      client.release();
      return res.status(400).json({
        success: false,
        error: 'Intake form must be completed before submitting ground questionnaire',
      });
    }

    if (progressResult.rows[0].ground_questionnaire_completed) {
      client.release();
      return res.status(400).json({ success: false, error: 'Ground questionnaire already completed' });
    }

    // Update progress record
    const updateProgress = `
      UPDATE product_progress
      SET ground_questionnaire_completed = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $1 AND user_id = $2
      RETURNING id
    `;
    const updateResult = await client.query(updateProgress, [productId, userId]);

    // Update report_status in products table
    await client.query(
      'UPDATE products SET report_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['ground_completed', productId]
    );

    // Log activity
    await client.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Submitted ground questionnaire for product ID ${productId}`]
    );

    client.release();
    res.status(200).json({ success: true, message: 'Ground questionnaire submitted successfully' });
  } catch (error) {
    console.error('Error submitting ground questionnaire:', error);
    res.status(500).json({ success: false, error: 'Failed to submit ground questionnaire', details: error.message });
  }
});


// Add Favorite
app.post('/api/add-favorite', authenticateToken, async (req, res) => {
  const { type, id } = req.body;
  const userId = req.user.id;

  if (!type || !id) {
    return res.status(400).json({ success: false, error: 'Missing type or id' });
  }

  try {
    const client = await pool.connect();

    const existing = await client.query(
      'SELECT id FROM user_favorites WHERE user_id = $1 AND item_type = $2 AND item_id = $3',
      [userId, type, id]
    );

    if (existing.rows.length > 0) {
      client.release();
      return res.status(400).json({ success: false, error: 'Item already in favorites' });
    }

    await client.query(
      'INSERT INTO user_favorites (user_id, item_type, item_id) VALUES ($1, $2, $3)',
      [userId, type, id]
    );

    client.release();
    res.json({ success: true, status: 'ok' });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to add favorite' });
  }
});






// Remove Favorite
app.post('/api/remove-favorite', authenticateToken, async (req, res) => {
  const { type, id } = req.body;
  const userId = req.user.id;

  if (!type || !id) {
    return res.status(400).json({ success: false, error: 'Missing type or id' });
  }

  try {
    const client = await pool.connect();

    const result = await client.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND item_type = $2 AND item_id = $3',
      [userId, type, id]
    );

    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Favorite not found' });
    }

    res.json({ success: true, status: 'ok' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, error: 'Failed to remove favorite' });
  }
});



// Get Categories
app.get('/api/categories', authenticateToken, checkAccess(['agent', 'admin']), async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, name FROM categories');
    client.release();
    res.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// Log admin routes for X-User-Id
app.use('/api/agents', (req, res, next) => {
  console.log('Admin route /api/agents - req.user:', req.user, 'X-User-Id:', req.headers['x-user-id']);
  next();
});
app.use('/api/products', (req, res, next) => {
  console.log('Admin route /api/products - req.user:', req.user, 'X-User-Id:', req.headers['x-user-id']);
  next();
});

// Admin Routes
const dashboardRouter = require('./routes/admin/dashboard');
const usersRouter = require('./routes/admin/users');
const productsRouter = require('./routes/admin/products');
const reportsRouter = require('./routes/admin/reports');
const paymentsRouter = require('./routes/admin/payments');
const announcementsRouter = require('./routes/admin/announcements');

// Channel Partner Routes (must be registered before admin routes)
console.log('Registering channel partner routes...');
app.use('/api/channel-partner', (req, res, next) => {
  console.log('Channel partner route hit:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path
  });
  next();
}, usersRouter);

// Admin Routes
console.log('Registering admin routes...');
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin/users', usersRouter);
app.use('/api/admin/products', productsRouter);
app.use('/api/admin/reports', reportsRouter);
app.use('/api/admin/payments', paymentsRouter);
app.use('/api/admin/announcements', announcementsRouter);

// ... existing code ...

// Admin routes
const adminDashboardRouter = require('./routes/admin/dashboard');
const adminUsersRouter = require('./routes/admin/users');
const adminAnnouncementsRouter = require('./routes/admin/announcements');

// ... existing code ...

// Admin routes
app.use('/api/admin/dashboard', adminDashboardRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/announcements', adminAnnouncementsRouter);

// ... existing code ...

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});
// HR Dashboard Data
app.get('/api/hr-dashboard', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    // Fetch active jobs
    const jobsResult = await client.query(
      'SELECT id, title, department, location, type, posted_date, status ' +
      'FROM jobs WHERE status = $1 ORDER BY posted_date DESC',
      ['active']
    );
    // Fetch applications
    const appsResult = await client.query(
      'SELECT a.id, a.job_id, a.full_name, a.email, a.mobile_number, a.resume_path, a.education, a.experience, a.skills, a.status, a.created_at, ' +
      'j.title AS job_title ' +
      'FROM applications a JOIN jobs j ON a.job_id = j.id ORDER BY a.created_at DESC'
    );
    client.release();
    res.json({
      success: true,
      jobs: jobsResult.rows,
      applications: appsResult.rows.map(app => ({
        ...app,
        resume_url: `${process.env.FRONTEND_URL}/Uploads/${app.resume_path}`,
      })),
    });
  } catch (error) {
    console.error('HR dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch HR dashboard data' });
  }
});
// Add this after the `/api/agent/activities` endpoint
app.get('/api/hr/activities', authenticateToken, checkAccess(['hr', 'admin']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  console.log('userId type:', typeof userId, 'value:', userId);

  if (isNaN(userId)) {
    console.error('Invalid user ID:', req.user.id);
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  try {
    const activitiesResult = await pool.query(
      `SELECT action, created_at 
       FROM activities 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    );

    const activities = activitiesResult.rows.map((row) => ({
      action: row.action,
      time: new Date(row.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      icon: '📋', // Use an HR-appropriate icon
    }));

    res.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error('HR activities error:', error.message, error.stack);
    res.status(500).json({ success: false, error: 'Failed to fetch activities', details: error.message });
  }
});

// HR Dashboard: Post a Job
app.post('/api/hr/jobs', authenticateToken, async (req, res) => {
    const { title, department, location, type, salary, description, requirements, benefits } = req.body;
  const userId = req.user.id;
  if (!title || !department || !location || !type || !salary || !description || !requirements || !benefits) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }
  try {
    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO jobs (
        title, department, location, type, salary, description, requirements, benefits, created_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
      RETURNING id, title, department, location, type, salary, posted_date, description, requirements, benefits, status`,
      [title, department, location, type, salary, description, requirements, benefits, userId]
    );
    await client.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Posted new job: ${title}`]
    );
    client.release();
    res.status(201).json({ success: true, job: result.rows[0] });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ success: false, error: 'Failed to post job' });
  }
});


// HR Dashboard: Get All Jobs
app.get('/api/hr/jobs', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT j.id, j.title, j.department, j.location, j.type, j.salary, j.posted_date, j.status,
              COUNT(a.id) AS application_count
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       GROUP BY j.id
       ORDER BY j.posted_date DESC`
    );
    client.release();

    res.json({
      success: true,
      jobs: result.rows,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
    });
  }
});


// HR Dashboard: Update Job
app.put('/api/hr/jobs/:id', authenticateToken, verifyCsrfToken, async (req, res) => {
  const { id } = req.params;
  const {
    title, department, location, type, salary, description, requirements, benefits, status
  } = req.body;
  const userId = req.user.id;

  if (!title || !department || !location || !type || !salary || !description || !requirements || !benefits || !status) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  if (!['Full-time', 'Part-time', 'Contract', 'Internship'].includes(type)) {
    return res.status(400).json({ success: false, error: 'Invalid job type' });
  }

  if (!['active', 'closed'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE jobs SET
        title = $1, department = $2, location = $3, type = $4, salary = $5, description = $6,
        requirements = $7, benefits = $8, status = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND created_by = $11
       RETURNING id, title, department, location, type, salary, posted_date, description, requirements, benefits, status`,
      [title, department, location, type, salary, description, requirements, benefits, status, id, userId]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        error: 'Job not found or you do not have permission to edit it',
      });
    }

    await client.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Updated job: ${title}`]
    );

    client.release();
    res.json({
      success: true,
      job: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job',
    });
  }
});

// HR Dashboard: Delete Job
app.delete('/api/hr/jobs/:id', authenticateToken, checkAccess(['hr', 'admin']), verifyCsrfToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const client = await pool.connect();
    const result = await client.query(
      'DELETE FROM jobs WHERE id = $1 AND created_by = $2 RETURNING id, title',
      [id, userId]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        error: 'Job not found or you do not have permission to delete it',
      });
    }

    await client.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Deleted job: ${result.rows[0].title}`]
    );

    client.release();
    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete job',
    });
  }
});

// HR Dashboard: Get Applications for a Job
app.get('/api/hr/jobs/:id/applications', authenticateToken, checkAccess(['hr', 'admin']), async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const client = await pool.connect();
    const jobCheck = await client.query(
      'SELECT id FROM jobs WHERE id = $1 AND created_by = $2',
      [id, userId]
    );

    if (jobCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        error: 'Job not found or you do not have permission to view its applications',
      });
    }

    const result = await client.query(
      `SELECT id, job_id, user_id, full_name, email, mobile_number, resume_path, education, experience, skills, status, created_at
       FROM applications
       WHERE job_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    client.release();
    res.json({
      success: true,
      applications: result.rows,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
    });
  }
});

// HR Dashboard: Update Application Status
app.post('/api/hr/applications/:id/status', authenticateToken, checkAccess(['hr', 'admin']), verifyCsrfToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (!['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status' });
  }

  try {
    const client = await pool.connect();
    const application = await client.query(
      `SELECT a.id, a.job_id, a.user_id, a.email
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1 AND j.created_by = $2`,
      [id, userId]
    );

    if (application.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        error: 'Application not found or you do not have permission to update it',
      });
    }

    const result = await client.query(
      `UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, status`,
      [status, id]
    );

    await client.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2)',
      [userId, `Updated application ${id} status to ${status}`]
    );

    try {
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: application.rows[0].email,
        subject: `Application Status Update for Job ${application.rows[0].job_id}`,
        html: `
          <h2>Application Status Update</h2>
          <p>Your application status has been updated to "${status}".</p>
          <p>Please log in to your dashboard for more details.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to notify applicant:', emailError);
    }

    client.release();
    res.json({
      success: true,
      application: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application status',
    });
  }
});

// Get active job postings (public)
app.get('/api/careers', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, title, department, location, type, salary, description, requirements, benefits, posted_date ' +
      'FROM jobs WHERE status = $1 ORDER BY posted_date DESC',
      ['active']
    );
    client.release();
    res.json({
      success: true,
      jobs: result.rows,
    });
  } catch (error) {
    console.error('Fetch careers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch job postings' });
  }
});

// Submit job application
app.post('/api/careers/apply', upload.single('resume'), async (req, res) => {
  const { job_id, full_name, email, mobile_number, education, experience, skills } = req.body;
  if (!job_id || !full_name || !email || !mobile_number || !req.file) {
    return res.status(400).json({ success: false, error: 'Missing required fields or resume' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^\+?[1-9]\d{1,14}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email format' });
  }
  if (!mobileRegex.test(mobile_number)) {
    return res.status(400).json({ success: false, error: 'Invalid mobile number format' });
  }
  try {
    const client = await pool.connect();
    // Verify job exists and is active
    const jobResult = await client.query('SELECT id FROM jobs WHERE id = $1 AND status = $2', [job_id, 'active']);
    if (jobResult.rows.length === 0) {
      client.release();
      return res.status(404).json({ success: false, error: 'Job not found or not active' });
    }
    // Check if user exists or create new applicant
    let userId = null;
    const userResult = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      const hashedEmail = crypto.createHash('sha256').update(email).digest('hex');
      const userInsert = await client.query(
        'INSERT INTO users (first_name, last_name, email, phone, signup_type, hashed_email, status) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [full_name.split(' ')[0], full_name.split(' ').slice(1).join(' ') || '', email, mobile_number, 'applicant', hashedEmail, 'pending']
      );
      userId = userInsert.rows[0].id;
    }
    // Insert application
    const resumePath = path.join('resumes', req.file.filename).replace(/\\/g, '/');
    const appResult = await client.query(
      'INSERT INTO applications (job_id, user_id, full_name, email, mobile_number, resume_path, education, experience, skills) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      [job_id, userId, full_name, email, mobile_number, resumePath, education, experience, skills]
    );
    // Notify HR
    const hrEmails = await client.query('SELECT email FROM users WHERE signup_type = $1', ['hr']);
    try {
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: hrEmails.rows.map(row => row.email),
        subject: 'New Job Application',
        html: `
          <h2>New Job Application</h2>
          <p>Application ID: ${appResult.rows[0].id}</p>
          <p>Applicant: ${full_name}</p>
          <p>Job ID: ${job_id}</p>
          <p>Please review in the HR dashboard.</p>
        `,
      });
    } catch (emailError) {
      console.error('Failed to notify HR:', emailError);
    }
    client.release();
    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit application' });
  }
});

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Get Products and Invoices for Agent's Companies
app.get('/api/agent/products-invoices', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  console.log('Fetching products and invoices for user ID:', userId);
  
  if (isNaN(userId)) {
    console.error('Invalid user ID received:', req.user.id);
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  let client;
  try {
    client = await pool.connect();
    console.log('Database connection established');

    // First, verify the user exists and is an agent
    const userCheck = await client.query(
      'SELECT id, signup_type FROM users WHERE id = $1',
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      console.error('User not found:', userId);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (userCheck.rows[0].signup_type !== 'agent') {
      console.error('User is not an agent:', userId);
      return res.status(403).json({ success: false, error: 'User is not an agent' });
    }

    console.log('Fetching products and invoices data...');
    const result = await client.query(
      `WITH agent_companies AS (
        SELECT id, name as company_name 
        FROM company 
        WHERE created_by = $1
      )
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.price,
        p.status as product_status,
        c.company_name,
        c.id as company_id,
        COALESCE(py.amount, 0) as invoice_amount,
        py.status as payment_status,
        py.created_at as invoice_date,
        py.id as payment_id,
        u.first_name || ' ' || u.last_name as client_name,
        u.email as client_email
      FROM products p
      JOIN agent_companies c ON p.company_id = c.id
      LEFT JOIN payments py ON p.id = py.product_id
      LEFT JOIN users u ON py.user_id = u.id
      ORDER BY py.created_at DESC NULLS LAST`,
      [userId]
    );
    console.log('Query executed successfully. Rows found:', result.rows.length);

    // Transform the data to group by products
    const productsWithInvoices = result.rows.reduce((acc, row) => {
      const productKey = row.product_id;
      if (!acc[productKey]) {
        acc[productKey] = {
          id: row.product_id,
          name: row.product_name,
          price: row.price,
          status: row.product_status,
          company: {
            id: row.company_id,
            name: row.company_name
          },
          invoices: []
        };
      }
      
      if (row.payment_id) {
        acc[productKey].invoices.push({
          id: row.payment_id,
          amount: row.invoice_amount,
          status: row.payment_status,
          date: row.invoice_date,
          client: {
            name: row.client_name,
            email: row.client_email
          }
        });
      }
      
      return acc;
    }, {});

    console.log('Data transformation completed. Products found:', Object.keys(productsWithInvoices).length);
    
    res.json({
      success: true,
      products: Object.values(productsWithInvoices)
    });
  } catch (error) {
    console.error('Detailed error in products-invoices endpoint:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch products and invoices',
      details: error.message 
    });
  } finally {
    if (client) {
      client.release();
      console.log('Database connection released');
    }
  }
});

// Get Agent Orders
app.get('/api/agent/orders', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  if (isNaN(userId)) {
    console.error('Invalid user ID:', req.user.id);
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT o.id, o.title, o.description, o.status, o.priority, 
              o.due_date as "dueDate", o.category, o.notes,
              o.created_at as "assignedAt",
              u.first_name || ' ' || u.last_name as "assignedBy"
       FROM orders o
       LEFT JOIN users u ON o.assigned_by = u.id
       WHERE o.assigned_to = $1
       ORDER BY 
         CASE o.priority
           WHEN 'urgent' THEN 1
           WHEN 'high' THEN 2
           WHEN 'medium' THEN 3
           WHEN 'low' THEN 4
         END,
         o.due_date ASC NULLS LAST`,
      [userId]
    );

    // Transform the data to match the frontend interface
    const orders = result.rows.map(order => ({
      ...order,
      status: order.status === 'in_progress' ? 'in_progress' : 
              order.status === 'completed' ? 'completed' :
              new Date(order.dueDate) < new Date() ? 'overdue' : 'pending'
    }));

    client.release();
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Agent orders error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch orders',
      details: error.message 
    });
  }
});

// Approve/Reject User (Admin)
app.post('/api/admin/users/:id/approve', authenticateToken, checkAccess(['admin']), async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  console.log('=== User Approval Debug ===');
  console.log('Request details:', { 
    id, 
    status, 
    rejectionReason,
    rawId: id,
    parsedId: parseInt(id, 10),
    headers: req.headers,
    user: req.user
  });

  // Validate user ID
  const userId = parseInt(id, 10);
  if (isNaN(userId) || userId <= 0) {
    console.error('Invalid user ID:', { 
      id, 
      parsedId: userId,
      isNaN: isNaN(userId),
      isPositive: userId > 0
    });
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid user ID. Must be a positive number.' 
    });
  }

  if (!status || !['approved', 'rejected'].includes(status)) {
    console.error('Invalid status:', { status });
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid status. Must be either "approved" or "rejected"' 
    });
  }

  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('Database connection established');

    // Start transaction
    await client.query('BEGIN');

    // Verify user exists and is either an agent or HAP
    console.log('Verifying user exists and is an agent or HAP...');
    const verifyQuery = `
      SELECT id, status, signup_type, email, first_name, last_name
      FROM users
      WHERE id = $1 AND signup_type IN ('agent', 'hap')
    `;
    const verifyResult = await client.query(verifyQuery, [userId]);
    console.log('User verification result:', verifyResult.rows[0]);

    if (verifyResult.rows.length === 0) {
      throw new Error('User not found or is not an agent/HAP');
    }

    // Update user status
    const updateQuery = `
      UPDATE users
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, status, signup_type, email, first_name, last_name
    `;
    
    const newStatus = status === 'approved' ? 'active' : 'pending';
    console.log('Executing user update query:', {
      query: updateQuery,
      params: [newStatus, userId],
      currentUser: verifyResult.rows[0]
    });

    const result = await client.query(updateQuery, [newStatus, userId]);
    console.log('User update result:', result.rows[0]);

    if (result.rows.length === 0) {
      throw new Error('Failed to update user status - no rows affected');
    }

    // Log the activity
    console.log('Logging activity...');
    const activityResult = await client.query(
      'INSERT INTO activities (user_id, action) VALUES ($1, $2) RETURNING id',
      [
        userId,
        status === 'rejected' ? 
          `User ${status} - Reason: ${rejectionReason}` : 
          `User ${status}`
      ]
    );
    console.log('Activity logged:', activityResult.rows[0]);

    // Commit the transaction
    console.log('Committing transaction...');
    await client.query('COMMIT');
    console.log('Transaction committed successfully');

    const user = result.rows[0];
    const userName = `${user.first_name} ${user.last_name}`;

    // Send email notification
    try {
      console.log('Sending email notification...');
      await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Your Account Has Been ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        html: `
          <h2>Account Status Update</h2>
          <p>Dear ${userName},</p>
          <p>Your account has been ${status === 'approved' ? 'approved' : 'rejected'} by the admin.</p>
          ${status === 'rejected' && rejectionReason ? 
            `<p>Reason for rejection: ${rejectionReason}</p>` : ''}
          <p>Please log in to your dashboard for more details.</p>
        `
      });
      console.log('Email notification sent successfully');
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    console.log('Sending success response...');
    res.json({
      success: true,
      message: `User ${status} successfully`,
      user: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        signup_type: result.rows[0].signup_type
      }
    });

  } catch (error) {
    console.error('=== User Approval Error ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });

    // Rollback the transaction on error
    if (client) {
      console.log('Rolling back transaction...');
      await client.query('ROLLBACK');
      console.log('Transaction rolled back');
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user status',
      details: error.message,
      code: error.code
    });
  } finally {
    if (client) {
      console.log('Releasing database connection...');
      client.release();
      console.log('Database connection released');
    }
  }
});

// Get Products and Invoices for Admin
app.get('/api/admin/products-invoices', authenticateToken, checkAccess(['admin']), async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    console.log('Fetching products and invoices for admin...');

    const result = await client.query(
      `WITH company_data AS (
        SELECT c.id, c.name as company_name, u.first_name || ' ' || u.last_name as agent_name
        FROM company c
        JOIN users u ON c.created_by = u.id
        WHERE u.signup_type = 'agent'
      )
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.price,
        p.status as product_status,
        c.company_name,
        c.agent_name,
        c.id as company_id,
        COALESCE(py.amount, 0) as invoice_amount,
        py.status as payment_status,
        py.created_at as invoice_date,
        py.id as payment_id,
        u.first_name || ' ' || u.last_name as client_name,
        u.email as client_email
      FROM products p
      JOIN company_data c ON p.company_id = c.id
      LEFT JOIN payments py ON p.id = py.product_id
      LEFT JOIN users u ON py.user_id = u.id
      ORDER BY py.created_at DESC NULLS LAST`
    );

    // Transform the data to group by products
    const productsWithInvoices = result.rows.reduce((acc, row) => {
      const productKey = row.product_id;
      if (!acc[productKey]) {
        acc[productKey] = {
          id: row.product_id,
          name: row.product_name,
          price: row.price,
          status: row.product_status,
          company: {
            id: row.company_id,
            name: row.company_name
          },
          agent: {
            name: row.agent_name
          },
          invoices: []
        };
      }
      
      if (row.payment_id) {
        acc[productKey].invoices.push({
          id: row.payment_id,
          amount: row.invoice_amount,
          status: row.payment_status,
          date: row.invoice_date,
          client: {
            name: row.client_name,
            email: row.client_email
          }
        });
      }
      
      return acc;
    }, {});

    console.log('Data transformation completed. Products found:', Object.keys(productsWithInvoices).length);
    
    res.json({
      success: true,
      products: Object.values(productsWithInvoices)
    });
  } catch (error) {
    console.error('Detailed error in admin products-invoices endpoint:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch products and invoices',
      details: error.message 
    });
  } finally {
    if (client) {
      client.release();
      console.log('Database connection released');
    }
  }
});

// Import routes
const agentAnnouncementsRouter = require('./routes/agent/announcements');
const hapAnnouncementsRouter = require('./routes/hap/announcements');
const hapProfileRouter = require('./routes/hap/profile');

// ... existing code ...

// Agent routes
app.use('/api/agent/announcements', agentAnnouncementsRouter);

// HAP routes
app.use('/api/hap/announcements', hapAnnouncementsRouter);
app.use('/api/profiles', hapProfileRouter);

// ... existing code ...

// Create otps table if it doesn't exist
const createOtpsTable = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expiry TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('OTPs table created or already exists');
  } catch (error) {
    console.error('Error creating otps table:', error);
  } finally {
    client.release();
  }
};

// Call the function when server starts
createOtpsTable();

// ... existing code ...
// Signup endpoint
app.post('/api/signup', async (req, res) => {
  let client;
  try {
    console.log('Received signup body:', req.body);
    const { 
      name, 
      email, 
      phone, 
      password, 
      otp,
      signup_type,
      linkedin_url,
      pincode,
      city,
      state,
      referral_id,
      experience_years,
      company_name,
      website,
      address,
      referred_by
    } = req.body;

    console.log('Signup request:', {
      email,
      phone,
      signup_type,
      referred_by
    });

    // Validate required fields
    if (!name || !email || !phone || !signup_type) {
      console.log('Missing required fields');
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Initialize database connection
    client = await pool.connect();
    console.log('Database connection established');

    // If referred_by is provided, verify it exists
    if (referred_by) {
      console.log('Checking referral code:', referred_by);
      const referrerCheck = await client.query(
        'SELECT id, email FROM users WHERE referral_code = $1 AND signup_type = $2',
        [referred_by, 'channel_partner']
      );

      if (referrerCheck.rows.length === 0) {
        console.log('Invalid referral code');
        client.release();
        return res.status(400).json({ success: false, error: 'Invalid referral code' });
      }
      console.log('Valid referral code from channel partner:', referrerCheck.rows[0].email);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      client.release();
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Additional validation for agents
    if (signup_type === 'agent') {
      if (!pincode || !city || !state) {
        console.log('Missing location details for agent');
        client.release();
        return res.status(400).json({ success: false, error: 'Location details are required for agents' });
      }
      if (!/^[0-9]{6}$/.test(pincode)) {
        console.log('Invalid pincode format for agent:', pincode);
        client.release();
        return res.status(400).json({ success: false, error: 'Invalid pincode format' });
      }
      if (experience_years && (parseInt(experience_years) < 0 || parseInt(experience_years) > 50)) {
        console.log('Invalid experience years for agent:', experience_years);
        client.release();
        return res.status(400).json({ success: false, error: 'Experience years must be between 0 and 50' });
      }
    }

    // Additional validation for channel partners
    if (signup_type === 'channel_partner') {
      console.log('Validating channel partner fields:', {
        company_name,
        website,
        address,
        pincode,
        city,
        state
      });

      if (!company_name || !website || !address || !pincode || !city || !state) {
        console.log('Missing required fields for channel partner');
        client.release();
        return res.status(400).json({ 
          success: false, 
          error: 'Company details and location are required for channel partners',
          details: {
            hasCompanyName: !!company_name,
            hasWebsite: !!website,
            hasAddress: !!address,
            hasPincode: !!pincode,
            hasCity: !!city,
            hasState: !!state
          }
        });
      }

      if (!/^[0-9]{6}$/.test(pincode)) {
        console.log('Invalid pincode format for channel partner:', pincode);
        client.release();
        return res.status(400).json({ success: false, error: 'Invalid pincode format' });
      }

      try {
        new URL(website);
      } catch (e) {
        console.log('Invalid website URL:', website);
        client.release();
        return res.status(400).json({ success: false, error: 'Invalid website URL format' });
      }
    }

    // Check if user exists
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('User exists:', userResult.rows.length > 0);
    if (userResult.rows.length > 0) {
      client.release();
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    // For agents, hap users, users, channel partners, and employees, verify password
    if (signup_type === 'agent' || signup_type === 'hap' || signup_type === 'user' || signup_type === 'channel_partner' || signup_type === 'employee') {
      console.log('Processing agent/hap/user/channel partner/employee registration');
      if (!password || !otp) {
        console.log('Missing password or OTP for agent/hap/user/channel partner/employee');
        client.release();
        return res.status(400).json({ success: false, error: 'Password and OTP are required for registration' });
      }

      // Verify OTP for agents, hap users, users, channel partners, and employees
      const otpResult = await client.query(
        'SELECT * FROM otps WHERE email = $1 AND otp = $2 AND expiry > NOW() AND used = FALSE ORDER BY created_at DESC LIMIT 1',
        [email, otp]
      );
      console.log('OTP result:', otpResult.rows);

      if (otpResult.rows.length === 0) {
        console.log('Invalid or expired OTP');
        client.release();
        return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
      }

      // Mark OTP as used
      await client.query('UPDATE otps SET used = TRUE WHERE id = $1', [otpResult.rows[0].id]);
      console.log('OTP verified and marked as used');

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed successfully');

      // Generate referral code for channel partners
      let referralCode = null;
      if (signup_type === 'channel_partner') {
        referralCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        console.log('Generated referral code for channel partner:', referralCode);
      }

      // Split name into parts
      const nameParts = name.trim().split(/\s+/);
      const first_name = nameParts[0];
      const last_name = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
      const middle_name = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

      // Normalize signup_type: map 'company' to 'employee' for backend logic and DB insert
      const normalizedSignupType = signup_type === 'company' ? 'employee' : signup_type;
      const dbSignupType = normalizedSignupType === 'user' ? 'client' : normalizedSignupType;

      console.log('Signup type conversion:', {
        original: signup_type,
        normalized: normalizedSignupType,
        db: dbSignupType
      });

      // Create user with appropriate fields based on signup type
      const userStatus = dbSignupType === 'client' ? 'active' : 'pending';
      const result = await client.query(
        `INSERT INTO users (
          first_name, middle_name, last_name, email, phone, signup_type, 
          password, status, linkedin_url, pincode, city, state, 
          referral_id, experience_years, company_name, website, address,
          referral_code, referred_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          first_name, middle_name, last_name, email, phone, dbSignupType,
          hashedPassword, userStatus,
          signup_type === 'agent' ? linkedin_url : null,
          (signup_type === 'agent' || signup_type === 'channel_partner') ? pincode : null,
          (signup_type === 'agent' || signup_type === 'channel_partner') ? city : null,
          (signup_type === 'agent' || signup_type === 'channel_partner') ? state : null,
          signup_type === 'agent' ? referral_id : null,
          signup_type === 'agent' ? experience_years : null,
          signup_type === 'channel_partner' ? company_name : null,
          signup_type === 'channel_partner' ? website : null,
          signup_type === 'channel_partner' ? address : null,
          referralCode,
          referred_by
        ]
      );

      console.log('User created successfully:', {
        id: result.rows[0].id,
        email: result.rows[0].email,
        signup_type: result.rows[0].signup_type,
        status: result.rows[0].status
      });

      // Create basic profile for company users
      if (signup_type === 'company') {
        try {
          console.log('Creating profile for company user with ID:', result.rows[0].id);
          await client.query(
            `INSERT INTO profiles (
              user_id, full_name, date_of_birth, gender, mobile_number, email_address,
              current_address, permanent_address, photo_path, selfie_path, id_number,
              bank_account_number, ifsc_code, cancelled_cheque_path, highest_qualification,
              institution, year_of_completion, years_of_experience, current_occupation,
              primary_sectors, regions_covered, languages_spoken, client_base_size,
              expected_audit_volume, devices_available, internet_quality, digital_tool_comfort,
              criminal_record, conflict_of_interest, accept_code_of_conduct, training_willingness,
              availability, resume_path, completion_percentage, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)`,
            [
              result.rows[0].id, // user_id
              name, // full_name
              '1900-01-01', // date_of_birth (placeholder)
              'Not specified', // gender
              phone, // mobile_number
              email, // email_address
              company_name || 'Not specified', // current_address (using company name as address)
              company_name || 'Not specified', // permanent_address
              'default-photo.jpg', // photo_path (placeholder)
              'default-selfie.jpg', // selfie_path (placeholder)
              'Not specified', // id_number
              'Not specified', // bank_account_number
              'Not specified', // ifsc_code
              'default-cheque.jpg', // cancelled_cheque_path (placeholder)
              'Not specified', // highest_qualification
              'Not specified', // institution
              'Not specified', // year_of_completion
              '0', // years_of_experience
              'Company Representative', // current_occupation
              'Business/Corporate', // primary_sectors
              'All India', // regions_covered
              'English, Hindi', // languages_spoken
              'Not specified', // client_base_size
              'Not specified', // expected_audit_volume
              'Not specified', // devices_available
              'Not specified', // internet_quality
              'Not specified', // digital_tool_comfort
              'No', // criminal_record
              'No', // conflict_of_interest
              true, // accept_code_of_conduct
              'Yes', // training_willingness
              'Not specified', // availability
              'default-resume.pdf', // resume_path (placeholder)
              10, // completion_percentage (low since most fields are placeholders)
              'pending' // status
            ]
          );
          console.log('Basic company profile created successfully for user ID:', result.rows[0].id);
        } catch (profileError) {
          console.error('Error creating company profile:', profileError);
          // Don't fail the signup if profile creation fails
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: result.rows[0].id,
          signup_type: dbSignupType
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('JWT token created with:', {
        id: result.rows[0].id,
        signup_type: dbSignupType,
        stored_signup_type: result.rows[0].signup_type
      });

      client.release();
      res.json({ 
        success: true, 
        message: 'Registration successful. Please wait for admin approval.',
        token: token,
        user: {
          id: result.rows[0].id,
          name: `${result.rows[0].first_name} ${result.rows[0].middle_name ? result.rows[0].middle_name + ' ' : ''}${result.rows[0].last_name}`.trim(),
          email: result.rows[0].email,
          phone: result.rows[0].phone,
          signupType: result.rows[0].signup_type,
          status: result.rows[0].status
        }
      });
    } else {
      // This block should now be empty or handle other specific signup types without password
      console.log(`Signup type ${signup_type} does not require password/OTP.`);
      client.release();
      res.status(400).json({ success: false, error: `Signup type ${signup_type} is not configured for passwordless registration.` });
    }
  } catch (error) {
    console.error('Signup error:', error);
    if (client) {
      client.release();
    }
    res.status(500).json({ success: false, error: 'Failed to register user: ' + error.message });
  }
});
// ... existing code ...

// Initialize Razorpay
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_1GFDo8lemzf1gj',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'V3D8TdPpOPoFnZ9oOHnfUaiT'
});

// Create Razorpay order endpoint
app.post('/api/create-razorpay-order', authenticateToken, async (req, res) => {
  let client;
  try {
    console.log('Creating Razorpay order - Request body:', req.body);
    console.log('User ID:', req.user.id);

    const { amount, plan_type, product_id, product_name } = req.body;
    
    let validatedAmount;
    let receipt;
    let purpose;
    
    if (plan_type === 'product_payment') {
      // For product payments, use the exact amount
      validatedAmount = amount;
      receipt = `product_payment_${Date.now()}`;
      purpose = 'Product Payment';
    } else {
      // For KYC verification, use the original logic
      validatedAmount = amount === 1 ? 1 : 499;
      receipt = `kyc_verification_${Date.now()}`;
      purpose = 'KYC Verification';
    }
    
    console.log('Validated amount:', validatedAmount);

    const options = {
      amount: validatedAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: receipt,
      notes: {
        userId: req.user.id,
        purpose: purpose,
        plan: plan_type,
        ...(product_id && { productId: product_id }),
        ...(product_name && { productName: product_name })
      }
    };

    console.log('Razorpay options:', options);
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created:', order);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create payment order'
    });
  }
});

// Verify Razorpay Payment
app.post('/api/verify-razorpay-payment', authenticateToken, async (req, res) => {
  let client;
  try {
    console.log('Verifying payment - Request body:', req.body);
    console.log('User ID:', req.user.id);
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_type, product_id } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('Missing required payment details:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });
      return res.status(400).json({
        success: false,
        error: 'Missing required payment details'
      });
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'V3D8TdPpOPoFnZ9oOHnfUaiT')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    client = await pool.connect();

    if (plan_type === 'product_payment') {
      // Handle product payment
      const amount = 10000; // ₹10,000 for product payment
      
      // Create payment record for product
      await client.query(
        `INSERT INTO payments (
          user_id, order_id, payment_id, amount, currency, status, plan_type, product_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
        [
          req.user.id,
          razorpay_order_id,
          razorpay_payment_id,
          amount,
          'INR',
          'completed',
          plan_type,
          product_id
        ]
      );

      console.log(`Product payment of ₹${amount} recorded for user ${req.user.id}, product ${product_id}`);
      
    } else {
      // Handle KYC payment (existing logic)
      
      // Update user's payment status
      const paymentStatusResult = await client.query(
        'UPDATE users SET payment_status = $1 WHERE id = $2 RETURNING id, payment_status',
        ['active', req.user.id]
      );
      console.log(`User ID ${req.user.id} payment_status changed to active after successful payment. Result:`, paymentStatusResult.rows[0]);

      // Create payment record
      await client.query(
        `INSERT INTO payments (
          user_id, order_id, payment_id, amount, currency, status, plan_type, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
        [
          req.user.id,
          razorpay_order_id,
          razorpay_payment_id,
          plan_type === 'trial' ? 1 : 499,
          'INR',
          'completed',
          plan_type
        ]
      );

      // Update payment history with completed status
      await client.query(
        `UPDATE payment_history 
         SET status = $1, 
             payment_id = $2, 
             order_id = $3 
         WHERE user_id = $4 
         AND status = 'pending' 
         ORDER BY created_at DESC 
         LIMIT 1`,
        ['completed', razorpay_payment_id, razorpay_order_id, req.user.id]
      );

      // Update agent's KYC status
      await client.query(
        'UPDATE agents SET kyc_payment_status = $1, kyc_plan_type = $2 WHERE user_id = $3',
        ['paid', plan_type, req.user.id]
      );

      // Set user status to active after successful payment
      const userStatusResult = await client.query(
        'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, status',
        ['active', req.user.id]
      );
      console.log(`User ID ${req.user.id} status changed to active after successful payment. Result:`, userStatusResult.rows[0]);
    }

    client.release();
    res.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    if (client) {
      client.release();
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify payment'
    });
  }
});

// ... rest of the existing code ...

// Create initial payment record
app.post('/api/create-payment-record', authenticateToken, async (req, res) => {
  console.log('Creating payment record - Request body:', req.body);
  console.log('User ID:', req.user.id);
  
  try {
    const { amount, plan_type } = req.body;
    
    if (!amount || !plan_type) {
      console.error('Missing required fields:', { amount, plan_type });
      return res.status(400).json({
        success: false,
        error: 'Amount and plan type are required'
      });
    }

    const client = await pool.connect();
    console.log('Database connection established');
    
    // Create initial payment record with pending status
    const orderId = 'pending_' + Date.now();
    console.log('Creating payment record with order ID:', orderId);
    
    const result = await client.query(
      `INSERT INTO payment_history 
       (user_id, amount, order_id, status, plan_type) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [req.user.id, amount, orderId, 'pending', plan_type]
    );
    console.log('Payment record created:', result.rows[0]);

    client.release();
    console.log('Database connection released');

    res.json({
      success: true,
      message: 'Payment record created successfully',
      paymentId: result.rows[0].id
    });
  } catch (error) {
    console.error('Create payment record error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create payment record',
      details: error.message 
    });
  }
});

// Update verify-razorpay-payment endpoint
app.post('/api/verify-razorpay-payment', authenticateToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_type } = req.body;
  
  try {
    const generated_signature = crypto
      .createHmac('sha256', 'V3D8TdPpOPoFnZ9oOHnfUaiT')
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      const client = await pool.connect();
      
      // Update payment history with completed status
      await client.query(
        `UPDATE payment_history 
         SET status = $1, 
             payment_id = $2, 
             order_id = $3 
         WHERE user_id = $4 
         AND status = 'pending' 
         ORDER BY created_at DESC 
         LIMIT 1`,
        ['completed', razorpay_payment_id, razorpay_order_id, req.user.id]
      );

      // Update agent's KYC status
      await client.query(
        'UPDATE agents SET kyc_payment_status = $1, kyc_plan_type = $2 WHERE user_id = $3',
        ['paid', plan_type, req.user.id]
      );

      client.release();

      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      // Update payment history with failed status
      const client = await pool.connect();
      console.log('Updating payment history to failed status');
      await client.query(
        `UPDATE payment_history 
         SET status = $1 
         WHERE user_id = $2 
         AND status = 'pending' 
         ORDER BY created_at DESC 
         LIMIT 1`,
        ['failed', req.user.id]
      );
      client.release();
      console.log('Database connection released');

      res.status(400).json({ 
        success: false, 
        error: 'Invalid payment signature',
        status: 'failed'
      });
    }
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify payment',
      details: error.message 
    });
  }
});

// ... existing code ...

// Check Agent Verification Status
app.get('/api/agent/verification-status', authenticateToken, checkAccess(['agent']), async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, error: 'Invalid user ID' });
  }

  try {
    const result = await pool.query(
      'SELECT kyc_payment_status FROM agents WHERE user_id = $1',
      [userId]
    );

    const isVerified = result.rows[0]?.kyc_payment_status === 'paid';
    
    res.json({
      success: true,
      isVerified
    });
  } catch (error) {
    console.error('Verification status check error:', error);
    res.status(500).json({ success: false, error: 'Failed to check verification status' });
  }
});

// ... existing code ...

// Register endpoint
app.post('/api/register', async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      name, 
      email, 
      phone, 
      password, 
      signup_type,
      linkedin_url,
      pincode,
      city,
      state,
      referral_id,
      experience_years
    } = req.body;

    console.log('Registration request data:', {
      name,
      email,
      phone,
      signup_type,
      linkedin_url,
      pincode,
      city,
      state,
      referral_id,
      experience_years
    });

    // Validate required fields
    if (!name || !email || !phone || !signup_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Additional validation for agents
    if (signup_type === 'agent') {
      if (!pincode || !city || !state) {
        return res.status(400).json({ error: 'Location details are required for agents' });
      }
      if (!/^[0-9]{6}$/.test(pincode)) {
        return res.status(400).json({ error: 'Invalid pincode format' });
      }
      if (experience_years && (parseInt(experience_years) < 0 || parseInt(experience_years) > 50)) {
        return res.status(400).json({ error: 'Experience years must be between 0 and 50' });
      }
    }

    // Check if user already exists
    const userCheck = await client.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Split name into first, middle, and last name
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts[nameParts.length - 1] || '';
    const middleName = nameParts.slice(1, -1).join(' ') || null;

    // Insert new user with agent fields
    const result = await client.query(
      `INSERT INTO users (
        first_name,
        middle_name,
        last_name,
        email, 
        phone, 
        password, 
        signup_type,
        linkedin_url,
        pincode,
        city,
        state,
        referral_id,
        experience_years,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING *`,
      [
        firstName,
        middleName,
        lastName,
        email, 
        phone, 
        hashedPassword, 
        signup_type,
        signup_type === 'agent' ? linkedin_url : null,
        signup_type === 'agent' ? pincode : null,
        signup_type === 'agent' ? city : null,
        signup_type === 'agent' ? state : null,
        signup_type === 'agent' ? referral_id : null,
        signup_type === 'agent' ? experience_years : null,
        'pending'
      ]
    );

    console.log('User registered successfully:', {
      id: result.rows[0].id,
      email: result.rows[0].email,
      signup_type: result.rows[0].signup_type,
      linkedin_url: result.rows[0].linkedin_url,
      pincode: result.rows[0].pincode,
      city: result.rows[0].city,
      state: result.rows[0].state,
      referral_id: result.rows[0].referral_id,
      experience_years: result.rows[0].experience_years
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.rows[0].id,
        email: result.rows[0].email,
        signupType: result.rows[0].signup_type
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Registration successful',
      token,
      user: {
        id: result.rows[0].id,
        name: `${result.rows[0].first_name} ${result.rows[0].middle_name ? result.rows[0].middle_name + ' ' : ''}${result.rows[0].last_name}`.trim(),
        email: result.rows[0].email,
        phone: result.rows[0].phone,
        signupType: result.rows[0].signup_type,
        linkedinUrl: result.rows[0].linkedin_url,
        pincode: result.rows[0].pincode,
        city: result.rows[0].city,
        state: result.rows[0].state,
        referralId: result.rows[0].referral_id,
        experienceYears: result.rows[0].experience_years
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    client.release();
  }
});

// ... existing code ...

// KYC Endpoints
app.post('/api/save-aadhar-details', authenticateToken, async (req, res) => {
  try {
    const { fullName, aadharNumber, dateOfBirth } = req.body;
    const userId = req.user.id;
    console.log('Saving Aadhar details for user ID:', userId);

    // Validate input
    if (!fullName || !aadharNumber || !dateOfBirth) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      console.error('User not found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Verified user exists with ID:', userId);

    // Check if Aadhar number already exists
    const existingAadhar = await pool.query(
      'SELECT * FROM aadhar_details WHERE aadhar_number = $1',
      [aadharNumber]
    );

    if (existingAadhar.rows.length > 0) {
      return res.status(400).json({ error: 'Aadhar number already registered' });
    }

    // Begin transaction
    await pool.query('BEGIN');

    try {
      // Save Aadhar details
      const result = await pool.query(
        `INSERT INTO aadhar_details (user_id, full_name, aadhar_number, date_of_birth)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, fullName, aadharNumber, dateOfBirth]
      );
      console.log('Successfully saved Aadhar details for user ID:', userId);

      // Check if all KYC details are present
      const [panResult, bankResult] = await Promise.all([
        pool.query('SELECT * FROM pan_details WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM bank_details WHERE user_id = $1', [userId])
      ]);

      // If all KYC details are present, update user's kyc_status
      if (panResult.rows.length > 0 && bankResult.rows.length > 0) {
        console.log('All KYC details present, updating kyc_status to active');
        await pool.query(
          'UPDATE users SET kyc_status = $1 WHERE id = $2',
          ['active', userId]
        );
        console.log('Updated user kyc_status to active');
      }

      await pool.query('COMMIT');
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error saving Aadhar details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/save-pan-details', authenticateToken, async (req, res) => {
  try {
    const { fullName, panNumber, dateOfBirth } = req.body;
    const userId = req.user.id;
    console.log('Saving PAN details for user ID:', userId);

    // Validate input
    if (!fullName || !panNumber || !dateOfBirth) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      console.error('User not found with ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Verified user exists with ID:', userId);

    // Check if PAN number already exists
    const existingPan = await pool.query(
      'SELECT * FROM pan_details WHERE pan_number = $1',
      [panNumber]
    );

    if (existingPan.rows.length > 0) {
      return res.status(400).json({ error: 'PAN number already registered' });
    }

    // Begin transaction
    await pool.query('BEGIN');

    try {
      // Save PAN details
      const result = await pool.query(
        `INSERT INTO pan_details (user_id, full_name, pan_number, date_of_birth)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, fullName, panNumber, dateOfBirth]
      );
      console.log('Successfully saved PAN details for user ID:', userId);

      // Check if all KYC details are present
      const [aadharResult, bankResult] = await Promise.all([
        pool.query('SELECT * FROM aadhar_details WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM bank_details WHERE user_id = $1', [userId])
      ]);

      // If all KYC details are present, update user's kyc_status
      if (aadharResult.rows.length > 0 && bankResult.rows.length > 0) {
        console.log('All KYC details present, updating kyc_status to active');
        await pool.query(
          'UPDATE users SET kyc_status = $1 WHERE id = $2',
          ['active', userId]
        );
        console.log('Updated user kyc_status to active');
      }

      await pool.query('COMMIT');
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error saving PAN details:', error);
    if (error.code === '23505') {
      // Unique violation (e.g., duplicate PAN number)
      return res.status(400).json({ error: 'PAN number already registered' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/save-bank-details', authenticateToken, async (req, res) => {
  try {
    console.log('Received bank details request:', req.body);
    const { accountHolderName, bankName, accountNumber, ifscCode } = req.body;
    const userId = req.user.id;
    console.log('User ID:', userId);

    // Validate input
    if (!accountHolderName || !bankName || !accountNumber || !ifscCode) {
      console.log('Missing required fields:', { accountHolderName, bankName, accountNumber, ifscCode });
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if bank account already exists
    console.log('Checking for existing bank account...');
    const existingBank = await pool.query(
      'SELECT * FROM bank_details WHERE account_number = $1 AND ifsc_code = $2',
      [accountNumber, ifscCode]
    );

    if (existingBank.rows.length > 0) {
      console.log('Bank account already exists');
      return res.status(400).json({ error: 'Bank account already registered' });
    }

    // Begin transaction
    await pool.query('BEGIN');

    try {
      // Save bank details
      console.log('Saving bank details...');
      const result = await pool.query(
        `INSERT INTO bank_details (user_id, account_holder_name, bank_name, account_number, ifsc_code)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, accountHolderName, bankName, accountNumber, ifscCode]
      );
      console.log('Bank details saved successfully:', result.rows[0]);

      // Check if all KYC details are present
      const [aadharResult, panResult] = await Promise.all([
        pool.query('SELECT * FROM aadhar_details WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM pan_details WHERE user_id = $1', [userId])
      ]);

      // If all KYC details are present, update user's kyc_status
      if (aadharResult.rows.length > 0 && panResult.rows.length > 0) {
        console.log('All KYC details present, updating kyc_status to active');
        await pool.query(
          'UPDATE users SET kyc_status = $1 WHERE id = $2',
          ['active', userId]
        );
        console.log('Updated user kyc_status to active');
      }

      await pool.query('COMMIT');
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error saving bank details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/kyc-details', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all KYC details for the user
    const [aadharResult, panResult, bankResult] = await Promise.all([
      pool.query('SELECT * FROM aadhar_details WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM pan_details WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM bank_details WHERE user_id = $1', [userId])
    ]);

    res.json({
      success: true,
      data: {
        aadhar: aadharResult.rows[0] || null,
        pan: panResult.rows[0] || null,
        bank: bankResult.rows[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching KYC details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ... existing code ...
// Channel Partner: Save Aadhar Details
app.post('/api/channel-partner/save-aadhar-details', authenticateToken, async (req, res) => {
  const { aadharNumber, aadharName, aadharDob } = req.body;
  const userId = req.user.id;
  // Optionally, check if user is a channel partner
  // if (req.user.signup_type !== 'channel_partner') {
  //   return res.status(403).json({ success: false, error: 'Access denied' });
  // }
  if (!aadharNumber || !aadharName || !aadharDob) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }
  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO aadhar_details (user_id, aadhar_number, full_name, date_of_birth)
       VALUES ($1, $2, $3, $4)`,
      [userId, aadharNumber, aadharName, aadharDob]
    );
    client.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save Channel Partner Aadhar details' });
  }
});
// ... existing code ...

// Channel Partner: Save PAN Details
app.post('/api/channel-partner/save-pan-details', authenticateToken, async (req, res) => {
  const { panNumber, panName, panDob } = req.body;
  const userId = req.user.id;
  if (!panNumber || !panName || !panDob) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }
  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO pan_details (user_id, pan_number, full_name, date_of_birth)
       VALUES ($1, $2, $3, $4)`,
      [userId, panNumber, panName, panDob]
    );
    client.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save Channel Partner PAN details' });
  }
});

// Channel Partner: Save Bank Details
app.post('/api/channel-partner/save-bank-details', authenticateToken, async (req, res) => {
  const { bankName, accountNumber, ifscCode, accountHolderName } = req.body;
  const userId = req.user.id;
  if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }
  try {
    const client = await pool.connect();
    await client.query(
      `INSERT INTO bank_details (user_id, bank_name, account_number, ifsc_code, account_holder_name)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, bankName, accountNumber, ifscCode, accountHolderName]
    );
    client.release();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save Channel Partner bank details' });
  }
});
// ... existing code ...

// Public: Get all active products for all users
app.get('/api/products/public', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.id, 
        p.name, 
        p.status, 
        p.price,
        p.description,
        p.location,
        p.company_id, 
        c.name AS company_name,
        cat.name AS category_name,
        (SELECT file FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as image_url
       FROM products p
       JOIN company c ON p.company_id = c.id
       LEFT JOIN categories cat ON p.category = cat.id
       WHERE p.status = 'active'
       ORDER BY p.created_at DESC`
    );
    const products = result.rows.map(p => ({
      ...p,
      image_url: p.image_url ? `/Uploads/products/${p.image_url}` : null
    }));
    res.json({ success: true, products: products });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// Get user's wishlist
app.get('/api/wishlist', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT item_id FROM user_favorites WHERE user_id = $1 AND item_type = 'product'`,
      [req.user.id]
    );
    res.json({ success: true, wishlist: result.rows.map(row => row.item_id) });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wishlist' });
  }
});

// Get user's wishlisted products with details
app.get('/api/wishlist/products', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.id, 
        p.name, 
        p.status, 
        p.price,
        p.description,
        p.company_id, 
        c.name AS company_name,
        cat.name AS category_name,
        (SELECT file FROM product_images WHERE product_id = p.id ORDER BY position LIMIT 1) as image_url
       FROM products p
       JOIN user_favorites uf ON p.id = uf.item_id
       JOIN company c ON p.company_id = c.id
       LEFT JOIN categories cat ON p.category = cat.id
       WHERE uf.user_id = $1 AND uf.item_type = 'product' AND p.status = 'active'
       ORDER BY uf.created_at DESC`,
      [req.user.id]
    );
    const products = result.rows.map(p => ({
      ...p,
      image_url: p.image_url ? `/Uploads/products/${p.image_url}` : null
    }));
    res.json({ success: true, products: products });
  } catch (error) {
    console.error('Error fetching wishlisted products:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wishlisted products' });
  }
});

// Add to wishlist
app.post('/api/wishlist/add', authenticateToken, async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, error: 'Product ID is required' });
  }
  try {
    await pool.query(
      `INSERT INTO user_favorites (user_id, item_id, item_type)
       VALUES ($1, $2, 'product')
       ON CONFLICT (user_id, item_id, item_type) DO NOTHING`,
      [req.user.id, productId]
    );
    res.json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
app.post('/api/wishlist/remove', authenticateToken, async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, error: 'Product ID is required' });
  }
  try {
    await pool.query(
      `DELETE FROM user_favorites WHERE user_id = $1 AND item_id = $2 AND item_type = 'product'`,
      [req.user.id, productId]
    );
    res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, error: 'Failed to remove from wishlist' });
  }
});

// ... existing code ...
const eligibilityRoutes = require('./routes/eligibility');

app.use('/api/eligibility', eligibilityRoutes);

// ... existing code ...

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add this route for agent verification status
app.get('/agent/verification-status', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

// Ensure all KYC and OTP routes use the /api/ prefix
// (If they already do, this is a no-op. If not, this will add them.)
// Example for reference:
// app.post('/api/send-otp', ...);
// app.post('/api/save-aadhar-details', ...);
// app.post('/api/save-pan-details', ...);
// app.post('/api/save-bank-details', ...);
