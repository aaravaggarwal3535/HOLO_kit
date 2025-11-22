"""
Request Model for Content Creation Requests
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class ContentRequest(BaseModel):
    """Content request created by companies"""
    id: Optional[str] = Field(alias="_id", default=None)
    company_id: str
    company_username: str
    title: str
    description: str
    budget: Optional[str] = None
    requirements: str = ""  # Requirements as a string
    deadline: Optional[str] = None
    created_at: Optional[str] = None  # ISO format string
    status: str = "open"  # open, closed, completed
    
    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


class ContentRequestCreate(BaseModel):
    """Create new content request"""
    title: str
    description: str
    budget: Optional[str] = None
    requirements: str = ""  # Requirements as a string
    deadline: Optional[str] = None


class CreatorApplication(BaseModel):
    """Creator application to a request"""
    id: Optional[str] = Field(alias="_id", default=None)
    request_id: str
    creator_id: str
    creator_username: str
    profile_url: str
    profile_data: Optional[dict] = None  # Analyzed profile data
    status: str = "pending"  # pending, accepted, rejected
    applied_at: Optional[str] = None  # ISO format string
    
    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


class CreatorApplicationCreate(BaseModel):
    """Create new application"""
    request_id: str
    profile_url: str
