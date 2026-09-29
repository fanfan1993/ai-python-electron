import sqlite3

from app.database import get_connection


def find_by_email(email: str) -> dict | None:
    with get_connection() as db:
        row = db.execute(
            "SELECT id, email, name, password_hash FROM users WHERE email = ?",
            (email.lower(),),
        ).fetchone()
    return dict(row) if row else None


def find_public_by_id(user_id: int) -> dict | None:
    with get_connection() as db:
        row = db.execute(
            "SELECT id, email, name FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    return dict(row) if row else None


def create(email: str, name: str, password_hash: str) -> dict | None:
    try:
        with get_connection() as db:
            cursor = db.execute(
                "INSERT INTO users(email, name, password_hash) VALUES (?, ?, ?)",
                (email.lower(), name.strip(), password_hash),
            )
            db.commit()
        return {"id": cursor.lastrowid, "email": email.lower(), "name": name.strip()}
    except sqlite3.IntegrityError:
        return None
