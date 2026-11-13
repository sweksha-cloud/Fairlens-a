def statistical_method(data, target_column=None, sensitive_attributes=None, numerical_features=None):
    """
    Statistical methods for bias detection in datasets.

    This function analyzes various forms of bias including:
    - Skewness in numerical features
    - Class imbalance in target variable
    - Representation bias across sensitive attributes
    - Correlation bias between sensitive attributes and target variable

    Parameters
    ----------
    data : pandas.DataFrame
        The dataset to analyze.
    target_column : str, optional
        Name of target/label column.
    sensitive_attributes : list[str], optional
        List of sensitive attribute columns.
    numerical_features : list[str], optional
        List of numerical feature columns.

    Returns
    -------
    dict
        Dictionary containing bias metrics and detected issues.
    """
    import pandas as pd
    import numpy as np
    from scipy import stats

    bias_report = {
        "skewness_analysis": {},
        "class_imbalance": {},
        "representation_bias": {},
        "correlation_bias": {},
        "detected_issues": []
    }

    # 1. Skewness Analysis for Numerical Features
    if numerical_features is None:
        numerical_features = data.select_dtypes(include=[np.number]).columns.tolist()

    for feature in numerical_features:
        if feature in data.columns:
            skew_value = stats.skew(data[feature].dropna())
            bias_report["skewness_analysis"][feature] = {
                "skewness": float(skew_value),
                "interpretation": (
                    "highly skewed" if abs(skew_value) > 1
                    else "moderately skewed" if abs(skew_value) > 0.5
                    else "roughly symmetric"
                ),
            }

            # Flag highly skewed features
            if abs(skew_value) > 1:
                bias_report["detected_issues"].append(
                    f"HIGH SKEWNESS: Feature '{feature}' has a skewness of {skew_value:.3f}"
                )

    # 2. Class Imbalance Analysis
    if target_column and target_column in data.columns:
        class_counts = data[target_column].value_counts()
        class_proportions = data[target_column].value_counts(normalize=True)

        bias_report["class_imbalance"] = {
            "class_counts": class_counts.to_dict(),
            "class_proportions": class_proportions.to_dict(),
            "imbalance_ratio": class_counts.max() / class_counts.min()
            if class_counts.min() > 0
            else float("inf"),
        }

        # Flag severe class imbalance
        if bias_report["class_imbalance"]["imbalance_ratio"] > 3:
            bias_report["detected_issues"].append(
                "CLASS IMBALANCE: Target variable has imbalance ratio "
                f"of {bias_report['class_imbalance']['imbalance_ratio']:.2f}"
            )

    # 3. Representation Bias across Sensitive Attributes
    if sensitive_attributes:
        for attr in sensitive_attributes:
            if attr in data.columns:
                value_counts = data[attr].value_counts()
                proportions = data[attr].value_counts(normalize=True)

                bias_report["representation_bias"][attr] = {
                    "counts": value_counts.to_dict(),
                    "proportions": proportions.to_dict(),
                    "representation_ratio": proportions.max() / proportions.min()
                    if proportions.min() > 0
                    else float("inf"),
                }

                # Flag underrepresentation
                if proportions.min() < 0.1:
                    bias_report["detected_issues"].append(
                        f"UNDERREPRESENTATION: Attribute '{attr}' has groups "
                        "with less than 10% representation"
                    )

    # 4. Correlation Bias (between sensitive attributes and target)
    if target_column and sensitive_attributes and target_column in data.columns:
        import pandas as pd  # ensure available locally

        for attr in sensitive_attributes:
            if attr in data.columns:
                # Create contingency table
                contingency_table = pd.crosstab(data[attr], data[target_column])

                # Chi-square test for independence
                chi2_raw, p_value_raw, dof, expected = stats.chi2_contingency(
                    contingency_table
                )
                chi2 = float(chi2_raw)
                p_value = float(p_value_raw)

                bias_report["correlation_bias"][attr] = {
                    "chi2_statistic": chi2,
                    "p_value": p_value,
                    "is_correlated": p_value < 0.05,
                }

                # Flag significant correlation
                if p_value < 0.05:
                    bias_report["detected_issues"].append(
                        "CORRELATION BIAS: Sensitive attribute "
                        f"'{attr}' is significantly correlated with target (p={p_value:.2f})"
                    )

    # Summary
    total_issues = len(bias_report["detected_issues"])
    if total_issues >= 5:
        severity = "high"
    elif total_issues >= 3:
        severity = "moderate"
    elif total_issues > 0:
        severity = "low"
    else:
        severity = "none detected"

    bias_report["summary"] = {
        "total_issues_detected": total_issues,
        "bias_severity": severity,
    }

    return bias_report


