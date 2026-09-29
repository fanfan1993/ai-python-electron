from fastapi import APIRouter

from app.api.routes import auth, chat, dining, moods, weather

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(chat.router)
api_router.include_router(dining.router)
api_router.include_router(moods.router)
api_router.include_router(weather.router)
