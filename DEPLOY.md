# Deploying FairLens

Two free services: the **API on Render** and the **frontend on Vercel**. About 15 minutes, all in the
browser. Everything in the repo is already set up; these steps are only the account-side clicks.

## 1. API on Render

1. Sign in at [render.com](https://render.com) with GitHub.
2. **New → Blueprint**, pick the `Fairlens-a` repo. Render reads `render.yaml` and creates the
   `fairlens-api` web service (free plan, Python 3.12, health check on `/health`).
3. When it asks for `ALLOWED_ORIGINS`, enter `https://placeholder.invalid` for now (you'll set the
   real frontend URL in step 3).
4. Wait for the first deploy, then open `https://<your-service>.onrender.com/health`. It should
   return `{"status":"healthy"}`. Copy that base URL.

The free plan sleeps after 15 minutes idle; the first request after that takes about a minute.

## 2. Frontend on Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project**, import `Fairlens-a`.
3. Set **Root Directory** to `frontend`. Vercel detects Vite (build `npm run build`, output `dist`).
4. Add the environment variable `VITE_BACKEND_URL` = the Render URL from step 1, without a trailing
   slash (e.g. `https://fairlens-api.onrender.com`).
5. Deploy and copy the site URL (e.g. `https://fairlens-a.vercel.app`).

## 3. Connect them

In Render → `fairlens-api` → **Environment**, set `ALLOWED_ORIGINS` to the Vercel URL from step 2
(comma-separate several if you also want preview URLs). Save; Render redeploys.

## 4. Check it

Open the Vercel URL → **Upload** → **Try a sample loan-approval dataset** → **Analyze Dataset**. You
should get a report with a "What this means" summary. If you see *"Could not reach the API"*, check
`VITE_BACKEND_URL` (Vercel) and `ALLOWED_ORIGINS` (Render), and remember the free API may be waking up.

Both services redeploy automatically on every push to `main`.
