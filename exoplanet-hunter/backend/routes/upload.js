import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import validator from '../middleware/requestValidator.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload directory setup
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const DATASETS_DIR = path.join(__dirname, '../datasets');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
  
  try {
    await fs.access(DATASETS_DIR);
  } catch {
    await fs.mkdir(DATASETS_DIR, { recursive: true });
  }
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureDirectories();
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, `${basename}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files at once
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const allowedExtensions = ['.csv', '.txt'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.originalname}. Only CSV files are allowed.`), false);
    }
  }
});

/**
 * POST /api/upload
 * Handles CSV file uploads with validation and processing
 */
router.post('/', upload.array('files', 5), validator.validateFileUpload, async (req, res, next) => {
  try {
    const { dataset_name, description, source } = req.body;
    const uploadedFiles = req.files;
    
    console.log(`📤 Processing ${uploadedFiles.length} uploaded files`);
    
    const results = [];
    
    for (const file of uploadedFiles) {
      try {
        console.log(`🔄 Processing file: ${file.originalname}`);
        
        // Read and parse CSV content
        const fileContent = await fs.readFile(file.path, 'utf-8');
        
        // Parse CSV with Papa Parse
        const parseResult = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          transform: (value) => {
            // Clean up string values
            if (typeof value === 'string') {
              return value.trim();
            }
            return value;
          }
        });
        
        if (parseResult.errors.length > 0) {
          console.warn(`CSV parsing warnings for ${file.originalname}:`, parseResult.errors);
        }
        
        // Validate parsed data
        req.parsedData = parseResult.data;
        await new Promise((resolve, reject) => {
          validator.validateCSVContent(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        // Generate dataset filename
        const datasetName = dataset_name || 
          path.basename(file.originalname, path.extname(file.originalname));
        const datasetFilename = `${datasetName.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`;
        const datasetPath = path.join(DATASETS_DIR, datasetFilename);
        
        // Copy file to datasets directory
        await fs.copyFile(file.path, datasetPath);
        
        // Create metadata file
        const metadata = {
          name: datasetName,
          description: description || `Uploaded dataset from ${file.originalname}`,
          source: source || 'User Upload',
          original_filename: file.originalname,
          upload_date: new Date().toISOString(),
          file_size: file.size,
          row_count: parseResult.data.length,
          column_count: parseResult.meta.fields?.length || 0,
          columns: parseResult.meta.fields || [],
          tags: ['exoplanet', 'uploaded', 'user-data'],
          version: '1.0.0',
          quality_score: calculateDataQuality(parseResult.data, parseResult.meta.fields || [])
        };
        
        const metadataPath = path.join(DATASETS_DIR, `${datasetFilename}.meta.json`);
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        
        // Analyze data for insights
        const dataAnalysis = analyzeDataset(parseResult.data, parseResult.meta.fields || []);
        
        results.push({
          success: true,
          original_filename: file.originalname,
          dataset_id: datasetName.replace(/[^a-zA-Z0-9_-]/g, '_'),
          dataset_filename: datasetFilename,
          metadata,
          analysis: dataAnalysis,
          preview: parseResult.data.slice(0, 5), // First 5 rows for preview
          warnings: parseResult.errors.length > 0 ? parseResult.errors : null
        });
        
        // Clean up temporary file
        await fs.unlink(file.path);
        
      } catch (fileError) {
        console.error(`Error processing file ${file.originalname}:`, fileError);
        
        // Clean up temporary file on error
        try {
          await fs.unlink(file.path);
        } catch {}
        
        results.push({
          success: false,
          original_filename: file.originalname,
          error: fileError.message,
          error_type: 'processing_error'
        });
      }
    }
    
    // Calculate summary
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const response = {
      success: successful.length > 0,
      message: `Processed ${uploadedFiles.length} files: ${successful.length} successful, ${failed.length} failed`,
      data: {
        results,
        summary: {
          total_files: uploadedFiles.length,
          successful_uploads: successful.length,
          failed_uploads: failed.length,
          total_rows_processed: successful.reduce((sum, r) => sum + (r.metadata?.row_count || 0), 0),
          datasets_created: successful.map(r => ({
            id: r.dataset_id,
            name: r.metadata?.name,
            rows: r.metadata?.row_count,
            quality_score: r.metadata?.quality_score
          }))
        }
      }
    };
    
    res.status(successful.length > 0 ? 201 : 400).json(response);
    
  } catch (error) {
    console.error('Upload processing error:', error);
    
    // Clean up any temporary files
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch {}
      }
    }
    
    next(error);
  }
});

/**
 * POST /api/upload/validate
 * Validates CSV files without saving them
 */
