"""
Request Routes
Handles content requests and creator applications
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from bson import ObjectId
from datetime import datetime

from models.request import (
    ContentRequest,
    ContentRequestCreate,
    CreatorApplication,
    CreatorApplicationCreate
)
from database.mongodb import get_database
from routes.auth import get_current_user
from agents.creator_analyzer import CreatorAnalyzerAgent

router = APIRouter(prefix="/requests", tags=["Content Requests"])

# Initialize analyzer
analyzer = CreatorAnalyzerAgent()


@router.post("/create", response_model=ContentRequest, status_code=status.HTTP_201_CREATED)
async def create_request(
    request_data: ContentRequestCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new content request (Company only)
    """
    if current_user["user_type"] != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only companies can create content requests"
        )
    
    db = get_database()
    
    # Create request document
    request_dict = request_data.dict()
    request_dict["company_id"] = str(current_user["_id"])
    request_dict["company_username"] = current_user["username"]
    request_dict["status"] = "open"
    request_dict["created_at"] = datetime.utcnow().isoformat()
    
    result = await db.content_requests.insert_one(request_dict)
    
    # Fetch and return created request
    created_request = await db.content_requests.find_one({"_id": result.inserted_id})
    created_request["_id"] = str(created_request["_id"])
    
    print(f"✅ Content request created by {current_user['username']}: {request_data.title}")
    
    return created_request


@router.get("/my-requests", response_model=List[ContentRequest])
async def get_my_requests(current_user: dict = Depends(get_current_user)):
    """
    Get all requests created by the current company
    """
    if current_user["user_type"] != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only companies can view their requests"
        )
    
    db = get_database()
    
    requests = []
    async for request in db.content_requests.find({"company_id": str(current_user["_id"])}):
        request["_id"] = str(request["_id"])
        requests.append(request)
    
    return requests


@router.get("/all", response_model=List[ContentRequest])
async def get_all_requests(current_user: dict = Depends(get_current_user)):
    """
    Get all open content requests (for creators to browse)
    """
    if current_user["user_type"] != "creator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can browse requests"
        )
    
    db = get_database()
    
    requests = []
    async for request in db.content_requests.find({"status": "open"}):
        request["_id"] = str(request["_id"])
        requests.append(request)
    
    return requests


@router.post("/apply", response_model=CreatorApplication, status_code=status.HTTP_201_CREATED)
async def apply_to_request(
    application_data: CreatorApplicationCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Apply to a content request (Creator only)
    Automatically analyzes the profile using LangGraph agent
    """
    if current_user["user_type"] != "creator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can apply to requests"
        )
    
    db = get_database()
    
    # Check if request exists
    request_obj = await db.content_requests.find_one({"_id": ObjectId(application_data.request_id)})
    if not request_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content request not found"
        )
    
    # Check if already applied
    existing_application = await db.creator_applications.find_one({
        "request_id": application_data.request_id,
        "creator_id": str(current_user["_id"])
    })
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this request"
        )
    
    # Analyze profile using LangGraph agent
    print(f"📊 Analyzing profile for {current_user['username']}: {application_data.profile_url}")
    
    try:
        profile_data = analyzer.analyze(application_data.profile_url)
        
        if "error" in profile_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to analyze profile: {profile_data['error']}"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile analysis failed: {str(e)}"
        )
    
    # Create application
    application_dict = {
        "request_id": application_data.request_id,
        "creator_id": str(current_user["_id"]),
        "creator_username": current_user["username"],
        "is_premium": current_user.get("is_premium", False),  # Include premium status
        "profile_url": application_data.profile_url,
        "profile_data": profile_data,
        "status": "pending",
        "applied_at": datetime.utcnow().isoformat()
    }
    
    result = await db.creator_applications.insert_one(application_dict)
    
    # Fetch and return created application
    created_application = await db.creator_applications.find_one({"_id": result.inserted_id})
    created_application["_id"] = str(created_application["_id"])
    
    print(f"✅ Application submitted by {current_user['username']} to request {application_data.request_id}")
    
    return created_application


@router.get("/applications/{request_id}")
async def get_request_applications(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all applications for a specific request (Company only)
    Returns top 5 creators ranked by followers/subscribers
    """
    if current_user["user_type"] != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only companies can view applications"
        )
    
    db = get_database()
    
    # Verify the request belongs to this company
    request_obj = await db.content_requests.find_one({
        "_id": ObjectId(request_id),
        "company_id": str(current_user["_id"])
    })
    
    if not request_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found or you don't have permission to view it"
        )
    
    # Get all applications
    applications = []
    async for app in db.creator_applications.find({"request_id": request_id}):
        app["_id"] = str(app["_id"])
        applications.append(app)
    
    # Sort by follower count (extract number from string like "1.6M subscribers")
    def extract_number(subscribers_str):
        try:
            # Remove " subscribers", " followers", etc.
            num_str = subscribers_str.split()[0]
            
            # Handle M, K suffixes
            if 'M' in num_str:
                return float(num_str.replace('M', '')) * 1_000_000
            elif 'K' in num_str:
                return float(num_str.replace('K', '')) * 1_000
            else:
                return float(num_str)
        except:
            return 0
    
    # Sort applications by followers
    sorted_applications = sorted(
        applications,
        key=lambda x: extract_number(x.get("profile_data", {}).get("subscribers", "0")),
        reverse=True
    )
    
    # Get top 5
    top_5 = sorted_applications[:5]
    
    return {
        "total_applications": len(applications),
        "all_applications": sorted_applications,
        "top_5": top_5
    }


@router.get("/my-applications", response_model=List[CreatorApplication])
async def get_my_applications(current_user: dict = Depends(get_current_user)):
    """
    Get all applications by the current creator
    """
    if current_user["user_type"] != "creator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can view their applications"
        )
    
    db = get_database()
    
    applications = []
    async for app in db.creator_applications.find({"creator_id": str(current_user["_id"])}):
        app["_id"] = str(app["_id"])
        applications.append(app)
    
    return applications


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a content request (Company only)
    """
    if current_user["user_type"] != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only companies can delete requests"
        )
    
    db = get_database()
    
    # Delete request
    result = await db.content_requests.delete_one({
        "_id": ObjectId(request_id),
        "company_id": str(current_user["_id"])
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found or you don't have permission to delete it"
        )
    
    # Also delete all applications to this request
    await db.creator_applications.delete_many({"request_id": request_id})
    
    print(f"✅ Request {request_id} deleted by {current_user['username']}")
    
    return None


@router.get("/application/{application_id}")
async def get_application_detail(
    application_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a specific application
    Accessible by both company (who owns the request) and creator (who owns the application)
    """
    db = get_database()
    
    # Fetch application
    application = await db.creator_applications.find_one({"_id": ObjectId(application_id)})
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check permissions
    is_creator_owner = str(application["creator_id"]) == str(current_user["_id"])
    
    # Check if company owns the request
    request_obj = await db.content_requests.find_one({"_id": ObjectId(application["request_id"])})
    is_company_owner = request_obj and str(request_obj["company_id"]) == str(current_user["_id"])
    
    if not (is_creator_owner or is_company_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this application"
        )
    
    # Convert ObjectId to string
    application["_id"] = str(application["_id"])
    
    return application

