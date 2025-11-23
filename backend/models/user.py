"""
User Model for MongoDB
Supports two user types: Creator and Company
"""
from pydantic import BaseModel, EmailStr, Field, GetCoreSchemaHandler
from pydantic_core import core_schema
from typing import Optional, Literal, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):
    """Custom ObjectId type for Pydantic v2"""
    
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ])
        ])
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


class UserBase(BaseModel):
    """Base user fields"""
    email: EmailStr
    username: str
    full_name: str
    user_type: Literal["creator", "company"]
    
    class Config:
        json_encoders = {ObjectId: str}


class UserCreate(UserBase):
    """User creation model"""
    password: str


class UserInDB(UserBase):
    """User in database with hashed password"""
    id: Optional[str] = Field(alias="_id", default=None)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_premium: bool = False  # Premium subscription status
    premium_since: Optional[datetime] = None  # When premium was activated
    premium_expires: Optional[datetime] = None  # Premium expiration date
    profile_data: Optional[dict] = None  # Store creator/company specific data
    
    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True


class User(UserBase):
    """User response model (without password)"""
    id: str
    created_at: datetime
    is_active: bool
    
    class Config:
        json_encoders = {ObjectId: str}


class Token(BaseModel):
    """JWT Token response"""
    access_token: str
    token_type: str = "bearer"
    user_type: str
    username: str


class TokenData(BaseModel):
    """Token payload data"""
    username: Optional[str] = None
    user_type: Optional[str] = None
