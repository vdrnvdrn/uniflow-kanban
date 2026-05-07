/**
 * Centralized Error Handler for consistent API error responses
 * All errors follow format: { error: true, message: "...", status: 400 }
 */

const errorHandler = {
  /**
   * Handle 400 Bad Request errors
   */
  badRequest: (res, message = 'Bad request') => {
    return res.status(400).json({
      error: true,
      message,
      status: 400
    });
  },

  /**
   * Handle 401 Unauthorized errors
   */
  unauthorized: (res, message = 'Unauthorized') => {
    return res.status(401).json({
      error: true,
      message,
      status: 401
    });
  },

  /**
   * Handle 403 Forbidden errors
   */
  forbidden: (res, message = 'Forbidden') => {
    return res.status(403).json({
      error: true,
      message,
      status: 403
    });
  },

  /**
   * Handle 404 Not Found errors
   */
  notFound: (res, message = 'Not found') => {
    return res.status(404).json({
      error: true,
      message,
      status: 404
    });
  },

  /**
   * Handle 409 Conflict errors
   */
  conflict: (res, message = 'Conflict') => {
    return res.status(409).json({
      error: true,
      message,
      status: 409
    });
  },

  /**
   * Handle 500 Internal Server Error
   */
  internalError: (res, error = null, message = 'Internal server error') => {
    // Log the actual error for debugging
    if (error && error.message) {
      console.error('Internal Error:', error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }

    return res.status(500).json({
      error: true,
      message,
      status: 500
    });
  },

  /**
   * Handle validation errors (from express-validator)
   */
  validationError: (res, errors) => {
    const message = errors[0]?.msg || 'Validation error';
    return res.status(400).json({
      error: true,
      message,
      status: 400,
      errors: errors // Return all validation errors for client
    });
  }
};

module.exports = errorHandler;
