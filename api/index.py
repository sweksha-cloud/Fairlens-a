"""Vercel entrypoint: serves the FairLens API under /api on the same domain as the website."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend"))

from fastapi import FastAPI  # noqa: E402

from app import app as fairlens_api  # noqa: E402

app = FastAPI(docs_url=None, redoc_url=None)
app.mount("/api", fairlens_api)
