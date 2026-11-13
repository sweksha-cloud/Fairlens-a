# FairLens-A

**A dataset bias detector.** Upload a tabular dataset and FairLens-A checks whether the
*data itself* is fair, balanced, and representative — **before** any model is trained —
then returns a report of flagged issues with a severity rating.

Built for the Responsible Computing Club at San José State University (Fall 2025).

---

## What it detects

| Bias | How |
| --- | --- |
| **Under-representation** of a protected group | group proportions; flag any group < 10% |
| **Class / label imbalance** | ratio of largest to smallest class; flag if > 3× |
| **Skewed feature distributions** | `scipy.stats.skew`; flag if \|skew\| > 1 |
| **Sensitive attribute ↔ outcome association** | χ² test of independence; flag if p < 0.05 |
| **Hidden group structure** (label-free) | KMeans + Cramér's V, group-wise IsolationForest outlier rates, KS distribution drift, intersectional small-cell flags |
| **Cluster separability & anomaly rate** | PCA → KMeans → one-way ANOVA → IsolationForest |

It answers *"is this data safe to train on?"* — not *"is my model fair?"*. No model is trained.

---

## Repo layout

```
frontend/   React + Vite single-page app  (upload UI, charts, report view)
backend/    FastAPI service                (the detection methods + endpoints)
```

Two toolchains, two deploy targets — kept as a monorepo so it's one clone, one project.

---

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py        # http://localhost:8000  (docs at /docs)
```

### Tests

```bash
cd backend
pip install pytest httpx
python -m pytest -q tests   # runs in-process; no server needed
```

Point the frontend at the API by setting `backendUrl` in `frontend/src/app/config.ts`.

---

## Status

- [x] Frontend — upload flow, analysis report, charts
- [x] Backend consolidated into `backend/`
- [x] Frontend wired to the live API + dataset column-selection step
- [x] CI + tests (GitHub Actions: backend `pytest`, frontend production build)
- [ ] Deployed

---

## Team

| | Contribution |
| --- | --- |
| Dhananjay Surti | Statistical bias method (skew / imbalance / representation / χ²) |
| Siddarth Shekhar | Unsupervised analytics (clustering, outlier, drift, intersectional) |
| Grace (graceash) | PCA → ANOVA → IsolationForest pipeline + visualization |
| sweksha | Frontend, integration |

## License

MIT — see [LICENSE](LICENSE).
