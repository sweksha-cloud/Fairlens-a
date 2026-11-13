# How to Use FairLens with COMPAS Dataset

## Quick Start Summary

Your FairLens bias detection system is ready to use with the COMPAS dataset! Here are three ways to use it:

## ✅ Analysis Complete!

The quick analysis just showed **5 major bias issues** in the COMPAS dataset:

1. **High Skewness** in RawScore feature
2. **Class Imbalance** - 64% Low risk, only 13% High risk
3. **Underrepresentation** - Some ethnic groups < 10%
4. **Gender Correlation** - Significant bias (p=0.000024)
5. **Race Correlation** - Significant bias (p<0.000001)

---

## Method 1: Direct Python Script (Fastest)

### Quick Sample Analysis (5,000 rows):
```bash
python quick_compas_analysis.py
```
✅ **Just ran this!** Results saved to `compas_sample_report.json`

### Full Dataset Analysis (60,000+ rows):
```bash
python analyze_compas.py
```
⚠️ Takes longer due to large dataset size

---

## Method 2: Using FastAPI (Recommended for Production)

### Step 1: Start the API server
Open Terminal 1:
```bash
python app.py
```
The API will run at `http://localhost:8000`

### Step 2: Test with COMPAS dataset
Open Terminal 2:
```bash
python test_compas_api.py
```

### Step 3: View interactive docs
Visit in browser: `http://localhost:8000/docs`

---

## Method 3: Custom Python Code

```python
import pandas as pd
from main import statistical_method

# Load your data
df = pd.read_csv('/path/to/your/dataset.csv')

# Run analysis
bias_report = statistical_method(
    data=df,
    target_column='ScoreText',              # Your target variable
    sensitive_attributes=['Sex_Code_Text', 'Ethnic_Code_Text'],  # Protected attributes
    numerical_features=['DecileScore', 'RawScore']  # Numerical features
)

# Use the results
print(f"Issues found: {bias_report['summary']['total_issues_detected']}")
```

---

## Key Files Created

- ✅ `main.py` - Your bias detection function
- ✅ `app.py` - FastAPI application
- ✅ `quick_compas_analysis.py` - Sample analysis (5k rows)
- ✅ `analyze_compas.py` - Full analysis (60k rows)
- ✅ `test_compas_api.py` - API testing script
- ✅ `compas_sample_report.json` - Results from sample analysis

---

## COMPAS Dataset Info

**Location:** `/Users/dhananjaysurti/Downloads/archive/compas-scores-raw.csv`

**Key Columns:**
- `ScoreText` - Risk classification (Low/Medium/High) - **TARGET**
- `Sex_Code_Text` - Gender (Male/Female) - **SENSITIVE**
- `Ethnic_Code_Text` - Race/Ethnicity - **SENSITIVE**
- `DecileScore` - Risk score 1-10 - **NUMERICAL**
- `RawScore` - Raw risk score - **NUMERICAL**

**Size:** 60,843 rows × 28 columns

---

## What Your Code Detects

### 1. **Skewness Analysis** 📈
Identifies highly skewed distributions in numerical features

### 2. **Class Imbalance** ⚖️
Detects severe imbalances in target variable (ratio > 3)

### 3. **Representation Bias** 👥
Flags underrepresented groups (<10% representation)

### 4. **Correlation Bias** 🔗
Chi-square tests between sensitive attributes and target (p < 0.05)

---

## Results Summary from Sample (5,000 rows)

### 🎯 Issues Detected: 5 (HIGH SEVERITY)

1. **RawScore** is highly skewed (1.029)
2. **Class imbalance** ratio of 5.0 (Low:63.9%, High:12.8%)
3. **Ethnic groups** severely underrepresented
4. **Gender** significantly correlated with risk score (p=0.000024)
5. **Race** significantly correlated with risk score (p<0.000001)

### Gender Distribution:
- Male: 80.7%
- Female: 19.3%

### Race Distribution:
- African-American: 49.2%
- Caucasian: 33.8%
- Hispanic: 11.4%
- Other groups: <5%

---

## Next Steps

### For Full Analysis:
```bash
python analyze_compas.py
```

### For API Usage:
```bash
# Terminal 1
python app.py

# Terminal 2 (new terminal)
python test_compas_api.py
```

### To Modify Analysis:
Edit the parameters in any script:
```python
bias_report = statistical_method(
    data=df,
    target_column='YourTargetColumn',
    sensitive_attributes=['Attribute1', 'Attribute2'],
    numerical_features=['Feature1', 'Feature2']
)
```

---

## Documentation

- **Full API docs:** See `API_DOCUMENTATION.md`
- **Project info:** See `README.md`
- **Interactive docs:** `http://localhost:8000/docs` (when API is running)

---

**Ready to go!** 🚀
