from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings
import hashlib

ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def preprocess_password(password: str) -> str:
    # SHA256 hash then truncate to 72 bytes for bcrypt compatibility
    hashed = hashlib.sha256(password.encode()).hexdigest()
    return hashed[:72]


def hash_password(password: str) -> str:
    processed = preprocess_password(password)
    return pwd_context.hash(processed)


def verify_password(plain: str, hashed: str) -> bool:
    processed = preprocess_password(plain)
    return pwd_context.verify(processed, hashed)


def create_access_token(data: dict):
    to_encode = {
        "user_id": data["user_id"],
        "role": data["role"],
        "company_id": data["company_id"]
    }

    expire = datetime.utcnow() + timedelta(hours=2)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)