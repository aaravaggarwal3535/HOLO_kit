"""
Utility Functions
URL detection, validation, and helper methods
"""
import re
from typing import Optional, Literal
from enum import Enum


class PlatformType(str, Enum):
    YOUTUBE = "youtube"
    GITHUB = "github"
    INSTAGRAM = "instagram"
    UNKNOWN = "unknown"


def detect_platform(url: str) -> PlatformType:
    """
    Detect which platform a URL belongs to
    Returns: PlatformType enum
    """
    url = url.lower().strip()
    
    if 'youtube.com' in url or 'youtu.be' in url:
        return PlatformType.YOUTUBE
    elif 'github.com' in url:
        return PlatformType.GITHUB
    elif 'instagram.com' in url or 'instagr.am' in url:
        return PlatformType.INSTAGRAM
    else:
        return PlatformType.UNKNOWN


def validate_url(url: str) -> bool:
    """Basic URL validation"""
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    return url_pattern.match(url) is not None


def sanitize_url(url: str) -> str:
    """Clean and normalize URL"""
    url = url.strip()
    
    # Add https:// if missing
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    return url


def format_large_number(num: int) -> str:
    """
    Format large numbers with K/M/B suffixes
    1500 -> "1.5K"
    1500000 -> "1.5M"
    """
    if num >= 1_000_000_000:
        return f"{num / 1_000_000_000:.1f}B"
    elif num >= 1_000_000:
        return f"{num / 1_000_000:.1f}M"
    elif num >= 1_000:
        return f"{num / 1_000:.1f}K"
    return str(num)


def truncate_text(text: str, max_length: int = 500, suffix: str = "...") -> str:
    """Truncate text to max length"""
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix


def extract_domain(url: str) -> Optional[str]:
    """Extract domain from URL"""
    domain_pattern = r'https?://(?:www\.)?([^/]+)'
    match = re.search(domain_pattern, url)
    return match.group(1) if match else None


class MockDataGenerator:
    """Generate mock data when API keys are missing"""
    
    @staticmethod
    def youtube_mock() -> dict:
        return {
            "platform": "youtube",
            "title": "Demo Tech Creator",
            "subscribers": "1.5M",
            "subscriber_count_raw": 1500000,
            "view_count": 50000000,
            "video_count": 234,
            "description": "Tech reviews, coding tutorials, and developer content",
            "thumbnail": "https://via.placeholder.com/800x800.png?text=Demo+Creator",
            "video_titles": [
                "Building a 3D Portfolio with React Three Fiber",
                "Why I Switched to Neovim (Developer Setup Tour)",
                "10 GitHub Projects That Changed My Career",
                "Real-time Collaboration with WebSockets",
                "My Honest Review of the M4 MacBook Pro"
            ],
            "vibe": "Chaotic Good Tech Reviewer",
            "estimated_rate": "$15,000 - $25,000"
        }
    
    @staticmethod
    def github_mock() -> dict:
        return {
            "platform": "github",
            "username": "demo-developer",
            "name": "Demo Developer",
            "bio": "Full-stack developer | Open source contributor | Building cool stuff",
            "followers": 1250,
            "public_repos": 87,
            "top_languages": ["TypeScript", "Python", "Rust", "Go"],
            "avatar_url": "https://via.placeholder.com/400x400.png?text=Demo+Dev",
            "repo_descriptions": [
                "A blazingly fast web framework for Rust",
                "Real-time collaborative code editor",
                "Machine learning model deployment toolkit",
                "3D visualization library for React",
                "CLI tool for project scaffolding"
            ],
            "vibe": "Open Source Wizard",
            "estimated_rate": "$10,000 - $20,000"
        }
    
    @staticmethod
    def get_mock_by_platform(platform: PlatformType) -> dict:
        """Get appropriate mock data based on platform"""
        if platform == PlatformType.YOUTUBE:
            return MockDataGenerator.youtube_mock()
        elif platform == PlatformType.GITHUB:
            return MockDataGenerator.github_mock()
        else:
            return {
                "platform": "unknown",
                "error": "Unsupported platform"
            }
