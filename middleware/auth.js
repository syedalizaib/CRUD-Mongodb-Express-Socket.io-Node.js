/**
 * Authentication Middleware Example
 * This is a simple example of auth middleware
 * In production, you would use JWT, sessions, or OAuth
 */

const authMiddleware = (req, res, next) => {
  // Example: Check for API key in headers
  const apiKey = req.headers['x-api-key'];

  // For demonstration purposes - in production, validate against database or JWT
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'No API key provided. Include x-api-key in headers.'
    });
  }

  // Example validation (replace with real validation)
  if (apiKey === process.env.API_KEY || apiKey === 'demo-key-12345') {
    // Attach user info to request (example)
    req.user = {
      id: 'user-123',
      role: 'admin'
    };
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key'
    });
  }
};

/**
 * Optional: Role-based authorization middleware
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole
};