# ---------------------------------------------------------------------------
# Grace — unsupervised -> statistical -> unsupervised pipeline
# ---------------------------------------------------------------------------
def unsupervised_statistical_unsupervised_pipeline(data, sensitive_attributes=None, cluster_num=3, contamination=0.05):
    """
    Pipeline combining unsupervised → statistical → unsupervised methods
    PCA + Group Difference + IsolationForest
    """
    from sklearn.preprocessing import StandardScaler
    from sklearn.decomposition import PCA
    from sklearn.cluster import KMeans
    from scipy import stats
    import pandas as pd
    import numpy as np
    from sklearn.ensemble import IsolationForest

    report = {}

    X = StandardScaler().fit_transform(data.select_dtypes(include=[np.number]))
    pca = PCA(n_components=2)
    reduced = pca.fit_transform(X)
    clusters = KMeans(n_clusters=cluster_num, random_state=42, n_init=10).fit_predict(reduced)

    report['unsupervised_stage_1'] = {
        'pca_variance': pca.explained_variance_ratio_.tolist(),
        'cluster_distribution': pd.Series(clusters).value_counts(normalize=True).to_dict()
    }

    cluster_stats = {}
    df = pd.DataFrame(reduced, columns=['PC1', 'PC2'])
    df['cluster'] = clusters

    for col in ['PC1', 'PC2']:
        samples = [df[df['cluster'] == c][col] for c in df['cluster'].unique()]
        stat, p_value = stats.f_oneway(*samples)
        cluster_stats[col] = {'F-stat': stat, 'p_value': p_value}

    report['statistical_stage'] = {
        'feature_differences': cluster_stats
    }

    clf = IsolationForest(contamination=contamination, random_state=42)
    df['anomaly_score'] = clf.fit_predict(X)
    outlier_ratio = (df['anomaly_score'] == -1).mean()

    report['unsupervised_stage_2'] = {
        'outlier_ratio': outlier_ratio
    }

    report['summary'] = {
        'outlier_severity': 'high' if outlier_ratio > 0.1 else
                         'moderate' if outlier_ratio > 0.05 else 'low'
    }

    return report


