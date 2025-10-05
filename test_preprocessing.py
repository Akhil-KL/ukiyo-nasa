#!/usr/bin/env python3
"""
Quick test script for NASA Exoplanet Data Preprocessing
======================================================

This script runs a quick test of the preprocessing pipeline
with a subset of data to verify everything works correctly.
"""

import sys
import os
from pathlib import Path

# Add the current directory to the path
sys.path.append(str(Path(__file__).parent))

try:
    from data_preprocessing import ExoplanetDataPreprocessor
    import pandas as pd
    import numpy as np
    
    def quick_test():
        """Run a quick test of the preprocessing pipeline"""
        print("🧪 Running Quick Test of NASA Exoplanet Preprocessing Pipeline")
        print("=" * 70)
        
        # Check if data files exist
        data_dir = Path("data/raw")
        required_files = [
            "K2 Planets and Candidate.csv",
            "Kepler Objects of Interest(KOI).csv", 
            "TESS Objects of Interest(TOI).csv"
        ]
        
        print("📂 Checking for required data files...")
        missing_files = []
        for file in required_files:
            filepath = data_dir / file
            if filepath.exists():
                print(f"   ✅ Found: {file}")
            else:
                print(f"   ❌ Missing: {file}")
                missing_files.append(file)
        
        if missing_files:
            print(f"\n❌ Error: Missing {len(missing_files)} required data files")
            print("Please ensure all NASA dataset files are in the data/raw/ directory")
            return False
        
        # Initialize preprocessor
        print("\n🔧 Initializing preprocessor...")
        preprocessor = ExoplanetDataPreprocessor()
        
        # Test data loading
        print("\n📥 Testing data loading...")
        try:
            datasets = preprocessor.load_datasets()
            print(f"   ✅ Successfully loaded {len(datasets)} datasets")
            
            # Show dataset sizes
            for name, df in datasets.items():
                print(f"      {name.upper()}: {len(df):,} records, {len(df.columns)} columns")
                
        except Exception as e:
            print(f"   ❌ Error loading datasets: {e}")
            return False
        
        # Test harmonization
        print("\n🔄 Testing data harmonization...")
        try:
            combined_df = preprocessor.harmonize_datasets(datasets)
            print(f"   ✅ Successfully harmonized data: {len(combined_df):,} total records")
            
            # Show combined data info
            print(f"      Combined columns: {len(combined_df.columns)}")
            print(f"      Missing values: {combined_df.isnull().sum().sum():,}")
            
        except Exception as e:
            print(f"   ❌ Error harmonizing datasets: {e}")
            return False
        
        # Test basic preprocessing steps
        print("\n🧹 Testing basic preprocessing...")
        try:
            # Clean data
            cleaned_df = preprocessor.clean_and_prepare_data(combined_df.copy())
            print(f"   ✅ Data cleaning: {len(cleaned_df):,} records remaining")
            
            # Feature engineering
            engineered_df = preprocessor.feature_engineering(cleaned_df.copy())
            print(f"   ✅ Feature engineering: {len(engineered_df.columns)} total columns")
            
            # Show disposition distribution
            if 'disposition' in engineered_df.columns:
                disp_counts = engineered_df['disposition'].value_counts()
                print("   📊 Disposition distribution:")
                for disp, count in disp_counts.head().items():
                    print(f"      {disp}: {count:,}")
            
        except Exception as e:
            print(f"   ❌ Error in basic preprocessing: {e}")
            return False
        
        print("\n🎉 Quick test completed successfully!")
        print("✅ All basic preprocessing functions are working correctly")
        print("\n🚀 Ready to run full preprocessing pipeline with:")
        print("   python data_preprocessing.py")
        
        return True
    
    def run_full_pipeline():
        """Run the full preprocessing pipeline"""
        print("🚀 Running Full NASA Exoplanet Preprocessing Pipeline")
        print("=" * 70)
        
        try:
            preprocessor = ExoplanetDataPreprocessor()
            results = preprocessor.run_preprocessing_pipeline()
            return True
        except Exception as e:
            print(f"❌ Error in full pipeline: {e}")
            return False
    
    if __name__ == "__main__":
        if len(sys.argv) > 1 and sys.argv[1] == "--full":
            success = run_full_pipeline()
        else:
            success = quick_test()
        
        sys.exit(0 if success else 1)

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("\n🔧 Please install required packages:")
    print("   pip install -r preprocessing_requirements.txt")
    sys.exit(1)