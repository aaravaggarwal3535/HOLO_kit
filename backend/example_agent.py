"""
Quick Example: Run the LangGraph Agent
"""
from agents.creator_analyzer import CreatorAnalyzerAgent

# Initialize the agent
agent = CreatorAnalyzerAgent()

# Analyze a YouTube channel
youtube_result = agent.analyze("https://www.youtube.com/@mkbhd")

print("\n" + "="*80)
print("YOUTUBE ANALYSIS RESULTS")
print("="*80)
print(f"1️⃣  Channel Name: {youtube_result['channel_name']}")
print(f"2️⃣  Subscribers: {youtube_result['subscribers']}")
print(f"3️⃣  Content Descriptor: {youtube_result['content_descriptor']}")
print(f"4️⃣  Content Summary: {youtube_result['content_summary']}")
print("\nTop Videos:")
for i, video in enumerate(youtube_result['top_content'], 1):
    print(f"   {i}. {video['title']}")

if youtube_result.get('summaries'):
    print("\nTranscript Summaries:")
    for i, summary in enumerate(youtube_result['summaries'], 1):
        print(f"   {i}. {summary['summary'][:100]}...")

print("\n" + "="*80 + "\n")

# Analyze a GitHub profile
github_result = agent.analyze("https://github.com/torvalds")

print("="*80)
print("GITHUB ANALYSIS RESULTS")
print("="*80)
print(f"1️⃣  Name: {github_result['channel_name']}")
print(f"2️⃣  Followers: {github_result['subscribers']}")
print(f"3️⃣  Content Descriptor: {github_result['content_descriptor']}")
print(f"4️⃣  Content Summary: {github_result['content_summary']}")
print("\nTop Repositories:")
for i, repo in enumerate(github_result['top_content'], 1):
    print(f"   {i}. {repo['title']} (⭐ {repo.get('stars', 0)})")

print("\n" + "="*80)
