from app.database import get_connection


def create_mood(user_id: int, mood: str, energy: int, note: str) -> dict:
    with get_connection() as db:
        cursor = db.execute(
            "INSERT INTO moods(user_id, mood, energy, note) VALUES (?, ?, ?, ?)",
            (user_id, mood, energy, note),
        )
        db.commit()
    return {"id": cursor.lastrowid, "mood": mood, "energy": energy, "note": note}


def list_moods(user_id: int) -> list[dict]:
    with get_connection() as db:
        rows = db.execute(
            "SELECT * FROM moods WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 30",
            (user_id,),
        ).fetchall()
    return [dict(row) for row in rows]
