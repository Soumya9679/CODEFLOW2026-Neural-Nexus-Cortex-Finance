import os
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.utils.auth import get_current_user
from app.tasks.worker import process_statement_task
from celery.result import AsyncResult

logger = logging.getLogger("upload_route")
router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".pdf", ".csv"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Only bank statements in PDF or CSV format are accepted."
        )

    file_path = os.path.join(UPLOAD_DIR, f"user_{user_id}_{filename}")

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Error saving uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save the uploaded statement file.")

    # Dispatch Celery task
    try:
        task = process_statement_task.delay(user_id, file_path, filename, ext)
        return {
            "success": True,
            "task_id": task.id,
            "status": "processing",
            "message": "Bank statement upload complete. Processing started in the background."
        }
    except Exception as e:
        logger.error(f"Failed to dispatch Celery task: {e}")
        # Cleanup file if dispatch fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail="Failed to enqueue background processing task. Please check Celery/RabbitMQ broker connections."
        )

@router.get("/upload/status/{task_id}")
def get_task_status(task_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = AsyncResult(task_id)
        state = result.state
        response_data = {
            "task_id": task_id,
            "status": state
        }
        
        if state == "PROGRESS":
            response_data["progress"] = result.info.get("status") if isinstance(result.info, dict) else str(result.info)
        elif state == "SUCCESS":
            response_data["result"] = result.result
        elif state == "FAILURE":
            response_data["error"] = str(result.info)
            
        return response_data
    except Exception as e:
        logger.error(f"Error checking status for task {task_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve task status.")