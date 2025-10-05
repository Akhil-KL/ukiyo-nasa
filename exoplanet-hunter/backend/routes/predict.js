import express from 'express';
import validator from '../middleware/requestValidator.js';
import MLService from '../services/mlService.js';

const router = express.Router();

/**
 * POST /api/predict
 * Accepts CSV data and returns ML predictions
 */
router.post('/', validator.predict, async (req, res, next) => {
  try {
    const { data, options = {} } = req.body;
    
    console.log(`🤖 Processing prediction request for ${data.length} records`);
    
    // Initialize ML service
    const mlService = new MLService();
    
    // Process predictions based on model type
    const modelType = options.model || 'habitability';
    const confidenceThreshold = options.confidence_threshold || 0.5;
    const includeDetails = options.include_details !== false;
    
    let predictions;
    
    switch (modelType) {
      case 'habitability':
        predictions = await mlService.predictHabitability(data, {
          confidenceThreshold,
          includeDetails
        });
        break;
      
      case 'classification':
        predictions = await mlService.classifyPlanets(data, {
          confidenceThreshold,
          includeDetails
        });
        break;
      
      case 'detection':
        predictions = await mlService.detectExoplanets(data, {
          confidenceThreshold,
          includeDetails
        });
        break;
      
      default:
        predictions = await mlService.predictHabitability(data, {
          confidenceThreshold,
          includeDetails
        });
    }
    
    // Calculate summary statistics
    const summary = {
      total_processed: data.length,
      successful_predictions: predictions.filter(p => p.success).length,
      failed_predictions: predictions.filter(p => !p.success).length,
      average_confidence: predictions
        .filter(p => p.success)
        .reduce((acc, p) => acc + (p.confidence || 0), 0) / 
        predictions.filter(p => p.success).length || 0,
      model_used: modelType,
      processing_time: predictions.processing_time || 0
    };
    
    // Group predictions by result
    const grouped = {
      habitable: predictions.filter(p => p.prediction === 'habitable' || p.prediction === 'CONFIRMED'),
      potentially_habitable: predictions.filter(p => p.prediction === 'potentially_habitable' || p.prediction === 'CANDIDATE'),
      not_habitable: predictions.filter(p => p.prediction === 'not_habitable' || p.prediction === 'FALSE_POSITIVE'),
      unknown: predictions.filter(p => !p.success || p.prediction === 'unknown')
    };
    
    res.status(200).json({
      success: true,
      message: `Successfully processed ${data.length} records using ${modelType} model`,
      data: {
        predictions,
        summary,
        grouped,
        metadata: {
          model_type: modelType,
          confidence_threshold: confidenceThreshold,
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    });
    
  } catch (error) {
    console.error('Prediction error:', error);
    next(error);
  }
});

/**
 * GET /api/predict/models
 * Returns available ML models and their information
 */
router.get('/models', async (req, res, next) => {
  try {
    const models = [
      {
        id: 'habitability',
        name: 'Habitability Predictor',
        description: 'Predicts the habitability potential of exoplanets based on physical characteristics',
        input_features: [
          'pl_rade', 'pl_masse', 'pl_orbper', 'pl_orbsmax', 
          'pl_eqt', 'st_teff', 'st_rad', 'st_mass'
        ],
        output_classes: ['habitable', 'potentially_habitable', 'not_habitable'],
        accuracy: 0.87,
        version: '1.2.0',
        last_trained: '2024-10-01'
      },
      {
        id: 'classification',
        name: 'Planet Type Classifier',
        description: 'Classifies exoplanets into different types (Rocky, Gas Giant, Super-Earth, etc.)',
        input_features: [
          'pl_rade', 'pl_masse', 'pl_bmasse', 'pl_dens'
        ],
        output_classes: ['Rocky', 'Super-Earth', 'Neptune-like', 'Gas Giant'],
        accuracy: 0.92,
        version: '1.1.0',
        last_trained: '2024-09-15'
      },
      {
        id: 'detection',
        name: 'Detection Validator',
        description: 'Validates exoplanet detections and classifies detection confidence',
        input_features: [
          'transit_depth', 'period_stability', 'signal_to_noise', 'follow_up_observations'
        ],
        output_classes: ['CONFIRMED', 'CANDIDATE', 'FALSE_POSITIVE'],
        accuracy: 0.94,
        version: '1.0.5',
        last_trained: '2024-09-30'
      }
    ];
    
    res.status(200).json({
      success: true,
      message: 'Available ML models retrieved successfully',
      data: {
        models,
        total_models: models.length,
        default_model: 'habitability',
        supported_formats: ['CSV', 'JSON'],
        max_batch_size: 1000
      }
    });
    
  } catch (error) {
    console.error('Models endpoint error:', error);
    next(error);
  }
});

/**
 * POST /api/predict/batch
 * Handles large batch predictions with progress tracking
 */
router.post('/batch', validator.predict, async (req, res, next) => {
  try {
    const { data, options = {} } = req.body;
    
    if (data.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Batch size too large. Maximum 1000 records per batch.',
        max_batch_size: 1000,
        received: data.length
      });
    }
    
    console.log(`🚀 Processing batch prediction for ${data.length} records`);
    
    const mlService = new MLService();
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Process in chunks for better performance
    const chunkSize = 100;
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    
    const results = [];
    let processed = 0;
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkResults = await mlService.predictHabitability(chunk, options);
      results.push(...chunkResults);
      processed += chunk.length;
      
      // Log progress
      console.log(`📊 Batch ${batchId}: ${processed}/${data.length} records processed`);
    }
    
    res.status(200).json({
      success: true,
      message: `Batch prediction completed successfully`,
      data: {
        batch_id: batchId,
        predictions: results,
        summary: {
          total_records: data.length,
          processed_records: processed,
          success_rate: results.filter(r => r.success).length / results.length,
          processing_time: results.reduce((acc, r) => acc + (r.processing_time || 0), 0)
        }
      }
    });
    
  } catch (error) {
    console.error('Batch prediction error:', error);
    next(error);
  }
});

export default router;