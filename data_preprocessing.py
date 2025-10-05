#!/usr/bin/env python3
"""
NASA Exoplanet Data Preprocessing Pipeline
==========================================

This script preprocesses K2, Kepler, and TESS exoplanet datasets for machine learning.

Features:
- Loads multiple NASA datasets with proper header handling
- Comprehensive missing value imputation
- Feature engineering (transit SNR, habitability zone indicators)
- Data normalization and categorical encoding
- Train/validation/test splits (70/15/15)
- Data augmentation for imbalanced classes
- Exports preprocessed data and scalers

Author: Exoplanet Hunter Team
Date: October 2025
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler
from sklearn.impute import SimpleImputer, KNNImputer
from imblearn.over_sampling import SMOTE, RandomOverSampler
from imblearn.under_sampling import RandomUnderSampler
from imblearn.combine import SMOTEENN
import joblib
import os
import warnings
from pathlib import Path
import json
from datetime import datetime

warnings.filterwarnings('ignore')

class ExoplanetDataPreprocessor:
    """
    Comprehensive preprocessing pipeline for NASA exoplanet datasets
    """
    
    def __init__(self, data_dir="data", random_state=42):
        self.data_dir = Path(data_dir)
        self.random_state = random_state
        self.scalers = {}
        self.encoders = {}
        self.feature_names = []
        self.target_classes = []
        
        # Create directories if they don't exist
        self.processed_dir = self.data_dir / "processed"
        self.scalers_dir = self.data_dir / "scalers"
        self.models_dir = self.data_dir / "models"
        
        for directory in [self.processed_dir, self.scalers_dir, self.models_dir]:
            directory.mkdir(parents=True, exist_ok=True)
    
    def load_nasa_dataset(self, filepath):
        """Load NASA CSV files with proper header handling"""
        print(f"📂 Loading dataset: {filepath}")
        
        # Read the file and find where data starts (after NASA comments)
        with open(filepath, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        
        # Find the line where actual CSV data starts (after # comments)
        data_start = 0
        for i, line in enumerate(lines):
            if not line.strip().startswith('#') and line.strip():
                data_start = i
                break
        
        # Read the CSV starting from the data line
        df = pd.read_csv(filepath, skiprows=data_start)
        
        print(f"   ✅ Loaded {len(df)} records with {len(df.columns)} columns")
        return df
    
    def load_datasets(self):
        """Load K2, Kepler, and TESS datasets"""
        print("🚀 Loading NASA Exoplanet Datasets...")
        
        datasets = {}
        file_mapping = {
            'k2': 'K2 Planets and Candidate.csv',
            'kepler': 'Kepler Objects of Interest(KOI).csv',
            'tess': 'TESS Objects of Interest(TOI).csv'
        }
        
        for name, filename in file_mapping.items():
            filepath = self.data_dir / "raw" / filename
            if filepath.exists():
                datasets[name] = self.load_nasa_dataset(filepath)
                # Add dataset source column
                datasets[name]['dataset_source'] = name.upper()
            else:
                print(f"   ⚠️  Warning: {filepath} not found")
        
        if not datasets:
            raise FileNotFoundError("No datasets found in data/raw/ directory")
        
        return datasets
    
    def harmonize_datasets(self, datasets):
        """Harmonize column names and create unified dataset"""
        print("🔧 Harmonizing datasets...")
        
        # Define column mappings for different datasets
        column_mappings = {
            'k2': {
                'pl_name': 'planet_name',
                'hostname': 'host_name',
                'disposition': 'disposition',
                'discoverymethod': 'discovery_method',
                'disc_year': 'discovery_year',
                'pl_orbper': 'orbital_period',
                'pl_orbsmax': 'semi_major_axis',
                'pl_rade': 'planet_radius',
                'pl_bmasse': 'planet_mass',
                'pl_eqt': 'equilibrium_temp',
                'pl_insol': 'insolation_flux',
                'st_teff': 'stellar_temp',
                'st_rad': 'stellar_radius',
                'st_mass': 'stellar_mass',
                'sy_dist': 'distance'
            },
            'kepler': {
                'kepoi_name': 'planet_name',
                'kepler_name': 'host_name',
                'koi_disposition': 'disposition',
                'koi_period': 'orbital_period',
                'koi_prad': 'planet_radius',
                'koi_teq': 'equilibrium_temp',
                'koi_insol': 'insolation_flux',
                'koi_duration': 'transit_duration',
                'koi_depth': 'transit_depth',
                'koi_model_snr': 'transit_snr',
                'koi_steff': 'stellar_temp',
                'koi_srad': 'stellar_radius',
                'koi_score': 'disposition_score'
            },
            'tess': {
                'toi': 'planet_name',
                'tfopwg_disp': 'disposition',
                'pl_orbper': 'orbital_period',
                'pl_rade': 'planet_radius',
                'pl_eqt': 'equilibrium_temp',
                'pl_insol': 'insolation_flux',
                'pl_trandurh': 'transit_duration',
                'pl_trandep': 'transit_depth',
                'st_teff': 'stellar_temp',
                'st_rad': 'stellar_radius',
                'st_dist': 'distance'
            }
        }
        
        harmonized_datasets = []
        
        for dataset_name, df in datasets.items():
            print(f"   📋 Processing {dataset_name.upper()} dataset...")
            
            # Apply column mapping
            mapping = column_mappings.get(dataset_name, {})
            df_mapped = df.rename(columns=mapping)
            
            # Select common columns that exist in the dataset
            common_columns = ['planet_name', 'host_name', 'disposition', 'discovery_method', 
                            'discovery_year', 'orbital_period', 'semi_major_axis', 'planet_radius',
                            'planet_mass', 'equilibrium_temp', 'insolation_flux', 'transit_duration',
                            'transit_depth', 'transit_snr', 'stellar_temp', 'stellar_radius',
                            'stellar_mass', 'distance', 'disposition_score', 'dataset_source']
            
            # Add missing columns with NaN
            for col in common_columns:
                if col not in df_mapped.columns:
                    df_mapped[col] = np.nan
            
            # Select only common columns
            df_harmonized = df_mapped[common_columns].copy()
            
            harmonized_datasets.append(df_harmonized)
            print(f"      ✅ {len(df_harmonized)} records harmonized")
        
        # Combine all datasets
        combined_df = pd.concat(harmonized_datasets, ignore_index=True)
        print(f"🎯 Combined dataset: {len(combined_df)} total records")
        
        return combined_df
    
    def clean_and_prepare_data(self, df):
        """Clean data and prepare for preprocessing"""
        print("🧹 Cleaning and preparing data...")
        
        # Convert object columns to numeric where possible
        numeric_columns = ['orbital_period', 'semi_major_axis', 'planet_radius', 'planet_mass',
                          'equilibrium_temp', 'insolation_flux', 'transit_duration', 'transit_depth',
                          'transit_snr', 'stellar_temp', 'stellar_radius', 'stellar_mass', 
                          'distance', 'disposition_score', 'discovery_year']
        
        for col in numeric_columns:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        # Clean disposition column for target variable
        if 'disposition' in df.columns:
            df['disposition'] = df['disposition'].astype(str).str.upper()
            # Standardize disposition values
            disposition_mapping = {
                'CONFIRMED': 'CONFIRMED',
                'CANDIDATE': 'CANDIDATE', 
                'FALSE POSITIVE': 'FALSE_POSITIVE',
                'FP': 'FALSE_POSITIVE',
                'PC': 'CANDIDATE',
                'CP': 'CONFIRMED'
            }
            df['disposition'] = df['disposition'].map(disposition_mapping).fillna('UNKNOWN')
        
        # Remove rows with no useful information
        df = df.dropna(subset=['planet_radius'], how='all')
        
        print(f"   ✅ Cleaned data: {len(df)} records remaining")
        return df
    
    def feature_engineering(self, df):
        """Create new features for ML models"""
        print("⚗️  Engineering features...")
        
        # 1. Transit Signal-to-Noise Ratio
        if 'transit_depth' in df.columns and 'transit_duration' in df.columns:
            df['transit_snr_calculated'] = df['transit_depth'] / (df['transit_duration'] + 1e-8)
            print("   ✅ Created transit_snr_calculated feature")
        
        # 2. Habitability Zone Indicator
        if 'stellar_temp' in df.columns and 'semi_major_axis' in df.columns:
            # Approximate habitable zone calculation
            stellar_temp_norm = df['stellar_temp'] / 5778  # Normalize to Sun
            habitable_zone_inner = np.sqrt(stellar_temp_norm**4 / 1.1)
            habitable_zone_outer = np.sqrt(stellar_temp_norm**4 / 0.53)
            
            df['in_habitable_zone'] = (
                (df['semi_major_axis'] >= habitable_zone_inner) & 
                (df['semi_major_axis'] <= habitable_zone_outer)
            ).astype(int)
            print("   ✅ Created habitability zone indicator")
        
        # 3. Planet size category
        if 'planet_radius' in df.columns:
            df['size_category'] = pd.cut(
                df['planet_radius'],
                bins=[0, 1.25, 2.0, 4.0, 11.0, np.inf],
                labels=['Earth-size', 'Super-Earth', 'Mini-Neptune', 'Neptune-size', 'Jupiter-size']
            )
            print("   ✅ Created planet size categories")
        
        # 4. Stellar classification
        if 'stellar_temp' in df.columns:
            df['stellar_class'] = pd.cut(
                df['stellar_temp'],
                bins=[0, 3700, 5200, 6000, 7500, np.inf],
                labels=['M-dwarf', 'K-dwarf', 'G-dwarf', 'F-dwarf', 'Hot-star']
            )
            print("   ✅ Created stellar classifications")
        
        # 5. Discovery era
        if 'discovery_year' in df.columns:
            df['discovery_era'] = pd.cut(
                df['discovery_year'],
                bins=[1990, 2009, 2013, 2018, 2030],
                labels=['Pre-Kepler', 'Kepler-Era', 'K2-Era', 'TESS-Era']
            )
            print("   ✅ Created discovery era categories")
        
        # 6. Equilibrium temperature category
        if 'equilibrium_temp' in df.columns:
            df['temp_category'] = pd.cut(
                df['equilibrium_temp'],
                bins=[0, 200, 273, 373, 500, np.inf],
                labels=['Very-Cold', 'Cold', 'Temperate', 'Hot', 'Very-Hot']
            )
            print("   ✅ Created temperature categories")
        
        # 7. Insolation flux ratio (compared to Earth)
        if 'insolation_flux' in df.columns:
            df['insolation_ratio'] = np.log10(df['insolation_flux'] + 1e-8)
            print("   ✅ Created insolation flux ratio")
        
        return df
    
    def handle_missing_values(self, df):
        """Handle missing values with appropriate imputation strategies"""
        print("🔧 Handling missing values...")
        
        # Separate numeric and categorical columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        # Remove target variable from imputation
        if 'disposition' in numeric_cols:
            numeric_cols.remove('disposition')
        if 'disposition' in categorical_cols:
            categorical_cols.remove('disposition')
        
        # Numeric imputation strategy
        print("   🔢 Imputing numeric features...")
        
        # Use different strategies for different types of numeric data
        median_imputer = SimpleImputer(strategy='median')
        mean_imputer = SimpleImputer(strategy='mean')
        knn_imputer = KNNImputer(n_neighbors=5)
        
        # Physical properties: use median (more robust to outliers)
        physical_cols = [col for col in numeric_cols if any(keyword in col.lower() 
                        for keyword in ['radius', 'mass', 'temp', 'period', 'distance'])]
        
        if physical_cols:
            df[physical_cols] = median_imputer.fit_transform(df[physical_cols])
            self.scalers['median_imputer'] = median_imputer
        
        # Observational properties: use KNN (preserve relationships)
        observational_cols = [col for col in numeric_cols if any(keyword in col.lower() 
                             for keyword in ['transit', 'snr', 'depth', 'duration', 'flux'])]
        
        if observational_cols:
            df[observational_cols] = knn_imputer.fit_transform(df[observational_cols])
            self.scalers['knn_imputer'] = knn_imputer
        
        # Handle any remaining numeric columns with median
        remaining_numeric = [col for col in numeric_cols if col not in physical_cols + observational_cols]
        if remaining_numeric:
            df[remaining_numeric] = median_imputer.fit_transform(df[remaining_numeric])
        
        # Categorical imputation
        print("   🏷️  Imputing categorical features...")
        
        for col in categorical_cols:
            if col in df.columns:
                # Use mode for categorical variables
                mode_val = df[col].mode().iloc[0] if not df[col].mode().empty else 'Unknown'
                df[col] = df[col].fillna(mode_val)
        
        # Final cleanup: handle any remaining NaN values
        print("   🧹 Final cleanup of any remaining NaN values...")
        
        # For any remaining numeric NaN, use median
        for col in df.select_dtypes(include=[np.number]).columns:
            if df[col].isnull().any() and col != 'disposition':
                df[col] = df[col].fillna(df[col].median())
        
        # For any remaining categorical NaN, use 'Unknown'
        for col in df.select_dtypes(include=['object', 'category']).columns:
            if df[col].isnull().any() and col != 'disposition':
                df[col] = df[col].fillna('Unknown')
        
        # Verify no NaN values remain (except in target)
        nan_count = df.drop(columns=['disposition'], errors='ignore').isnull().sum().sum()
        print(f"   ✅ Missing values handled (remaining NaN: {nan_count})")
        
        return df
    
    def encode_categorical_features(self, df):
        """Encode categorical variables"""
        print("🎯 Encoding categorical features...")
        
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        # Remove target variable and identifier columns
        exclude_cols = ['disposition', 'planet_name', 'host_name']
        categorical_cols = [col for col in categorical_cols if col not in exclude_cols]
        
        encoded_dfs = [df.select_dtypes(include=[np.number])]  # Start with numeric columns
        
        for col in categorical_cols:
            if col in df.columns:
                # Use one-hot encoding for categorical variables
                encoded = pd.get_dummies(df[col], prefix=col, drop_first=True)
                encoded_dfs.append(encoded)
                
                # Store encoder info for later use
                self.encoders[col] = {
                    'type': 'one_hot',
                    'categories': df[col].unique().tolist()
                }
        
        # Combine all encoded features
        df_encoded = pd.concat(encoded_dfs, axis=1)
        
        # Ensure target variable is included
        if 'disposition' in df.columns:
            df_encoded['disposition'] = df['disposition']
        
        print(f"   ✅ Encoded {len(categorical_cols)} categorical features")
        print(f"   📊 Final feature count: {len(df_encoded.columns)}")
        
        return df_encoded
    
    def normalize_features(self, df, exclude_cols=None):
        """Normalize numerical features"""
        print("📏 Normalizing features...")
        
        if exclude_cols is None:
            exclude_cols = ['disposition']
        
        # Separate features and target
        feature_cols = [col for col in df.columns if col not in exclude_cols]
        
        # Apply StandardScaler to features
        scaler = StandardScaler()
        df_scaled = df.copy()
        df_scaled[feature_cols] = scaler.fit_transform(df[feature_cols])
        
        self.scalers['feature_scaler'] = scaler
        self.feature_names = feature_cols
        
        print(f"   ✅ Normalized {len(feature_cols)} features")
        return df_scaled
    
    def prepare_target_variable(self, df):
        """Prepare target variable for classification"""
        print("🎯 Preparing target variable...")
        
        if 'disposition' not in df.columns:
            raise ValueError("Target variable 'disposition' not found")
        
        # Encode target variable
        label_encoder = LabelEncoder()
        df['target'] = label_encoder.fit_transform(df['disposition'])
        
        self.encoders['target'] = label_encoder
        self.target_classes = label_encoder.classes_
        
        # Print class distribution
        class_counts = df['disposition'].value_counts()
        print("   📊 Target variable distribution:")
        for class_name, count in class_counts.items():
            percentage = (count / len(df)) * 100
            print(f"      {class_name}: {count} ({percentage:.1f}%)")
        
        return df
    
    def split_data(self, df, test_size=0.15, val_size=0.15):
        """Split data into train/validation/test sets (70/15/15)"""
        print("✂️  Splitting data...")
        
        # Features and target
        feature_cols = [col for col in df.columns if col not in ['disposition', 'target']]
        X = df[feature_cols]
        y = df['target']
        
        # First split: separate test set (15%)
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=test_size, random_state=self.random_state, stratify=y
        )
        
        # Second split: separate train and validation (70% and 15% of original)
        val_size_adjusted = val_size / (1 - test_size)  # Adjust validation size
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=val_size_adjusted, 
            random_state=self.random_state, stratify=y_temp
        )
        
        print(f"   📊 Train set: {len(X_train)} samples ({len(X_train)/len(df)*100:.1f}%)")
        print(f"   📊 Validation set: {len(X_val)} samples ({len(X_val)/len(df)*100:.1f}%)")
        print(f"   📊 Test set: {len(X_test)} samples ({len(X_test)/len(df)*100:.1f}%)")
        
        return X_train, X_val, X_test, y_train, y_val, y_test
    
    def augment_data(self, X_train, y_train, method='smote'):
        """Apply data augmentation for imbalanced classes"""
        print("🔄 Applying data augmentation...")
        
        # Ensure y_train is integer type for classification
        y_train = pd.Series(y_train).astype(int)
        
        # Check class imbalance
        class_counts = y_train.value_counts()
        imbalance_ratio = class_counts.max() / class_counts.min()
        
        print(f"   📊 Class imbalance ratio: {imbalance_ratio:.2f}")
        
        if imbalance_ratio > 2:  # Apply augmentation if significantly imbalanced
            if method == 'smote':
                augmenter = SMOTE(random_state=self.random_state)
            elif method == 'random_oversample':
                augmenter = RandomOverSampler(random_state=self.random_state)
            elif method == 'smoteenn':
                augmenter = SMOTEENN(random_state=self.random_state)
            else:
                print("   ⚠️  Unknown augmentation method, skipping...")
                return X_train, y_train
            
            X_train_aug, y_train_aug = augmenter.fit_resample(X_train, y_train)
            
            print(f"   ✅ Augmentation applied: {len(X_train)} → {len(X_train_aug)} samples")
            print(f"   📊 New class distribution:")
            
            new_class_counts = pd.Series(y_train_aug).value_counts()
            for class_idx, count in new_class_counts.items():
                if hasattr(self, 'target_classes') and class_idx < len(self.target_classes):
                    class_name = self.target_classes[class_idx]
                    print(f"      {class_name}: {count}")
                else:
                    print(f"      Class {class_idx}: {count}")
            
            return X_train_aug, y_train_aug
        else:
            print("   ℹ️  Classes are balanced, skipping augmentation")
            return X_train, y_train
    
    def save_processed_data(self, datasets_dict):
        """Save all processed datasets"""
        print("💾 Saving processed data...")
        
        for name, data in datasets_dict.items():
            filepath = self.processed_dir / f"{name}_processed.csv"
            if isinstance(data, tuple):  # Train/val/test split
                X, y = data
                combined_data = X.copy()
                combined_data['target'] = y
                combined_data.to_csv(filepath, index=False)
            else:  # Single dataset
                data.to_csv(filepath, index=False)
            
            print(f"   ✅ Saved {name} to {filepath}")
    
    def save_scalers_and_encoders(self):
        """Save all scalers and encoders for inference"""
        print("💾 Saving scalers and encoders...")
        
        # Save scalers
        for name, scaler in self.scalers.items():
            filepath = self.scalers_dir / f"{name}.pkl"
            joblib.dump(scaler, filepath)
            print(f"   ✅ Saved {name} to {filepath}")
        
        # Save encoders
        for name, encoder in self.encoders.items():
            if hasattr(encoder, 'fit'):  # sklearn encoder
                filepath = self.scalers_dir / f"{name}_encoder.pkl"
                joblib.dump(encoder, filepath)
            else:  # custom encoder info
                filepath = self.scalers_dir / f"{name}_encoder.json"
                with open(filepath, 'w') as f:
                    json.dump(encoder, f, indent=2, default=str)
            print(f"   ✅ Saved {name} encoder to {filepath}")
        
        # Save feature names
        feature_info = {
            'feature_names': self.feature_names,
            'target_classes': self.target_classes.tolist() if hasattr(self.target_classes, 'tolist') else self.target_classes,
            'preprocessing_timestamp': datetime.now().isoformat()
        }
        
        feature_info_path = self.scalers_dir / "feature_info.json"
        with open(feature_info_path, 'w') as f:
            json.dump(feature_info, f, indent=2)
        
        print(f"   ✅ Saved feature info to {feature_info_path}")
    
    def generate_data_report(self, original_df, processed_df):
        """Generate a comprehensive data preprocessing report"""
        print("📊 Generating data report...")
        
        report = {
            'preprocessing_summary': {
                'timestamp': datetime.now().isoformat(),
                'original_samples': len(original_df),
                'processed_samples': len(processed_df),
                'original_features': len(original_df.columns),
                'processed_features': len(processed_df.columns),
                'missing_value_percentage': (original_df.isnull().sum().sum() / 
                                           (len(original_df) * len(original_df.columns))) * 100
            },
            'dataset_composition': {
                'k2_samples': len(original_df[original_df['dataset_source'] == 'K2']) if 'dataset_source' in original_df.columns else 0,
                'kepler_samples': len(original_df[original_df['dataset_source'] == 'KEPLER']) if 'dataset_source' in original_df.columns else 0,
                'tess_samples': len(original_df[original_df['dataset_source'] == 'TESS']) if 'dataset_source' in original_df.columns else 0
            },
            'target_distribution': original_df['disposition'].value_counts().to_dict() if 'disposition' in original_df.columns else {},
            'feature_engineering': {
                'new_features_created': [
                    'transit_snr_calculated', 'in_habitable_zone', 'size_category',
                    'stellar_class', 'discovery_era', 'temp_category', 'insolation_ratio'
                ],
                'categorical_features_encoded': list(self.encoders.keys()),
                'normalization_applied': 'StandardScaler'
            }
        }
        
        report_path = self.processed_dir / "preprocessing_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"   ✅ Report saved to {report_path}")
        
        # Print summary
        print("=" * 60)
        print("📊 PREPROCESSING SUMMARY")
        print("=" * 60)
        print(f"Original samples: {report['preprocessing_summary']['original_samples']:,}")
        print(f"Processed samples: {report['preprocessing_summary']['processed_samples']:,}")
        print(f"Original features: {report['preprocessing_summary']['original_features']}")
        print(f"Final features: {report['preprocessing_summary']['processed_features']}")
        print(f"Missing values: {report['preprocessing_summary']['missing_value_percentage']:.2f}%")
        print()
        print("Dataset composition:")
        for dataset, count in report['dataset_composition'].items():
            if count > 0:
                print(f"  {dataset}: {count:,} samples")
        print()
        print("Target distribution:")
        for target, count in report['target_distribution'].items():
            print(f"  {target}: {count:,} samples")
        print("=" * 60)
    
    def run_preprocessing_pipeline(self, augmentation_method='smote'):
        """Run the complete preprocessing pipeline"""
        print("🚀 Starting NASA Exoplanet Data Preprocessing Pipeline")
        print("=" * 60)
        
        try:
            # 1. Load datasets
            datasets = self.load_datasets()
            
            # 2. Harmonize datasets
            combined_df = self.harmonize_datasets(datasets)
            original_df = combined_df.copy()  # Keep for reporting
            
            # 3. Clean and prepare data
            combined_df = self.clean_and_prepare_data(combined_df)
            
            # 4. Feature engineering
            combined_df = self.feature_engineering(combined_df)
            
            # 5. Handle missing values
            combined_df = self.handle_missing_values(combined_df)
            
            # 6. Encode categorical features
            combined_df = self.encode_categorical_features(combined_df)
            
            # 7. Prepare target variable
            combined_df = self.prepare_target_variable(combined_df)
            
            # 8. Normalize features
            combined_df = self.normalize_features(combined_df)
            
            # 9. Split data
            X_train, X_val, X_test, y_train, y_val, y_test = self.split_data(combined_df)
            
            # 10. Apply data augmentation
            X_train_aug, y_train_aug = self.augment_data(X_train, y_train, augmentation_method)
            
            # 11. Save processed data
            datasets_to_save = {
                'train': (X_train_aug, y_train_aug),
                'validation': (X_val, y_val),
                'test': (X_test, y_test),
                'full_processed': combined_df
            }
            self.save_processed_data(datasets_to_save)
            
            # 12. Save scalers and encoders
            self.save_scalers_and_encoders()
            
            # 13. Generate report
            self.generate_data_report(original_df, combined_df)
            
            print("🎉 Preprocessing pipeline completed successfully!")
            
            return {
                'train': (X_train_aug, y_train_aug),
                'validation': (X_val, y_val), 
                'test': (X_test, y_test),
                'processed_data': combined_df,
                'scalers': self.scalers,
                'encoders': self.encoders
            }
            
        except Exception as e:
            print(f"❌ Error in preprocessing pipeline: {str(e)}")
            raise

def main():
    """Main execution function"""
    print("🌌 NASA Exoplanet Data Preprocessing")
    print("=" * 60)
    
    # Initialize preprocessor
    preprocessor = ExoplanetDataPreprocessor()
    
    # Run preprocessing pipeline
    results = preprocessor.run_preprocessing_pipeline(augmentation_method='smote')
    
    print("\n✅ All preprocessing tasks completed!")
    print("📁 Check the following directories for outputs:")
    print(f"   📂 Processed data: data/processed/")
    print(f"   🔧 Scalers: data/scalers/")
    print(f"   📊 Report: data/processed/preprocessing_report.json")

if __name__ == "__main__":
    main()