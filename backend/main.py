"""
Holo-Kit Backend - FastAPI Server
Main entry point for the holographic media kit generator
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, ConfigDict
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from agents.creator_analyzer import CreatorAnalyzerAgent
from database.mongodb import connect_to_mongo, close_mongo_connection
from routes import auth, requests, image_gen

# Load environment variables
load_dotenv()


# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


# Initialize FastAPI app
app = FastAPI(
    title="Holo-Kit API",
    description="Live 3D Holographic Media Kit Generator with Authentication",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the LangGraph agent
analyzer_agent = CreatorAnalyzerAgent()

# Include authentication routes
app.include_router(auth.router)

# Include request management routes
app.include_router(requests.router)

# Include image generation routes
app.include_router(image_gen.router)


# Request/Response models
class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "url": "https://www.youtube.com/@mkbhd"
            }
        }
    )
    
    url: str


class AnalyzeResponse(BaseModel):
    platform: str
    channel_name: str
    subscribers: str
    content_descriptor: str
    content_summary: str
    about: str = ""
    top_content: list = []
    summaries: list = []


# Routes
@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "service": "Holo-Kit API",
        "status": "online",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/analyze",
            "docs": "/docs"
        }
    }


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_creator(request: AnalyzeRequest):
    """
    Analyze a creator's YouTube or GitHub profile
    
    This endpoint uses a LangGraph agent workflow:
    1. Detect platform (YouTube/GitHub)
    2. Fetch channel/profile data
    3. Get top 2 videos/repos
    4. Fetch transcripts (YouTube only)
    5. Summarize transcripts using subsidiary agent
    6. Analyze content to generate descriptor + summary
    
    Returns:
        - channel_name: Creator's name
        - subscribers: Subscriber/follower count
        - content_descriptor: One-word content vibe
        - content_summary: Short description of content style
        - about: Channel/profile bio
        - top_content: Top 2 videos/repos
        - summaries: Transcript summaries (YouTube only)
    """
    try:
        print(f"\n📥 Received request: {request.url}")
        
        # Run the LangGraph agent
        result = analyzer_agent.analyze(request.url)
        
        # Check for errors
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Ensure all fields have valid values (no None)
        result['about'] = result.get('about') or ""
        result['top_content'] = result.get('top_content') or []
        result['summaries'] = result.get('summaries') or []
        
        print(f"✅ Analysis complete for: {result['channel_name']}\n")
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error processing request: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/health")
def health_check():
    """Detailed health check with API key status"""
    return {
        "status": "healthy",
        "apis": {
            "youtube": "configured" if os.getenv("YOUTUBE_API_KEY") else "missing",
            "github": "configured" if os.getenv("GITHUB_TOKEN") else "optional",
            "gemini": "configured" if os.getenv("GEMINI_API_KEY") else "missing"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")  # Changed from 0.0.0.0 to localhost
    
    print(f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                         HOLO-KIT BACKEND SERVER                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

🚀 Starting server at: http://localhost:{port}
📚 API Documentation: http://localhost:{port}/docs
🔍 Health Check: http://localhost:{port}/health

""")
    
    uvicorn.run(app, host=host, port=port, log_level="info")
