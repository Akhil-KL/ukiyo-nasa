#!/usr/bin/env python3
"""
NASA Exoplanet Classification Model Inference Script
====================================================

This script demonstrates how to use the trained model for making predictions
on new exoplanet data using the saved model and scalers from Prompt 12A.

Features:
- Load trained model and preprocessors
- Make predictions on new data
- Get prediction probabilities
- Interpret results with original class names
"""

import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
import joblib

class ExoplanetPredictor:
    """
    Exoplanet classification predictor using trained models
    """
    
    def __init__(self, models_dir="data/models", scalers_dir="data/scalers"):
        self.models_dir = Path(models_dir)
        self.scalers_dir = Path(scalers_dir)
        
        # Load model and metadata
        self.load_model()
        self.load_scalers()
        
        print("🤖 Exoplanet Predictor Initialized")
        print(f"📊 Model: {self.metadata['model_name']}")
        print(f"🎯 Classes: {self.target_classes}")
    
    def load_model(self):
        """Load the trained model and metadata"""
        try:
            # Load metadata to find the best model
            with open(self.models_dir / "model_metadata.json", 'r') as f:
                self.metadata = json.load(f)
            
            # Load the model
            model_filename = f"best_model_{self.metadata['model_name'].lower().replace(' ', '_')}.pkl"
            self.model = joblib.load(self.models_dir / model_filename)
            
            self.feature_names = self.metadata['feature_names']
            self.target_classes = self.metadata['target_classes']
            
            print(f"✅ Loaded model: {self.metadata['model_name']}")
            print(f"📏 Features: {len(self.feature_names)}")
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise
    
    def load_scalers(self):
        """Load the preprocessing statistics for manual scaling"""
        try:
            # Since the feature_scaler.pkl contains processed data instead of the scaler,
            # we'll load the training data to compute scaling statistics
            train_data = pd.read_csv("data/processed/train_processed.csv")
            
            # Get the feature columns (excluding target)
            feature_cols = [col for col in train_data.columns if col not in ['target', 'disposition']]
            
            # Compute mean and std for manual scaling
            self.feature_means = train_data[feature_cols].mean()
            self.feature_stds = train_data[feature_cols].std()
            
            # Load feature info if available
            try:
                with open(self.scalers_dir / "feature_info.json", 'r') as f:
                    self.feature_info = json.load(f)
            except:
                self.feature_info = {}
            
            print(f"✅ Computed scaling statistics from training data")
            
        except Exception as e:
            print(f"❌ Error computing scaling statistics: {e}")
            raise
    
    def predict(self, X):
        """Make predictions on new data"""
        # Ensure X has the correct features
        X_processed = self.preprocess_features(X)
        
        # Make predictions
        predictions = self.model.predict(X_processed)
        probabilities = self.model.predict_proba(X_processed)
        
        return predictions, probabilities
    
    def preprocess_features(self, X):
        """Preprocess features to match training data format"""
        if isinstance(X, dict):
            X = pd.DataFrame([X])
        elif not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X)
        
        # Ensure all required features are present
        for feature in self.feature_names:
            if feature not in X.columns:
                X[feature] = 0  # Default value for missing features
        
        # Select only the features used in training
        X_processed = X[self.feature_names]
        
        # Apply manual standardization using computed statistics
        # Handle division by zero by replacing zero std with 1
        feature_stds_safe = self.feature_stds.replace(0, 1)
        X_scaled = (X_processed - self.feature_means) / feature_stds_safe
        
        # Replace any infinite or very large values
        X_scaled = X_scaled.replace([np.inf, -np.inf], 0)
        X_scaled = np.clip(X_scaled, -10, 10)  # Clip to reasonable range
        
        # Fill any NaN values with 0
        X_scaled = X_scaled.fillna(0)
        
        return X_scaled.values
    
    def interpret_prediction(self, prediction, probabilities):
        """Interpret model predictions with class names"""
        
        # Map back to original disposition names if available
        class_mapping = {
            0: "UNKNOWN",
            1: "CANDIDATE", 
            2: "CONFIRMED",
            3: "FALSE_POSITIVE"
        }
        
        predicted_class = class_mapping.get(prediction, f"Class_{prediction}")
        confidence = np.max(probabilities)
        
        # Get all class probabilities
        class_probs = {}
        for i, prob in enumerate(probabilities):
            class_name = class_mapping.get(i, f"Class_{i}")
            class_probs[class_name] = prob
        
        return {
            'predicted_class': predicted_class,
            'confidence': confidence,
            'all_probabilities': class_probs
        }
    
    def predict_single(self, exoplanet_data):
        """Make a prediction for a single exoplanet"""
        predictions, probabilities = self.predict(exoplanet_data)
        
        result = self.interpret_prediction(predictions[0], probabilities[0])
        
        return result

def demo_prediction():
    """Demonstrate model prediction with sample data"""
    print("\n🧪 Demo: Predicting Exoplanet Classification")
    print("=" * 50)
    
    # Initialize predictor
    predictor = ExoplanetPredictor()
    
    # Sample exoplanet data (using realistic values)
    sample_exoplanet = {
        'discovery_year': 2020,
        'orbital_period': 365.25,     # Earth-like orbit
        'semi_major_axis': 1.0,       # AU
        'planet_radius': 1.1,         # Earth radii
        'planet_mass': 1.2,           # Earth masses
        'equilibrium_temp': 288,      # Kelvin
        'insolation_flux': 1.0,       # Relative to Earth
        'transit_duration': 13.0,     # Hours
        'transit_depth': 84,          # ppm
        'transit_snr': 15.0,          # Signal-to-noise ratio
        'stellar_temp': 5778,         # Kelvin (Sun-like)
        'stellar_radius': 1.0,        # Solar radii
        'stellar_mass': 1.0,          # Solar masses
        'distance': 50.0,             # Parsecs
        'disposition_score': 0.8,     # High confidence
        'transit_snr_calculated': 15.5,
        'in_habitable_zone': 1,       # Boolean
        'insolation_ratio': 1.0,      # Relative to Earth
        # One-hot encoded features (set most to 0, few to 1)
        'discovery_method_Transit': 1,
        'dataset_source_KEPLER': 0,
        'dataset_source_TESS': 1,
        'size_category_Super-Earth': 1,
        'size_category_Mini-Neptune': 0,
        'size_category_Neptune-size': 0,
        'size_category_Jupiter-size': 0,
        'stellar_class_K-dwarf': 0,
        'stellar_class_G-dwarf': 1,   # Sun-like star
        'stellar_class_F-dwarf': 0,
        'stellar_class_Hot-star': 0,
        'discovery_era_Kepler-Era': 0,
        'discovery_era_K2-Era': 0,
        'discovery_era_TESS-Era': 1,  # Discovered by TESS
        'temp_category_Cold': 0,
        'temp_category_Temperate': 1, # Earth-like temperature
        'temp_category_Hot': 0,
        'temp_category_Very-Hot': 0
    }
    
    print("📊 Sample Exoplanet Data:")
    for key, value in sample_exoplanet.items():
        print(f"   {key}: {value}")
    
    # Make prediction
    result = predictor.predict_single(sample_exoplanet)
    
    print(f"\n🎯 Prediction Results:")
    print(f"   Predicted Class: {result['predicted_class']}")
    print(f"   Confidence: {result['confidence']:.4f}")
    print(f"\n📊 All Class Probabilities:")
    for class_name, prob in result['all_probabilities'].items():
        print(f"   {class_name}: {prob:.4f}")

if __name__ == "__main__":
    demo_prediction()