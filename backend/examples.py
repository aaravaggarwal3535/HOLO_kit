"""
Quick API Examples - Copy & Run These Snippets
"""

# ============================================================================
# EXAMPLE 1: Analyze a YouTube Channel
# ============================================================================

from utils.youtube_api import YouTubeAPI

yt = YouTubeAPI()  # Uses YOUTUBE_API_KEY from .env

# Option A: From a video URL
result = yt.analyze_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ")

# Option B: From a channel handle
result = yt.analyze_url("https://www.youtube.com/@mkbhd")

# Option C: From a channel ID
result = yt.analyze_url("https://www.youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ")

# Result contains:
print(result['title'])              # "MKBHD"
print(result['subscribers'])        # "18.5M"
print(result['subscriber_count_raw']) # 18500000
print(result['video_count'])        # 1234
print(result['view_count'])         # 3500000000
print(result['top_videos'])         # List of top 5 videos
print(result['video_titles'])       # List of video titles for AI
print(result['top_video_transcript']) # Full transcript of top video


# ============================================================================
# EXAMPLE 2: Get YouTube Channel Stats Only
# ============================================================================

from utils.youtube_api import YouTubeAPI

yt = YouTubeAPI()

# Extract channel ID from any URL format
channel_id = yt.extract_channel_id_from_url("https://www.youtube.com/@channel")

# Get just the stats
stats = yt.get_channel_stats(channel_id)
print(stats)
# {
#   "channel_id": "UC...",
#   "title": "Channel Name",
#   "description": "...",
#   "subscribers": "1.5M",
#   "subscriber_count_raw": 1500000,
#   "view_count": 50000000,
#   "video_count": 234,
#   "thumbnail": "https://...",
#   "custom_url": "@channel"
# }


# ============================================================================
# EXAMPLE 3: Get Video Transcripts
# ============================================================================

from utils.youtube_api import YouTubeAPI

yt = YouTubeAPI()

# Extract video ID
video_id = yt.extract_video_id_from_url("https://www.youtube.com/watch?v=abc123")

# Get transcript
transcript = yt.get_video_transcript(video_id)
print(transcript)  # Full text of video captions


# ============================================================================
# EXAMPLE 4: Analyze a GitHub Profile
# ============================================================================

from utils.github_api import GitHubAPI

gh = GitHubAPI()  # Uses GITHUB_TOKEN from .env (optional)

# Analyze any GitHub URL
result = gh.analyze_url("https://github.com/torvalds")

# Result contains:
print(result['username'])           # "torvalds"
print(result['name'])              # "Linus Torvalds"
print(result['bio'])               # "..."
print(result['followers'])         # 150000
print(result['public_repos'])      # 10
print(result['top_languages'])     # ["C", "Shell", "Makefile"]
print(result['top_repos'])         # List of top 5 repos with stats
print(result['repo_descriptions']) # List of descriptions for AI
print(result['top_repo_readme'])   # README content of top repo
print(result['activity'])          # Recent activity summary


# ============================================================================
# EXAMPLE 5: Get GitHub User Stats Only
# ============================================================================

from utils.github_api import GitHubAPI

gh = GitHubAPI()

# Extract username
username = gh.extract_username_from_url("https://github.com/username")

# Get profile
profile = gh.get_user_profile(username)
print(profile)
# {
#   "username": "username",
#   "name": "Full Name",
#   "bio": "...",
#   "followers": 1250,
#   "following": 89,
#   "public_repos": 87,
#   "avatar_url": "https://...",
#   "blog": "https://...",
#   "location": "San Francisco",
#   "company": "@company"
# }


# ============================================================================
# EXAMPLE 6: Get Top GitHub Repositories
# ============================================================================

from utils.github_api import GitHubAPI

gh = GitHubAPI()

# Get most starred repos
repos = gh.get_top_repos_by_stars("username", max_results=5)

for repo in repos:
    print(f"{repo['name']} - ⭐ {repo['stars']}")
    print(f"  Language: {repo['language']}")
    print(f"  Description: {repo['description']}")
    print(f"  URL: {repo['url']}\n")


# ============================================================================
# EXAMPLE 7: Platform Detection
# ============================================================================

from utils.helpers import detect_platform, PlatformType

url = "https://www.youtube.com/@channel"
platform = detect_platform(url)

if platform == PlatformType.YOUTUBE:
    print("This is a YouTube URL")
elif platform == PlatformType.GITHUB:
    print("This is a GitHub URL")
else:
    print("Unknown platform")


# ============================================================================
# EXAMPLE 8: Mock Data (No API Keys Needed)
# ============================================================================

from utils.helpers import MockDataGenerator, PlatformType

# Get mock YouTube data
mock_yt = MockDataGenerator.youtube_mock()
print(mock_yt['title'])        # "Demo Tech Creator"
print(mock_yt['subscribers'])  # "1.5M"
print(mock_yt['vibe'])        # "Chaotic Good Tech Reviewer"

# Get mock GitHub data
mock_gh = MockDataGenerator.github_mock()
print(mock_gh['username'])     # "demo-developer"
print(mock_gh['followers'])    # 1250

# Auto-select by platform
platform = PlatformType.YOUTUBE
mock_data = MockDataGenerator.get_mock_by_platform(platform)


# ============================================================================
# EXAMPLE 9: URL Validation & Sanitization
# ============================================================================

from utils.helpers import validate_url, sanitize_url

# Validate
is_valid = validate_url("https://youtube.com/@channel")  # True

# Sanitize (adds https:// if missing)
clean_url = sanitize_url("youtube.com/@channel")
print(clean_url)  # "https://youtube.com/@channel"


# ============================================================================
# EXAMPLE 10: Format Large Numbers
# ============================================================================

from utils.helpers import format_large_number

print(format_large_number(1500))        # "1.5K"
print(format_large_number(1500000))     # "1.5M"
print(format_large_number(1500000000))  # "1.5B"


# ============================================================================
# EXAMPLE 11: Combined Workflow (What the FastAPI Endpoint Does)
# ============================================================================

from utils.youtube_api import YouTubeAPI
from utils.github_api import GitHubAPI
from utils.helpers import detect_platform, PlatformType, MockDataGenerator

def analyze_creator(url: str):
    """Full analysis workflow"""
    
    # Detect platform
    platform = detect_platform(url)
    
    if platform == PlatformType.YOUTUBE:
        yt = YouTubeAPI()
        
        # Check if API key exists
        if yt.api_key:
            data = yt.analyze_url(url)
        else:
            data = MockDataGenerator.youtube_mock()
        
        return {
            "platform": "youtube",
            "name": data['title'],
            "subscribers": data['subscribers'],
            "vibe": "TBD - Send to Gemini AI",
            "data": data
        }
    
    elif platform == PlatformType.GITHUB:
        gh = GitHubAPI()
        data = gh.analyze_url(url)
        
        if not data:
            data = MockDataGenerator.github_mock()
        
        return {
            "platform": "github",
            "name": data['name'] or data['username'],
            "followers": data['followers'],
            "vibe": "TBD - Send to Gemini AI",
            "data": data
        }
    
    else:
        return {"error": "Unsupported platform"}


# Usage
result = analyze_creator("https://youtube.com/@mkbhd")
print(result)
