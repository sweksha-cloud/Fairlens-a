"""
Example script to analyze the COMPAS dataset for bias detection
"""
import pandas as pd
from main import statistical_method
import json

# Load the COMPAS dataset
print("Loading COMPAS dataset...")
df = pd.read_csv('/Users/dhananjaysurti/Downloads/archive/compas-scores-raw.csv')

print(f"Dataset loaded: {len(df)} rows, {len(df.columns)} columns")
print(f"\nColumns: {df.columns.tolist()}\n")

# Display basic info about the dataset
print("First few rows:")
print(df.head())
print("\n" + "="*80 + "\n")

# Run bias analysis with your statistical_method
print("🔍 Running Bias Analysis...")
print("="*80)

# Key columns for COMPAS analysis:
# - DecileScore: Risk score (1-10)
# - ScoreText: Low/Medium/High risk classification
# - Sex_Code_Text: Gender (Male/Female)
# - Ethnic_Code_Text: Race/Ethnicity
# - RawScore: Raw risk score (numerical)

bias_report = statistical_method(
    data=df,
    target_column='ScoreText',  # Target: Low/Medium/High risk classification
    sensitive_attributes=['Sex_Code_Text', 'Ethnic_Code_Text'],  # Protected attributes
    numerical_features=['DecileScore', 'RawScore']  # Numerical features to check for skewness
)

# Display results
print("\n📊 BIAS ANALYSIS RESULTS")
print("="*80)

# Summary
print("\n🎯 SUMMARY:")
print(f"  Total Issues Detected: {bias_report['summary']['total_issues_detected']}")
print(f"  Bias Severity: {bias_report['summary']['bias_severity'].upper()}")

# Detected Issues
if bias_report['detected_issues']:
    print("\n⚠️  DETECTED ISSUES:")
    for i, issue in enumerate(bias_report['detected_issues'], 1):
        print(f"  {i}. {issue}")
else:
    print("\n✅ No major bias issues detected!")

# Skewness Analysis
print("\n📈 SKEWNESS ANALYSIS:")
for feature, analysis in bias_report['skewness_analysis'].items():
    print(f"  {feature}:")
    print(f"    - Skewness: {analysis['skewness']:.3f}")
    print(f"    - Interpretation: {analysis['interpretation']}")

# Class Imbalance
if bias_report['class_imbalance']:
    print("\n⚖️  CLASS IMBALANCE:")
    print(f"  Imbalance Ratio: {bias_report['class_imbalance']['imbalance_ratio']:.2f}")
    print("  Class Distribution:")
    for class_label, count in bias_report['class_imbalance']['class_counts'].items():
        proportion = bias_report['class_imbalance']['class_proportions'][class_label]
        print(f"    - {class_label}: {count} ({proportion:.1%})")

# Representation Bias
if bias_report['representation_bias']:
    print("\n👥 REPRESENTATION BIAS:")
    for attr, analysis in bias_report['representation_bias'].items():
        print(f"  {attr}:")
        print(f"    Representation Ratio: {analysis['representation_ratio']:.2f}")
        print("    Distribution:")
        for group, count in analysis['counts'].items():
            proportion = analysis['proportions'][group]
            print(f"      - {group}: {count} ({proportion:.1%})")

# Correlation Bias
if bias_report['correlation_bias']:
    print("\n🔗 CORRELATION BIAS (Chi-Square Tests):")
    for attr, analysis in bias_report['correlation_bias'].items():
        print(f"  {attr}:")
        print(f"    - Chi-square: {analysis['chi2_statistic']:.2f}")
        print(f"    - P-value: {analysis['p_value']:.4f}")
        print(f"    - Significant Correlation: {'YES ⚠️' if analysis['is_correlated'] else 'No'}")

print("\n" + "="*80)
print("Analysis complete!")

# Save report to JSON file
output_file = '/Users/dhananjaysurti/personal/FairLens-A/compas_bias_report.json'
with open(output_file, 'w') as f:
    json.dump(bias_report, f, indent=2)
print(f"\n💾 Full report saved to: {output_file}")