def unsupervised_analytics(
    data,
    sensitive_attributes=None,
    numerical_features=None,
    n_clusters=6,
    random_state=0,
):
    """
    Unsupervised (label-free) bias analytics.
    - Clustering composition vs sensitive groups (chi-square + Cramér's V)
    - Group-wise outlier rate using IsolationForest
    - Numeric distribution drift (KS vs global) per group
    - Intersectional small-cell flags

    Returns a dict ready to be embedded into the overall bias report.
    """
    import numpy as np
    import pandas as pd
    from scipy import stats
    from sklearn.preprocessing import StandardScaler, OneHotEncoder
    from sklearn.compose import ColumnTransformer
    from sklearn.cluster import KMeans
    from sklearn.ensemble import IsolationForest

    # Determine numeric features if not provided
    if numerical_features is None:
        numerical_features = data.select_dtypes(include=[np.number]).columns.tolist()

    # Basic preprocessing: encode categoricals (excluding sensitive cols to avoid leakage in clustering)
    cat_cols = [
        c
        for c in data.select_dtypes(exclude=[np.number]).columns
        if c not in (sensitive_attributes or [])
    ]
    num_cols = [c for c in numerical_features if c in data.columns]

    if not num_cols and not cat_cols:
        return {"note": "No usable features for unsupervised analysis."}

    pre = ColumnTransformer(
        [
            ("num", StandardScaler(with_mean=True, with_std=True), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ],
        remainder="drop",
    )

    # Build feature matrix X
    X = pre.fit_transform(data)
    assert X is not None, "fit_transform should always return an array"
    n = X.shape[0]

    # 1. Clustering
    if n >= n_clusters:
        kmeans = KMeans(n_clusters=n_clusters, n_init="auto", random_state=random_state)
        labels = kmeans.fit_predict(X)
    else:
        # fallback for very small datasets
        n_clusters = max(2, min(3, n))
        kmeans = KMeans(n_clusters=n_clusters, n_init="auto", random_state=random_state)
        labels = kmeans.fit_predict(X)

    cluster_df = pd.DataFrame({"cluster": labels})
    cluster_section = {}

    # For each sensitive attribute: chi-square composition test
    if sensitive_attributes:
        for gcol in sensitive_attributes:
            if gcol in data.columns:
                tab = pd.crosstab(cluster_df["cluster"], data[gcol].fillna("NaN"))
                # Guard against extremely sparse tables
                if (tab.values < 2).any():
                    chi2_p = None
                    cramers_v = None
                else:
                    chi2_raw, p_raw, dof, expected = stats.chi2_contingency(tab.values)
                    chi2 = float(chi2_raw)
                    p = float(p_raw)
                    n_tab = tab.values.sum()
                    k = min(tab.shape) - 1 if min(tab.shape) > 1 else 1
                    cramers_v = (
                        float(np.sqrt(chi2 / (n_tab * k))) if n_tab > 0 and k > 0 else 0.0
                    )
                    chi2_p = p
                cluster_section[gcol] = {
                    "table_counts": tab.to_dict(),
                    "p_value": chi2_p,
                    "cramers_v": cramers_v,
                }

    # 2. Outlier Analysis
    outlier_section = {}
    iso = IsolationForest(random_state=random_state, contamination="auto")
    scores = iso.fit_predict(X)
    outlier_mask = scores == -1
    outlier_rate_global = float(outlier_mask.mean())
    outlier_section["global_outlier_rate"] = outlier_rate_global

    if sensitive_attributes:
        for gcol in sensitive_attributes:
            if gcol in data.columns:
                rates = {}
                for gval, idx in data.groupby(gcol).groups.items():
                    if len(idx) > 0:
                        idx_list = idx.tolist() if hasattr(idx, "tolist") else list(idx)
                        rates[str(gval)] = float(outlier_mask[idx_list].mean())
                outlier_section[gcol] = {"rate_by_group": rates}

    # 3. Numeric drift per group vs global (KS)
    numeric_section = {}
    for col in num_cols:
        series = data[col].dropna()
        if series.shape[0] < 20:
            continue
        entry = {}
        if sensitive_attributes:
            for gcol in sensitive_attributes:
                if gcol in data.columns:
                    stats_by_group = {}
                    for gval, sub in data[[gcol, col]].dropna().groupby(gcol):
                        s = sub[col].values
                        if len(s) >= 10 and len(series) >= 20:
                            ks_stat, p_val = stats.ks_2samp(
                                s, series, alternative="two-sided"
                            )
                            stats_by_group[str(gval)] = {
                                "ks": float(ks_stat),
                                "p": float(p_val),
                                "n": int(len(s)),
                            }
                    entry[gcol] = stats_by_group
        numeric_section[col] = entry

    # 4. Intersectional small-cell flags
    small_cells = {}
    if sensitive_attributes and len(sensitive_attributes) >= 2:
        for i in range(len(sensitive_attributes)):
            for j in range(i + 1, len(sensitive_attributes)):
                a, b = sensitive_attributes[i], sensitive_attributes[j]
                if a in data.columns and b in data.columns:
                    ct = pd.crosstab(data[a].fillna("NaN"), data[b].fillna("NaN"))
                    small = []
                    for ra in ct.index:  # type: ignore[attr-defined]
                        for cb in ct.columns:  # type: ignore[attr-defined]
                            if ct.loc[ra, cb] < max(5, int(0.01 * n)):
                                small.append(
                                    {
                                        "combo": [str(ra), str(cb)],
                                        "n": int(ct.loc[ra, cb]),
                                    }
                                )
                    if small:
                        small_cells[f"{a}×{b}"] = small

    # Traffic-light summary for unsupervised
    alerts = []

    # Strong cluster association
    for gcol, res in cluster_section.items():
        if (
            res.get("p_value") is not None
            and res.get("p_value") < 0.05
            and (res.get("cramers_v") or 0) >= 0.1
        ):
            alerts.append(
                f"Cluster composition differs by {gcol} "
                f"(p={res['p_value']:.4f}, V={res['cramers_v']:.2f})"
            )

    # Outlier rate gaps
    if "global_outlier_rate" in outlier_section:
        for gcol, meta in outlier_section.items():
            if gcol == "global_outlier_rate":
                continue
            rates = meta.get("rate_by_group", {})
            if rates:
                mx, mn = max(rates.values()), min(rates.values())
                if mx - mn >= 0.05:
                    alerts.append(
                        f"Outlier rate disparity across {gcol}: Δ={mx-mn:.2f}"
                    )

    # KS flags
    for col, entry in numeric_section.items():
        for gcol, d in entry.items():
            for gval, st in d.items():
                if st.get("p", 1.0) < 0.01 and st.get("ks", 0.0) >= 0.2:
                    alerts.append(
                        f"{col} distribution differs for {gcol}={gval} "
                        f"(KS={st['ks']:.2f}, p={st['p']:.3f})"
                    )

    status = "green"
    if any("Δ=" in a for a in alerts) or any("differs" in a for a in alerts):
        status = "yellow"
    if len(alerts) >= 3:
        status = "red"

    return {
        "clustering": cluster_section,
        "outlier": outlier_section,
        "numeric_drift": numeric_section,
        "intersectional_small_cells": small_cells,
        "summary": {
            "status": status,
            "alerts": alerts,
        },
    }


import os
import matplotlib.pyplot as plt


def generate_bias_plots(
    data,
    target_column=None,
    sensitive_attributes=None,
    numerical_features=None,
    dataset_name="dataset",
    output_dir="plots",
):
    """
    Generate graphs for the bias report and save them as PNG files.

    - Class imbalance bar chart (if target_column is provided)
    - Representation bias bar charts for each sensitive attribute
    - Skewness histograms for numerical features

    Returns a dict with file paths for each generated plot.
    """
    import numpy as np

    os.makedirs(output_dir, exist_ok=True)
    plot_paths = {}

    # 1. Class imbalance plot
    if target_column is not None and target_column in data.columns:
        class_counts = data[target_column].value_counts().sort_index()
        plt.figure(figsize=(5, 4))
        class_counts.plot(kind="bar")
        plt.title(f"{dataset_name} - Class distribution ({target_column})")
        plt.xlabel("Class")
        plt.ylabel("Count")
        plt.tight_layout()
        fname = f"{dataset_name}_class_imbalance.png"
        path = os.path.join(output_dir, fname)
        plt.savefig(path)
        plt.close()
        plot_paths["class_imbalance"] = path

    # 2. Representation bias plots for sensitive attributes
    if sensitive_attributes:
        for attr in sensitive_attributes:
            if attr in data.columns:
                counts = data[attr].value_counts().sort_index()
                plt.figure(figsize=(5, 4))
                counts.plot(kind="bar")
                plt.title(f"{dataset_name} - Representation by {attr}")
                plt.xlabel(attr)
                plt.ylabel("Count")
                plt.tight_layout()
                fname = f"{dataset_name}_representation_{attr}.png"
                path = os.path.join(output_dir, fname)
                plt.savefig(path)
                plt.close()
                plot_paths[f"representation_{attr}"] = path

    # 3. Histograms for numerical features (skewness visualization)
    if numerical_features is None:
        numerical_features = data.select_dtypes(include=[np.number]).columns.tolist()

    for feature in numerical_features:
        if feature in data.columns:
            plt.figure(figsize=(5, 4))
            data[feature].dropna().hist(bins=15)
            plt.title(f"{dataset_name} - Distribution of {feature}")
            plt.xlabel(feature)
            plt.ylabel("Frequency")
            plt.tight_layout()
            fname = f"{dataset_name}_hist_{feature}.png"
            path = os.path.join(output_dir, fname)
            plt.savefig(path)
            plt.close()
            plot_paths[f"hist_{feature}"] = path

    return plot_paths
