"""
Example Usage and Testing Script for YouTube and GitHub APIs
Run this to test the API functions with real URLs
"""
import os
from dotenv import load_dotenv
from utils.youtube_api import YouTubeAPI
from utils.github_api import GitHubAPI
from utils.helpers import detect_platform, PlatformType, MockDataGenerator
import json


# Load environment variables
load_dotenv()


def print_section(title: str):
    """Print formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80 + "\n")


def test_youtube_api():
    """Test YouTube API with various URL formats"""
    print_section("YOUTUBE API TESTS")
    
    yt = YouTubeAPI()
    
    # Test URLs
    test_urls = [
        "https://www.youtube.com/@mkbhd",  # Handle format
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",  # Video URL
        "https://www.youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ",  # Channel ID
    ]
    
    for url in test_urls:
        print(f"🔗 Testing URL: {url}\n")
        
        # Extract IDs
        video_id = yt.extract_video_id_from_url(url)
        channel_id = yt.extract_channel_id_from_url(url)
        
        print(f"   Video ID: {video_id or 'N/A'}")
        print(f"   Channel ID: {channel_id or 'N/A'}")
        
        # Analyze full URL
        if os.getenv("YOUTUBE_API_KEY"):
            print("\n   📊 Analyzing channel...\n")
            result = yt.analyze_url(url)
            
            if result:
                print(f"   ✅ Channel: {result['title']}")
                print(f"   👥 Subscribers: {result['subscribers']}")
                print(f"   📹 Videos: {result['video_count']}")
                print(f"   👁️  Total Views: {result['view_count']:,}")
                
                if result.get('top_videos'):
                    print(f"\n   🔥 Top Videos:")
                    for i, video in enumerate(result['top_videos'][:3], 1):
                        print(f"      {i}. {video['title']}")
                        print(f"         Views: {video['view_count']:,}")
                
                if result.get('top_video_transcript'):
                    transcript = result['top_video_transcript']
                    print(f"\n   📝 Top Video Transcript Preview:")
                    print(f"      {transcript[:200]}...")
            else:
                print("   ❌ Failed to analyze URL")
        else:
            print("   ⚠️  No YOUTUBE_API_KEY found. Skipping live API call.")
        
        print("\n" + "-" * 80 + "\n")


def test_github_api():
    """Test GitHub API with various URL formats"""
    print_section("GITHUB API TESTS")
    
    gh = GitHubAPI()
    
    # Test URLs
    test_urls = [
        "https://github.com/torvalds",  # User profile
        "https://github.com/vercel",  # Organization
        "https://github.com/kamranahmedse/developer-roadmap",  # Specific repo
    ]
    
    for url in test_urls:
        print(f"🔗 Testing URL: {url}\n")
        
        # Extract username
        username = gh.extract_username_from_url(url)
        print(f"   Username: {username or 'N/A'}")
        
        # Analyze full URL
        if username:
            print("\n   📊 Analyzing profile...\n")
            result = gh.analyze_url(url)
            
            if result:
                print(f"   ✅ Name: {result['name'] or result['username']}")
                print(f"   👥 Followers: {result['followers']}")
                print(f"   📦 Public Repos: {result['public_repos']}")
                
                if result.get('bio'):
                    print(f"   💭 Bio: {result['bio']}")
                
                if result.get('top_languages'):
                    print(f"\n   💻 Top Languages: {', '.join(result['top_languages'][:5])}")
                
                if result.get('top_repos'):
                    print(f"\n   ⭐ Top Repositories:")
                    for i, repo in enumerate(result['top_repos'][:3], 1):
                        print(f"      {i}. {repo['name']}")
                        print(f"         ⭐ Stars: {repo['stars']} | Language: {repo['language']}")
                        if repo['description']:
                            print(f"         {repo['description'][:80]}...")
                
                if result.get('top_repo_readme'):
                    readme = result['top_repo_readme']
                    print(f"\n   📝 Top Repo README Preview:")
                    print(f"      {readme[:200].replace(chr(10), ' ')}...")
            else:
                print("   ❌ Failed to analyze URL")
        
        print("\n" + "-" * 80 + "\n")


def test_platform_detection():
    """Test platform detection utility"""
    print_section("PLATFORM DETECTION TESTS")
    
    test_urls = [
        "https://www.youtube.com/@channel",
        "https://youtu.be/dQw4w9WgXcQ",
        "https://github.com/username",
        "https://twitter.com/user",
    ]
    
    for url in test_urls:
        platform = detect_platform(url)
        emoji = "🎥" if platform == PlatformType.YOUTUBE else "💻" if platform == PlatformType.GITHUB else "❓"
        print(f"{emoji} {url}")
        print(f"   Platform: {platform.value}\n")


def test_mock_data():
    """Test mock data generators"""
    print_section("MOCK DATA GENERATORS")
    
    print("🎥 YouTube Mock Data:\n")
    yt_mock = MockDataGenerator.youtube_mock()
    print(json.dumps(yt_mock, indent=2))
    
    print("\n" + "-" * 80 + "\n")
    
    print("💻 GitHub Mock Data:\n")
    gh_mock = MockDataGenerator.github_mock()
    print(json.dumps(gh_mock, indent=2))


def test_individual_functions():
    """Test individual API methods"""
    print_section("INDIVIDUAL FUNCTION TESTS")
    
    yt = YouTubeAPI()
    gh = GitHubAPI()
    
    # YouTube individual tests
    print("🎥 YouTube Functions:\n")
    
    test_video_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    video_id = yt.extract_video_id_from_url(test_video_url)
    print(f"   extract_video_id_from_url('{test_video_url}')")
    print(f"   → {video_id}\n")
    
    if os.getenv("YOUTUBE_API_KEY") and video_id:
        print(f"   get_channel_from_video('{video_id}')")
        channel_id = yt.get_channel_from_video(video_id)
        print(f"   → {channel_id}\n")
        
        if channel_id:
            print(f"   get_channel_stats('{channel_id}')")
            stats = yt.get_channel_stats(channel_id)
            if stats:
                print(f"   → Title: {stats['title']}")
                print(f"   → Subscribers: {stats['subscribers']}\n")
            
            print(f"   get_top_videos('{channel_id}', max_results=2)")
            videos = yt.get_top_videos(channel_id, max_results=2)
            for video in videos:
                print(f"   → {video['title']} ({video['view_count']:,} views)")
    
    print("\n" + "-" * 80 + "\n")
    
    # GitHub individual tests
    print("💻 GitHub Functions:\n")
    
    test_gh_url = "https://github.com/torvalds"
    username = gh.extract_username_from_url(test_gh_url)
    print(f"   extract_username_from_url('{test_gh_url}')")
    print(f"   → {username}\n")
    
    if username:
        print(f"   get_user_profile('{username}')")
        profile = gh.get_user_profile(username)
        if profile:
            print(f"   → Name: {profile['name']}")
            print(f"   → Followers: {profile['followers']}\n")
        
        print(f"   get_top_repos_by_stars('{username}', max_results=2)")
        repos = gh.get_top_repos_by_stars(username, max_results=2)
        for repo in repos:
            print(f"   → {repo['name']} (⭐ {repo['stars']})")


def main():
    """Run all tests"""
    print("\n")
    print("╔" + "═" * 78 + "╗")
    print("║" + " " * 20 + "HOLO-KIT API TESTING SUITE" + " " * 32 + "║")
    print("╚" + "═" * 78 + "╝")
    
    # Check for API keys
    has_yt_key = bool(os.getenv("YOUTUBE_API_KEY"))
    has_gh_token = bool(os.getenv("GITHUB_TOKEN"))
    
    print(f"\n📋 Environment Status:")
    print(f"   YOUTUBE_API_KEY: {'✅ Set' if has_yt_key else '❌ Not set (using mock data)'}")
    print(f"   GITHUB_TOKEN: {'✅ Set' if has_gh_token else '⚠️  Not set (public API, rate limited)'}")
    
    # Run tests
    test_platform_detection()
    test_youtube_api()
    test_github_api()
    test_individual_functions()
    test_mock_data()
    
    print("\n" + "═" * 80)
    print("✨ All tests completed!")
    print("═" * 80 + "\n")


if __name__ == "__main__":
    main()
