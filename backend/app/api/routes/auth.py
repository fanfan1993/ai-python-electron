from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.repositories.users import find_public_by_id
from app.schemas import TokenOut, UserCreate, UserLogin, UserOut
from app.security import get_current_user
from app.services import auth

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate):
    result = auth.register(payload.email, payload.name, payload.password)
    if result is None:
        raise HTTPException(status_code=409, detail="这个邮箱已经注册过了")
    return result


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin):
    result = auth.login(payload.email, payload.password)
    if result is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="邮箱或密码不正确")
    return result


@router.get("/me", response_model=UserOut)
def me(user: Annotated[dict, Depends(get_current_user)]):
    public_user = find_public_by_id(user["id"])
    if public_user is None:
        raise HTTPException(status_code=401, detail="请先登录后继续")
    return public_user
