import sqlite3
from contextlib import contextmanager
from pathlib import Path

from app.config import settings


def _database_path() -> str:
    url = settings.database_url
    if url.startswith("sqlite:///"):
        return url.removeprefix("sqlite:///")
    if url == "sqlite://":
        return ":memory:"
    raise ValueError("This starter currently supports SQLite DATABASE_URL values only")


DB_PATH = _database_path()


@contextmanager
def get_connection():
    path = DB_PATH
    if path != ":memory:":
        Path(path).parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
    finally:
        connection.close()


def init_db() -> None:
    with get_connection() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                dish_id TEXT NOT NULL,
                dish_name TEXT NOT NULL,
                meal_date TEXT NOT NULL,
                meal_slot TEXT NOT NULL DEFAULT '午餐',
                note TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS moods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                mood TEXT NOT NULL,
                energy INTEGER NOT NULL,
                note TEXT NOT NULL DEFAULT '',
                recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        db.commit()
