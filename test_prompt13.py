#!/usr/bin/env python3
"""
Prompt 13 Test Script
Demonstrates the comprehensive prediction service implementation
"""

import requests
import json
import time
from datetime import datetime

# Service configuration
SERVICE_URL = "http://127.0.0.1:5001"

def test_health_endpoint():
    """Test the health endpoint"""
    print("🏥 Testing Health Endpoint...")
    try:
        response = requests.get(f"{SERVICE_URL}/health")
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Health check passed!")
            print(f"   Status: {health_data.get('status')}")
            print(f"   Model loaded: {health_data.get('model_loaded')}")
            print(f"   Features available: {health_data.get('features_available')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_model_info():
    """Test the model info endpoint"""
    print("\n📊 Testing Model Info Endpoint...")
    try:
        response = requests.get(f"{SERVICE_URL}/model/info")
        if response.status_code == 200:
            model_data = response.json()
            print("✅ Model info retrieved!")
            print(f"   Model type: {model_data.get('model_info', {}).get('model_type')}")
            print(f"   Features count: {model_data.get('features_count')}")
            print(f"   Target classes: {model_data.get('target_classes')}")
            print(f"   Model version: {model_data.get('model_version')}")
            return True
        else:
            print(f"❌ Model info failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Model info error: {e}")
        return False

def test_single_prediction():
    """Test single prediction with comprehensive data"""
    print("\n🔮 Testing Single Prediction...")
    
    # Test case 1: Earth-like planet
    earth_like_planet = {
        "planet_radius": 1.0,        # Earth radii
        "planet_mass": 1.0,          # Earth masses
        "orbital_period": 365.25,    # Days
        "semi_major_axis": 1.0,      # AU
        "equilibrium_temp": 288,     # Kelvin
        "stellar_temp": 5778,        # Kelvin (Sun-like)
        "stellar_radius": 1.0,       # Solar radii
        "stellar_mass": 1.0,         # Solar masses
        "discovery_year": 2024,
        "distance": 100,             # parsecs
        "disposition_score": 0.8,
        "transit_snr": 15.0,
        "transit_depth": 0.001,
        "transit_duration": 3.0
    }
    
    try:
        print("   Testing Earth-like planet...")
        response = requests.post(
            f"{SERVICE_URL}/predict", 
            json=earth_like_planet,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Single prediction successful!")
            print(f"   Prediction ID: {result.get('prediction_id')}")
            print(f"   Predictions: {result.get('predictions')}")
            print(f"   Confidence: {result.get('confidence')}")
            print(f"   Processing time: {result.get('metadata', {}).get('processing_time')}s")
            print(f"   Model version: {result.get('metadata', {}).get('model_version')}")
            
            # Show probabilities
            probabilities = result.get('probabilities', {})
            print("   Probabilities:")
            for class_name, prob in probabilities.items():
                print(f"     {class_name}: {prob:.3f}")
            
            return True
        else:
            print(f"❌ Single prediction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Single prediction error: {e}")
        return False

def test_batch_prediction():
    """Test batch prediction"""
    print("\n📦 Testing Batch Prediction...")
    
    # Multiple test planets
    planets = [
        {
            "planet_radius": 1.2,
            "orbital_period": 200,
            "stellar_temp": 5500,
            "discovery_year": 2023,
            "disposition_score": 0.9
        },
        {
            "planet_radius": 2.5,
            "orbital_period": 10,
            "stellar_temp": 6000,
            "discovery_year": 2022,
            "disposition_score": 0.3
        },
        {
            "planet_radius": 0.8,
            "orbital_period": 500,
            "stellar_temp": 4500,
            "discovery_year": 2024,
            "disposition_score": 0.7
        }
    ]
    
    try:
        response = requests.post(
            f"{SERVICE_URL}/predict/batch",
            json={"planets": planets},
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Batch prediction successful!")
            
            batch_summary = result.get('batch_summary', {})
            print(f"   Batch ID: {batch_summary.get('batch_id')}")
            print(f"   Total predictions: {batch_summary.get('total_predictions')}")
            print(f"   Successful: {batch_summary.get('successful_predictions')}")
            print(f"   Failed: {batch_summary.get('failed_predictions')}")
            print(f"   Processing time: {batch_summary.get('batch_processing_time')}s")
            
            # Show individual results
            predictions = result.get('predictions', [])
            print("   Individual Results:")
            for i, pred in enumerate(predictions):
                print(f"     Planet {i}: {pred.get('predictions', ['N/A'])[0]} (conf: {pred.get('confidence', [0])[0]:.3f})")
            
            return True
        else:
            print(f"❌ Batch prediction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Batch prediction error: {e}")
        return False

def test_error_handling():
    """Test error handling with invalid inputs"""
    print("\n🚨 Testing Error Handling...")
    
    # Test 1: Empty request
    try:
        response = requests.post(f"{SERVICE_URL}/predict", json={})
        if response.status_code == 400:
            print("✅ Empty request handled correctly (400)")
        else:
            print(f"❌ Empty request not handled properly: {response.status_code}")
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
    
    # Test 2: Invalid data types
    try:
        invalid_data = {"planet_radius": "not_a_number", "orbital_period": None}
        response = requests.post(f"{SERVICE_URL}/predict", json=invalid_data)
        if response.status_code == 400:
            print("✅ Invalid data types handled correctly (400)")
        else:
            print(f"❌ Invalid data types not handled properly: {response.status_code}")
    except Exception as e:
        print(f"❌ Invalid data test failed: {e}")

def test_prediction_history():
    """Test prediction history endpoint"""
    print("\n📚 Testing Prediction History...")
    try:
        response = requests.get(f"{SERVICE_URL}/predictions/history?limit=5")
        if response.status_code == 200:
            history = response.json()
            print("✅ Prediction history retrieved!")
            print(f"   Total predictions found: {history.get('count', 0)}")
            
            predictions = history.get('predictions', [])
            if predictions:
                print("   Recent predictions:")
                for pred in predictions[:3]:  # Show first 3
                    timestamp = pred.get('timestamp', 'Unknown')
                    pred_result = pred.get('prediction_result', {})
                    prediction = pred_result.get('predictions', ['Unknown'])[0]
                    print(f"     {timestamp}: {prediction}")
            else:
                print("   No predictions found in history")
            
            return True
        else:
            print(f"❌ Prediction history failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Prediction history error: {e}")
        return False

def main():
    """Run comprehensive tests for Prompt 13 implementation"""
    print("=" * 60)
    print("🧪 PROMPT 13 COMPREHENSIVE TEST SUITE")
    print("=" * 60)
    print("Testing ML Prediction Service Implementation:")
    print("✅ Load trained model")
    print("✅ Return JSON response: predictions, confidence, metadata")
    print("✅ Error handling for invalid inputs") 
    print("✅ Logging for debugging")
    print("✅ Save predictions in Data folder")
    print("=" * 60)
    
    # Wait for service to be ready
    print("⏳ Waiting for service to start...")
    time.sleep(3)
    
    # Run tests
    tests = [
        test_health_endpoint,
        test_model_info,
        test_single_prediction,
        test_batch_prediction,
        test_error_handling,
        test_prediction_history
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 60)
    print("🎯 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"✅ Tests passed: {passed}/{total}")
    print(f"❌ Tests failed: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Prompt 13 implementation is complete.")
    else:
        print("⚠️  Some tests failed. Check the service logs for details.")
    
    print("=" * 60)
    print("📁 Check data/predictions/ folder for saved prediction files")
    print("📝 Check ml_service.log for comprehensive service logs")
    print("=" * 60)

if __name__ == "__main__":
    main()