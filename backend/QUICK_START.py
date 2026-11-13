"""
Quick Start Guide - Running the FairLens API
"""

print("""
╔════════════════════════════════════════════════════════════════╗
║           FairLens-A Bias Detection API - Quick Start          ║
╔════════════════════════════════════════════════════════════════╗

✅ Dependencies installed successfully!

📝 What you've got:
  
  1. app.py - FastAPI application with bias detection endpoints
  2. main.py - Core statistical method for bias detection
  3. test_api.py - Test script to verify the API
  4. requirements.txt - All dependencies
  5. API_DOCUMENTATION.md - Complete API documentation

🚀 To start the API:

  Terminal 1:
  $ python app.py
  
  (or use: uvicorn app:app --reload)

🧪 To test the API:

  Terminal 2 (while API is running):
  $ python test_api.py

📚 Available Endpoints:

  GET  /              - Welcome message
  GET  /health        - Health check
  POST /analyze-bias-csv  - Upload CSV for analysis
  POST /analyze-bias-json - Send JSON data for analysis

📖 View Interactive Documentation:

  Once running, visit:
  • Swagger UI: http://localhost:8000/docs
  • ReDoc:     http://localhost:8000/redoc

💡 Quick Example (in Python):

  import requests
  
  data = {
      "data": {
          "income": [50000, 60000, 45000, 80000],
          "race": ["A", "B", "A", "B"],
          "outcome": [1, 0, 1, 0]
      },
      "request_params": {
          "target_column": "outcome",
          "sensitive_attributes": ["race"],
          "numerical_features": ["income"]
      }
  }
  
  response = requests.post(
      "http://localhost:8000/analyze-bias-json",
      json=data
  )
  print(response.json())

🎯 What It Detects:

  ✓ Skewness in numerical features
  ✓ Class imbalance in target variable
  ✓ Underrepresentation in sensitive groups
  ✓ Correlation between sensitive attributes and outcomes

Ready to go! Run 'python app.py' to start the server.
╚════════════════════════════════════════════════════════════════╝
""")
