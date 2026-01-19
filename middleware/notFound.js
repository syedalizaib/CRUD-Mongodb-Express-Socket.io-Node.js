/**
 * 404 Not Found Middleware
 * Handles routes that don't exist
 */

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
};

module.exports = notFound;
