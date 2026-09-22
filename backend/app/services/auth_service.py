import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from backend.app.models.models import User

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "ecorecycle-super-secret-jwt-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def ensure_demo_user(db: Session) -> User:
    """Ensure the default Demo User exists in database."""
    demo_email = "demo@ecorecycle.ai"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        user = User(
            name="Demo Eco-Auditor",
            email=demo_email,
            password_hash=get_password_hash("demo123"),
            role="DEMO_USER"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
