"""
Dynamic Image Generation using Replicate API
Generates profile cover images for creators
"""
from fastapi import APIRouter, HTTPException, Depends
import os
from routes.auth import get_current_user

try:
    import replicate
    REPLICATE_AVAILABLE = True
except ImportError:
    REPLICATE_AVAILABLE = False

router = APIRouter(prefix="/image", tags=["Image Generation"])


@router.post("/generate-profile-cover")
async def generate_profile_cover(
    platform: str,
    channel_name: str,
    subscribers: str,
    category: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a dynamic profile cover image using AI
    """
    try:
        # Check if Replicate is available
        if not REPLICATE_AVAILABLE:
            return {
                "image_url": f"https://via.placeholder.com/1200x400/{get_platform_color(platform)}/ffffff?text={channel_name}",
                "message": "Replicate library not installed (using placeholder)"
            }
        
        # Check if Replicate API key exists
        replicate_api_key = os.getenv("REPLICATE_API_TOKEN")
        if not replicate_api_key:
            # Return a placeholder gradient image URL if no API key
            return {
                "image_url": f"https://via.placeholder.com/1200x400/{get_platform_color(platform)}/ffffff?text={channel_name}",
                "message": "Using placeholder image (Replicate API key not configured)"
            }
        
        # Create a prompt for the image generation
        prompt = f"""
        Professional holographic social media cover image for {channel_name}.
        Platform: {platform}. Category: {category}. Audience: {subscribers}.
        Style: Modern, glassy, 3D holographic effect with vibrant gradients.
        Colors: Cyan, purple, and pink neon tones. Abstract tech background.
        Text overlay: "{channel_name}" in bold futuristic font.
        High quality, 4K resolution, ultra detailed.
        """
        
        # Use Stable Diffusion or DALL-E equivalent
        output = replicate.run(
            "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
            input={
                "prompt": prompt,
                "width": 1200,
                "height": 400,
                "num_outputs": 1,
            }
        )
        
        image_url = output[0] if isinstance(output, list) else output
        
        return {
            "image_url": image_url,
            "message": "Image generated successfully"
        }
        
    except Exception as e:
        print(f"❌ Image generation error: {str(e)}")
        # Fallback to gradient placeholder
        return {
            "image_url": f"https://via.placeholder.com/1200x400/{get_platform_color(platform)}/ffffff?text={channel_name}",
            "message": f"Error generating image, using placeholder: {str(e)}"
        }


def get_platform_color(platform: str) -> str:
    """Get hex color for platform"""
    colors = {
        "youtube": "FF0000",
        "github": "8B5CF6",
        "instagram": "E4405F",
    }
    return colors.get(platform.lower(), "22D3EE")
