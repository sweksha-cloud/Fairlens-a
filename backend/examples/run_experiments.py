import os
import json
import pandas as pd

from main import statistical_method, generate_bias_plots

# List your datasets here
DATASETS = [
    {
        "path": "test_dataset.csv",
        "name": "test_dataset",
        "target_column": "label",
        "sensitive_attributes": ["gender", "race"],
        "numerical_features": ["age", "income"],
    },
    {
        "path": "biased_credit_applications.csv",
        "name": "biased_credit",
        "target_column": "approved",
        "sensitive_attributes": ["gender", "race"],
        "numerical_features": ["age", "income", "credit_score"],
    },
    {
        "path": "biased_hiring_decisions.csv",
        "name": "biased_hiring",
        "target_column": "hired",
        "sensitive_attributes": ["gender", "race"],
        "numerical_features": ["years_experience", "test_score"],
    },
]

OUTPUT_DIR = "results"
PLOTS_DIR = "plots"

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)


def run_all_experiments():
    summary_index = []

    for cfg in DATASETS:
        path = cfg["path"]
        name = cfg["name"]
        print(f"\n=== Running analysis for: {name} ({path}) ===")

        if not os.path.exists(path):
            print(f"  [!] File not found: {path} (skipping)")
            continue

        df = pd.read_csv(path)

        # Run your statistical_method
        report = statistical_method(
            data=df,
            target_column=cfg["target_column"],
            sensitive_attributes=cfg["sensitive_attributes"],
            numerical_features=cfg["numerical_features"],
        )

        # Save JSON report
        json_path = os.path.join(OUTPUT_DIR, f"{name}_bias_report.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, default=str)
        print(f"  Saved bias report to: {json_path}")

        # Generate plots
        plot_paths = generate_bias_plots(
            data=df,
            target_column=cfg["target_column"],
            sensitive_attributes=cfg["sensitive_attributes"],
            numerical_features=cfg["numerical_features"],
            dataset_name=name,
            output_dir=PLOTS_DIR,
        )
        print(f"  Generated plots:")
        for key, p in plot_paths.items():
            print(f"   - {key}: {p}")

        # For your presentation summary slide
        summary = report.get("summary", {})
        summary_index.append(
            {
                "dataset": name,
                "rows": len(df),
                "issues": summary.get("total_issues_detected", 0),
                "severity": summary.get("bias_severity", "unknown"),
            }
        )

    # Save a small index file you can paste into slides
    idx_path = os.path.join(OUTPUT_DIR, "dataset_summary_index.json")
    with open(idx_path, "w", encoding="utf-8") as f:
        json.dump(summary_index, f, indent=2)
    print(f"\nSaved dataset summary index to: {idx_path}")


if __name__ == "__main__":
    run_all_experiments()