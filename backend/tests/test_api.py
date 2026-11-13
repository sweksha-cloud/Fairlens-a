"""Tests for the FairLens bias-detection API.

Runs against the app in-process with FastAPI's TestClient, so no server needs to be running.
"""
import io
import os
import sys

import pandas as pd
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app  # noqa: E402

client = TestClient(app)

SAMPLE_DATA = {
    "income": [50000, 60000, 45000, 80000, 55000, 70000, 48000, 90000, 52000, 65000],
    "credit_score": [700, 650, 720, 680, 710, 690, 730, 660, 705, 695],
    "race": ["A", "B", "A", "B", "A", "B", "A", "B", "A", "B"],
    "gender": ["M", "F", "F", "M", "F", "M", "F", "M", "M", "F"],
    "outcome": [1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
}


def _csv_bytes(data=SAMPLE_DATA):
    buf = io.StringIO()
    pd.DataFrame(data).to_csv(buf, index=False)
    return buf.getvalue().encode("utf-8")


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_root_lists_endpoints():
    response = client.get("/")
    assert response.status_code == 200
    assert "/analyze-bias-csv" in response.json()["endpoints"]


def test_analyze_json():
    payload = {
        "data": SAMPLE_DATA,
        "request_params": {
            "target_column": "outcome",
            "sensitive_attributes": ["race", "gender"],
            "numerical_features": ["income", "credit_score"],
        },
    }
    response = client.post("/analyze-bias-json", json=payload)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["dataset_info"]["rows"] == 10
    assert body["dataset_info"]["columns"] == 5
    summary = body["bias_report"]["summary"]
    assert "total_issues_detected" in summary
    assert "bias_severity" in summary


def test_analyze_csv():
    response = client.post(
        "/analyze-bias-csv",
        files={"file": ("test_data.csv", _csv_bytes(), "text/csv")},
        data={
            "target_column": "outcome",
            "sensitive_attributes": "race,gender",
            "numerical_features": "income,credit_score",
        },
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["status"] == "success"
    assert body["dataset_info"]["rows"] == 10
    assert body["dataset_info"]["column_names"] == list(SAMPLE_DATA)


def test_analyze_csv_flags_underrepresented_group():
    # Group "B" is 1 of 20 rows (5%), below the 10% representation threshold.
    data = {
        "income": list(range(40000, 60000, 1000)),
        "group": ["A"] * 19 + ["B"],
        "outcome": [0, 1] * 10,
    }
    response = client.post(
        "/analyze-bias-csv",
        files={"file": ("skewed.csv", _csv_bytes(data), "text/csv")},
        data={"target_column": "outcome", "sensitive_attributes": "group"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["bias_report"]["summary"]["total_issues_detected"] >= 1


def test_analyze_csv_rejects_non_csv():
    response = client.post(
        "/analyze-bias-csv",
        files={"file": ("bad.csv", b"\xff\xfe\x00not-utf8", "text/csv")},
    )
    assert response.status_code == 400
