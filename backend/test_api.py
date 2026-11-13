"""
Example script to test the FairLens Bias Detection API
"""
import requests
import pandas as pd
import io

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print("Health Check:", response.json())
    return response.status_code == 200

def test_with_sample_data():
    """Test API with sample dataset"""
    # Create sample dataset
    sample_data = {
        "income": [50000, 60000, 45000, 80000, 55000, 70000, 48000, 90000, 52000, 65000],
        "credit_score": [700, 650, 720, 680, 710, 690, 730, 660, 705, 695],
        "race": ["A", "B", "A", "B", "A", "B", "A", "B", "A", "B"],
        "gender": ["M", "F", "F", "M", "F", "M", "F", "M", "M", "F"],
        "outcome": [1, 0, 1, 0, 1, 1, 1, 0, 1, 0]
    }
    
    # Test with JSON endpoint
    print("\n" + "="*50)
    print("Testing JSON endpoint...")
    print("="*50)
    
    payload = {
        "data": sample_data,
        "request_params": {
            "target_column": "outcome",
            "sensitive_attributes": ["race", "gender"],
            "numerical_features": ["income", "credit_score"]
        }
    }
    
    response = requests.post(f"{BASE_URL}/analyze-bias-json", json=payload)
    
    if response.status_code == 200:
        result = response.json()
        print("\n✓ Analysis successful!")
        print(f"\nDataset Info:")
        print(f"  Rows: {result['dataset_info']['rows']}")
        print(f"  Columns: {result['dataset_info']['columns']}")
        
        bias_report = result['bias_report']
        print(f"\n📊 Bias Summary:")
        print(f"  Issues detected: {bias_report['summary']['total_issues_detected']}")
        print(f"  Severity: {bias_report['summary']['bias_severity']}")
        
        if bias_report['detected_issues']:
            print(f"\n⚠️  Detected Issues:")
            for issue in bias_report['detected_issues']:
                print(f"  - {issue}")
        
        return True
    else:
        print(f"✗ Error: {response.status_code}")
        print(response.json())
        return False

def test_with_csv_file():
    """Test API with CSV file"""
    # Create sample CSV
    sample_data = {
        "income": [50000, 60000, 45000, 80000, 55000, 70000, 48000, 90000, 52000, 65000],
        "credit_score": [700, 650, 720, 680, 710, 690, 730, 660, 705, 695],
        "race": ["A", "B", "A", "B", "A", "B", "A", "B", "A", "B"],
        "gender": ["M", "F", "F", "M", "F", "M", "F", "M", "M", "F"],
        "outcome": [1, 0, 1, 0, 1, 1, 1, 0, 1, 0]
    }
    
    df = pd.DataFrame(sample_data)
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_content = csv_buffer.getvalue()
    
    print("\n" + "="*50)
    print("Testing CSV endpoint...")
    print("="*50)
    
    files = {'file': ('test_data.csv', csv_content, 'text/csv')}
    params = {
        'target_column': 'outcome',
        'sensitive_attributes': 'race,gender',
        'numerical_features': 'income,credit_score'
    }
    
    response = requests.post(f"{BASE_URL}/analyze-bias-csv", files=files, params=params)
    
    if response.status_code == 200:
        result = response.json()
        print("\n✓ CSV analysis successful!")
        print(f"\nDataset Info:")
        print(f"  Rows: {result['dataset_info']['rows']}")
        print(f"  Columns: {result['dataset_info']['columns']}")
        return True
    else:
        print(f"✗ Error: {response.status_code}")
        print(response.json())
        return False

if __name__ == "__main__":
    print("="*50)
    print("FairLens Bias Detection API - Test Suite")
    print("="*50)
    print("\nMake sure the API is running at http://localhost:8000")
    print("Start it with: python app.py\n")
    
    try:
        # Run tests
        if test_health_check():
            print("✓ Health check passed")
        
        test_with_sample_data()
        test_with_csv_file()
        
        print("\n" + "="*50)
        print("Testing complete!")
        print("="*50)
        
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to API")
        print("Make sure the API is running: python app.py")
