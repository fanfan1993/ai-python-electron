"""天气预报服务：优先调用 Open-Meteo 免费接口，失败时返回内置兜底数据。"""

import json
import urllib.parse
import urllib.request
from datetime import date, timedelta

from app.schemas import ForecastDay, WeatherResponse

# 城市 => (纬度, 经度)，未收录的城市回退到上海
CITY_COORDS: dict[str, tuple[float, float]] = {
    "北京": (39.9042, 116.4074),
    "上海": (31.2304, 121.4737),
    "广州": (23.1291, 113.2644),
    "深圳": (22.5431, 114.0579),
    "杭州": (30.2741, 120.1551),
    "成都": (30.5728, 104.0668),
    "武汉": (30.5928, 114.3055),
    "西安": (34.3416, 108.9398),
    "南京": (32.0603, 118.7969),
    "重庆": (29.5630, 106.5516),
}

WEEKDAY_LABELS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

# Open-Meteo WMO 天气码 => (中文描述, 展示类型)
WEATHER_CODE_MAP: dict[int, tuple[str, str]] = {
    0: ("晴", "sunny"),
    1: ("晴间多云", "sunny"),
    2: ("多云", "cloudy"),
    3: ("阴", "cloudy"),
    45: ("雾", "cloudy"),
    48: ("雾凇", "cloudy"),
    51: ("小毛毛雨", "rain"),
    53: ("毛毛雨", "rain"),
    55: ("大毛毛雨", "rain"),
    61: ("小雨", "rain"),
    63: ("中雨", "rain"),
    65: ("大雨", "rain"),
    66: ("冻雨", "rain"),
    67: ("强冻雨", "rain"),
    71: ("小雪", "snow"),
    73: ("中雪", "snow"),
    75: ("大雪", "snow"),
    77: ("雪粒", "snow"),
    80: ("阵雨", "rain"),
    81: ("中阵雨", "rain"),
    82: ("强阵雨", "rain"),
    85: ("小阵雪", "snow"),
    86: ("大阵雪", "snow"),
    95: ("雷阵雨", "thunder"),
    96: ("雷阵雨伴冰雹", "thunder"),
    99: ("强雷阵雨伴冰雹", "thunder"),
}


def _describe(code: int) -> tuple[str, str]:
    return WEATHER_CODE_MAP.get(code, ("未知", "cloudy"))


def _icon_for(weather_type: str) -> str:
    return {"sunny": "☀️", "cloudy": "⛅", "rain": "🌧️", "snow": "❄️", "thunder": "⛈️"}.get(
        weather_type, "⛅"
    )


def _fetch_json(url: str, timeout: float = 6.0) -> dict | None:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:  # noqa: S310
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None


def _fallback() -> WeatherResponse:
    """离线兜底数据，保证接口永远可用。"""
    today = date.today()
    forecast = [
        ForecastDay(
            date=today + timedelta(days=offset),
            day_label=WEEKDAY_LABELS[(today + timedelta(days=offset)).weekday()],
            temp_max=24.0 + offset,
            temp_min=17.0,
            condition="多云" if offset % 2 else "晴",
            icon="⛅" if offset % 2 else "☀️",
        )
        for offset in range(3)
    ]
    return WeatherResponse(
        city="上海",
        temperature=22.0,
        feels_like=22.5,
        condition="多云",
        icon="⛅",
        wind_speed=8.5,
        humidity=62,
        weather_type="cloudy",
        forecast=forecast,
        source="offline-fallback",
    )


def get_weather(city: str = "上海") -> WeatherResponse:
    coords = CITY_COORDS.get(city, CITY_COORDS["上海"])
    resolved_city = city if city in CITY_COORDS else "上海"

    params = urllib.parse.urlencode(
        {
            "latitude": coords[0],
            "longitude": coords[1],
            "current": "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min",
            "forecast_days": 4,
            "timezone": "Asia/Shanghai",
        }
    )
    data = _fetch_json(f"https://api.open-meteo.com/v1/forecast?{params}")
    if not data or "current" not in data or "daily" not in data:
        return _fallback()

    current = data["current"]
    condition, weather_type = _describe(current.get("weather_code", 3))

    daily = data["daily"]
    forecast: list[ForecastDay] = []
    for idx, iso_date in enumerate(daily.get("time", [])[:4]):
        day_date = date.fromisoformat(iso_date)
        day_condition, day_type = _describe(daily["weather_code"][idx])
        forecast.append(
            ForecastDay(
                date=day_date,
                day_label="今天" if idx == 0 else WEEKDAY_LABELS[day_date.weekday()],
                temp_max=float(daily["temperature_2m_max"][idx]),
                temp_min=float(daily["temperature_2m_min"][idx]),
                condition=day_condition,
                icon=_icon_for(day_type),
            )
        )

    return WeatherResponse(
        city=resolved_city,
        temperature=float(current["temperature_2m"]),
        feels_like=float(current["apparent_temperature"]),
        condition=condition,
        icon=_icon_for(weather_type),
        wind_speed=float(current.get("wind_speed_10m", 0)),
        humidity=int(current.get("relative_humidity_2m", 0)),
        weather_type=weather_type,
        forecast=forecast,
    )
