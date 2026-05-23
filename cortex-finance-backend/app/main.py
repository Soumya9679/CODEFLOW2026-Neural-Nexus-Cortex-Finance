from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.upload import router as upload_router
from app.routes.dashboard import router as dashboard_router
from app.routes.chat import router as chat_router
from app.routes.insights import router as insights_router
from app.database.db import init_db

app = FastAPI(title="Cortex Finance AI")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

# Routes
app.include_router(upload_router)
app.include_router(dashboard_router)
app.include_router(chat_router)
app.include_router(insights_router)



@app.get("/")
def home():
    return {
        "message": "Cortex Finance Backend Running"
    }