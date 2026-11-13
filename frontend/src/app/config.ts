export const environment = {
  production: import.meta.env.PROD,
  // Set VITE_BACKEND_URL in .env / your host's env for deployment.
  backendUrl: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000',
};
