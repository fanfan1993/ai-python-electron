from datetime import date

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=60)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[dict[str, str]] = Field(default_factory=list, max_length=30)


class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = Field(default_factory=list)
    intent: str = "chat"


class BookingCreate(BaseModel):
    dish_id: str
    dish_name: str
    meal_date: date
    meal_slot: str = "午餐"
    note: str = ""


class MoodCreate(BaseModel):
    mood: str
    energy: int = Field(ge=1, le=5)
    note: str = Field(default="", max_length=500)


class ForecastDay(BaseModel):
    date: date
    day_label: str
    temp_max: float
    temp_min: float
    condition: str
    icon: str


class WeatherResponse(BaseModel):
    city: str
    temperature: float
    feels_like: float
    condition: str
    icon: str
    wind_speed: float
    humidity: int
    weather_type: str
    forecast: list[ForecastDay] = Field(default_factory=list)
    source: str = "open-meteo"
