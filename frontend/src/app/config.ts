export const environment = {
  production: import.meta.env.PROD,
  // In production the API is served from the same domain under /api (see vercel.json).
  // Locally it runs on :8000. VITE_BACKEND_URL overrides either.
  backendUrl:
    import.meta.env.VITE_BACKEND_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8000'),
};
