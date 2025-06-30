const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log('authenticateToken middleware - Request received');
  console.log('Headers:', req.headers);

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('authenticateToken: Missing token');
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required',
      details: 'No authorization token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    if (!decoded.id || isNaN(parseInt(decoded.id, 10))) {
      console.error('authenticateToken: Invalid user ID in token', decoded);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        details: 'Invalid user ID in token'
      });
    }

    if (!decoded.signup_type) {
      console.error('authenticateToken: Missing signup_type in token', decoded);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        details: 'Missing signup_type in token'
      });
    }

    req.user = {
      id: parseInt(decoded.id, 10),
      signup_type: decoded.signup_type,
    };
    console.log('User set in request:', req.user);
    next();
  } catch (err) {
    console.error('authenticateToken: Token verification failed:', err);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token',
      details: err.message
    });
  }
};

const checkAccess = (roles) => (req, res, next) => {
  console.log('checkAccess middleware - Request received');
  console.log('User:', req.user);
  console.log('Required roles:', roles);

  if (!req.user || !req.user.signup_type) {
    console.error('checkAccess: Missing user or signup_type');
    return res.status(401).json({ 
      success: false, 
      message: 'User not authenticated',
      details: 'Missing user information'
    });
  }

  if (!roles.includes(req.user.signup_type)) {
    console.error('checkAccess: Access denied for user:', req.user);
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied',
      details: `Required role: ${roles.join(', ')}`
    });
  }

  console.log('Access granted for user:', req.user);
  next();
};

module.exports = { authenticateToken, checkAccess };