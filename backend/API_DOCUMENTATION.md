# FairLens-A: Bias Detection API

A FastAPI-based service for detecting statistical bias in datasets.

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Run the API:**
```bash
python app.py
```

Or using uvicorn directly:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

## Endpoints

### 1. Root Endpoint
- **URL:** `GET /`
- **Description:** Welcome message and API information

### 2. Health Check
- **URL:** `GET /health`
- **Description:** Check if API is running

### 3. Analyze CSV File
- **URL:** `POST /analyze-bias-csv`
- **Description:** Upload a CSV file for bias analysis
- **Parameters:**
  - `file`: CSV file (required)
  - `target_column`: Name of target column (optional)
  - `sensitive_attributes`: Comma-separated list of sensitive attributes (optional)
  - `numerical_features`: Comma-separated list of numerical features (optional)

### 4. Analyze JSON Data
- **URL:** `POST /analyze-bias-json`
- **Description:** Send JSON data for bias analysis
- **Body:** JSON object containing dataset and parameters

## Example Usage

### Using cURL with CSV:

```bash
curl -X POST "http://localhost:8000/analyze-bias-csv" \
  -F "file=@your_dataset.csv" \
  -F "target_column=outcome" \
  -F "sensitive_attributes=race,gender,age" \
  -F "numerical_features=income,credit_score"
```

### Using Python requests with CSV:

```python
import requests

url = "http://localhost:8000/analyze-bias-csv"

files = {'file': open('your_dataset.csv', 'rb')}
params = {
    'target_column': 'outcome',
    'sensitive_attributes': 'race,gender,age',
    'numerical_features': 'income,credit_score'
}

response = requests.post(url, files=files, params=params)
print(response.json())
```

### Using Python requests with JSON:

```python
import requests

url = "http://localhost:8000/analyze-bias-json"

data = {
    "data": {
        "income": [50000, 60000, 45000, 80000],
        "credit_score": [700, 650, 720, 680],
        "race": ["A", "B", "A", "B"],
        "gender": ["M", "F", "F", "M"],
        "outcome": [1, 0, 1, 0]
    },
    "request_params": {
        "target_column": "outcome",
        "sensitive_attributes": ["race", "gender"],
        "numerical_features": ["income", "credit_score"]
    }
}

response = requests.post(url, json=data)
print(response.json())
```

## Response Format

```json
{
  "status": "success",
  "dataset_info": {
    "rows": 1000,
    "columns": 5,
    "column_names": ["income", "credit_score", "race", "gender", "outcome"]
  },
  "bias_report": {
    "skewness_analysis": {
      "income": {
        "skewness": 1.23,
        "interpretation": "highly skewed"
      }
    },
    "class_imbalance": {
      "class_counts": {"0": 300, "1": 700},
      "class_proportions": {"0": 0.3, "1": 0.7},
      "imbalance_ratio": 2.33
    },
    "representation_bias": {
      "race": {
        "counts": {"A": 500, "B": 500},
        "proportions": {"A": 0.5, "B": 0.5}
      }
    },
    "correlation_bias": {
      "race": {
        "chi2_statistic": 15.2,
        "p_value": 0.0001,
        "is_correlated": true
      }
    },
    "detected_issues": [
      "HIGH SKEWNESS: Feature 'income' has skewness of 1.230",
      "CORRELATION BIAS: Sensitive attribute 'race' is significantly correlated with target (p=0.0001)"
    ],
    "summary": {
      "total_issues_detected": 2,
      "bias_severity": "low"
    }
  }
}
```

## Bias Metrics Explained

- **Skewness:** Measures asymmetry of distribution
  - |skew| > 1: Highly skewed
  - |skew| > 0.5: Moderately skewed
  - |skew| < 0.5: Roughly symmetric

- **Class Imbalance:** Ratio of largest to smallest class
  - Ratio > 3: Flagged as severe imbalance

- **Representation Bias:** Distribution across sensitive groups
  - Groups < 10%: Flagged as underrepresented

- **Correlation Bias:** Chi-square test between sensitive attributes and target
  - p < 0.05: Significant correlation detected

## Development

To contribute or modify:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request
