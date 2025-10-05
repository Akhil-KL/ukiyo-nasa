/**
 * Machine Learning Service for Exoplanet Analysis
 * Integrates with trained NASA ML models from Prompt 12A for real predictions
 * Features both the trained model (via Python service) and fallback rule-based analysis
 */

import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MLService {
  constructor() {
    this.isInitialized = false;
    this.pythonServiceUrl = 'http://127.0.0.1:5001';
    this.pythonServiceProcess = null;
    this.usePythonService = false;
    
    // Fallback features for rule-based analysis
    this.features = {
      habitability: ['pl_rade', 'pl_masse', 'pl_orbper', 'pl_orbsmax', 'pl_eqt', 'st_teff', 'st_rad', 'st_mass'],
      classification: ['pl_rade', 'pl_masse', 'pl_bmasse', 'pl_dens'],
      detection: ['koi_score', 'koi_period', 'koi_prad', 'koi_dor']
    };
  }

  /**
   * Initialize the service with both trained model and fallback
   */
  async initializeModels() {
    try {
      console.log('🤖 Initializing NASA Exoplanet ML service...');
      
      // Try to start Python ML service
      await this.startPythonService();
      
      // Test connection to Python service
      if (await this.testPythonService()) {
        this.usePythonService = true;
        console.log('✅ Using trained Gradient Boosting model (Prompt 12A)');
      } else {
        this.usePythonService = false;
        console.log('⚠️ Trained model unavailable, using rule-based fallback');
      }
      
      this.isInitialized = true;
      console.log('✅ ML service initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing ML service:', error);
      // Initialize with rule-based fallback only
      this.usePythonService = false;
      this.isInitialized = true;
      console.log('✅ ML service initialized with rule-based fallback');
    }
  }

  /**
   * Start the Python ML service subprocess
   */
  async startPythonService() {
    return new Promise((resolve, reject) => {
      try {
        const pythonScript = path.join(__dirname, 'ml_service_python.py');
        
        console.log('🐍 Starting Python ML service...');
        this.pythonServiceProcess = spawn('python', [pythonScript], {
          cwd: __dirname,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        // Handle Python service output
        this.pythonServiceProcess.stdout.on('data', (data) => {
          console.log(`[Python ML] ${data.toString().trim()}`);
        });

        this.pythonServiceProcess.stderr.on('data', (data) => {
          console.error(`[Python ML Error] ${data.toString().trim()}`);
        });

        this.pythonServiceProcess.on('error', (error) => {
          console.error('Python service error:', error);
          reject(error);
        });

        this.pythonServiceProcess.on('exit', (code) => {
          console.log(`Python service exited with code ${code}`);
          this.usePythonService = false;
        });

        // Wait a moment for the service to start
        setTimeout(() => {
          resolve();
        }, 3000);

      } catch (error) {
        console.error('Error starting Python service:', error);
        reject(error);
      }
    });
  }

  /**
   * Test connection to Python ML service
   */
  async testPythonService() {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/health`, {
        timeout: 5000
      });
      return response.data.model_loaded === true;
    } catch (error) {
      console.log('Python service not available:', error.message);
      return false;
    }
  }

  /**
   * Get model information
   */
  async getModelInfo() {
    if (this.usePythonService) {
      try {
        const response = await axios.get(`${this.pythonServiceUrl}/model/info`);
        return response.data.data;
      } catch (error) {
        console.error('Error getting model info from Python service:', error);
        return this.getFallbackModelInfo();
      }
    }
    
    return this.getFallbackModelInfo();
  }

  /**
   * Get fallback model information
   */
  getFallbackModelInfo() {
    return {
      model_name: 'Rule-based Analysis',
      model_type: 'Deterministic Rules',
      features_count: 8,
      classes: ['habitable', 'potentially_habitable', 'not_habitable'],
      performance: {
        validation_accuracy: 'N/A',
        description: 'Rule-based system using NASA exoplanet criteria'
      },
      training_info: {
        method: 'Expert knowledge and NASA habitability criteria',
        features: this.features.habitability
      }
    };
  }

  /**
   * Predict habitability using the best available method
   */
  async predictHabitability(data, options = {}) {
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        await this.initializeModels();
      }

      // Try trained model first
      if (this.usePythonService) {
        try {
          const response = await axios.post(`${this.pythonServiceUrl}/predict`, {
            data: data,
            options: options
          }, {
            timeout: 30000
          });

          if (response.data.success) {
            const predictions = response.data.data.predictions.map(pred => ({
              success: pred.success,
              planet_name: pred.planet_name,
              prediction: this.mapTrainedModelPrediction(pred.prediction),
              confidence: pred.confidence,
              probabilities: this.mapTrainedModelProbabilities(pred.probabilities),
              model_used: 'Gradient Boosting (Trained)',
              details: options.includeDetails ? {
                trained_model_prediction: pred.prediction,
                trained_model_confidence: pred.confidence,
                model_type: response.data.data.model_info.model_name
              } : undefined
            }));

            return {
              predictions,
              processing_time: Date.now() - startTime,
              model_used: 'trained'
            };
          }
        } catch (error) {
          console.error('Trained model prediction failed, falling back to rules:', error.message);
          this.usePythonService = false;
        }
      }

      // Fallback to rule-based predictions
      return await this.predictHabitabilityRuleBased(data, options, startTime);

    } catch (error) {
      console.error('Habitability prediction error:', error);
      throw error;
    }
  }

  /**
   * Map trained model predictions to habitability categories
   */
  mapTrainedModelPrediction(trainedPrediction) {
    const mapping = {
      'CONFIRMED': 'habitable',
      'CANDIDATE': 'potentially_habitable', 
      'FALSE_POSITIVE': 'not_habitable',
      'UNKNOWN': 'potentially_habitable'
    };
    
    return mapping[trainedPrediction] || 'potentially_habitable';
  }

  /**
   * Map trained model probabilities to habitability categories
   */
  mapTrainedModelProbabilities(trainedProbs) {
    return {
      habitable: (trainedProbs.CONFIRMED || 0),
      potentially_habitable: (trainedProbs.CANDIDATE || 0) + (trainedProbs.UNKNOWN || 0),
      not_habitable: (trainedProbs.FALSE_POSITIVE || 0)
    };
  }

  /**
   * Classify planets using the best available method
   */
  async classifyPlanets(data, options = {}) {
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        await this.initializeModels();
      }

      // Try trained model first
      if (this.usePythonService) {
        try {
          const response = await axios.post(`${this.pythonServiceUrl}/predict`, {
            data: data,
            options: options
          });

          if (response.data.success) {
            const predictions = response.data.data.predictions.map(pred => ({
              success: pred.success,
              planet_name: pred.planet_name,
              prediction: pred.prediction,
              confidence: pred.confidence,
              probabilities: pred.probabilities,
              model_used: 'Gradient Boosting (Trained)',
              details: options.includeDetails ? {
                classification_type: this.classifyPlanetTypeFromPrediction(pred.prediction),
                confidence_level: pred.confidence > 0.8 ? 'High' : pred.confidence > 0.6 ? 'Medium' : 'Low'
              } : undefined
            }));

            return {
              predictions,
              processing_time: Date.now() - startTime,
              model_used: 'trained'
            };
          }
        } catch (error) {
          console.error('Trained model classification failed, falling back to rules:', error.message);
          this.usePythonService = false;
        }
      }

      // Fallback to rule-based classification
      return await this.classifyPlanetsRuleBased(data, options, startTime);

    } catch (error) {
      console.error('Classification error:', error);
      throw error;
    }
  }

  /**
   * Validate detections using the best available method
   */
  async detectExoplanets(data, options = {}) {
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        await this.initializeModels();
      }

      // Try trained model first
      if (this.usePythonService) {
        try {
          const response = await axios.post(`${this.pythonServiceUrl}/predict`, {
            data: data,
            options: options
          });

          if (response.data.success) {
            const predictions = response.data.data.predictions.map(pred => ({
              success: pred.success,
              planet_name: pred.planet_name,
              prediction: pred.prediction, // CONFIRMED, CANDIDATE, FALSE_POSITIVE, UNKNOWN
              confidence: pred.confidence,
              probabilities: pred.probabilities,
              model_used: 'Gradient Boosting (Trained)',
              details: options.includeDetails ? {
                detection_status: pred.prediction,
                confidence_level: pred.confidence > 0.8 ? 'High' : pred.confidence > 0.6 ? 'Medium' : 'Low',
                source: 'NASA Trained Model'
              } : undefined
            }));

            return {
              predictions,
              processing_time: Date.now() - startTime,
              model_used: 'trained'
            };
          }
        } catch (error) {
          console.error('Trained model detection failed, falling back to rules:', error.message);
          this.usePythonService = false;
        }
      }

      // Fallback to rule-based detection
      return await this.detectExoplanetsRuleBased(data, options, startTime);

    } catch (error) {
      console.error('Detection validation error:', error);
      throw error;
    }
  }

  /**
   * Batch prediction with proper handling
   */
  async predictBatch(data, options = {}) {
    if (data.length > 1000) {
      throw new Error('Batch size too large. Maximum 1000 records per batch.');
    }

    if (this.usePythonService) {
      try {
        const response = await axios.post(`${this.pythonServiceUrl}/predict/batch`, {
          data: data,
          options: options
        }, {
          timeout: 60000 // Longer timeout for batch processing
        });

        if (response.data.success) {
          return response.data.data;
        }
      } catch (error) {
        console.error('Batch prediction failed, falling back to individual predictions:', error.message);
      }
    }

    // Fallback: process individually with rule-based method
    const results = await this.predictHabitability(data, options);
    return {
      batch_id: `fallback_batch_${Date.now()}`,
      predictions: results.predictions,
      summary: {
        total_records: data.length,
        successful_predictions: results.predictions.filter(p => p.success).length,
        processing_time: results.processing_time
      }
    };
  }

  /**
   * Rule-based habitability prediction (fallback method)
   */
  async predictHabitabilityRuleBased(data, options = {}, startTime = Date.now()) {
    const { confidenceThreshold = 0.5, includeDetails = true } = options;
    
    const predictions = data.map((planet, index) => {
      try {
        // Rule-based habitability assessment
        const habitabilityScore = this.calculateHabitabilityScore(planet);
        const prediction = this.classifyHabitability(habitabilityScore);
        const confidence = Math.min(0.95, Math.max(0.1, habitabilityScore / 100));

        const result = {
          success: true,
          planet_name: planet.pl_name || planet.kepoi_name || planet.toi || `Planet-${index + 1}`,
          prediction,
          confidence,
          habitability_score: habitabilityScore,
          probabilities: this.generateProbabilities(prediction, confidence),
          model_used: 'Rule-based Analysis'
        };

        if (includeDetails) {
          result.details = {
            input_features: this.extractFeatureValues(planet, 'habitability'),
            reasoning: this.generateHabitabilityReasoning(planet, result)
          };
        }

        return result;

      } catch (error) {
        console.error(`Error predicting habitability for planet ${index}:`, error);
        return {
          success: false,
          planet_name: planet.pl_name || planet.name || `Planet-${index + 1}`,
          error: error.message,
          confidence: 0,
          prediction: 'unknown',
          model_used: 'Rule-based Analysis (Error)'
        };
      }
    });

    const processingTime = Date.now() - startTime;
    return { predictions, processing_time: processingTime };
  }

  /**
   * Rule-based planet classification (fallback method)
   */
  async classifyPlanetsRuleBased(data, options = {}, startTime = Date.now()) {
    const { confidenceThreshold = 0.5, includeDetails = true } = options;
    
    const predictions = data.map((planet, index) => {
      try {
        const classification = this.classifyPlanetType(planet);
        const confidence = Math.min(0.95, Math.max(0.3, classification.confidence));

        const result = {
          success: true,
          planet_name: planet.pl_name || planet.kepoi_name || planet.toi || `Planet-${index + 1}`,
          prediction: classification.type,
          confidence,
          probabilities: classification.probabilities,
          model_used: 'Rule-based Classification'
        };

        if (includeDetails) {
          result.details = {
            input_features: this.extractFeatureValues(planet, 'classification'),
            size_category: this.categorizePlanetSize(planet),
            mass_category: this.categorizePlanetMass(planet)
          };
        }

        return result;

      } catch (error) {
        return {
          success: false,
          planet_name: planet.pl_name || planet.name || `Planet-${index + 1}`,
          error: error.message,
          confidence: 0,
          prediction: 'unknown',
          model_used: 'Rule-based Classification (Error)'
        };
      }
    });

    const processingTime = Date.now() - startTime;
    return { predictions, processing_time: processingTime };
  }

  /**
   * Rule-based detection validation (fallback method)
   */
  async detectExoplanetsRuleBased(data, options = {}, startTime = Date.now()) {
    const predictions = data.map((planet, index) => {
      // Rule-based detection validation
      const detection = this.validateDetection(planet);
      
      return {
        success: true,
        planet_name: planet.pl_name || planet.kepoi_name || planet.toi || `Planet-${index + 1}`,
        prediction: detection.status,
        confidence: detection.confidence,
        model_used: 'Rule-based Detection',
        details: options.includeDetails ? detection.reasoning : undefined
      };
    });

    const processingTime = Date.now() - startTime;
    return { predictions, processing_time: processingTime };
  }

  /**
   * Helper method to classify planet type from trained model prediction
   */
  classifyPlanetTypeFromPrediction(prediction) {
    // This is a simplified mapping - in a real scenario, you'd have more sophisticated logic
    const typeMapping = {
      'CONFIRMED': 'Validated Exoplanet',
      'CANDIDATE': 'Exoplanet Candidate',
      'FALSE_POSITIVE': 'Non-planetary Signal',
      'UNKNOWN': 'Undetermined'
    };
    
    return typeMapping[prediction] || 'Unknown Type';
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.pythonServiceProcess) {
      console.log('🛑 Stopping Python ML service...');
      this.pythonServiceProcess.kill();
      this.pythonServiceProcess = null;
    }
    this.isInitialized = false;
    console.log('🧹 ML service disposed');
  }

  /**
   * Rule-based habitability classification
   */
  classifyHabitability(score) {
    if (score >= 75) return 'habitable';
    if (score >= 50) return 'potentially_habitable';
    return 'not_habitable';
  }

  /**
   * Generate probability distribution for predictions
   */
  generateProbabilities(prediction, confidence) {
    const base = (1 - confidence) / 2;
    const probabilities = {
      habitable: base,
      potentially_habitable: base,
      not_habitable: base
    };
    probabilities[prediction] = confidence;
    return probabilities;
  }

  /**
   * Rule-based planet type classification
   */
  classifyPlanetType(planet) {
    const radius = parseFloat(planet.pl_rade) || parseFloat(planet.koi_prad) || 1;
    const mass = parseFloat(planet.pl_masse) || parseFloat(planet.pl_bmasse) || parseFloat(planet.koi_pmass) || 1;
    
    let type, confidence;
    
    if (radius < 1.25) {
      type = 'Rocky';
      confidence = 0.8 + (1.25 - radius) * 0.15;
    } else if (radius < 2.0) {
      type = 'Super-Earth';
      confidence = 0.75 + Math.abs(1.6 - radius) * 0.1;
    } else if (radius < 4.0) {
      type = 'Neptune-like';
      confidence = 0.7 + Math.abs(3.0 - radius) * 0.1;
    } else {
      type = 'Gas Giant';
      confidence = 0.8 + Math.min(0.15, (radius - 4) * 0.05);
    }

    // Adjust confidence based on mass if available
    if (mass > 0.1) {
      const massRadius = Math.pow(mass, 1/3); // Rough mass-radius relationship
      const consistency = 1 - Math.abs(radius - massRadius) / Math.max(radius, massRadius);
      confidence *= (0.7 + consistency * 0.3);
    }

    return {
      type,
      confidence,
      probabilities: {
        rocky: type === 'Rocky' ? confidence : (1 - confidence) / 3,
        super_earth: type === 'Super-Earth' ? confidence : (1 - confidence) / 3,
        neptune_like: type === 'Neptune-like' ? confidence : (1 - confidence) / 3,
        gas_giant: type === 'Gas Giant' ? confidence : (1 - confidence) / 3
      }
    };
  }

  /**
   * Rule-based detection validation
   */
  validateDetection(planet) {
    let status, confidence, reasoning = [];
    
    // Check disposition from data
    const disposition = (planet.disposition || planet.koi_disposition || planet.tfopwg_disp || '').toLowerCase();
    
    if (disposition.includes('confirmed')) {
      status = 'CONFIRMED';
      confidence = 0.95;
      reasoning.push('Object has confirmed disposition in dataset');
    } else if (disposition.includes('candidate')) {
      status = 'CANDIDATE';
      confidence = 0.7;
      reasoning.push('Object has candidate disposition in dataset');
    } else if (disposition.includes('false')) {
      status = 'FALSE_POSITIVE';
      confidence = 0.9;
      reasoning.push('Object has false positive disposition in dataset');
    } else {
      // Use other indicators
      const koiScore = parseFloat(planet.koi_score) || 0.5;
      const period = parseFloat(planet.pl_orbper || planet.koi_period) || 0;
      const radius = parseFloat(planet.pl_rade || planet.koi_prad) || 0;
      
      if (koiScore > 0.8 && period > 0.1 && radius > 0.1) {
        status = 'CANDIDATE';
        confidence = koiScore * 0.8;
        reasoning.push(`High KOI score (${koiScore.toFixed(2)}) with valid parameters`);
      } else if (koiScore < 0.3) {
        status = 'FALSE_POSITIVE';
        confidence = 0.7;
        reasoning.push(`Low KOI score (${koiScore.toFixed(2)}) indicates likely false positive`);
      } else {
        status = 'CANDIDATE';
        confidence = 0.5;
        reasoning.push('Moderate evidence for planetary nature');
      }
    }

    return { status, confidence, reasoning };
  }

  /**
   * Extract feature values for display
   */
  extractFeatureValues(planet, modelType) {
    const features = {};
    const requiredFeatures = this.features[modelType];
    
    for (const feature of requiredFeatures) {
      let value = planet[feature];
      if (value === null || value === undefined || value === '' || isNaN(value)) {
        value = this.getDefaultValue(feature);
      }
      features[feature] = parseFloat(value) || value;
    }
    
    return features;
  }

  /**
   * Extract and normalize features for ML models
   */
  extractFeatures(planet, modelType) {
    const requiredFeatures = this.features[modelType];
    const features = [];

    for (const feature of requiredFeatures) {
      let value = planet[feature];
      
      // Handle missing values
      if (value === null || value === undefined || value === '' || isNaN(value)) {
        // Use default values based on feature type
        value = this.getDefaultValue(feature);
      } else {
        value = parseFloat(value);
      }

      // Normalize features (simple min-max scaling)
      value = this.normalizeFeature(feature, value);
      features.push(value);
    }

    // Check if we have enough valid features
    const validFeatures = features.filter(f => !isNaN(f) && isFinite(f));
    if (validFeatures.length < requiredFeatures.length * 0.5) {
      return null; // Not enough data
    }

    return features;
  }

  /**
   * Get default values for missing features
   */
  getDefaultValue(feature) {
    const defaults = {
      // Planet physical properties
      pl_rade: 1.0,     // Earth radii
      pl_masse: 1.0,    // Earth masses
      pl_bmasse: 1.0,   // Earth masses (bulk mass)
      pl_dens: 5.5,     // g/cm³
      
      // Orbital properties
      pl_orbper: 365.25, // Days
      pl_orbsmax: 1.0,   // AU
      pl_eqt: 288,       // Kelvin
      
      // Stellar properties
      st_teff: 5778,     // Kelvin (Sun-like)
      st_rad: 1.0,       // Solar radii
      st_mass: 1.0,      // Solar masses
      
      // Kepler-specific features
      koi_score: 0.5,    // KOI disposition score
      koi_period: 365.25, // Orbital period (days)
      koi_prad: 1.0,     // Planet radius (Earth radii)
      koi_dor: 10.0,     // Duration/Period ratio
      
      // TESS-specific features
      toi_period: 365.25, // Orbital period (days)
      toi_prad: 1.0,      // Planet radius (Earth radii)
      toi_depth: 0.001,   // Transit depth
      toi_dur: 3.0        // Transit duration (hours)
    };

    return defaults[feature] || 1.0;
  }

  /**
   * Normalize features for neural network input
   */
  normalizeFeature(feature, value) {
    // Normalization ranges based on real NASA exoplanet data
    const ranges = {
      // Planet physical properties
      pl_rade: [0.1, 20],      // 0.1 to 20 Earth radii
      pl_masse: [0.01, 1000],  // 0.01 to 1000 Earth masses
      pl_bmasse: [0.01, 1000], // 0.01 to 1000 Earth masses
      pl_dens: [0.1, 20],      // 0.1 to 20 g/cm³
      
      // Orbital properties
      pl_orbper: [0.1, 10000], // 0.1 to 10000 days
      pl_orbsmax: [0.01, 100], // 0.01 to 100 AU
      pl_eqt: [100, 2000],     // 100 to 2000 K
      
      // Stellar properties
      st_teff: [2000, 10000],  // 2000 to 10000 K
      st_rad: [0.1, 10],       // 0.1 to 10 solar radii
      st_mass: [0.1, 10],      // 0.1 to 10 solar masses
      
      // Kepler-specific features
      koi_score: [0, 1],       // KOI disposition score (0-1)
      koi_period: [0.1, 10000], // Orbital period (days)
      koi_prad: [0.1, 20],     // Planet radius (Earth radii)
      koi_dor: [1, 100],       // Duration/Period ratio
      
      // TESS-specific features
      toi_period: [0.1, 10000], // Orbital period (days)
      toi_prad: [0.1, 20],      // Planet radius (Earth radii)
      toi_depth: [0.0001, 0.1], // Transit depth
      toi_dur: [0.1, 24]        // Transit duration (hours)
    };

    const [min, max] = ranges[feature] || [0, 1];
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  /**
   * Calculate habitability score based on known factors
   */
  calculateHabitabilityScore(planet) {
    let score = 0;
    let factors = 0;

    // Planet size factor
    const radius = parseFloat(planet.pl_rade) || 1;
    if (radius >= 0.5 && radius <= 2.0) {
      score += 25; // Optimal size range
    } else if (radius >= 0.3 && radius <= 3.0) {
      score += 15; // Acceptable range
    }
    factors++;

    // Orbital distance factor
    const orbitalDistance = parseFloat(planet.pl_orbsmax) || 1;
    if (orbitalDistance >= 0.5 && orbitalDistance <= 2.0) {
      score += 25; // Habitable zone
    } else if (orbitalDistance >= 0.2 && orbitalDistance <= 5.0) {
      score += 10; // Extended habitable zone
    }
    factors++;

    // Temperature factor
    const temperature = parseFloat(planet.pl_eqt) || 288;
    if (temperature >= 273 && temperature <= 373) {
      score += 25; // Liquid water range
    } else if (temperature >= 200 && temperature <= 500) {
      score += 15; // Extended range
    }
    factors++;

    // Stellar temperature factor
    const stellarTemp = parseFloat(planet.st_teff) || 5778;
    if (stellarTemp >= 4000 && stellarTemp <= 7000) {
      score += 25; // Sun-like stars
    } else if (stellarTemp >= 3000 && stellarTemp <= 8000) {
      score += 15; // Acceptable range
    }
    factors++;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Generate reasoning for habitability prediction
   */
  generateHabitabilityReasoning(planet, result) {
    const reasons = [];
    
    const radius = parseFloat(planet.pl_rade) || 1;
    const temp = parseFloat(planet.pl_eqt) || 288;
    const orbitalDistance = parseFloat(planet.pl_orbsmax) || 1;

    if (result.prediction === 'habitable') {
      if (radius >= 0.5 && radius <= 2.0) {
        reasons.push('Planet size is in the optimal range for habitability');
      }
      if (temp >= 273 && temp <= 373) {
        reasons.push('Temperature allows for liquid water');
      }
      if (orbitalDistance >= 0.5 && orbitalDistance <= 2.0) {
        reasons.push('Located in the habitable zone');
      }
    } else if (result.prediction === 'potentially_habitable') {
      reasons.push('Some conditions favor habitability but uncertainties remain');
      if (radius < 0.5 || radius > 2.0) {
        reasons.push('Planet size is outside optimal range');
      }
      if (temp < 273 || temp > 373) {
        reasons.push('Temperature may not support liquid water');
      }
    } else {
      reasons.push('Conditions are not favorable for habitability');
      if (radius > 5) {
        reasons.push('Planet is too large (likely gas giant)');
      }
      if (temp > 500) {
        reasons.push('Temperature is too high');
      }
      if (temp < 200) {
        reasons.push('Temperature is too low');
      }
    }

    return reasons;
  }

  /**
   * Categorize planet size
   */
  categorizePlanetSize(planet) {
    const radius = parseFloat(planet.pl_rade) || 1;
    
    if (radius < 1.25) return 'Earth-size';
    if (radius < 2.0) return 'Super-Earth';
    if (radius < 4.0) return 'Mini-Neptune';
    if (radius < 10.0) return 'Neptune-size';
    return 'Jupiter-size or larger';
  }

  /**
   * Categorize planet mass
   */
  categorizePlanetMass(planet) {
    const mass = parseFloat(planet.pl_masse) || parseFloat(planet.pl_bmasse) || 1;
    
    if (mass < 2.0) return 'Earth-mass';
    if (mass < 10.0) return 'Super-Earth mass';
    if (mass < 50.0) return 'Neptune-mass';
    if (mass < 500.0) return 'Jupiter-mass';
    return 'Super-Jupiter mass';
  }

  /**
   * Rule-based habitability classification
   */
  classifyHabitability(score) {
    if (score >= 75) return 'habitable';
    if (score >= 50) return 'potentially_habitable';
    return 'not_habitable';
  }

  /**
   * Generate probability distribution for predictions
   */
  generateProbabilities(prediction, confidence) {
    const base = (1 - confidence) / 2;
    const probabilities = {
      habitable: base,
      potentially_habitable: base,
      not_habitable: base
    };
    probabilities[prediction] = confidence;
    return probabilities;
  }

  /**
   * Rule-based planet type classification
   */
  classifyPlanetType(planet) {
    const radius = parseFloat(planet.pl_rade) || parseFloat(planet.koi_prad) || 1;
    const mass = parseFloat(planet.pl_masse) || parseFloat(planet.pl_bmasse) || parseFloat(planet.koi_pmass) || 1;
    
    let type, confidence;
    
    if (radius < 1.25) {
      type = 'Rocky';
      confidence = 0.8 + (1.25 - radius) * 0.15;
    } else if (radius < 2.0) {
      type = 'Super-Earth';
      confidence = 0.75 + Math.abs(1.6 - radius) * 0.1;
    } else if (radius < 4.0) {
      type = 'Neptune-like';
      confidence = 0.7 + Math.abs(3.0 - radius) * 0.1;
    } else {
      type = 'Gas Giant';
      confidence = 0.8 + Math.min(0.15, (radius - 4) * 0.05);
    }

    // Adjust confidence based on mass if available
    if (mass > 0.1) {
      const massRadius = Math.pow(mass, 1/3); // Rough mass-radius relationship
      const consistency = 1 - Math.abs(radius - massRadius) / Math.max(radius, massRadius);
      confidence *= (0.7 + consistency * 0.3);
    }

    return {
      type,
      confidence,
      probabilities: {
        rocky: type === 'Rocky' ? confidence : (1 - confidence) / 3,
        super_earth: type === 'Super-Earth' ? confidence : (1 - confidence) / 3,
        neptune_like: type === 'Neptune-like' ? confidence : (1 - confidence) / 3,
        gas_giant: type === 'Gas Giant' ? confidence : (1 - confidence) / 3
      }
    };
  }

  /**
   * Rule-based detection validation
   */
  validateDetection(planet) {
    let status, confidence, reasoning = [];
    
    // Check disposition from data
    const disposition = (planet.disposition || planet.koi_disposition || planet.tfopwg_disp || '').toLowerCase();
    
    if (disposition.includes('confirmed')) {
      status = 'CONFIRMED';
      confidence = 0.95;
      reasoning.push('Object has confirmed disposition in dataset');
    } else if (disposition.includes('candidate')) {
      status = 'CANDIDATE';
      confidence = 0.7;
      reasoning.push('Object has candidate disposition in dataset');
    } else if (disposition.includes('false')) {
      status = 'FALSE_POSITIVE';
      confidence = 0.9;
      reasoning.push('Object has false positive disposition in dataset');
    } else {
      // Use other indicators
      const koiScore = parseFloat(planet.koi_score) || 0.5;
      const period = parseFloat(planet.pl_orbper || planet.koi_period) || 0;
      const radius = parseFloat(planet.pl_rade || planet.koi_prad) || 0;
      
      if (koiScore > 0.8 && period > 0.1 && radius > 0.1) {
        status = 'CANDIDATE';
        confidence = koiScore * 0.8;
        reasoning.push(`High KOI score (${koiScore.toFixed(2)}) with valid parameters`);
      } else if (koiScore < 0.3) {
        status = 'FALSE_POSITIVE';
        confidence = 0.7;
        reasoning.push(`Low KOI score (${koiScore.toFixed(2)}) indicates likely false positive`);
      } else {
        status = 'CANDIDATE';
        confidence = 0.5;
        reasoning.push('Moderate evidence for planetary nature');
      }
    }

    return { status, confidence, reasoning };
  }

  /**
   * Extract feature values for display
   */
  extractFeatureValues(planet, modelType) {
    const features = {};
    const requiredFeatures = this.features[modelType];
    
    for (const feature of requiredFeatures) {
      let value = planet[feature];
      if (value === null || value === undefined || value === '' || isNaN(value)) {
        value = this.getDefaultValue(feature);
      }
      features[feature] = parseFloat(value) || value;
    }
    
    return features;
  }

  /**
   * Get default values for missing features
   */
  getDefaultValue(feature) {
    const defaults = {
      // Planet physical properties
      pl_rade: 1.0,     // Earth radii
      pl_masse: 1.0,    // Earth masses
      pl_bmasse: 1.0,   // Earth masses (bulk mass)
      pl_dens: 5.5,     // g/cm³
      
      // Orbital properties
      pl_orbper: 365.25, // Days
      pl_orbsmax: 1.0,   // AU
      pl_eqt: 288,       // Kelvin
      
      // Stellar properties
      st_teff: 5778,     // Kelvin (Sun-like)
      st_rad: 1.0,       // Solar radii
      st_mass: 1.0,      // Solar masses
      
      // Kepler-specific features
      koi_score: 0.5,    // KOI disposition score
      koi_period: 365.25, // Orbital period (days)
      koi_prad: 1.0,     // Planet radius (Earth radii)
      koi_dor: 10.0,     // Duration/Period ratio
      
      // TESS-specific features
      toi_period: 365.25, // Orbital period (days)
      toi_prad: 1.0,      // Planet radius (Earth radii)
      toi_depth: 0.001,   // Transit depth
      toi_dur: 3.0        // Transit duration (hours)
    };

    return defaults[feature] || 1.0;
  }

  /**
   * Calculate habitability score based on known factors
   */
  calculateHabitabilityScore(planet) {
    let score = 0;
    let factors = 0;

    // Planet size factor
    const radius = parseFloat(planet.pl_rade) || 1;
    if (radius >= 0.5 && radius <= 2.0) {
      score += 25; // Optimal size range
    } else if (radius >= 0.3 && radius <= 3.0) {
      score += 15; // Acceptable range
    }
    factors++;

    // Orbital distance factor
    const orbitalDistance = parseFloat(planet.pl_orbsmax) || 1;
    if (orbitalDistance >= 0.5 && orbitalDistance <= 2.0) {
      score += 25; // Habitable zone
    } else if (orbitalDistance >= 0.2 && orbitalDistance <= 5.0) {
      score += 10; // Extended habitable zone
    }
    factors++;

    // Temperature factor
    const temperature = parseFloat(planet.pl_eqt) || 288;
    if (temperature >= 273 && temperature <= 373) {
      score += 25; // Liquid water range
    } else if (temperature >= 200 && temperature <= 500) {
      score += 15; // Extended range
    }
    factors++;

    // Stellar temperature factor
    const stellarTemp = parseFloat(planet.st_teff) || 5778;
    if (stellarTemp >= 4000 && stellarTemp <= 7000) {
      score += 25; // Sun-like stars
    } else if (stellarTemp >= 3000 && stellarTemp <= 8000) {
      score += 15; // Acceptable range
    }
    factors++;

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Generate reasoning for habitability prediction
   */
  generateHabitabilityReasoning(planet, result) {
    const reasons = [];
    
    const radius = parseFloat(planet.pl_rade) || 1;
    const temp = parseFloat(planet.pl_eqt) || 288;
    const orbitalDistance = parseFloat(planet.pl_orbsmax) || 1;

    if (result.prediction === 'habitable') {
      if (radius >= 0.5 && radius <= 2.0) {
        reasons.push('Planet size is in the optimal range for habitability');
      }
      if (temp >= 273 && temp <= 373) {
        reasons.push('Temperature allows for liquid water');
      }
      if (orbitalDistance >= 0.5 && orbitalDistance <= 2.0) {
        reasons.push('Located in the habitable zone');
      }
    } else if (result.prediction === 'potentially_habitable') {
      reasons.push('Some conditions favor habitability but uncertainties remain');
      if (radius < 0.5 || radius > 2.0) {
        reasons.push('Planet size is outside optimal range');
      }
      if (temp < 273 || temp > 373) {
        reasons.push('Temperature may not support liquid water');
      }
    } else {
      reasons.push('Conditions are not favorable for habitability');
      if (radius > 5) {
        reasons.push('Planet is too large (likely gas giant)');
      }
      if (temp > 500) {
        reasons.push('Temperature is too high');
      }
      if (temp < 200) {
        reasons.push('Temperature is too low');
      }
    }

    return reasons;
  }

  /**
   * Categorize planet size
   */
  categorizePlanetSize(planet) {
    const radius = parseFloat(planet.pl_rade) || 1;
    
    if (radius < 1.25) return 'Earth-size';
    if (radius < 2.0) return 'Super-Earth';
    if (radius < 4.0) return 'Mini-Neptune';
    if (radius < 10.0) return 'Neptune-size';
    return 'Jupiter-size or larger';
  }

  /**
   * Categorize planet mass
   */
  categorizePlanetMass(planet) {
    const mass = parseFloat(planet.pl_masse) || parseFloat(planet.pl_bmasse) || 1;
    
    if (mass < 2.0) return 'Earth-mass';
    if (mass < 10.0) return 'Super-Earth mass';
    if (mass < 50.0) return 'Neptune-mass';
    if (mass < 500.0) return 'Jupiter-mass';
    return 'Super-Jupiter mass';
  }
}

export default MLService;