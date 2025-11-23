"""
Premium Subscription Routes
Handles premium upgrades for creators
"""
from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timedelta
from bson import ObjectId

from database.mongodb import get_database
from routes.auth import get_current_user

router = APIRouter(prefix="/premium", tags=["Premium"])


@router.post("/upgrade")
async def upgrade_to_premium(
    duration_months: int = 1,
    current_user: dict = Depends(get_current_user)
):
    """
    Upgrade creator account to premium
    Duration: 1, 3, 6, or 12 months
    """
    if current_user["user_type"] != "creator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only creators can upgrade to premium"
        )
    
    # Validate duration
    if duration_months not in [1, 3, 6, 12]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duration must be 1, 3, 6, or 12 months"
        )
    
    db = get_database()
    
    # Calculate expiration date
    now = datetime.utcnow()
    expires_at = now + timedelta(days=duration_months * 30)
    
    # Update user to premium
    result = await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {
            "$set": {
                "is_premium": True,
                "premium_since": now.isoformat(),
                "premium_expires": expires_at.isoformat()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Calculate pricing
    pricing = {
        1: 9.99,
        3: 24.99,
        6: 44.99,
        12: 79.99
    }
    
    print(f"✨ {current_user['username']} upgraded to Premium ({duration_months} months)")
    
    return {
        "success": True,
        "message": f"Successfully upgraded to Premium for {duration_months} months",
        "premium_expires": expires_at.isoformat(),
        "amount_charged": pricing[duration_months]
    }


@router.get("/status")
async def get_premium_status(current_user: dict = Depends(get_current_user)):
    """
    Get current premium status
    """
    db = get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    is_premium = user.get("is_premium", False)
    premium_expires = user.get("premium_expires")
    
    # Check if premium has expired
    if is_premium and premium_expires:
        try:
            expires_date = datetime.fromisoformat(premium_expires)
            if expires_date < datetime.utcnow():
                # Premium expired, revoke it
                await db.users.update_one(
                    {"_id": ObjectId(current_user["_id"])},
                    {"$set": {"is_premium": False}}
                )
                is_premium = False
        except:
            pass
    
    return {
        "is_premium": is_premium,
        "premium_since": user.get("premium_since"),
        "premium_expires": premium_expires,
        "user_type": user.get("user_type")
    }


@router.post("/cancel")
async def cancel_premium(current_user: dict = Depends(get_current_user)):
    """
    Cancel premium subscription (will expire at end of period)
    """
    db = get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    
    if not user.get("is_premium", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a premium member"
        )
    
    print(f"❌ {current_user['username']} cancelled Premium subscription")
    
    return {
        "success": True,
        "message": "Premium cancelled. You will retain access until expiration date.",
        "premium_expires": user.get("premium_expires")
    }
