# FairLens-A — Frontend

React + Vite single-page app for the FairLens-A ML bias detector. The UI was
designed in Figma Make and exported here; the shadcn/ui component library and
other unused Figma Make scaffolding have been stripped out.

## Stack

- React 18 + Vite 6
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Recharts (charts on the Analysis page)
- lucide-react (icons)

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Opens on http://localhost:5173 (Vite picks the next free port if 5173 is taken).

Other scripts:

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Structure

```
src/
  main.tsx                 entry
  app/
    App.tsx                page router (plain useState, 4 pages)
    config.ts              backendUrl (see "Backend wiring" below)
    components/
      Navigation.tsx       top nav (raw Figma-generated SVG layout)
      HomePage.tsx
      UploadPage.tsx
      AnalysisPage.tsx
      AboutPage.tsx
    imports/
      svg-fertresihc.ts    generated SVG path data for the hero/background art
  styles/                  Tailwind entry + theme tokens
```

## Backend wiring (not done yet)

`UploadPage.tsx` currently returns a hardcoded mock COMPAS result on "Analyze"
instead of calling the API. To connect it to the FastAPI backend:

1. `POST` the uploaded file (multipart) to `${environment.backendUrl}/analyze-bias-csv`.
2. Add UI to collect `target_column`, `sensitive_attributes`, and
   `numerical_features` — the backend needs these and the upload page collects
   none today.
3. The backend response shape already matches the `AnalysisResult` type in `App.tsx`.
