import os

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
import io
from main import statistical_method, unsupervised_analytics

app = FastAPI(
    title="Fairlens Bias Detection API",
    description="API for detecting statistical bias in datasets",
    version="1.0.0"
)

# Allow the frontend (dev server + deployed origin) to call the API from the browser.
# Set ALLOWED_ORIGINS as a comma-separated list in production.
_default_origins = "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173"
allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", _default_origins).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BiasAnalysisRequest(BaseModel): 
    """Request model for bias analysis with JSON data"""
    target_column: Optional[str] = None
    sensitive_attributes: Optional[List[str]] = None
    numerical_features: Optional[List[str]] = None

@app.get("/")
async def root(): 
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Fairlens Bias Detection API",
        "endpoints": {
            "/analyze-bias-csv": "Upload CSV file for bias analysis",
            "/analyze-bias-json": "Send JSON data for bias analysis", 
            "/health": "Health check endpoint"
        }
    }

@app.get("/health")
async def health_check(): 
    """Health check andpoint"""
    return {"status": "healthy"}

@app.post("/analyze-bias-csv")
async def analyze_bias_csv(
    file: UploadFile = File(...),
    target_column: Optional[str] = Form(None),
    sensitive_attributes: Optional[str] = Form(None),
    numerical_features: Optional[str] = Form(None),
):

    """
    Analyze bias in a CSV dataset.

    Multipart form fields:
    - file: CSV file to analyze
    - target_column: Name of target/label column
    - sensitive_attributes: Comma-separated list of sensitive attribute columns
    - numerical_features: Comma-separated list of numerical feature columns

    Returns:
    - Comprehensive bias analysis report
    """
    try: 
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))

        # Parse comma-separated lists
        sensitive_attrs = sensitive_attributes.split(',') if sensitive_attributes else None
        numerical_feats = numerical_features.split(',') if numerical_features else None

        # Run bias analysis
        bias_report = statistical_method(
            data=df, 
            target_column=target_column,
            sensitive_attributes=sensitive_attrs, 
            numerical_features=numerical_feats 
        )

        # Convert numpy types to Python native types for JSON serialization
        bias_report = convert_to_serializable(bias_report)

        return JSONResponse(content={
            "status": "success", 
            "dataset_info": {
                "rows": len(df), 
                "columns": len(df.columns),
                "column_names": df.columns.tolist()
            }, 
            "bias_report": bias_report

        })

    except Exception as e: 
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@app.post("/analyze-bias-json")
async def analize_bias_json(
    data: dict, 
    request_params: BiasAnalysisRequest
): 
    """
    Analyze bias in JSON dataset

    Parameters: 
    - data: Dictionary containing dataset (list of records or dict of lists)
    - request_params: Analysis parameters (target_column, sensitive_sttributes, numerical_features)

    Returns: 
    - Comprehensive bias analysis report
    """
    try: 
        # Convert JSON to DataFrame
        df = pd.DataFrame(data)

        #Run bias analysis
        bias_report = statistical_method(
            data=df, 
            target_column=request_params.target_column, 
            sensitive_attributes=request_params.sensitive_attributes,
            numerical_features=request_params.numerical_features 
        )

        # Convert numpy types to Python native types for JSON serialization
        bias_report = convert_to_serializable(bias_report)

        return JSONResponse(content={
            "status": "success", 
            "dataset_info": {
                "rows": len(df),
                "columns": len(df.columns), 
                "column_names": df.columns.tolist()
            },
            "bias_report": bias_report
        })

    except Exception as e: 
        raise HTTPException(status_code=400, detail=f"Error processing data: {str(e)}")

def convert_to_serializable(obj): 
    """Convert numpy/pandas types to Python native types for JSON serialization"""
    import numpy as np

    if isinstance(obj, dict): 
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list): 
        return [convert_to_serializable(item) for item in obj]
    elif isinstance(obj, np.integer): 
        return int(obj)
    elif isinstance(obj, np.floating): 
        return float(obj)
    elif isinstance(obj, np.ndarray): 
        return obj.tolist()
    elif pd.isna(obj): 
        return None
    else: 
        return obj

if __name__ == "__main__": 
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)