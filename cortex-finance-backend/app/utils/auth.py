import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import app.utils.config  # Loads .env variables first
from app.database.db import get_user_by_id

# Secret key configuration
JWT_SECRET = os.getenv("JWT_SECRET", "cortex_secret_key_default_123!")
# Normalize algorithm
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Bearer security scheme for token extraction
security_scheme = HTTPBearer()

def hash_password(password: str) -> str:
    """Hashes a plain-text password using bcrypt directly."""
    salt = bcrypt.gensalt()
    # truncate to 72 bytes (bcrypt max length) just in case, and encode to bytes
    hashed = bcrypt.hashpw(password.encode('utf-8')[:72], salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored bcrypt hash directly."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8')[:72],
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def create_access_token(user_id: int, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT access token for a user ID."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
        
    to_encode = {
        "sub": str(user_id),
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    """
    Dependency that extracts, decodes, and verifies a JWT token.
    Returns the user profile dictionary from the database.
    """
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise credentials_exception
        
    user = get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
        
    return user
