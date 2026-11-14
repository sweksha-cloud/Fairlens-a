# FairLens

**Check a dataset for bias before you train a model on it.**

Made for the Responsible Computing Club at SJSU.

**Try it: [fairlens-a.vercel.app](https://fairlens-a.vercel.app)** (no sign-up; nothing you upload is stored)

Upload a CSV, tell FairLens which column is the outcome (for example *approved* or *hired*) and which
columns describe people (race, sex, age group…), and it reports, in plain English:

- whether some groups are **rare** in the data,
- whether the **outcome rate differs between groups** (e.g. 51% vs 39%), and how strongly,
- whether the outcome itself is **lopsided**, and
- whether numeric columns have **extreme values** worth cleaning.

It answers *"is this data safe to train on?"*, not *"is my model fair?"*. No model is trained.

FairLens is a Responsible Computing Club (RCC) project at San José State University, built for people
on campus to use: students checking datasets for class projects, researchers vetting data before a
study, or anyone at SJSU who wants a quick fairness check before training a model.

---

## How the checks work

| Check | What it measures | Flagged when |
| --- | --- | --- |
| Representation | Share of rows in each group of a sensitive attribute | a group is under 10% of rows (the groups are named) |
| Outcome difference | Outcome rate per group; χ² test of independence; Cramér's V (strength, 0–1) | p < 0.05 **and** either a gap of 10+ percentage points between groups with 30+ rows, or Cramér's V ≥ 0.1 |
| Class balance | Most common outcome ÷ rarest outcome | ratio above 3 |
| Skew | `scipy.stats.skew` on selected numeric columns | \|skew\| above 1 (a data-quality note, not unfairness by itself) |

**Severity** depends on what was found, not how many checks ran: *high* if outcomes differ strongly by a
group (Cramér's V ≥ 0.3) or by two or more attributes, *moderate* for an outcome gap, rare groups or a
lopsided outcome, *low* for data-quality notes only.

**Why both a p-value and a strength measure?** With thousands of rows almost any difference is
"statistically significant", so FairLens also requires the difference to be large enough to matter.
Groups with fewer than 30 rows are left out of the gap comparison because their rates are noisy, and
the report warns when the χ² test is unreliable because groups are small. An outcome column with more
than 20 distinct values is treated as continuous, and the group-outcome checks are skipped.

These are statistical warning signs in the data, not proof of discrimination.

The backend also contains unsupervised analyses (KMeans clustering with Cramér's V, IsolationForest
outlier rates by group, KS drift, intersectional small-cell flags, and a PCA → ANOVA → IsolationForest
pipeline). They run from Python (`backend/main.py`, `backend/examples/`) and are not yet in the web app.

---

## Repo layout

```
frontend/   React + Vite single-page app (upload, column selection, report and charts)
backend/    FastAPI service (the detection methods and the API)
```

## Run it locally

**Backend** (Python 3.11+):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py        # http://localhost:8000  (interactive docs at /docs)
```

**Frontend** (Node 20+):

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The frontend calls `http://localhost:8000` by default. Set `VITE_BACKEND_URL` to point it elsewhere
(see `frontend/.env.example`). No dataset handy? Use **Try a sample loan-approval dataset** on the
upload page.

**Tests:**

```bash
cd backend
pip install pytest httpx
python -m pytest -q tests   # runs in-process; no server needed
```

CI (GitHub Actions) runs the backend tests and the frontend production build on every push and pull
request.

## API

`POST /analyze-bias-csv` (multipart form)

| Field | Meaning |
| --- | --- |
| `file` | the CSV |
| `target_column` | the outcome column |
| `sensitive_attributes` | comma-separated columns describing people; `,` for none |
| `numerical_features` | comma-separated numeric columns to check for skew; `,` for none; omit to choose automatically |

`POST /analyze-bias-json` takes the same parameters with the data as JSON. `GET /health` returns
`{"status": "healthy"}`. Full details: `backend/API_DOCUMENTATION.md`.

## Deploy

See [DEPLOY.md](DEPLOY.md): one Vercel project serves the website and the API (under `/api`). The
online version accepts CSVs up to 4.5 MB; run it locally for bigger files.

---

## Team

An RCC project, built by Sweksha Shaw in collaboration with Dhananjay Surti, Siddarth Shekhar, Grace and Ayesha.
The original team project is at [Kagehina1218/FairLens-A](https://github.com/Kagehina1218/FairLens-A).

## License

MIT, see [LICENSE](LICENSE).
