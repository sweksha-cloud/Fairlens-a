"""
Example script to test the FairLens API with COMPAS dataset
Make sure to run 'python app.py' in another terminal first!
"""
import requests
import pandas as pd

# API URL
BASE_URL = "http://localhost:8000"

print("="*80)
print("FairLens API - COMPAS Dataset Analysis")
print("="*80)
print("\n⚠️  Make sure the API is running: python app.py\n")

# Test 1: Health check
print("1️⃣  Testing health check...")
try:
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        print("   ✅ API is healthy!")
    else:
        print("   ❌ API health check failed")
        exit(1)
except requests.exceptions.ConnectionError:
    print("   ❌ Cannot connect to API. Please run: python app.py")
    exit(1)

# Test 2: Analyze COMPAS dataset via CSV upload
print("\n2️⃣  Analyzing COMPAS dataset via CSV upload...")
csv_path = '/Users/dhananjaysurti/Downloads/archive/compas-scores-raw.csv'

with open(csv_path, 'rb') as f:
    files = {'file': ('compas-scores-raw.csv', f, 'text/csv')}
    params = {
        'target_column': 'ScoreText',
        'sensitive_attributes': 'Sex_Code_Text,Ethnic_Code_Text',
        'numerical_features': 'DecileScore,RawScore'
    }
    
    print("   Uploading file and analyzing...")
    response = requests.post(f"{BASE_URL}/analyze-bias-csv", files=files, params=params)

if response.status_code == 200:
    result = response.json()
    print("   ✅ Analysis complete!")
    
    # Display results
    print("\n" + "="*80)
    print("📊 ANALYSIS RESULTS")
    print("="*80)
    
    # Dataset info
    dataset_info = result['dataset_info']
    print(f"\n📁 Dataset Info:")
    print(f"   Rows: {dataset_info['rows']:,}")
    print(f"   Columns: {dataset_info['columns']}")
    
    # Bias report summary
    bias_report = result['bias_report']
    summary = bias_report['summary']
    print(f"\n🎯 Summary:")
    print(f"   Issues Detected: {summary['total_issues_detected']}")
    print(f"   Bias Severity: {summary['bias_severity'].upper()}")
    
    # Show detected issues
    if bias_report['detected_issues']:
        print(f"\n⚠️  Detected Issues ({len(bias_report['detected_issues'])}):")
        for i, issue in enumerate(bias_report['detected_issues'], 1):
            print(f"   {i}. {issue}")
    
    # Show skewness analysis
    if bias_report.get('skewness_analysis'):
        print(f"\n📈 Skewness Analysis:")
        for feature, analysis in bias_report['skewness_analysis'].items():
            print(f"   {feature}: {analysis['skewness']:.3f} ({analysis['interpretation']})")
    
    # Show class imbalance
    if bias_report.get('class_imbalance'):
        print(f"\n⚖️  Class Imbalance:")
        print(f"   Ratio: {bias_report['class_imbalance']['imbalance_ratio']:.2f}")
        for class_name, proportion in bias_report['class_imbalance']['class_proportions'].items():
            print(f"   {class_name}: {proportion:.1%}")
    
    # Show representation bias
    if bias_report.get('representation_bias'):
        print(f"\n👥 Representation Bias:")
        for attr, analysis in bias_report['representation_bias'].items():
            print(f"   {attr} - Ratio: {analysis['representation_ratio']:.2f}")
            for group, proportion in analysis['proportions'].items():
                print(f"     • {group}: {proportion:.1%}")
    
    # Show correlation bias
    if bias_report.get('correlation_bias'):
        print(f"\n🔗 Correlation Bias:")
        for attr, analysis in bias_report['correlation_bias'].items():
            correlated = "YES ⚠️" if analysis['is_correlated'] else "No"
            print(f"   {attr}:")
            print(f"     Chi²: {analysis['chi2_statistic']:.2f}")
            print(f"     P-value: {analysis['p_value']:.4f}")
            print(f"     Correlated: {correlated}")
    
    print("\n" + "="*80)
    
    # Save full response
    import json
    output_file = '/Users/dhananjaysurti/personal/FairLens-A/api_compas_report.json'
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)
    print(f"💾 Full API response saved to: {output_file}")
    
else:
    print(f"   ❌ Error: {response.status_code}")
    print(f"   {response.text}")

print("\n" + "="*80)
print("Testing complete!")
print("="*80)
