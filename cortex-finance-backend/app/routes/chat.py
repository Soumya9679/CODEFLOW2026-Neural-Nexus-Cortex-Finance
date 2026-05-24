from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.rag.chatbot import ask_question
from app.utils.auth import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    query: str

@router.post("/chat")
def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    response = ask_question(request.query, user_id)
    return {
        "response": response
    }