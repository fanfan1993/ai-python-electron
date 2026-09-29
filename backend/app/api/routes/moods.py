from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.repositories import moods
from app.schemas import MoodCreate
from app.security import get_current_user

router = APIRouter(tags=["moods"], dependencies=[Depends(get_current_user)])


@router.post("/moods", status_code=status.HTTP_201_CREATED)
def create_mood(payload: MoodCreate, user: Annotated[dict, Depends(get_current_user)]):
    return moods.create_mood(user["id"], payload.mood, payload.energy, payload.note)


@router.get("/moods")
def list_moods(user: Annotated[dict, Depends(get_current_user)]):
    return moods.list_moods(user["id"])
