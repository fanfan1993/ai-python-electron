def test_protected_routes_require_auth(client):
    assert client.get("/api/menu/today").status_code == 401
    assert client.post("/api/chat", json={"message": "今天吃什么"}).status_code == 401


def test_user_can_chat_and_view_menu(client, auth_headers):
    menu = client.get("/api/menu/today", headers=auth_headers)
    assert menu.status_code == 200
    assert len(menu.json()["dishes"]) >= 3

    response = client.post(
        "/api/chat",
        headers=auth_headers,
        json={"message": "今天吃什么好？", "history": []},
    )
    assert response.status_code == 200
    assert response.json()["reply"]


def test_user_can_record_mood_and_book_lunch(client, auth_headers):
    mood = client.post(
        "/api/moods",
        headers=auth_headers,
        json={"mood": "平静", "energy": 3, "note": "测试记录"},
    )
    assert mood.status_code == 201
    assert client.get("/api/moods", headers=auth_headers).json()[0]["mood"] == "平静"

    booking = client.post(
        "/api/bookings",
        headers=auth_headers,
        json={
            "dish_id": "1",
            "dish_name": "山野菌菇鸡汤饭",
            "meal_date": "2026-09-29",
            "meal_slot": "午餐",
        },
    )
    assert booking.status_code == 201
    assert (
        client.get("/api/bookings", headers=auth_headers).json()[0]["dish_name"] == "山野菌菇鸡汤饭"
    )


def test_weather_endpoint_returns_current_weather_and_forecast(client, monkeypatch):
    from app.services import weather

    monkeypatch.setattr(
        weather,
        "_fetch_json",
        lambda _url: {
            "current": {
                "temperature_2m": 23.4,
                "apparent_temperature": 24.1,
                "weather_code": 2,
                "wind_speed_10m": 8.5,
                "relative_humidity_2m": 62,
            },
            "daily": {
                "time": ["2026-09-29", "2026-09-30"],
                "weather_code": [2, 61],
                "temperature_2m_max": [25.0, 22.0],
                "temperature_2m_min": [18.0, 17.0],
            },
        },
    )

    response = client.get("/api/weather?city=北京")

    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "北京"
    assert data["temperature"] == 23.4
    assert data["condition"] == "多云"
    assert data["weather_type"] == "cloudy"
    assert len(data["forecast"]) == 2
    assert data["forecast"][1]["condition"] == "小雨"
