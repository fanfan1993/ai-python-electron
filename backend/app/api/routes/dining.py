from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.repositories import dining
from app.schemas import BookingCreate
from app.security import get_current_user

router = APIRouter(tags=["dining"], dependencies=[Depends(get_current_user)])


@router.get("/menu/today")
def today_menu():
    return dining.list_today_menu()


@router.post("/bookings", status_code=status.HTTP_201_CREATED)
def create_booking(payload: BookingCreate, user: Annotated[dict, Depends(get_current_user)]):
    return dining.create_booking(user["id"], payload.model_dump(mode="json"))


@router.get("/bookings")
def list_bookings(user: Annotated[dict, Depends(get_current_user)]):
    return dining.list_bookings(user["id"])
