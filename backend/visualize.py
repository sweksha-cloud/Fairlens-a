import io
import base64
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

def visualize_bias_images_from_pipeline(data, pipeline_report, sensitive_col=None, outcome_col='is_recid'):
    """
    Generate visualizations from an unsupervised pipeline report.
    Only returns images as strings.
    """
    images = []

    df_vis = data.copy()
    from sklearn.preprocessing import StandardScaler
    from sklearn.decomposition import PCA
    from sklearn.cluster import KMeans

    X_scaled = StandardScaler().fit_transform(data.select_dtypes(include=['number','float','int']))
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    df_vis['PC1'] = X_pca[:,0]
    df_vis['PC2'] = X_pca[:,1]

    clusters = KMeans(n_clusters=len(pipeline_report['unsupervised_stage_1']['cluster_distribution']),
                      random_state=42, n_init=10).fit_predict(X_pca)
    df_vis['cluster'] = clusters

    df_vis['outlier_label'] = ['Normal'] * len(df_vis)

    fig, axes = plt.subplots(1, 2, figsize=(12,5))
    sns.scatterplot(ax=axes[0], data=df_vis, x='PC1', y='PC2', hue='cluster', palette='Set2', s=60)
    axes[0].set_title("PCA Projection (Clusters)")

    sns.scatterplot(ax=axes[1], data=df_vis, x='PC1', y='PC2', hue='outlier_label', style='cluster',
                    s=70, palette={'Normal':'blue','Outlier':'red'})
    axes[1].set_title("Outlier Detection (placeholder)")

    buf = io.BytesIO()
    fig.savefig(buf, format='png')
    buf.seek(0)
    images.append(base64.b64encode(buf.read()).decode('utf-8'))
    plt.close(fig)

    if outcome_col in df_vis.columns:
        fig, ax = plt.subplots(figsize=(8,5))
        sns.barplot(x='cluster', y=outcome_col, data=df_vis, palette='Set2', ax=ax)
        ax.set_title(f"Outcome ({outcome_col}) by Cluster")
        buf = io.BytesIO()
        fig.savefig(buf, format='png')
        buf.seek(0)
        images.append(base64.b64encode(buf.read()).decode('utf-8'))
        plt.close(fig)

    return images
