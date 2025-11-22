"""
LangGraph Agent: Creator Analyzer
Multi-step workflow for analyzing YouTube/GitHub creators
"""
import os
from typing import TypedDict, Annotated, Sequence, Literal
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from utils.youtube_api import YouTubeAPI
from utils.github_api import GitHubAPI
from utils.instagram_api import InstagramAPI
from utils.helpers import detect_platform, PlatformType, MockDataGenerator
from agents.summarizer_agent import TranscriptSummarizer


# Define the state schema
class AnalyzerState(TypedDict):
    """State for the creator analyzer workflow"""
    url: str
    platform: str
    channel_name: str
    subscribers: str
    about: str
    top_videos: list
    transcripts: list
    summaries: list
    content_descriptor: str
    content_summary: str
    final_output: dict
    error: str


class CreatorAnalyzerAgent:
    """LangGraph agent for analyzing creator profiles"""
    
    def __init__(self):
        """Initialize the agent with APIs and LLM"""
        self.youtube_api = YouTubeAPI()
        self.github_api = GitHubAPI()
        self.instagram_api = InstagramAPI()
        self.summarizer = TranscriptSummarizer()
        
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            self.llm = ChatGoogleGenerativeAI(
                model="models/gemini-2.0-flash",
                google_api_key=gemini_key,
                temperature=0.5
            )
        else:
            self.llm = None
        
        # Build the graph
        self.workflow = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        workflow = StateGraph(AnalyzerState)
        
        # Add nodes
        workflow.add_node("detect_platform", self.detect_platform_node)
        workflow.add_node("fetch_youtube_data", self.fetch_youtube_data_node)
        workflow.add_node("fetch_github_data", self.fetch_github_data_node)
        workflow.add_node("fetch_instagram_data", self.fetch_instagram_data_node)
        workflow.add_node("get_transcripts", self.get_transcripts_node)
        workflow.add_node("summarize_transcripts", self.summarize_transcripts_node)
        workflow.add_node("analyze_content", self.analyze_content_node)
        workflow.add_node("format_output", self.format_output_node)
        
        # Set entry point
        workflow.set_entry_point("detect_platform")
        
        # Add conditional edges
        workflow.add_conditional_edges(
            "detect_platform",
            self.route_by_platform,
            {
                "youtube": "fetch_youtube_data",
                "github": "fetch_github_data",
                "instagram": "fetch_instagram_data",
                "error": END
            }
        )
        
        workflow.add_edge("fetch_youtube_data", "get_transcripts")
        workflow.add_edge("get_transcripts", "summarize_transcripts")
        workflow.add_edge("summarize_transcripts", "analyze_content")
        workflow.add_edge("analyze_content", "format_output")
        workflow.add_edge("format_output", END)
        
        workflow.add_edge("fetch_github_data", "analyze_content")
        workflow.add_edge("fetch_instagram_data", "analyze_content")
        
        return workflow.compile()
    
    # ============================================================================
    # NODE FUNCTIONS
    # ============================================================================
    
    def detect_platform_node(self, state: AnalyzerState) -> AnalyzerState:
        """Node: Detect which platform the URL belongs to"""
        url = state["url"]
        platform = detect_platform(url)
        
        print(f"🔍 Detected platform: {platform.value}")
        
        state["platform"] = platform.value
        
        if platform == PlatformType.UNKNOWN:
            state["error"] = "Unsupported platform. Use YouTube or GitHub URL."
        
        return state
    
    def fetch_youtube_data_node(self, state: AnalyzerState) -> AnalyzerState:
        """Node: Fetch YouTube channel data"""
        url = state["url"]
        
        print(f"📺 Fetching YouTube data from: {url}")
        
        # Use mock data if no API key
        if not self.youtube_api.api_key:
            print("⚠️  No YouTube API key, using mock data")
            mock_data = MockDataGenerator.youtube_mock()
            state["channel_name"] = mock_data["title"]
            state["subscribers"] = mock_data["subscribers"]
            state["about"] = mock_data["description"]
            state["top_videos"] = [
                {"title": title, "video_id": f"mock_{i}"}
                for i, title in enumerate(mock_data["video_titles"][:2])
            ]
            return state
        
        # Fetch real data
        data = self.youtube_api.analyze_url(url)
        
        if not data:
            state["error"] = "Failed to fetch YouTube data"
            return state
        
        state["channel_name"] = data["title"]
        state["subscribers"] = data["subscribers"]
        state["about"] = data.get("description", "")
        
        # Get top 2 videos
        top_videos = data.get("top_videos", [])[:2]
        state["top_videos"] = [
            {
                "title": video["title"],
                "video_id": video["video_id"],
                "view_count": video["view_count"],
                "description": video.get("description", "")
            }
            for video in top_videos
        ]
        
        print(f"✅ Fetched: {state['channel_name']} ({state['subscribers']} subscribers)")
        print(f"📹 Top videos: {len(state['top_videos'])}")
        
        return state
    
    def fetch_github_data_node(self, state: AnalyzerState) -> AnalyzerState:
        """Node: Fetch GitHub profile data"""
        url = state["url"]
        
        print(f"💻 Fetching GitHub data from: {url}")
        
        data = self.github_api.analyze_url(url)
        
        if not data:
            state["error"] = "Failed to fetch GitHub data"
            return state
        
        state["channel_name"] = data["name"] or data["username"]
        state["subscribers"] = f"{data['followers']} followers"
        state["about"] = data.get("bio", "")
        
        # Get top repos as "videos"
        top_repos = data.get("top_repos", [])[:2]
        state["top_videos"] = [
            {
                "title": repo["name"],
                "description": repo["description"],
                "stars": repo["stars"]
            }
            for repo in top_repos
        ]
        
        print(f"✅ Fetched: {state['channel_name']} ({state['subscribers']})")
        
        return state
    
    def fetch_instagram_data_node(self, state: AnalyzerState) -> AnalyzerState:
        """Node: Fetch Instagram profile data"""
        url = state["url"]
        
        print(f"📸 Fetching Instagram data from: {url}")
        
        data = self.instagram_api.analyze_url(url)
        
        if "error" in data:
            state["error"] = data["error"]
            return state
        
        state["channel_name"] = data["name"] or data["username"]
        state["subscribers"] = f"{data['followers']} followers"
        state["about"] = data.get("bio", "")
        
        # Get top posts as "videos"
        top_posts = data.get("top_posts", [])[:2]
        state["top_videos"] = [
            {
                "title": post["caption"][:100] if post["caption"] else "Untitled Post",
                "likes": post.get("likes", 0),
                "comments": post.get("comments", 0),
                "type": post.get("type", "IMAGE"),
                "url": post.get("url", "")
            }
            for post in top_posts
        ]
        
        print(f"✅ Fetched: {state['channel_name']} ({state['subscribers']})")
        
        return state
    
    def get_transcripts_node(self, state: AnalyzerState) -> AnalyzerState:
        """Node: Fetch transcripts for top 2 videos"""
        top_videos = state["top_videos"]
        
        print(f"📝 Fetching transcripts for {len(top_videos)} videos...")
        
        transcripts = []
        
        for video in top_videos:
            video_id = video.get("video_id")
            title = video["title"]
            description = video.get("description", "")
            
            if not video_id:
                transcripts.append({
                    "title": title,
                    "transcript": None,
                    "description": description
                })
                continue
            
            # Use mock transcript if no API key
            if not self.youtube_api.api_key:
                transcript_text = f"[Mock transcript for: {title}] This video covers technical content related to the channel's niche."
            else:
                transcript_text = self.youtube_api.get_video_transcript(video_id)
            
            transcripts.append({
                "title": title,
                "transcript": transcript_text,
                "video_id": video_id,
                "description": description
            })
            
            status = "✅" if transcript_text else "⚠️ "
            print(f"{status} Transcript: {title[:50]}...")
        
        state["transcripts"] = transcripts
        
        return state
    
    def summarize_transcripts_node(self, state: AnalyzerState) -> AnalyzerState:
        """Node: Summarize transcripts using subsidiary agent"""
        transcripts = state["transcripts"]
        
        print(f"🤖 Summarizing {len(transcripts)} transcripts...")
        
        # Call the subsidiary summarizer agent
        summarized = self.summarizer.summarize_multiple_transcripts(transcripts)
        
        state["summaries"] = summarized
        
        for item in summarized:
            print(f"✅ Summary: {item['title'][:40]}...")
            print(f"   {item['summary'][:80]}...")
        
        return state
    
    def analyze_content_node(self, state: AnalyzerState) -> AnalyzerState:
        """Node: Analyze channel content and generate descriptor + summary"""
        channel_name = state["channel_name"]
        about = state["about"]
        platform = state["platform"]
        
        print(f"🧠 Analyzing content for: {channel_name}")
        
        # For GitHub, use repo descriptions
        if platform == "github":
            content_context = "\n".join([
                f"- {v['title']}: {v.get('description', 'No description')}"
                for v in state["top_videos"]
            ])
        # For Instagram, use post captions
        elif platform == "instagram":
            content_context = "\n".join([
                f"- Post: {v['title']} ({v.get('likes', 0)} likes, {v.get('comments', 0)} comments)"
                for v in state["top_videos"]
            ])
        else:
            # For YouTube, use summaries and video titles
            summaries = state.get("summaries", [])
            top_videos = state.get("top_videos", [])
            
            # Build context from summaries (or descriptions if no transcript)
            content_parts = []
            for i, s in enumerate(summaries):
                summary_text = s.get('summary', '')
                if summary_text and not summary_text.startswith('[No'):
                    content_parts.append(f"- {s['title']}: {summary_text}")
                elif i < len(top_videos):
                    # Fallback to video title and description
                    video = top_videos[i]
                    desc = video.get('description', '')[:150]
                    content_parts.append(f"- {video['title']}: {desc if desc else 'Popular video'}")
            
            content_context = "\n".join(content_parts) if content_parts else f"Channel creates content about: {about[:200]}"
        
        # Use LLM to analyze
        if not self.llm:
            # Mock response
            state["content_descriptor"] = "Tech Educator"
            state["content_summary"] = f"{channel_name} creates content focused on technology, development, and innovation."
            return state
        
        system_prompt = """You are a content analyst. Analyze creator profiles and provide:
1. A ONE-WORD descriptor that captures their content vibe (e.g., "Innovator", "Educator", "Reviewer")
   - Do NOT use markdown formatting (no ** or __)
   - Just return the single word
2. A SHORT summary (1-2 sentences) describing their content style and focus

Be concise and insightful."""
        
        user_prompt = f"""Creator: {channel_name}
Platform: {platform.upper()}

About: {about}

Recent Content:
{content_context}

Provide:
1. One-word descriptor:
2. Short summary:"""
        
        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = self.llm.invoke(messages)
            result = response.content.strip()
            
            # Parse response
            lines = result.split('\n')
            descriptor = "Creator"
            summary = result
            
            for line in lines:
                if "descriptor:" in line.lower() or line.startswith("1."):
                    descriptor = line.split(":")[-1].strip().strip('"\'*_ ')
                elif "summary:" in line.lower() or line.startswith("2."):
                    summary = line.split(":", 1)[-1].strip()
            
            # Clean up descriptor (remove markdown formatting)
            descriptor = descriptor.replace('**', '').replace('__', '').replace('*', '').replace('_', '').strip()
            
            state["content_descriptor"] = descriptor
            state["content_summary"] = summary
            
            print(f"✅ Descriptor: {descriptor}")
            print(f"✅ Summary: {summary[:80]}...")
        
        except Exception as e:
            print(f"Error analyzing content: {e}")
            state["content_descriptor"] = "Creator"
            state["content_summary"] = f"{channel_name} creates content on {platform}."
        
        return state
    
    def format_output_node(self, state: AnalyzerState) -> AnalyzerState:
        """Node: Format final output"""
        print(f"📦 Formatting final output...")
        
        output = {
            "platform": state["platform"],
            "channel_name": state["channel_name"],
            "subscribers": state["subscribers"],
            "content_descriptor": state["content_descriptor"],
            "content_summary": state["content_summary"],
            "about": state.get("about") or "",
            "top_content": state.get("top_videos") or [],
            "summaries": state.get("summaries", [])
        }
        
        state["final_output"] = output
        
        return state
    
    # ============================================================================
    # ROUTING FUNCTIONS
    # ============================================================================
    
    def route_by_platform(self, state: AnalyzerState) -> Literal["youtube", "github", "instagram", "error"]:
        """Route to appropriate data fetching node based on platform"""
        if state.get("error"):
            return "error"
        
        platform = state.get("platform", "")
        
        if platform == "youtube":
            return "youtube"
        elif platform == "github":
            return "github"
        elif platform == "instagram":
            return "instagram"
        else:
            return "error"
    
    # ============================================================================
    # MAIN EXECUTION
    # ============================================================================
    
    def analyze(self, url: str) -> dict:
        """
        Main method: Analyze a creator URL
        
        Args:
            url: YouTube or GitHub URL
        
        Returns:
            dict with analysis results
        """
        print(f"\n{'='*80}")
        print(f"🚀 Starting Creator Analysis")
        print(f"{'='*80}\n")
        
        # Initialize state
        initial_state = {
            "url": url,
            "platform": "",
            "channel_name": "",
            "subscribers": "",
            "about": "",
            "top_videos": [],
            "transcripts": [],
            "summaries": [],
            "content_descriptor": "",
            "content_summary": "",
            "final_output": {},
            "error": ""
        }
        
        # Run the workflow
        final_state = self.workflow.invoke(initial_state)
        
        # Check for errors
        if final_state.get("error"):
            print(f"\n❌ Error: {final_state['error']}\n")
            return {"error": final_state["error"]}
        
        print(f"\n{'='*80}")
        print(f"✨ Analysis Complete!")
        print(f"{'='*80}\n")
        
        return final_state["final_output"]
