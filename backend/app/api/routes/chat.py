from fastapi import APIRouter, Depends

from app.schemas import ChatRequest, ChatResponse
from app.security import get_current_user
from app.services.chat import reply

router = APIRouter(tags=["chat"], dependencies=[Depends(get_current_user)])


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    return reply(payload.message, payload.history)