router.post('/validate', upload.array('files', 5), validator.validateFileUpload, async (req, res, next) => {
  try {
    const uploadedFiles = req.files;
    console.log(`🔍 Validating ${uploadedFiles.length} files`);
    
    const validationResults = [];
    
    for (const file of uploadedFiles) {
      try {
        const fileContent = await fs.readFile(file.path, 'utf-8');
        
        // Parse CSV
        const parseResult = Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          preview: 100 // Only parse first 100 rows for validation
        });
        
        // Validate structure
        const validation = {
          filename: file.originalname,
          valid: true,
          file_size: file.size,
          file_size_human: formatFileSize(file.size),
          row_count_sample: parseResult.data.length,
          column_count: parseResult.meta.fields?.length || 0,
          columns: parseResult.meta.fields || [],
          data_types: analyzeDataTypes(parseResult.data, parseResult.meta.fields || []),
          issues: [],
          warnings: parseResult.errors || [],
          quality_score: calculateDataQuality(parseResult.data, parseResult.meta.fields || [])
        };
        
        // Check for common issues
        if (validation.column_count === 0) {
          validation.valid = false;
          validation.issues.push('No columns detected');
        }
        
        if (validation.row_count_sample === 0) {
          validation.valid = false;
          validation.issues.push('No data rows found');
        }
        
        // Check for required exoplanet fields
        const exoplanetFields = ['pl_name', 'planet', 'name', 'pl_rade', 'radius'];
        const hasExoplanetField = validation.columns.some(col => 
          exoplanetFields.some(field => 
            col.toLowerCase().includes(field.toLowerCase())
          )
        );
        
        if (!hasExoplanetField) {
          validation.warnings.push('No obvious exoplanet identifier columns found');
        }
        
        validationResults.push(validation);
        
        // Clean up temporary file
        await fs.unlink(file.path);
        
      } catch (fileError) {
        validationResults.push({
          filename: file.originalname,
          valid: false,
          error: fileError.message,
          issues: ['File processing failed']
        });
        
        // Clean up temporary file
        try {
          await fs.unlink(file.path);
        } catch {}
      }
    }
    
    const allValid = validationResults.every(r => r.valid);
    
    res.status(200).json({
      success: true,
      message: `Validation complete: ${validationResults.filter(r => r.valid).length}/${validationResults.length} files are valid`,
      data: {
        all_files_valid: allValid,
        validation_results: validationResults,
        summary: {
          total_files: validationResults.length,
          valid_files: validationResults.filter(r => r.valid).length,
          invalid_files: validationResults.filter(r => !r.valid).length,
          total_estimated_rows: validationResults.reduce((sum, r) => sum + (r.row_count_sample || 0), 0)
        }
      }
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    
    // Clean up any temporary files
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch {}
      }
    }
    
    next(error);
  }
});

/**
 * GET /api/upload/status
 * Returns upload limits and server information
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Upload service status',
    data: {
      service_status: 'active',
      upload_limits: {
        max_file_size: '10MB',
        max_file_size_bytes: 10 * 1024 * 1024,
        max_files_per_request: 5,
        allowed_file_types: ['CSV', 'TXT'],
        allowed_extensions: ['.csv', '.txt'],
        allowed_mime_types: ['text/csv', 'application/vnd.ms-excel', 'text/plain']
      },
      supported_features: [
        'CSV parsing and validation',
        'Automatic data type detection',
        'Quality scoring',
        'Metadata generation',
        'Batch file upload',
        'Preview generation'
      ],
      storage_info: {
        upload_directory: UPLOAD_DIR,
        datasets_directory: DATASETS_DIR
      }
    }
  });
});

// Helper functions
function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function calculateDataQuality(data, columns) {
  if (!data || data.length === 0) return 0;
  
  let score = 0;
  
  // Row count scoring (40 points max)
  if (data.length > 1000) score += 40;
  else if (data.length > 100) score += 30;
  else if (data.length > 10) score += 20;
  else score += 10;
  
  // Column count scoring (20 points max)
  if (columns.length > 10) score += 20;
  else if (columns.length > 5) score += 15;
  else if (columns.length > 2) score += 10;
  else score += 5;
  
  // Data completeness scoring (40 points max)
  const completeness = columns.map(col => {
    const nonEmptyValues = data.filter(row => row[col] !== null && row[col] !== '' && row[col] !== undefined).length;
    return nonEmptyValues / data.length;
  });
  
  const avgCompleteness = completeness.reduce((sum, c) => sum + c, 0) / completeness.length;
  score += Math.round(avgCompleteness * 40);
  
  return Math.min(100, score);
}

function analyzeDataTypes(data, columns) {
  if (!data || data.length === 0) return {};
  
  const types = {};
  
  columns.forEach(col => {
    const values = data.map(row => row[col]).filter(val => val !== null && val !== '' && val !== undefined);
    
    if (values.length === 0) {
      types[col] = 'empty';
      return;
    }
    
    const numericValues = values.filter(val => typeof val === 'number' || (!isNaN(val) && !isNaN(parseFloat(val))));
    const stringValues = values.filter(val => typeof val === 'string');
    
    if (numericValues.length / values.length > 0.8) {
      types[col] = 'numeric';
    } else if (stringValues.length / values.length > 0.8) {
      types[col] = 'string';
    } else {
      types[col] = 'mixed';
    }
  });
  
  return types;
}

function analyzeDataset(data, columns) {
  if (!data || data.length === 0) return {};
  
  return {
    row_count: data.length,
    column_count: columns.length,
    data_types: analyzeDataTypes(data, columns),
    completeness: columns.reduce((acc, col) => {
      const nonEmpty = data.filter(row => row[col] !== null && row[col] !== '' && row[col] !== undefined).length;
      acc[col] = (nonEmpty / data.length) * 100;
      return acc;
    }, {}),
    unique_values: columns.reduce((acc, col) => {
      const unique = new Set(data.map(row => row[col]));
      acc[col] = unique.size;
      return acc;
    }, {}),
    sample_values: columns.reduce((acc, col) => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== '').slice(0, 5);
      acc[col] = values;
      return acc;
    }, {})
  };
}

export default router;