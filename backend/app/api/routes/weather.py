from typing import Annotated

from fastapi import APIRouter, Query

from app.schemas import WeatherResponse
from app.services import weather

router = APIRouter(tags=["weather"])


@router.get("/weather", response_model=WeatherResponse)
def get_weather(
    city: Annotated[str, Query(min_length=1, max_length=30)] = "上海",
) -> WeatherResponse:
    """获取指定城市的实时天气与未来三天预报（无需登录）。"""
    return weather.get_weather(city)
