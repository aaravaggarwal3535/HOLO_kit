"""
Authentication Routes
Handles user registration, login, and token management
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Optional

from models.user import UserCreate, User, Token, TokenData, UserInDB
from database.mongodb import get_database
from utils.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_token
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user from database by email"""
    db = get_database()
    user = await db.users.find_one({"email": email})
    return user


async def get_user_by_username(username: str) -> Optional[dict]:
    """Get user from database by username"""
    db = get_database()
    user = await db.users.find_one({"username": username})
    return user


async def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Authenticate user credentials"""
    user = await get_user_by_username(username)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Get current authenticated user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = await get_user_by_username(username)
    if user is None:
        raise credentials_exception
    
    return user


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """
    Register a new user (Creator or Company)
    
    - **email**: Valid email address
    - **username**: Unique username
    - **full_name**: Full name
    - **password**: Strong password
    - **user_type**: Either "creator" or "company"
    """
    db = get_database()
    
    # Check if email already exists
    existing_email = await get_user_by_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = await get_user_by_username(user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Validate user type
    if user_data.user_type not in ["creator", "company"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_type must be either 'creator' or 'company'"
        )
    
    # Create new user
    user_dict = user_data.dict()
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    
    result = await db.users.insert_one(user_dict)
    
    # Generate access token
    access_token = create_access_token(
        data={"sub": user_data.username, "user_type": user_data.user_type}
    )
    
    print(f"✅ New {user_data.user_type} registered: {user_data.username}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user_data.user_type,
        "username": user_data.username
    }


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login with username and password
    Returns JWT access token
    """
    user = await authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    access_token = create_access_token(
        data={"sub": user["username"], "user_type": user["user_type"]}
    )
    
    print(f"✅ User logged in: {user['username']} ({user['user_type']})")
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user["user_type"],
        "username": user["username"]
    }


@router.get("/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "username": current_user["username"],
        "full_name": current_user["full_name"],
        "user_type": current_user["user_type"],
        "created_at": current_user.get("created_at"),
        "is_active": current_user.get("is_active", True)
    }


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout (client should discard token)
    """
    print(f"✅ User logged out: {current_user['username']}")
    return {"message": "Successfully logged out"}
