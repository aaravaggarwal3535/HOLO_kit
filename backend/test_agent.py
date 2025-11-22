"""
Test the LangGraph Creator Analyzer Agent
Run this to test the full workflow
"""
import os
from dotenv import load_dotenv
from agents.creator_analyzer import CreatorAnalyzerAgent

load_dotenv()


def print_section(title: str):
    """Print formatted section"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80 + "\n")


def test_youtube_analysis():
    """Test YouTube channel analysis"""
    print_section("TEST: YOUTUBE CHANNEL ANALYSIS")
    
    agent = CreatorAnalyzerAgent()
    
    # Test URL
    url = "https://www.youtube.com/@mkbhd"
    
    print(f"Analyzing: {url}\n")
    
    result = agent.analyze(url)
    
    if "error" in result:
        print(f"❌ Error: {result['error']}")
        return
    
    # Print results
    print_section("RESULTS")
    
    print(f"📺 Platform: {result['platform'].upper()}")
    print(f"👤 Channel Name: {result['channel_name']}")
    print(f"👥 Subscribers: {result['subscribers']}")
    print(f"🏷️  Content Descriptor: {result['content_descriptor']}")
    print(f"\n📝 Content Summary:")
    print(f"   {result['content_summary']}")
    print(f"\n📖 About:")
    print(f"   {result['about'][:200]}...")
    
    print(f"\n🎬 Top Content ({len(result['top_content'])} items):")
    for i, video in enumerate(result['top_content'], 1):
        print(f"   {i}. {video['title']}")
        if 'view_count' in video:
            print(f"      Views: {video['view_count']:,}")
    
    if result.get('summaries'):
        print(f"\n📄 Transcript Summaries:")
        for i, summary in enumerate(result['summaries'], 1):
            print(f"   {i}. {summary['title']}")
            print(f"      {summary.get('summary', 'No summary')[:150]}...")


def test_github_analysis():
    """Test GitHub profile analysis"""
    print_section("TEST: GITHUB PROFILE ANALYSIS")
    
    agent = CreatorAnalyzerAgent()
    
    # Test URL
    url = "https://github.com/torvalds"
    
    print(f"Analyzing: {url}\n")
    
    result = agent.analyze(url)
    
    if "error" in result:
        print(f"❌ Error: {result['error']}")
        return
    
    # Print results
    print_section("RESULTS")
    
    print(f"💻 Platform: {result['platform'].upper()}")
    print(f"👤 Name: {result['channel_name']}")
    print(f"👥 Followers: {result['subscribers']}")
    print(f"🏷️  Content Descriptor: {result['content_descriptor']}")
    print(f"\n📝 Content Summary:")
    print(f"   {result['content_summary']}")
    print(f"\n📖 Bio:")
    print(f"   {result['about']}")
    
    print(f"\n⭐ Top Repositories ({len(result['top_content'])} items):")
    for i, repo in enumerate(result['top_content'], 1):
        print(f"   {i}. {repo['title']}")
        if 'stars' in repo:
            print(f"      ⭐ Stars: {repo['stars']}")
        if 'description' in repo:
            print(f"      {repo['description'][:100]}...")


def test_api_endpoint_simulation():
    """Simulate the FastAPI endpoint behavior"""
    print_section("TEST: API ENDPOINT SIMULATION")
    
    agent = CreatorAnalyzerAgent()
    
    # Simulate POST /analyze request
    test_urls = [
        "https://www.youtube.com/@channel",
        "https://github.com/username"
    ]
    
    for url in test_urls:
        print(f"\n📨 POST /analyze")
        print(f"Request Body: {{ \"url\": \"{url}\" }}")
        
        result = agent.analyze(url)
        
        print(f"\n📤 Response:")
        print(f"   Status: {'✅ 200 OK' if 'error' not in result else '❌ 400 Bad Request'}")
        print(f"   Body: {result}")
        print("\n" + "-" * 80)


def main():
    """Run all tests"""
    print("\n")
    print("╔" + "═" * 78 + "╗")
    print("║" + " " * 15 + "LANGGRAPH CREATOR ANALYZER - TEST SUITE" + " " * 24 + "║")
    print("╚" + "═" * 78 + "╝")
    
    # Check API keys
    has_yt = bool(os.getenv("YOUTUBE_API_KEY"))
    has_gh = bool(os.getenv("GITHUB_TOKEN"))
    has_gemini = bool(os.getenv("GEMINI_API_KEY"))
    
    print(f"\n📋 Environment Status:")
    print(f"   YOUTUBE_API_KEY: {'✅' if has_yt else '❌'} {' (using mock data)' if not has_yt else ''}")
    print(f"   GITHUB_TOKEN: {'✅' if has_gh else '⚠️ '} {' (optional)' if not has_gh else ''}")
    print(f"   GEMINI_API_KEY: {'✅' if has_gemini else '❌'} {' (using mock analysis)' if not has_gemini else ''}")
    
    # Run tests
    try:
        test_github_analysis()  # GitHub works without API key
        
        if has_yt:
            test_youtube_analysis()
        else:
            print("\n⚠️  Skipping YouTube test (no API key)")
        
        test_api_endpoint_simulation()
    
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "═" * 80)
    print("✨ All tests completed!")
    print("═" * 80 + "\n")


if __name__ == "__main__":
    main()
