from app.repositories import users
from app.security import create_access_token, hash_password, verify_password


def register(email: str, name: str, password: str) -> dict | None:
    user = users.create(email, name, hash_password(password))
    if user is None:
        return None
    return {"access_token": create_access_token(user["id"]), "user": user}


def login(email: str, password: str) -> dict | None:
    user = users.find_by_email(email)
    if user is None or not verify_password(password, user["password_hash"]):
        return None
    public_user = {key: user[key] for key in ("id", "email", "name")}
    return {"access_token": create_access_token(user["id"]), "user": public_user}
