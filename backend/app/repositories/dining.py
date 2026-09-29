from datetime import date

from app.database import get_connection


def list_today_menu() -> dict:
    with get_connection() as db:
        rows = db.execute(
            "SELECT title, content FROM knowledge WHERE kind = 'dish' ORDER BY title"
        ).fetchall()
    return {
        "date": date.today().isoformat(),
        "dishes": [
            {"id": str(index + 1), "name": row["title"], "description": row["content"]}
            for index, row in enumerate(rows)
        ],
    }


def create_booking(user_id: int, payload: dict) -> dict:
    with get_connection() as db:
        cursor = db.execute(
            """INSERT INTO bookings(user_id, dish_id, dish_name, meal_date, meal_slot, note)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                user_id,
                payload["dish_id"],
                payload["dish_name"],
                payload["meal_date"],
                payload["meal_slot"],
                payload["note"],
            ),
        )
        db.commit()
    return {
        "id": cursor.lastrowid,
        "status": "confirmed",
        "dish_name": payload["dish_name"],
        "meal_date": payload["meal_date"],
    }


def list_bookings(user_id: int) -> list[dict]:
    with get_connection() as db:
        rows = db.execute(
            "SELECT * FROM bookings WHERE user_id = ? ORDER BY meal_date DESC, id DESC LIMIT 30",
            (user_id,),
        ).fetchall()
    return [dict(row) for row in rows]
