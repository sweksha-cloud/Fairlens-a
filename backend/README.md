# FairLens-A

A comprehensive bias detection system with FastAPI backend for analyzing statistical bias in datasets.

## 🎯 Features

- **Statistical Bias Detection**: Comprehensive analysis of dataset bias including:
  - Skewness analysis for numerical features
  - Class imbalance detection
  - Representation bias across sensitive attributes
  - Correlation bias between sensitive attributes and target variables

- **RESTful API**: Easy-to-use FastAPI endpoints for bias analysis
- **Multiple Input Formats**: Support for both CSV files and JSON data
- **Detailed Reports**: Comprehensive bias reports with actionable insights

## 🚀 Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sweksha-cloud/Fairlens-a.git
cd FairLens-A
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the API

Start the FastAPI server:
```bash
python app.py
```

Or use uvicorn directly:
```bash
uvicorn app:app --reload
```

The API will be available at `http://localhost:8000`

### Testing the API

Run the test script:
```bash
python test_api.py
```

## 📚 Documentation

- **API Documentation**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed endpoint information
- **Interactive Docs**: Visit `http://localhost:8000/docs` when the server is running
- **ReDoc**: Visit `http://localhost:8000/redoc` for alternative documentation

## 💻 Usage Examples

### Python Client

```python
import requests

# Analyze a dataset
url = "http://localhost:8000/analyze-bias-json"
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

response = requests.post(url, json=data)
print(response.json())
```

### cURL

```bash
curl -X POST "http://localhost:8000/analyze-bias-csv" \
  -F "file=@dataset.csv" \
  -F "target_column=outcome" \
  -F "sensitive_attributes=race,gender"
```

## 🔍 What Bias Does It Detect?

1. **Skewness Bias**: Identifies highly skewed distributions in numerical features
2. **Class Imbalance**: Detects severe imbalances in target variable classes
3. **Representation Bias**: Flags underrepresented groups in sensitive attributes
4. **Correlation Bias**: Identifies significant correlations between sensitive attributes and outcomes

## 👥 Team

- **Dhananjay Surti** - Statistical Method Implementation
- **Sid** - Unsupervised Learning Method
- **Grace** - Unsupervised Learning Method

## 📄 License

This project is part of the FairLens fairness analysis toolkit.