import pandas as pd
from main import statistical_method, unsupervised_analytics

# --- Make a tiny dummy dataset ---
data = pd.DataFrame({
    "age":   [22, 25, 30, 45, 50, 60, 19, 23, 40, 70],
    "income": [30_000, 35_000, 40_000, 80_000, 90_000, 100_000, 25_000, 32_000, 70_000, 110_000],
    "gender": ["F","F","M","M","M","M","F","F","M","M"],
    "race":   ["A","A","A","B","B","B","A","B","C","C"],
    "label":  [0,0,1,1,1,1,0,0,1,1]  # pretend this is your target
})

# --- Test the existing statistical method ---
stat_report = statistical_method(
    data=data,
    target_column="label",
    sensitive_attributes=["gender", "race"],
    numerical_features=["age", "income"]
)

print("=== STATISTICAL METHOD REPORT ===")
print("Summary:", stat_report["summary"])
print("Detected issues:")
for issue in stat_report["detected_issues"]:
    print(" -", issue)

# --- Test the unsupervised method separately ---
unsup_report = unsupervised_analytics(
    data=data,
    sensitive_attributes=["gender", "race"],
    numerical_features=["age", "income"]
)

print("\n=== UNSUPERVISED ANALYSIS REPORT ===")
print("Status:", unsup_report["summary"]["status"])
print("Alerts:")
for alert in unsup_report["summary"]["alerts"]:
    print(" -", alert)
