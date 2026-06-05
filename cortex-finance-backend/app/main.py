from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import ORJSONResponse
from app.utils.rate_limiter import RedisRateLimitMiddleware

from app.routes.upload import router as upload_router
from app.routes.dashboard import router as dashboard_router
from app.routes.chat import router as chat_router
from app.routes.insights import router as insights_router
from app.routes.auth import router as auth_router
from app.database.db import init_db

app = FastAPI(
    title="Cortex Finance AI",
    default_response_class=ORJSONResponse
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compression & Rate Limiting Middlewares
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RedisRateLimitMiddleware)

@app.on_event("startup")
def on_startup():
    init_db()

# Routes
app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(dashboard_router)
app.include_router(chat_router)
app.include_router(insights_router)



@app.get("/")
def home():
    return {
        "message": "Cortex Finance Backend Running"
    }

@app.get("/healthz")
def healthz():
    import os
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    pinecone_key = os.environ.get("PINECONE_API_KEY")
    hf_token = os.environ.get("HF_API_TOKEN")
    db_url = os.environ.get("DATABASE_URL")
    
    return {
        "status": "healthy",
        "gemini_api_key_configured": bool(gemini_key),
        "gemini_key_prefix": gemini_key[:6] + "..." if gemini_key else None,
        "pinecone_api_key_configured": bool(pinecone_key),
        "pinecone_key_prefix": pinecone_key[:6] + "..." if pinecone_key else None,
        "hf_api_token_configured": bool(hf_token),
        "hf_token_prefix": hf_token[:6] + "..." if hf_token else None,
        "database_url_configured": bool(db_url),
        "database_url_prefix": db_url[:15] + "..." if db_url else None
    }
