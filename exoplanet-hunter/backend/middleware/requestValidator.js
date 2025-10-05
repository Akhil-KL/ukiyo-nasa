import Joi from 'joi';

/**
 * Request validation middleware using Joi
 * Validates incoming requests based on predefined schemas
 */

// Validation schemas
const schemas = {
  // POST /api/predict validation
  predict: Joi.object({
    data: Joi.array().items(
      Joi.object({
        // Common exoplanet data fields
        pl_name: Joi.string().optional(),
        pl_rade: Joi.number().min(0).optional(),
        pl_masse: Joi.number().min(0).optional(),
        pl_orbper: Joi.number().min(0).optional(),
        pl_orbsmax: Joi.number().min(0).optional(),
        pl_eqt: Joi.number().min(0).optional(),
        st_teff: Joi.number().min(0).optional(),
        st_rad: Joi.number().min(0).optional(),
        st_mass: Joi.number().min(0).optional(),
        // Allow additional fields for flexibility
      }).unknown(true)
    ).min(1).required(),
    options: Joi.object({
      model: Joi.string().valid('habitability', 'classification', 'detection').default('habitability'),
      confidence_threshold: Joi.number().min(0).max(1).default(0.5),
      include_details: Joi.boolean().default(true)
    }).optional()
  }),

  // POST /api/upload validation (file validation handled by multer)
  upload: Joi.object({
    dataset_name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    source: Joi.string().max(200).optional()
  }),

  // Query parameters validation
  query: {
    datasets: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().max(100).optional(),
      sort: Joi.string().valid('name', 'date', 'size').default('date'),
      order: Joi.string().valid('asc', 'desc').default('desc')
    })
  }
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let dataToValidate;
      
      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: false,
        allowUnknown: true
      });

      if (error) {
        const validationError = new Error('Validation failed');
        validationError.isJoi = true;
        validationError.details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/['"]/g, ''),
          value: detail.context?.value
        }));
        
        return next(validationError);
      }

      // Replace the original data with validated data
      if (source === 'body') req.body = value;
      if (source === 'query') req.query = value;
      if (source === 'params') req.params = value;

      next();
    } catch (err) {
      next(err);
    }
  };
};

// File validation for uploads
const validateFileUpload = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      const error = new Error('No files uploaded. Please select at least one CSV file.');
      error.statusCode = 400;
      return next(error);
    }

    // Validate file types
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const allowedExtensions = ['.csv', '.txt'];

    for (const file of req.files) {
      const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.mimetype) && !allowedExtensions.includes(fileExtension)) {
        const error = new Error(`Invalid file type: ${file.originalname}. Only CSV files are allowed.`);
        error.statusCode = 400;
        return next(error);
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        const error = new Error(`File too large: ${file.originalname}. Maximum size is 10MB.`);
        error.statusCode = 413;
        return next(error);
      }
    }

    next();
  } catch (err) {
    next(err);
  }
};

// CSV content validation
const validateCSVContent = (req, res, next) => {
  try {
    if (!req.parsedData || !Array.isArray(req.parsedData) || req.parsedData.length === 0) {
      const error = new Error('CSV file appears to be empty or contains no valid data.');
      error.statusCode = 400;
      return next(error);
    }

    // Check for required columns (flexible validation)
    const firstRow = req.parsedData[0];
    const requiredFields = ['pl_name']; // At minimum, we need planet names
    const hasRequiredFields = requiredFields.some(field => 
      Object.keys(firstRow).some(key => 
        key.toLowerCase().includes(field.toLowerCase()) || 
        key.toLowerCase().includes('name') ||
        key.toLowerCase().includes('planet')
      )
    );

    if (!hasRequiredFields) {
      const error = new Error('CSV must contain at least planet name or identifier columns.');
      error.statusCode = 400;
      return next(error);
    }

    // Validate data quality
    const validRows = req.parsedData.filter(row => {
      return Object.values(row).some(value => value && value.toString().trim() !== '');
    });

    if (validRows.length < req.parsedData.length * 0.5) {
      const error = new Error('CSV contains too many empty rows. Please check your data quality.');
      error.statusCode = 400;
      return next(error);
    }

    req.parsedData = validRows;
    next();
  } catch (err) {
    next(err);
  }
};

// Export validation functions
export default {
  predict: validate(schemas.predict),
  upload: validate(schemas.upload),
  queryDatasets: validate(schemas.query.datasets, 'query'),
  validateFileUpload,
  validateCSVContent,
  validate,
  schemas
};