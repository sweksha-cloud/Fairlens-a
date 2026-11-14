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


def _report(data, **params):
    response = client.post(
        "/analyze-bias-csv",
        files={"file": ("d.csv", _csv_bytes(data), "text/csv")},
        data=params,
    )
    assert response.status_code == 200, response.text
    return response.json()["bias_report"]


def test_outcome_gap_between_groups_is_flagged_with_rates():
    # Group A approved 80%, group B approved 40%: a 40-point gap.
    data = {
        "group": ["A"] * 100 + ["B"] * 100,
        "approved": [1] * 80 + [0] * 20 + [1] * 40 + [0] * 60,
    }
    report = _report(data, target_column="approved", sensitive_attributes="group", numerical_features=",")
    corr = report["correlation_bias"]["group"]
    assert corr["is_correlated"] is True
    assert corr["outcome_rates"]["A"]["1"] == pytest.approx(0.8)
    assert corr["outcome_rates"]["B"]["1"] == pytest.approx(0.4)
    assert corr["max_rate_gap"] == pytest.approx(0.4)
    assert 0 < corr["cramers_v"] <= 1


def test_no_gap_is_not_flagged():
    data = {"group": ["A", "B"] * 100, "approved": [1, 1, 0, 0] * 50}
    report = _report(data, target_column="approved", sensitive_attributes="group", numerical_features=",")
    assert report["correlation_bias"]["group"]["is_correlated"] is False
    assert report["summary"]["bias_severity"] == "none detected"


def test_empty_numeric_selection_skips_skew_and_names_small_groups():
    data = {
        "id": list(range(100)),
        "group": ["A"] * 95 + ["B"] * 5,
        "approved": [0, 1] * 50,
    }
    report = _report(data, target_column="approved", sensitive_attributes="group", numerical_features=",")
    assert report["skewness_analysis"] == {}
    assert report["representation_bias"]["group"]["underrepresented_groups"] == {"B": pytest.approx(0.05)}


def test_continuous_target_skips_group_outcome_checks():
    data = {"score": [i * 1.5 for i in range(60)], "group": ["A", "B"] * 30}
    report = _report(data, target_column="score", sensitive_attributes="group", numerical_features=",")
    assert report["correlation_bias"] == {}
    assert report["class_imbalance"] == {}
    assert report["notes"]


def test_numeric_group_column_is_binned_into_ranges():
    ages = [17 + (i % 60) for i in range(300)]
    data = {"age": ages, "approved": [1 if a > 40 else 0 for a in ages]}
    report = _report(data, target_column="approved", sensitive_attributes="age", numerical_features=",")
    counts = report["representation_bias"]["age"]["counts"]
    assert 2 <= len(counts) <= 5
    assert all("-" in label for label in counts)
    assert report["representation_bias"]["age"]["underrepresented_groups"] == {}
    assert any("grouped into" in n for n in report["notes"])


def test_question_mark_is_treated_as_missing_not_a_group():
    data = {"country": ["US"] * 60 + ["?"] * 20 + ["MX"] * 20, "approved": [0, 1] * 50}
    report = _report(data, target_column="approved", sensitive_attributes="country", numerical_features=",")
    rep = report["representation_bias"]["country"]
    assert "?" not in rep["counts"]
    assert rep["missing"] == 20
    assert "?" not in report["correlation_bias"]["country"]["outcome_rates"]
    assert any("unknown" in n for n in report["notes"])


def test_rare_threshold_scales_with_many_groups():
    groups = [f"g{i}" for i in range(20) for _ in range(50)] + ["tiny"] * 3
    data = {"group": groups, "approved": [i % 2 for i in range(len(groups))]}
    report = _report(data, target_column="approved", sensitive_attributes="group", numerical_features=",")
    rep = report["representation_bias"]["group"]
    # 20 even groups of ~5% each are not rare; only the 3-row group is.
    assert rep["underrepresented_groups"].keys() == {"tiny"}
    assert rep["rare_threshold"] == pytest.approx(0.5 / 21)
