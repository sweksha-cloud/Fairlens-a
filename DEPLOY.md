# Deploying FairLens

One free Vercel project serves both the website and the API. The API runs as a Python function
under `/api` on the same domain (`api/index.py`, `vercel.json`), so there is no CORS or backend URL
to configure. Everything is already set up in the repo; this is only the account side.

## Steps

1. Sign in at [vercel.com](https://vercel.com) with GitHub (the free Hobby plan is enough).
2. **Add New → Project**, then **Import** `sweksha-cloud/Fairlens-a`. If it isn't listed, use
   **Adjust GitHub App Permissions** to give Vercel access to the repo.
3. On the configure screen, leave everything as it is:
   - **Root Directory:** the repo root (`./`). Don't change it to `frontend`.
   - **Framework Preset:** Other. Build and output settings come from `vercel.json`.
   - **Environment Variables:** none needed.
4. Click **Deploy** and wait for it to finish (a couple of minutes the first time).

## Check it

Open the site URL → **Upload** → **Try a sample loan-approval dataset** → **Analyze Dataset**. You
should get a report with a "What this means" summary. `https://<your-site>/api/health` should return
`{"status":"healthy"}`.

After this, every push to `main` redeploys automatically, and pull requests get preview URLs.

## Limits (free plan)

- Uploads up to **4.5 MB** per request (Vercel's limit). The upload page says so for bigger files;
  run FairLens locally (see the README) to analyze those.
- After a quiet period the first request starts the API in a few seconds; later ones are instant.
- No database: nothing a user uploads is stored.
