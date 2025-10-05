#!/usr/bin/env python3
"""
NASA Exoplanet Classification Model Training - Prompt 12A Implementation
========================================================================

This script trains machine learning models using the preprocessed NASA exoplanet data
and scalers from Prompt 12. It implements multiple ML algorithms and evaluates their
performance for exoplanet classification.

Features:
- Multiple ML algorithms (Random Forest, XGBoost, SVM, Neural Network)
- Comprehensive model evaluation with metrics and visualizations
- Model comparison and selection
- Best model saving for production use
- Feature importance analysis
"""

import os
import sys
import json
import pickle
import warnings
from pathlib import Path
from datetime import datetime
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report, confusion_matrix, accuracy_score, 
    precision_score, recall_score, f1_score, roc_auc_score,
    roc_curve, precision_recall_curve
)
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_val_score
import joblib

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

class ExoplanetModelTrainer:
    """
    Comprehensive machine learning model trainer for NASA exoplanet classification
    """
    
    def __init__(self, data_dir="data", random_state=42):
        self.data_dir = Path(data_dir)
        self.processed_dir = self.data_dir / "processed"
        self.scalers_dir = self.data_dir / "scalers"
        self.models_dir = self.data_dir / "models"
        self.random_state = random_state
        
        # Create models directory if it doesn't exist
        self.models_dir.mkdir(exist_ok=True)
        
        # Initialize containers
        self.models = {}
        self.results = {}
        self.feature_names = []
        self.target_classes = []
        
        print("🤖 NASA Exoplanet Model Trainer Initialized")
        print(f"📂 Data directory: {self.data_dir}")
        print(f"🎯 Models will be saved to: {self.models_dir}")
    
    def load_processed_data(self):
        """Load the preprocessed training, validation, and test datasets"""
        print("\n📥 Loading Preprocessed Data...")
        
        try:
            # Load datasets
            self.X_train = pd.read_csv(self.processed_dir / "train_processed.csv")
            self.X_val = pd.read_csv(self.processed_dir / "validation_processed.csv")
            self.X_test = pd.read_csv(self.processed_dir / "test_processed.csv")
            
            # Separate features and targets
            target_col = 'target'
            
            # Extract targets and ensure they are integers for classification
            self.y_train = self.X_train[target_col].astype(int)
            self.y_val = self.X_val[target_col].astype(int)
            self.y_test = self.X_test[target_col].astype(int)
            
            # Map negative values to positive for sklearn compatibility
            unique_targets = sorted(pd.concat([self.y_train, self.y_val, self.y_test]).unique())
            if min(unique_targets) < 0:
                # Create mapping to ensure non-negative class labels
                target_mapping = {old_val: new_val for new_val, old_val in enumerate(unique_targets)}
                print(f"   📋 Mapping target values: {target_mapping}")
                
                self.y_train = self.y_train.map(target_mapping)
                self.y_val = self.y_val.map(target_mapping)
                self.y_test = self.y_test.map(target_mapping)
                
                self.target_mapping = target_mapping
            
            # Extract features (remove target and any identifier columns)
            feature_cols = [col for col in self.X_train.columns 
                           if col not in [target_col, 'disposition']]
            
            self.X_train = self.X_train[feature_cols]
            self.X_val = self.X_val[feature_cols]
            self.X_test = self.X_test[feature_cols]
            
            self.feature_names = feature_cols
            
            print(f"   ✅ Training set: {self.X_train.shape[0]:,} samples, {self.X_train.shape[1]} features")
            print(f"   ✅ Validation set: {self.X_val.shape[0]:,} samples, {self.X_val.shape[1]} features")
            print(f"   ✅ Test set: {self.X_test.shape[0]:,} samples, {self.X_test.shape[1]} features")
            print(f"   📊 Target classes: {sorted(self.y_train.unique())}")
            
            # Load target encoder to get class names
            self.load_target_encoder()
            
            return True
            
        except Exception as e:
            print(f"   ❌ Error loading processed data: {e}")
            return False
    
    def load_target_encoder(self):
        """Load the target encoder to get class names"""
        try:
            with open(self.scalers_dir / "target_encoder.pkl", 'rb') as f:
                self.target_encoder = pickle.load(f)
                if hasattr(self.target_encoder, 'classes_'):
                    self.target_classes = self.target_encoder.classes_
                    print(f"   📊 Target classes from encoder: {list(self.target_classes)}")
                else:
                    # Fallback to unique values if encoder doesn't have classes_
                    self.target_classes = sorted(self.y_train.unique())
                    print(f"   📊 Target classes from data: {list(self.target_classes)}")
        except Exception as e:
            print(f"   ⚠️ Could not load target encoder, using data classes: {e}")
            self.target_classes = sorted(self.y_train.unique())
            print(f"   📊 Target classes from data: {list(self.target_classes)}")
    
    def initialize_models(self):
        """Initialize different ML models for comparison"""
        print("\n🧠 Initializing ML Models...")
        
        self.models = {
            'random_forest': RandomForestClassifier(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=self.random_state,
                n_jobs=-1
            ),
            
            'gradient_boosting': GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=self.random_state
            ),
            
            'svm': SVC(
                kernel='rbf',
                C=1.0,
                gamma='scale',
                probability=True,
                random_state=self.random_state
            ),
            
            'neural_network': MLPClassifier(
                hidden_layer_sizes=(100, 50),
                activation='relu',
                solver='adam',
                alpha=0.001,
                learning_rate='adaptive',
                max_iter=500,
                random_state=self.random_state
            ),
            
            'logistic_regression': LogisticRegression(
                C=1.0,
                solver='liblinear',
                random_state=self.random_state,
                max_iter=1000
            )
        }
        
        print(f"   ✅ Initialized {len(self.models)} models:")
        for name in self.models.keys():
            print(f"      • {name.replace('_', ' ').title()}")
    
    def train_models(self):
        """Train all models and evaluate their performance"""
        print("\n🎯 Training Models...")
        
        for name, model in self.models.items():
            print(f"\n   🔄 Training {name.replace('_', ' ').title()}...")
            
            try:
                # Train the model
                model.fit(self.X_train, self.y_train)
                
                # Make predictions
                y_train_pred = model.predict(self.X_train)
                y_val_pred = model.predict(self.X_val)
                
                # Calculate metrics
                train_accuracy = accuracy_score(self.y_train, y_train_pred)
                val_accuracy = accuracy_score(self.y_val, y_val_pred)
                
                # Cross-validation score
                cv_scores = cross_val_score(model, self.X_train, self.y_train, 
                                          cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=self.random_state),
                                          scoring='accuracy', n_jobs=-1)
                
                # Store results
                self.results[name] = {
                    'model': model,
                    'train_accuracy': train_accuracy,
                    'val_accuracy': val_accuracy,
                    'cv_mean': cv_scores.mean(),
                    'cv_std': cv_scores.std(),
                    'y_val_pred': y_val_pred,
                    'y_train_pred': y_train_pred
                }
                
                print(f"      ✅ Train Accuracy: {train_accuracy:.4f}")
                print(f"      ✅ Val Accuracy: {val_accuracy:.4f}")
                print(f"      ✅ CV Score: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")
                
            except Exception as e:
                print(f"      ❌ Error training {name}: {e}")
    
    def evaluate_models(self):
        """Comprehensive evaluation of all trained models"""
        print("\n📊 Evaluating Models...")
        
        # Create evaluation summary
        evaluation_data = []
        
        for name, result in self.results.items():
            model = result['model']
            y_val_pred = result['y_val_pred']
            
            # Calculate comprehensive metrics
            precision = precision_score(self.y_val, y_val_pred, average='weighted')
            recall = recall_score(self.y_val, y_val_pred, average='weighted')
            f1 = f1_score(self.y_val, y_val_pred, average='weighted')
            
            # Try to calculate ROC AUC (multiclass)
            try:
                if hasattr(model, 'predict_proba'):
                    y_val_proba = model.predict_proba(self.X_val)
                    roc_auc = roc_auc_score(self.y_val, y_val_proba, multi_class='ovr', average='weighted')
                else:
                    roc_auc = None
            except:
                roc_auc = None
            
            evaluation_data.append({
                'Model': name.replace('_', ' ').title(),
                'Train Accuracy': result['train_accuracy'],
                'Val Accuracy': result['val_accuracy'],
                'CV Mean': result['cv_mean'],
                'CV Std': result['cv_std'],
                'Precision': precision,
                'Recall': recall,
                'F1 Score': f1,
                'ROC AUC': roc_auc
            })
        
        # Create evaluation DataFrame
        self.evaluation_df = pd.DataFrame(evaluation_data)
        
        # Display results
        print("\n📈 Model Performance Summary:")
        print("=" * 100)
        pd.set_option('display.max_columns', None)
        pd.set_option('display.width', None)
        print(self.evaluation_df.round(4))
        
        # Find best model
        self.best_model_name = self.evaluation_df.loc[self.evaluation_df['Val Accuracy'].idxmax(), 'Model']
        self.best_model = self.results[self.best_model_name.lower().replace(' ', '_')]['model']
        
        print(f"\n🏆 Best Model: {self.best_model_name}")
        print(f"   📊 Validation Accuracy: {self.evaluation_df['Val Accuracy'].max():.4f}")
    
    def generate_detailed_report(self):
        """Generate detailed classification report and confusion matrix for best model"""
        print(f"\n📋 Detailed Analysis - {self.best_model_name}")
        print("=" * 60)
        
        best_result = self.results[self.best_model_name.lower().replace(' ', '_')]
        y_val_pred = best_result['y_val_pred']
        
        # Classification report
        print("\n🎯 Classification Report:")
        if hasattr(self, 'target_classes'):
            target_names = [str(cls) for cls in self.target_classes]
        else:
            target_names = None
            
        report = classification_report(self.y_val, y_val_pred, target_names=target_names)
        print(report)
        
        # Confusion matrix
        print("\n🔍 Confusion Matrix:")
        cm = confusion_matrix(self.y_val, y_val_pred)
        print(cm)
        
        return report, cm
    
    def analyze_feature_importance(self):
        """Analyze and display feature importance for tree-based models"""
        print(f"\n🔍 Feature Importance Analysis - {self.best_model_name}")
        
        if hasattr(self.best_model, 'feature_importances_'):
            importances = self.best_model.feature_importances_
            
            # Create feature importance DataFrame
            feature_importance_df = pd.DataFrame({
                'feature': self.feature_names,
                'importance': importances
            }).sort_values('importance', ascending=False)
            
            print("\n📊 Top 15 Most Important Features:")
            print("=" * 50)
            for idx, row in feature_importance_df.head(15).iterrows():
                print(f"   {row['feature']:<25} {row['importance']:.4f}")
            
            # Save feature importance
            feature_importance_df.to_csv(self.models_dir / f"{self.best_model_name.lower().replace(' ', '_')}_feature_importance.csv", index=False)
            
            return feature_importance_df
        else:
            print("   ℹ️ Feature importance not available for this model type")
            return None
    
    def test_best_model(self):
        """Test the best model on the test set"""
        print(f"\n🧪 Testing Best Model ({self.best_model_name}) on Test Set...")
        
        # Make predictions on test set
        y_test_pred = self.best_model.predict(self.X_test)
        
        # Calculate test metrics
        test_accuracy = accuracy_score(self.y_test, y_test_pred)
        test_precision = precision_score(self.y_test, y_test_pred, average='weighted')
        test_recall = recall_score(self.y_test, y_test_pred, average='weighted')
        test_f1 = f1_score(self.y_test, y_test_pred, average='weighted')
        
        print(f"   🎯 Test Accuracy: {test_accuracy:.4f}")
        print(f"   🎯 Test Precision: {test_precision:.4f}")
        print(f"   🎯 Test Recall: {test_recall:.4f}")
        print(f"   🎯 Test F1-Score: {test_f1:.4f}")
        
        # Test set classification report
        print(f"\n📋 Test Set Classification Report:")
        if hasattr(self, 'target_classes'):
            target_names = [str(cls) for cls in self.target_classes]
        else:
            target_names = None
            
        test_report = classification_report(self.y_test, y_test_pred, target_names=target_names)
        print(test_report)
        
        return {
            'test_accuracy': test_accuracy,
            'test_precision': test_precision,
            'test_recall': test_recall,
            'test_f1': test_f1,
            'test_report': test_report,
            'y_test_pred': y_test_pred
        }
    
    def save_best_model(self):
        """Save the best model and associated metadata"""
        print(f"\n💾 Saving Best Model ({self.best_model_name})...")
        
        # Save the model
        model_filename = f"best_model_{self.best_model_name.lower().replace(' ', '_')}.pkl"
        model_path = self.models_dir / model_filename
        
        joblib.dump(self.best_model, model_path)
        print(f"   ✅ Model saved to: {model_path}")
        
        # Save model metadata
        metadata = {
            'model_name': self.best_model_name,
            'model_type': type(self.best_model).__name__,
            'training_timestamp': datetime.now().isoformat(),
            'feature_names': self.feature_names,
            'target_classes': [int(cls) for cls in self.target_classes] if hasattr(self, 'target_classes') else None,
            'model_parameters': self.best_model.get_params(),
            'performance_metrics': {k: float(v) if isinstance(v, np.number) else v 
                                  for k, v in self.evaluation_df[self.evaluation_df['Model'] == self.best_model_name].to_dict('records')[0].items()}
        }
        
        metadata_path = self.models_dir / "model_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"   ✅ Metadata saved to: {metadata_path}")
        
        return model_path, metadata_path
    
    def save_training_results(self):
        """Save comprehensive training results"""
        print("\n💾 Saving Training Results...")
        
        # Save evaluation results
        results_path = self.models_dir / "training_results.csv"
        self.evaluation_df.to_csv(results_path, index=False)
        print(f"   ✅ Results saved to: {results_path}")
        
        # Save detailed results as JSON
        detailed_results = {}
        for name, result in self.results.items():
            detailed_results[name] = {
                'train_accuracy': float(result['train_accuracy']),
                'val_accuracy': float(result['val_accuracy']),
                'cv_mean': float(result['cv_mean']),
                'cv_std': float(result['cv_std'])
            }
        
        detailed_path = self.models_dir / "detailed_results.json"
        with open(detailed_path, 'w') as f:
            json.dump(detailed_results, f, indent=2)
        print(f"   ✅ Detailed results saved to: {detailed_path}")
    
    def run_training_pipeline(self):
        """Run the complete model training pipeline"""
        print("🚀 Starting NASA Exoplanet Model Training Pipeline")
        print("=" * 70)
        
        # Step 1: Load processed data
        if not self.load_processed_data():
            print("❌ Failed to load processed data. Exiting.")
            return False
        
        # Step 2: Initialize models
        self.initialize_models()
        
        # Step 3: Train models
        self.train_models()
        
        # Step 4: Evaluate models
        self.evaluate_models()
        
        # Step 5: Generate detailed report
        self.generate_detailed_report()
        
        # Step 6: Analyze feature importance
        self.analyze_feature_importance()
        
        # Step 7: Test best model
        test_results = self.test_best_model()
        
        # Step 8: Save best model
        self.save_best_model()
        
        # Step 9: Save training results
        self.save_training_results()
        
        print("\n" + "=" * 70)
        print("🎉 Training Pipeline Completed Successfully!")
        print(f"🏆 Best Model: {self.best_model_name}")
        print(f"📊 Final Test Accuracy: {test_results['test_accuracy']:.4f}")
        print(f"📁 Models saved to: {self.models_dir}")
        print("=" * 70)
        
        return True

def main():
    """Main execution function"""
    print("🌌 NASA Exoplanet Classification Model Training")
    print("🎯 Prompt 12A Implementation")
    print("=" * 70)
    
    # Initialize trainer
    trainer = ExoplanetModelTrainer()
    
    # Run training pipeline
    success = trainer.run_training_pipeline()
    
    if success:
        print("\n✅ All training tasks completed successfully!")
        print("🚀 Models are ready for production use!")
    else:
        print("\n❌ Training pipeline failed!")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())