/**
 * Global error handling middleware
 * Handles all errors throughout the application
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error Details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  };

  // Validation errors (from Joi)
  if (err.name === 'ValidationError' || err.isJoi) {
    error.message = 'Validation Error';
    error.details = err.details?.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    })) || err.message;
    return res.status(400).json(error);
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File size too large. Maximum size is 10MB.';
    return res.status(413).json(error);
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error.message = 'Too many files. Maximum is 5 files.';
    return res.status(413).json(error);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Unexpected file field. Please check file upload requirements.';
    return res.status(400).json(error);
  }

  // CSV parsing errors
  if (err.message.includes('CSV')) {
    error.message = 'CSV parsing error. Please check your file format.';
    return res.status(400).json(error);
  }

  // ML model errors
  if (err.message.includes('TensorFlow') || err.message.includes('model')) {
    error.message = 'Machine learning model error. Please try again later.';
    return res.status(500).json(error);
  }

  // File system errors
  if (err.code === 'ENOENT') {
    error.message = 'Requested file not found.';
    return res.status(404).json(error);
  }

  if (err.code === 'EACCES') {
    error.message = 'Permission denied accessing file.';
    return res.status(403).json(error);
  }

  // Database connection errors
  if (err.code === 'ECONNREFUSED') {
    error.message = 'Database connection failed. Please try again later.';
    return res.status(503).json(error);
  }

  // Rate limiting errors
  if (err.status === 429) {
    error.message = 'Too many requests. Please try again later.';
    return res.status(429).json(error);
  }

  // Custom API errors
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json(error);
  }

  // Generic server errors
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = err;
  }

  return res.status(500).json(error);
};

export default errorHandler;