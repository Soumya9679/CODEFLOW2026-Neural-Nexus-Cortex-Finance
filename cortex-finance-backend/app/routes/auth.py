from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, Field
from app.database.db import create_user, get_user_by_email
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=50)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict

@router.post("/signup", response_model=AuthResponse)
def signup(request: SignupRequest):
    # Normalize email to lowercase
    email = request.email.lower().strip()
    
    # Check if email is already registered
    existing_user = get_user_by_email(email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered."
        )
        
    # Hash password and create user record
    hashed = hash_password(request.password)
    try:
        user_id = create_user(request.name.strip(), email, hashed)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create user account. Please try again."
        )
        
    token = create_access_token(user_id)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": request.name.strip(),
            "email": email
        }
    }

@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest):
    email = request.email.lower().strip()
    
    # Retrieve user profile
    user = get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
        
    # Verify password hash
    if not verify_password(request.password, user.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
        
    token = create_access_token(user.get("id"))
    return {
        "token": token,
        "user": {
            "id": user.get("id"),
            "name": user.get("name"),
            "email": user.get("email")
        }
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user.get("id"),
        "name": current_user.get("name"),
        "email": current_user.get("email"),
        "created_at": current_user.get("created_at")
    }
