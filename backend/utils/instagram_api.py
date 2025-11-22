"""
Instagram API Wrapper
Uses Meta Graph API to fetch Instagram Business/Creator account data
"""
import os
import re
import requests
from typing import Optional, Dict, List


class InstagramAPI:
    """Wrapper for Instagram Graph API"""
    
    def __init__(self):
        """Initialize with access token from environment"""
        self.access_token = os.getenv("INSTAGRAM_ACCESS_TOKEN")
        self.base_url = "https://graph.instagram.com"
        
    def extract_username(self, url: str) -> Optional[str]:
        """
        Extract Instagram username from URL
        Examples:
            https://www.instagram.com/mkbhd/ -> mkbhd
            https://instagram.com/mkbhd -> mkbhd
        """
        patterns = [
            r'instagram\.com/([^/?]+)',
            r'instagr\.am/([^/?]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                username = match.group(1)
                # Filter out common paths
                if username not in ['p', 'reel', 'tv', 'explore', 'accounts']:
                    return username
        
        return None
    
    def get_user_id_from_username(self, username: str) -> Optional[str]:
        """
        Get Instagram Business Account ID from username using Business Discovery
        Requires: Your Instagram Business Account ID and Access Token
        """
        if not self.access_token:
            print("⚠️  Instagram API: No access token configured")
            return None
        
        # You need to set your own Instagram Business Account ID
        # This is YOUR Instagram Business Account ID that has access to the API
        ig_business_account_id = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID")
        
        if not ig_business_account_id:
            print("⚠️  Instagram API: INSTAGRAM_BUSINESS_ACCOUNT_ID not configured")
            return None
        
        # Use Business Discovery to look up another user's account
        url = f"{self.base_url}/{ig_business_account_id}"
        params = {
            "fields": f"business_discovery.username({username}){{id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website}}",
            "access_token": self.access_token
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Extract the discovered user's ID
            business_discovery = data.get("business_discovery", {})
            return business_discovery.get("id")
        except requests.RequestException as e:
            print(f"❌ Instagram Business Discovery error: {e}")
            return None
    
    def get_profile_from_username(self, username: str) -> Optional[Dict]:
        """
        Fetch Instagram profile data directly using Business Discovery
        This is more direct than getting ID first
        """
        if not self.access_token:
            return None
        
        ig_business_account_id = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID")
        if not ig_business_account_id:
            return None
        
        url = f"{self.base_url}/{ig_business_account_id}"
        params = {
            "fields": f"business_discovery.username({username}){{id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website}}",
            "access_token": self.access_token
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get("business_discovery", {})
        except requests.RequestException as e:
            print(f"❌ Instagram API error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"   Response: {e.response.text}")
            return None
    
    def get_profile_data(self, user_id: str) -> Optional[Dict]:
        """
        Fetch Instagram profile data using Graph API
        
        Fields available:
        - username, name, biography
        - followers_count, follows_count, media_count
        - profile_picture_url
        - website
        """
        if not self.access_token:
            return None
        
        url = f"{self.base_url}/{user_id}"
        params = {
            "fields": "username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website",
            "access_token": self.access_token
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"❌ Instagram API error: {e}")
            return None
    
    def get_recent_media_from_username(self, username: str, limit: int = 10) -> List[Dict]:
        """
        Fetch recent media posts using Business Discovery
        """
        if not self.access_token:
            return []
        
        ig_business_account_id = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID")
        if not ig_business_account_id:
            return []
        
        url = f"{self.base_url}/{ig_business_account_id}"
        params = {
            "fields": f"business_discovery.username({username}){{media.limit({limit}){{id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count}}}}",
            "access_token": self.access_token
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            business_discovery = data.get("business_discovery", {})
            media = business_discovery.get("media", {})
            return media.get("data", [])
        except requests.RequestException as e:
            print(f"❌ Instagram Media API error: {e}")
            return []
    
    def get_recent_media(self, user_id: str, limit: int = 10) -> List[Dict]:
        """
        Fetch recent media posts
        
        Fields available per media:
        - id, caption, media_type, media_url
        - permalink, timestamp
        - like_count, comments_count (requires additional permissions)
        """
        if not self.access_token:
            return []
        
        url = f"{self.base_url}/{user_id}/media"
        params = {
            "fields": "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
            "limit": limit,
            "access_token": self.access_token
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
        except requests.RequestException as e:
            print(f"❌ Instagram Media API error: {e}")
            return []
    
    def analyze_url(self, url: str) -> Dict:
        """
        Main method: Analyze Instagram profile from URL
        Returns real data from Instagram Graph API if configured, otherwise mock data
        """
        username = self.extract_username(url)
        
        if not username:
            return {"error": "Could not extract Instagram username from URL"}
        
        print(f"📸 Fetching Instagram data from: {url}")
        
        # Try to get real data using Business Discovery
        if self.access_token and os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID"):
            profile_data = self.get_profile_from_username(username)
            
            if profile_data:
                print(f"✅ Fetched real Instagram data for @{username}")
                
                # Get media posts
                media_data = self.get_recent_media_from_username(username, limit=6)
                
                # Get top posts by likes
                top_posts = sorted(
                    media_data,
                    key=lambda x: x.get('like_count', 0),
                    reverse=True
                )[:3]
                
                return {
                    "username": profile_data.get("username"),
                    "name": profile_data.get("name") or profile_data.get("username"),
                    "followers": self._format_count(profile_data.get("followers_count", 0)),
                    "following": profile_data.get("follows_count", 0),
                    "bio": profile_data.get("biography", ""),
                    "website": profile_data.get("website"),
                    "posts_count": profile_data.get("media_count", 0),
                    "top_posts": [
                        {
                            "caption": post.get("caption", "")[:100] if post.get("caption") else "No caption",
                            "type": post.get("media_type"),
                            "likes": post.get("like_count", 0),
                            "comments": post.get("comments_count", 0),
                            "url": post.get("permalink")
                        }
                        for post in top_posts
                    ]
                }
        
        # Fallback to mock data if API not configured
        print(f"⚠️  Instagram API not fully configured, using mock data for @{username}")
        return self._generate_mock_data(username)
    
    def _format_count(self, count: int) -> str:
        """Format follower count (1000000 -> 1M)"""
        if count >= 1_000_000:
            return f"{count / 1_000_000:.1f}M"
        elif count >= 1_000:
            return f"{count / 1_000:.1f}K"
        else:
            return str(count)
    
    def _generate_mock_data(self, username: str) -> Dict:
        """Generate realistic mock data for testing"""
        mock_profiles = {
            "mkbhd": {
                "username": "mkbhd",
                "name": "Marques Brownlee",
                "followers": "19.2M",
                "following": 345,
                "bio": "Tech reviews and unboxings 📱⚡️\nYouTube: MKBHD\nPodcast: Waveform",
                "website": "https://www.youtube.com/@mkbhd",
                "posts_count": 4523,
                "top_posts": [
                    {
                        "caption": "The new iPhone 16 Pro Max is here! Full review on YouTube 📱",
                        "type": "IMAGE",
                        "likes": 892000,
                        "comments": 12400,
                        "url": f"https://instagram.com/p/sample1"
                    },
                    {
                        "caption": "Behind the scenes of the studio setup 🎥",
                        "type": "VIDEO",
                        "likes": 756000,
                        "comments": 9800,
                        "url": f"https://instagram.com/p/sample2"
                    },
                    {
                        "caption": "Testing out the new camera tech 📸",
                        "type": "IMAGE",
                        "likes": 634000,
                        "comments": 7200,
                        "url": f"https://instagram.com/p/sample3"
                    }
                ]
            }
        }
        
        # Return specific mock data or generic mock
        if username.lower() in mock_profiles:
            return mock_profiles[username.lower()]
        else:
            return {
                "username": username,
                "name": username.replace("_", " ").title(),
                "followers": "125K",
                "following": 450,
                "bio": f"Creator • Content enthusiast\nFollow for more!",
                "website": None,
                "posts_count": 382,
                "top_posts": [
                    {
                        "caption": "Latest content creation setup 🎬",
                        "type": "IMAGE",
                        "likes": 8900,
                        "comments": 234,
                        "url": f"https://instagram.com/p/{username}1"
                    },
                    {
                        "caption": "Behind the scenes 📸",
                        "type": "VIDEO",
                        "likes": 7600,
                        "comments": 189,
                        "url": f"https://instagram.com/p/{username}2"
                    }
                ]
            }


# Test function
if __name__ == "__main__":
    api = InstagramAPI()
    
    # Test with MKBHD
    result = api.analyze_url("https://www.instagram.com/mkbhd/")
    print("\n" + "="*80)
    print("Instagram Profile Analysis")
    print("="*80)
    print(f"Username: {result.get('username')}")
    print(f"Name: {result.get('name')}")
    print(f"Followers: {result.get('followers')}")
    print(f"Bio: {result.get('bio')}")
    print(f"\nTop Posts: {len(result.get('top_posts', []))}")
    for i, post in enumerate(result.get('top_posts', [])[:3], 1):
        print(f"\n{i}. {post.get('caption')}")
        print(f"   👍 {post.get('likes'):,} likes | 💬 {post.get('comments'):,} comments")
