import os
from celery import Celery
import app.utils.config  # Loads environment variables

broker_url = os.getenv("CELERY_BROKER_URL", "amqp://guest:guest@localhost:5672//")
result_backend = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "cortex_tasks",
    broker=broker_url,
    backend=result_backend,
    include=["app.tasks.worker"]
)

celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    worker_prefetch_multiplier=1, # Fetch one task at a time for optimal concurrency
)
