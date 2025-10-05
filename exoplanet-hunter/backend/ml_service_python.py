#!/usr/bin/env python3
"""
Exoplanet ML Service - Python Flask API
Serves the trained Gradient Boosting model with comprehensive prediction service
Implements Prompt 13: Complete prediction service with JSON responses, error handling, logging, and prediction saving
"""

import os
import sys
import logging
import traceback
import time
import uuid
from pathlib import Path
import pickle
import json
import pandas as pd
import numpy as np
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from sklearn.preprocessing import StandardScaler

# Setup comprehensive logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ml_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ExoplanetMLService:
    """Main ML service class for exoplanet predictions implementing Prompt 13 requirements"""
    
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        
        # Model paths relative to backend directory
        self.base_path = Path(__file__).parent
        self.models_path = self.base_path.parent.parent / 'data' / 'models'
        self.predictions_path = self.base_path.parent.parent / 'data' / 'predictions'
        self.scalers_path = self.base_path.parent.parent / 'data' / 'scalers'
        
        # Ensure predictions directory exists
        self.predictions_path.mkdir(parents=True, exist_ok=True)
        
        # Model components
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.target_classes = None
        self.model_info = {}
        self.model_version = None
        self.feature_scalers = {}
        self.encoders = {}
        
        # Load model and preprocessing components
        self.load_model()
        self.load_preprocessors()
        
        # Setup routes
        self.setup_routes()
        
        logger.info("🚀 Exoplanet ML Service initialized successfully")
    
    def load_preprocessors(self):
        """Load all preprocessing components (scalers, encoders, etc.)"""
        try:
            logger.info("Loading preprocessing components...")
            
            # Load feature scaler
            scaler_file = self.scalers_path / 'feature_scaler.pkl'
            if scaler_file.exists():
                self.scaler = joblib.load(scaler_file)
                logger.info("✅ Feature scaler loaded successfully")
            
            # Load target encoder
            target_encoder_file = self.scalers_path / 'target_encoder.pkl'
            if target_encoder_file.exists():
                self.target_encoder = joblib.load(target_encoder_file)
                logger.info("✅ Target encoder loaded successfully")
            
            # Load categorical encoders
            encoder_files = [
                'dataset_source_encoder.json',
                'discovery_era_encoder.json', 
                'discovery_method_encoder.json',
                'size_category_encoder.json',
                'stellar_class_encoder.json',
                'temp_category_encoder.json'
            ]
            
            for encoder_file in encoder_files:
                encoder_path = self.scalers_path / encoder_file
                if encoder_path.exists():
                    with open(encoder_path, 'r') as f:
                        encoder_name = encoder_file.replace('_encoder.json', '')
                        self.encoders[encoder_name] = json.load(f)
                        logger.info(f"✅ {encoder_name} encoder loaded")
            
            # Load feature info
            feature_info_file = self.scalers_path / 'feature_info.json'
            if feature_info_file.exists():
                with open(feature_info_file, 'r') as f:
                    feature_info = json.load(f)
                    self.target_classes = feature_info.get('target_classes', ['CANDIDATE', 'CONFIRMED', 'FALSE_POSITIVE', 'UNKNOWN'])
                    logger.info(f"✅ Feature info loaded with {len(self.target_classes)} target classes")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error loading preprocessors: {str(e)}")
            return False
    
    def load_model(self):
        """Load the trained model and preprocessing components"""
        try:
            logger.info(f"Loading model from: {self.models_path}")
            
            # Load the trained Gradient Boosting model
            model_file = self.models_path / 'best_model_gradient_boosting.pkl'
            if model_file.exists():
                self.model = joblib.load(model_file)
                logger.info("✅ Gradient Boosting model loaded successfully")
            else:
                logger.error(f"❌ Model file not found: {model_file}")
                return False
            
            # Load model metadata
            metadata_file = self.models_path / 'model_metadata.json'
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    self.model_info = json.load(f)
                    self.feature_names = self.model_info.get('feature_names', [])
                    self.model_version = self.model_info.get('training_timestamp', 'unknown')
                    logger.info("✅ Model metadata loaded")
                    logger.info(f"📊 Model performance - Accuracy: {self.model_info.get('performance_metrics', {}).get('Val Accuracy', 'N/A')}")
                    logger.info(f"🎯 Features: {len(self.feature_names)} features loaded")
            else:
                logger.error(f"❌ Model metadata not found: {metadata_file}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error loading model: {str(e)}")
            logger.error(traceback.format_exc())
            return False
    
    def preprocess_features(self, data):
        """Preprocess input features for prediction with comprehensive feature engineering"""
        try:
            # Convert to DataFrame if it's a dict
            if isinstance(data, dict):
                df = pd.DataFrame([data])
            else:
                df = pd.DataFrame(data)
            
            # Create a copy to avoid modifying original data
            processed_df = df.copy()
            
            # Map common input field names to model feature names
            field_mapping = {
                # Planet properties
                'pl_rade': 'planet_radius',
                'pl_masse': 'planet_mass', 
                'pl_orbper': 'orbital_period',
                'pl_orbsmax': 'semi_major_axis',
                'pl_eqt': 'equilibrium_temp',
                'pl_dens': 'planet_density',
                
                # Stellar properties
                'st_teff': 'stellar_temp',
                'st_rad': 'stellar_radius', 
                'st_mass': 'stellar_mass',
                
                # Transit properties
                'koi_period': 'orbital_period',
                'koi_prad': 'planet_radius',
                'koi_score': 'disposition_score',
                'koi_dor': 'transit_duration_ratio',
                
                # TESS properties
                'toi_period': 'orbital_period',
                'toi_prad': 'planet_radius',
                'toi_depth': 'transit_depth',
                'toi_dur': 'transit_duration'
            }
            
            # Apply field mapping
            for old_name, new_name in field_mapping.items():
                if old_name in processed_df.columns:
                    processed_df[new_name] = processed_df[old_name]
            
            # Ensure all required features are present with defaults
            for feature in self.feature_names:
                if feature not in processed_df.columns:
                    processed_df[feature] = self.get_default_value(feature)
            
            # Calculate derived features
            self._calculate_derived_features(processed_df)
            
            # Select only the required features in the correct order
            features_df = processed_df[self.feature_names].copy()
            
            # Handle missing values
            for col in features_df.columns:
                if features_df[col].isna().any():
                    features_df[col] = features_df[col].fillna(self.get_default_value(col))
            
            # Apply categorical encoding
            features_df = self._apply_categorical_encoding(features_df)
            
            # Scale features if scaler is available
            if self.scaler is not None:
                try:
                    features_scaled = self.scaler.transform(features_df)
                    return features_scaled
                except Exception as e:
                    logger.warning(f"Scaling failed, using raw features: {e}")
                    return features_df.values
            
            return features_df.values
            
        except Exception as e:
            logger.error(f"Error in preprocessing: {str(e)}")
            raise
    
    def _calculate_derived_features(self, df):
        """Calculate derived features from basic inputs"""
        try:
            # Calculate insolation flux if not provided
            if 'insolation_flux' not in df.columns or df['insolation_flux'].isna().any():
                if 'stellar_temp' in df.columns and 'semi_major_axis' in df.columns:
                    # Simplified insolation flux calculation
                    stellar_temp = df['stellar_temp'].fillna(5778)
                    semi_major_axis = df['semi_major_axis'].fillna(1.0)
                    df['insolation_flux'] = (stellar_temp / 5778) ** 4 / (semi_major_axis ** 2)
                else:
                    df['insolation_flux'] = 1.0
            
            # Calculate insolation ratio
            if 'insolation_ratio' not in df.columns:
                df['insolation_ratio'] = df.get('insolation_flux', 1.0) / 1.0  # Ratio to Earth
            
            # Calculate habitable zone flag
            if 'in_habitable_zone' not in df.columns:
                insolation = df.get('insolation_flux', 1.0)
                df['in_habitable_zone'] = ((insolation >= 0.3) & (insolation <= 2.0)).astype(int)
            
            # Calculate transit SNR if not provided
            if 'transit_snr_calculated' not in df.columns:
                transit_depth = df.get('transit_depth', 0.001)
                df['transit_snr_calculated'] = df.get('transit_snr', 10.0) * np.sqrt(transit_depth * 1000)
            
            # Set current year if discovery_year not provided
            if 'discovery_year' not in df.columns or df['discovery_year'].isna().any():
                df['discovery_year'] = df['discovery_year'].fillna(2024)
                
        except Exception as e:
            logger.warning(f"Error calculating derived features: {e}")
    
    def _apply_categorical_encoding(self, df):
        """Apply categorical encoding using saved encoders"""
        try:
            # Apply one-hot encoding for categorical features
            categorical_features = [
                'discovery_method_Transit',
                'dataset_source_KEPLER', 'dataset_source_TESS',
                'size_category_Super-Earth', 'size_category_Mini-Neptune',
                'size_category_Neptune-size', 'size_category_Jupiter-size',
                'stellar_class_K-dwarf', 'stellar_class_G-dwarf',
                'stellar_class_F-dwarf', 'stellar_class_Hot-star',
                'discovery_era_Kepler-Era', 'discovery_era_K2-Era', 'discovery_era_TESS-Era',
                'temp_category_Cold', 'temp_category_Temperate', 
                'temp_category_Hot', 'temp_category_Very-Hot'
            ]
            
            # Set default values for categorical features (mostly 0, some 1 for defaults)
            for feature in categorical_features:
                if feature not in df.columns:
                    if feature in ['discovery_method_Transit', 'dataset_source_TESS', 'discovery_era_TESS-Era']:
                        df[feature] = 1  # Default assumptions
                    else:
                        df[feature] = 0
            
            return df
            
        except Exception as e:
            logger.warning(f"Error in categorical encoding: {e}")
            return df
    
    def get_default_value(self, feature):
        """Get default values for missing features"""
        defaults = {
            # Core prediction features
            'disposition_score': 0.5,
            'dataset_source_TESS': 0,
            'dataset_source_KEPLER': 0,
            'distance': 100.0,  # parsecs
            'discovery_year': 2020,
            'transit_snr': 10.0,
            'planet_radius': 1.0,  # Earth radii
            'stellar_mass': 1.0,   # Solar masses
            'transit_snr_calculated': 10.0,
            'orbital_period': 365.25,  # days
            'insolation_flux': 1.0,    # Earth flux
            'equilibrium_temp': 288,   # Kelvin
            'stellar_temp': 5778,      # Kelvin
            'transit_duration': 3.0,   # hours
            'stellar_radius': 1.0,     # Solar radii
            'transit_depth': 0.001,    # fraction
            'insolation_ratio': 1.0,
            'size_category_Neptune-size': 0,
            'stellar_class_G-dwarf': 0,
            'discovery_era_TESS-Era': 0,
            'semi_major_axis': 1.0,    # AU
            'stellar_class_K-dwarf': 0,
            'size_category_Jupiter-size': 0,
            'discovery_era_K2-Era': 0,
            'size_category_Mini-Neptune': 0,
            'temp_category_Hot': 0,
            'size_category_Super-Earth': 0,
            'stellar_class_F-dwarf': 0,
            'planet_mass': 1.0,        # Earth masses
            'temp_category_Temperate': 0,
            'temp_category_Cold': 0,
            'stellar_class_Hot-star': 0,
            'temp_category_Very-Hot': 0,
            'discovery_era_Kepler-Era': 0,
            'discovery_method_Transit': 1,
            'in_habitable_zone': 0,
            
            # Legacy features for backward compatibility
            'pl_rade': 1.0,     # Earth radii
            'pl_masse': 1.0,    # Earth masses
            'pl_bmasse': 1.0,   # Earth masses (bulk mass)
            'pl_dens': 5.5,     # g/cm³
            'pl_orbper': 365.25, # Days
            'pl_orbsmax': 1.0,   # AU
            'pl_eqt': 288,       # Kelvin
            'st_teff': 5778,     # Kelvin (Sun-like)
            'st_rad': 1.0,       # Solar radii
            'st_mass': 1.0,      # Solar masses
            'koi_score': 0.5,    # KOI disposition score
            'koi_period': 365.25, # Orbital period (days)
            'koi_prad': 1.0,     # Planet radius (Earth radii)
            'koi_dor': 10.0,     # Duration/Period ratio
            'toi_period': 365.25, # Orbital period (days)
            'toi_prad': 1.0,      # Planet radius (Earth radii)
            'toi_depth': 0.001,   # Transit depth
            'toi_dur': 3.0        # Transit duration (hours)
        }
        
        return defaults.get(feature, 0.0)
    
    def predict_single(self, planet_data, save_prediction=True):
        """Make prediction for a single planet with comprehensive response"""
        start_time = time.time()
        prediction_id = str(uuid.uuid4())
        
        try:
            logger.info(f"🔮 Starting prediction for ID: {prediction_id}")
            
            # Preprocess the data
            features = self.preprocess_features(planet_data)
            
            # Make prediction
            prediction = self.model.predict(features)[0]
            probabilities = self.model.predict_proba(features)[0]
            
            # Convert numeric prediction to class label
            if hasattr(self, 'target_classes') and self.target_classes:
                predicted_class = self.target_classes[prediction]
            else:
                # Fallback class mapping
                class_map = {0: 'CANDIDATE', 1: 'CONFIRMED', 2: 'FALSE_POSITIVE', 3: 'UNKNOWN'}
                predicted_class = class_map.get(prediction, 'UNKNOWN')
            
            # Get confidence score
            confidence = float(probabilities[prediction])
            
            # Create probability distribution
            if hasattr(self, 'target_classes') and self.target_classes:
                prob_dict = {
                    self.target_classes[i]: float(probabilities[i])
                    for i in range(len(self.target_classes))
                }
            else:
                prob_dict = {
                    'CANDIDATE': float(probabilities[0]) if len(probabilities) > 0 else 0.0,
                    'CONFIRMED': float(probabilities[1]) if len(probabilities) > 1 else 0.0,
                    'FALSE_POSITIVE': float(probabilities[2]) if len(probabilities) > 2 else 0.0,
                    'UNKNOWN': float(probabilities[3]) if len(probabilities) > 3 else 0.0
                }
            
            processing_time = time.time() - start_time
            
            # Create comprehensive result as per Prompt 13
            result = {
                'prediction_id': prediction_id,
                'predictions': [predicted_class],  # Class labels as requested
                'confidence': [confidence],        # Probability scores as requested
                'probabilities': prob_dict,        # Full probability distribution
                'metadata': {                      # Processing metadata as requested
                    'processing_time': round(processing_time, 4),
                    'model_version': self.model_version,
                    'model_type': self.model_info.get('model_type', 'GradientBoostingClassifier'),
                    'features_used': len(self.feature_names),
                    'timestamp': datetime.now().isoformat(),
                    'prediction_id': prediction_id
                },
                'input_features': {
                    'provided': list(planet_data.keys()),
                    'processed': self.feature_names,
                    'feature_count': len(self.feature_names)
                }
            }
            
            # Save prediction to data folder as requested in Prompt 13
            if save_prediction:
                self.save_prediction(result, planet_data)
            
            logger.info(f"✅ Prediction completed for ID: {prediction_id} - Result: {predicted_class} (confidence: {confidence:.3f})")
            
            return result
            
        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = f"Prediction error for ID {prediction_id}: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            
            # Return error response with same structure
            error_result = {
                'prediction_id': prediction_id,
                'predictions': ['ERROR'],
                'confidence': [0.0],
                'probabilities': {'ERROR': 1.0},
                'metadata': {
                    'processing_time': round(processing_time, 4),
                    'model_version': self.model_version,
                    'error': error_msg,
                    'timestamp': datetime.now().isoformat(),
                    'prediction_id': prediction_id
                },
                'error': True
            }
            
            if save_prediction:
                self.save_prediction(error_result, planet_data)
            
            raise Exception(error_msg)
    
    def save_prediction(self, prediction_result, input_data):
        """Save prediction results to the data/predictions folder"""
        try:
            prediction_id = prediction_result.get('prediction_id', str(uuid.uuid4()))
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Create comprehensive prediction record
            prediction_record = {
                'prediction_id': prediction_id,
                'timestamp': datetime.now().isoformat(),
                'input_data': input_data,
                'prediction_result': prediction_result,
                'model_info': {
                    'model_type': self.model_info.get('model_type'),
                    'model_version': self.model_version,
                    'feature_count': len(self.feature_names)
                }
            }
            
            # Save individual prediction file
            prediction_file = self.predictions_path / f"prediction_{timestamp}_{prediction_id[:8]}.json"
            with open(prediction_file, 'w') as f:
                json.dump(prediction_record, f, indent=2)
            
            # Also append to daily log file
            daily_log_file = self.predictions_path / f"predictions_log_{datetime.now().strftime('%Y%m%d')}.json"
            
            # Read existing log or create new one
            daily_predictions = []
            if daily_log_file.exists():
                try:
                    with open(daily_log_file, 'r') as f:
                        daily_predictions = json.load(f)
                except:
                    daily_predictions = []
            
            # Append new prediction
            daily_predictions.append(prediction_record)
            
            # Save updated daily log
            with open(daily_log_file, 'w') as f:
                json.dump(daily_predictions, f, indent=2)
            
            logger.info(f"💾 Prediction saved: {prediction_file.name}")
            
        except Exception as e:
            logger.error(f"❌ Error saving prediction: {str(e)}")
            # Don't raise exception here to avoid breaking the main prediction flow
    
    def predict_batch(self, planets_data, save_predictions=True):
        """Make predictions for multiple planets with comprehensive logging"""
        batch_start_time = time.time()
        batch_id = str(uuid.uuid4())
        
        try:
            logger.info(f"🔮 Starting batch prediction for {len(planets_data)} planets - Batch ID: {batch_id}")
            
            results = []
            successful_predictions = 0
            failed_predictions = 0
            
            for i, planet_data in enumerate(planets_data):
                try:
                    result = self.predict_single(planet_data, save_prediction=save_predictions)
                    result['batch_id'] = batch_id
                    result['planet_index'] = i
                    results.append(result)
                    successful_predictions += 1
                    
                except Exception as e:
                    logger.error(f"❌ Error predicting planet {i} in batch {batch_id}: {str(e)}")
                    failed_predictions += 1
                    
                    # Add error result maintaining structure
                    error_result = {
                        'prediction_id': str(uuid.uuid4()),
                        'batch_id': batch_id,
                        'planet_index': i,
                        'predictions': ['ERROR'],
                        'confidence': [0.0],
                        'probabilities': {'ERROR': 1.0},
                        'metadata': {
                            'processing_time': 0.0,
                            'model_version': self.model_version,
                            'error': str(e),
                            'timestamp': datetime.now().isoformat()
                        },
                        'error': True
                    }
                    results.append(error_result)
            
            batch_processing_time = time.time() - batch_start_time
            
            # Create batch summary
            batch_summary = {
                'batch_id': batch_id,
                'total_predictions': len(planets_data),
                'successful_predictions': successful_predictions,
                'failed_predictions': failed_predictions,
                'batch_processing_time': round(batch_processing_time, 4),
                'timestamp': datetime.now().isoformat(),
                'model_version': self.model_version
            }
            
            logger.info(f"✅ Batch prediction completed - ID: {batch_id}, Success: {successful_predictions}, Errors: {failed_predictions}")
            
            return {
                'predictions': results,
                'batch_summary': batch_summary
            }
            
        except Exception as e:
            batch_processing_time = time.time() - batch_start_time
            error_msg = f"Batch prediction error for batch {batch_id}: {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            raise Exception(error_msg)
    
    def validate_input_data(self, data):
        """Validate input data structure and content"""
        try:
            if not isinstance(data, dict):
                return False, "Input must be a dictionary"
            
            if not data:
                return False, "Input dictionary cannot be empty"
            
            # Check for required minimum features (at least some basic planet properties)
            basic_features = ['planet_radius', 'orbital_period', 'stellar_temp', 'discovery_year']
            has_basic = any(feature in data for feature in basic_features)
            
            if not has_basic:
                return False, f"Input must contain at least one of: {basic_features}"
            
            # Validate numeric values
            for key, value in data.items():
                if value is not None:
                    try:
                        float(value)
                    except (ValueError, TypeError):
                        if key not in ['discovery_method', 'dataset_source', 'size_category', 'stellar_class', 'discovery_era', 'temp_category']:
                            return False, f"Value for '{key}' must be numeric, got: {type(value).__name__}"
            
            return True, "Valid input"
            
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    def setup_routes(self):
        """Setup Flask routes with comprehensive error handling and logging"""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            """Health check endpoint with detailed status"""
            try:
                health_status = {
                    'status': 'healthy',
                    'model_loaded': self.model is not None,
                    'model_version': self.model_version,
                    'features_available': len(self.feature_names) if self.feature_names else 0,
                    'target_classes': len(self.target_classes) if hasattr(self, 'target_classes') else 0,
                    'preprocessors_loaded': bool(self.scaler),
                    'timestamp': datetime.now().isoformat(),
                    'service': 'Exoplanet ML Prediction Service',
                    'version': '1.0.0'
                }
                
                logger.info("Health check performed")
                return jsonify(health_status)
                
            except Exception as e:
                logger.error(f"Health check error: {str(e)}")
                return jsonify({
                    'status': 'error',
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                }), 500
        
        @self.app.route('/model/info', methods=['GET'])
        def model_info():
            """Get comprehensive model information"""
            try:
                model_details = {
                    'model_info': self.model_info,
                    'feature_names': self.feature_names,
                    'target_classes': getattr(self, 'target_classes', []),
                    'features_count': len(self.feature_names),
                    'model_loaded': self.model is not None,
                    'model_version': self.model_version,
                    'preprocessing_info': {
                        'scaler_available': self.scaler is not None,
                        'encoders_loaded': len(self.encoders),
                        'available_encoders': list(self.encoders.keys())
                    },
                    'predictions_saved_to': str(self.predictions_path),
                    'service_capabilities': {
                        'single_prediction': True,
                        'batch_prediction': True,
                        'prediction_saving': True,
                        'comprehensive_logging': True,
                        'error_handling': True
                    }
                }
                
                logger.info("Model info requested")
                return jsonify(model_details)
                
            except Exception as e:
                logger.error(f"Model info error: {str(e)}")
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/predict', methods=['POST'])
        def predict():
            """Single prediction endpoint with comprehensive response and error handling"""
            try:
                # Get request data
                data = request.get_json()
                if not data:
                    logger.warning("Prediction request with no data")
                    return jsonify({
                        'error': 'No data provided',
                        'message': 'Request body must contain JSON data',
                        'timestamp': datetime.now().isoformat()
                    }), 400
                
                # Validate input
                is_valid, validation_message = self.validate_input_data(data)
                if not is_valid:
                    logger.warning(f"Invalid input data: {validation_message}")
                    return jsonify({
                        'error': 'Invalid input data',
                        'message': validation_message,
                        'timestamp': datetime.now().isoformat()
                    }), 400
                
                # Check if model is loaded
                if self.model is None:
                    logger.error("Prediction requested but model not loaded")
                    return jsonify({
                        'error': 'Model not loaded',
                        'message': 'ML model is not available for predictions',
                        'timestamp': datetime.now().isoformat()
                    }), 500
                
                # Make prediction
                result = self.predict_single(data, save_prediction=True)
                
                logger.info(f"Single prediction successful - ID: {result.get('prediction_id')}")
                return jsonify(result)
                
            except Exception as e:
                error_msg = f"Prediction endpoint error: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                
                return jsonify({
                    'error': 'Prediction failed',
                    'message': str(e),
                    'timestamp': datetime.now().isoformat(),
                    'predictions': ['ERROR'],
                    'confidence': [0.0],
                    'metadata': {
                        'processing_time': 0.0,
                        'model_version': self.model_version,
                        'error': True
                    }
                }), 500
        
        @self.app.route('/predict/batch', methods=['POST'])
        def predict_batch():
            """Batch prediction endpoint with comprehensive response and error handling"""
            try:
                data = request.get_json()
                if not data or 'planets' not in data:
                    logger.warning("Batch prediction request with invalid data structure")
                    return jsonify({
                        'error': 'No planets data provided',
                        'message': 'Request body must contain "planets" array',
                        'expected_format': {'planets': [{'planet_data': 'here'}]},
                        'timestamp': datetime.now().isoformat()
                    }), 400
                
                planets_data = data['planets']
                if not isinstance(planets_data, list) or len(planets_data) == 0:
                    logger.warning("Batch prediction request with empty or invalid planets array")
                    return jsonify({
                        'error': 'Invalid planets data',
                        'message': 'planets must be a non-empty array',
                        'timestamp': datetime.now().isoformat()
                    }), 400
                
                # Limit batch size for performance
                max_batch_size = 100
                if len(planets_data) > max_batch_size:
                    logger.warning(f"Batch size {len(planets_data)} exceeds maximum {max_batch_size}")
                    return jsonify({
                        'error': 'Batch size too large',
                        'message': f'Maximum batch size is {max_batch_size}, got {len(planets_data)}',
                        'timestamp': datetime.now().isoformat()
                    }), 400
                
                # Check if model is loaded
                if self.model is None:
                    logger.error("Batch prediction requested but model not loaded")
                    return jsonify({
                        'error': 'Model not loaded',
                        'message': 'ML model is not available for predictions',
                        'timestamp': datetime.now().isoformat()
                    }), 500
                
                # Make batch predictions
                result = self.predict_batch(planets_data, save_predictions=True)
                
                logger.info(f"Batch prediction successful - Batch ID: {result['batch_summary']['batch_id']}")
                return jsonify(result)
                
            except Exception as e:
                error_msg = f"Batch prediction endpoint error: {str(e)}"
                logger.error(error_msg)
                logger.error(traceback.format_exc())
                
                return jsonify({
                    'error': 'Batch prediction failed',
                    'message': str(e),
                    'timestamp': datetime.now().isoformat(),
                    'predictions': [],
                    'batch_summary': {
                        'total_predictions': 0,
                        'successful_predictions': 0,
                        'failed_predictions': 0,
                        'error': True
                    }
                }), 500
        
        @self.app.route('/predictions/history', methods=['GET'])
        def get_predictions_history():
            """Get prediction history from saved files"""
            try:
                # Get query parameters
                limit = request.args.get('limit', 50, type=int)
                date_filter = request.args.get('date')  # YYYY-MM-DD format
                
                predictions = []
                
                if date_filter:
                    # Get specific date predictions
                    daily_log_file = self.predictions_path / f"predictions_log_{date_filter.replace('-', '')}.json"
                    if daily_log_file.exists():
                        with open(daily_log_file, 'r') as f:
                            predictions = json.load(f)
                else:
                    # Get recent predictions from all daily logs
                    log_files = sorted(self.predictions_path.glob("predictions_log_*.json"), reverse=True)
                    
                    for log_file in log_files:
                        try:
                            with open(log_file, 'r') as f:
                                daily_predictions = json.load(f)
                                predictions.extend(daily_predictions)
                                
                                if len(predictions) >= limit:
                                    break
                        except Exception as e:
                            logger.warning(f"Error reading log file {log_file}: {e}")
                            continue
                
                # Limit results
                predictions = predictions[:limit]
                
                return jsonify({
                    'predictions': predictions,
                    'count': len(predictions),
                    'limit': limit,
                    'date_filter': date_filter,
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                logger.error(f"Predictions history error: {str(e)}")
                return jsonify({'error': str(e)}), 500
    
    def run(self, host='127.0.0.1', port=5001, debug=False):
        """Run the Flask application"""
        logger.info(f"🚀 Starting Exoplanet ML Service on {host}:{port}")
        self.app.run(host=host, port=port, debug=debug)

# Main execution
if __name__ == '__main__':
    try:
        logger.info("=" * 60)
        logger.info("🚀 STARTING EXOPLANET ML PREDICTION SERVICE")
        logger.info("=" * 60)
        logger.info("📋 Prompt 13 Implementation:")
        logger.info("   ✅ Load trained model")
        logger.info("   ✅ Return JSON response with predictions, confidence, metadata") 
        logger.info("   ✅ Error handling for invalid inputs")
        logger.info("   ✅ Comprehensive logging for debugging")
        logger.info("   ✅ Save predictions in Data folder")
        logger.info("=" * 60)
        
        # Create and initialize the service
        service = ExoplanetMLService()
        
        # Check if model loaded successfully
        if service.model is None:
            logger.error("❌ CRITICAL: Failed to load model. Service cannot start.")
            logger.error("   Please ensure model files are available in data/models/")
            sys.exit(1)
        
        # Log successful initialization
        logger.info("✅ Service initialization completed successfully!")
        logger.info(f"📊 Model: {service.model_info.get('model_type', 'Unknown')}")
        logger.info(f"🎯 Features: {len(service.feature_names)} features loaded")
        logger.info(f"📁 Predictions will be saved to: {service.predictions_path}")
        logger.info(f"🔧 Model version: {service.model_version}")
        
        # Performance metrics
        if 'performance_metrics' in service.model_info:
            metrics = service.model_info['performance_metrics']
            logger.info(f"📈 Model Performance:")
            logger.info(f"   - Validation Accuracy: {metrics.get('Val Accuracy', 'N/A'):.3f}")
            logger.info(f"   - ROC AUC: {metrics.get('ROC AUC', 'N/A'):.3f}")
            logger.info(f"   - F1 Score: {metrics.get('F1 Score', 'N/A'):.3f}")
        
        logger.info("=" * 60)
        logger.info("🌟 EXOPLANET ML SERVICE READY FOR PREDICTIONS!")
        logger.info("📡 API Endpoints available:")
        logger.info("   - GET  /health              - Service health check")
        logger.info("   - GET  /model/info          - Model information")
        logger.info("   - POST /predict             - Single prediction")
        logger.info("   - POST /predict/batch       - Batch predictions")
        logger.info("   - GET  /predictions/history - Prediction history")
        logger.info("=" * 60)
        
        # Run the service
        service.run(host='127.0.0.1', port=5001, debug=False)
        
    except Exception as e:
        logger.error("=" * 60)
        logger.error("❌ CRITICAL ERROR: Failed to start service")
        logger.error(f"Error: {str(e)}")
        logger.error("Traceback:")
        logger.error(traceback.format_exc())
        logger.error("=" * 60)
        sys.exit(1)