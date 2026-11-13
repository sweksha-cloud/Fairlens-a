"""
Test script for the bias visualization API using the COMPAS dataset.
Make sure the API is running: python app.py
"""
import requests
import base64
import os

BASE_URL = "http://localhost:8000"

print("="*80)
print("Bias Visualization API Test - COMPAS Dataset")
print("="*80)

# ---------------------------------------------------------
# 1. Health Check
# ---------------------------------------------------------
print("\n1. Testing health endpoint...")
try:
    response = requests.get(f"{BASE_URL}/health")
    if response.status_code == 200:
        print("   API is running successfully.")
    else:
        print("   Health check failed.")
        print(response.text)
        exit(1)
except Exception as e:
    print("   Error: Could not connect to API.", e)
    exit(1)

# ---------------------------------------------------------
# 2. Upload CSV and Trigger Visualization
# ---------------------------------------------------------
print("\n2. Uploading COMPAS dataset and running visualization...")

csv_path = "/Users/dhananjaysurti/Downloads/archive/compas-scores-raw.csv"

if not os.path.exists(csv_path):
    print(f"   Error: CSV file not found at {csv_path}")
    exit(1)

files = {"file": ("compas.csv", open(csv_path, "rb"), "text/csv")}

response = requests.post(f"{BASE_URL}/visualize-bias-csv", files=files)

if response.status_code != 200:
    print("   API returned an error:", response.status_code)
    print(response.text)
    exit(1)

print("   Visualization completed successfully.")

result = response.json()

# ---------------------------------------------------------
# 3. Print Bias Metrics
# ---------------------------------------------------------
print("\nBias Metrics:")
for key, value in result["bias_metrics"].items():
    print(f"   {key}: {value}")

# ---------------------------------------------------------
# 4. Save Returned Images
# ---------------------------------------------------------
output_dir = "bias_output_images"
os.makedirs(output_dir, exist_ok=True)

print("\nSaving generated diagrams...")

for i, img_base64 in enumerate(result["images"]):
    img_bytes = base64.b64decode(img_base64)
    path = os.path.join(output_dir, f"bias_plot_{i+1}.png")

    with open(path, "wb") as f:
        f.write(img_bytes)

    print(f"   Saved: {path}")

print("\n" + "="*80)
print("Test Completed")
print("="*80)