"""
YouTube API Helper Functions
Fetches channel info, statistics, and video transcripts
"""
import os
import re
from typing import Optional, Dict, List
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi


class YouTubeAPI:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize YouTube API client"""
        self.api_key = api_key or os.getenv("YOUTUBE_API_KEY")
        self.youtube = None
        if self.api_key:
            self.youtube = build('youtube', 'v3', developerKey=self.api_key)
    
    def extract_channel_id_from_url(self, url: str) -> Optional[str]:
        """
        Extract channel ID from various YouTube URL formats:
        - youtube.com/@username
        - youtube.com/channel/CHANNEL_ID
        - youtube.com/c/CustomName
        - youtube.com/user/Username
        """
        # Direct channel ID pattern
        channel_id_pattern = r'youtube\.com/channel/([a-zA-Z0-9_-]+)'
        match = re.search(channel_id_pattern, url)
        if match:
            return match.group(1)
        
        # Handle @username format
        handle_pattern = r'youtube\.com/@([a-zA-Z0-9_-]+)'
        match = re.search(handle_pattern, url)
        if match:
            handle = match.group(1)
            return self._get_channel_id_from_handle(handle)
        
        # Handle /c/ or /user/ format
        custom_pattern = r'youtube\.com/(?:c|user)/([a-zA-Z0-9_-]+)'
        match = re.search(custom_pattern, url)
        if match:
            username = match.group(1)
            return self._get_channel_id_from_username(username)
        
        return None
    
    def extract_video_id_from_url(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL"""
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})',
            r'youtube\.com/embed/([a-zA-Z0-9_-]{11})',
            r'youtube\.com/v/([a-zA-Z0-9_-]{11})'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def _get_channel_id_from_handle(self, handle: str) -> Optional[str]:
        """Get channel ID from @handle"""
        if not self.youtube:
            return None
        
        try:
            request = self.youtube.search().list(
                part="snippet",
                q=f"@{handle}",
                type="channel",
                maxResults=1
            )
            response = request.execute()
            
            if response['items']:
                return response['items'][0]['snippet']['channelId']
        except Exception as e:
            print(f"Error fetching channel from handle: {e}")
        
        return None
    
    def _get_channel_id_from_username(self, username: str) -> Optional[str]:
        """Get channel ID from legacy username"""
        if not self.youtube:
            return None
        
        try:
            request = self.youtube.search().list(
                part="snippet",
                q=username,
                type="channel",
                maxResults=1
            )
            response = request.execute()
            
            if response['items']:
                return response['items'][0]['snippet']['channelId']
        except Exception as e:
            print(f"Error fetching channel from username: {e}")
        
        return None
    
    def get_channel_from_video(self, video_id: str) -> Optional[str]:
        """Get channel ID from video ID"""
        if not self.youtube:
            return None
        
        try:
            request = self.youtube.videos().list(
                part="snippet",
                id=video_id
            )
            response = request.execute()
            
            if response['items']:
                return response['items'][0]['snippet']['channelId']
        except Exception as e:
            print(f"Error fetching channel from video: {e}")
        
        return None
    
    def get_channel_stats(self, channel_id: str) -> Optional[Dict]:
        """
        Fetch channel statistics and info
        Returns: {
            "title": str,
            "description": str,
            "subscribers": str,
            "view_count": int,
            "video_count": int,
            "thumbnail": str
        }
        """
        if not self.youtube:
            return None
        
        try:
            request = self.youtube.channels().list(
                part="snippet,statistics",
                id=channel_id
            )
            response = request.execute()
            
            if not response['items']:
                return None
            
            channel = response['items'][0]
            snippet = channel['snippet']
            stats = channel['statistics']
            
            return {
                "channel_id": channel_id,
                "title": snippet['title'],
                "description": snippet['description'],
                "subscribers": self._format_subscriber_count(stats.get('subscriberCount', '0')),
                "subscriber_count_raw": int(stats.get('subscriberCount', 0)),
                "view_count": int(stats.get('viewCount', 0)),
                "video_count": int(stats.get('videoCount', 0)),
                "thumbnail": snippet['thumbnails']['high']['url'],
                "custom_url": snippet.get('customUrl', '')
            }
        except Exception as e:
            print(f"Error fetching channel stats: {e}")
            return None
    
    def get_top_videos(self, channel_id: str, max_results: int = 5) -> List[Dict]:
        """
        Fetch top videos from channel sorted by view count
        Returns list of video metadata
        """
        if not self.youtube:
            return []
        
        try:
            # Get recent uploads
            request = self.youtube.search().list(
                part="snippet",
                channelId=channel_id,
                order="viewCount",
                type="video",
                maxResults=max_results
            )
            response = request.execute()
            
            videos = []
            video_ids = [item['id']['videoId'] for item in response['items']]
            
            # Get detailed stats for these videos
            stats_request = self.youtube.videos().list(
                part="snippet,statistics,contentDetails",
                id=",".join(video_ids)
            )
            stats_response = stats_request.execute()
            
            for video in stats_response['items']:
                videos.append({
                    "video_id": video['id'],
                    "title": video['snippet']['title'],
                    "description": video['snippet']['description'],
                    "published_at": video['snippet']['publishedAt'],
                    "thumbnail": video['snippet']['thumbnails']['high']['url'],
                    "view_count": int(video['statistics'].get('viewCount', 0)),
                    "like_count": int(video['statistics'].get('likeCount', 0)),
                    "comment_count": int(video['statistics'].get('commentCount', 0)),
                    "duration": video['contentDetails']['duration']
                })
            
            return videos
        except Exception as e:
            print(f"Error fetching top videos: {e}")
            return []
    
    def get_video_transcript(self, video_id: str) -> Optional[str]:
        """
        Fetch video transcript/captions
        Returns full transcript as text
        Tries multiple strategies: auto-generated, manual, translated
        """
        try:
            # Try to get transcript in English (auto-generated or manual)
            transcript_list = YouTubeTranscriptApi.get_transcript(
                video_id,
                languages=['en', 'en-US', 'en-GB']
            )
            
            # Combine all transcript segments
            full_transcript = " ".join([entry['text'] for entry in transcript_list])
            return full_transcript
        
        except Exception as first_error:
            # Try to get any available transcript (any language)
            try:
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                
                # Try to get first available transcript
                for transcript in transcript_list:
                    try:
                        fetched = transcript.fetch()
                        full_transcript = " ".join([entry['text'] for entry in fetched])
                        return full_transcript
                    except:
                        continue
                
                # If no transcript worked, return None
                print(f"⚠️  No transcript available for {video_id} (captions may be disabled)")
                return None
            
            except Exception as e:
                # Video has no transcripts at all
                error_msg = str(e).lower()
                if "subtitles are disabled" in error_msg or "no transcripts" in error_msg:
                    print(f"⚠️  Transcripts disabled for {video_id}")
                else:
                    print(f"⚠️  Could not fetch transcript for {video_id}: {str(e)[:100]}")
                return None
    
    def get_video_titles_for_analysis(self, channel_id: str, max_videos: int = 10) -> List[str]:
        """
        Get video titles for AI vibe analysis
        Returns list of recent video titles
        """
        videos = self.get_top_videos(channel_id, max_results=max_videos)
        return [video['title'] for video in videos]
    
    def analyze_url(self, url: str) -> Optional[Dict]:
        """
        Main method: Analyze any YouTube URL (video or channel)
        Returns comprehensive channel data with top videos
        """
        # Check if it's a video URL
        video_id = self.extract_video_id_from_url(url)
        if video_id:
            # Get channel from video
            channel_id = self.get_channel_from_video(video_id)
        else:
            # Try to extract channel ID directly
            channel_id = self.extract_channel_id_from_url(url)
        
        if not channel_id:
            return None
        
        # Fetch channel stats
        channel_data = self.get_channel_stats(channel_id)
        if not channel_data:
            return None
        
        # Fetch top videos
        top_videos = self.get_top_videos(channel_id, max_results=5)
        
        # Get transcript of most viewed video if available
        if top_videos:
            top_video_id = top_videos[0]['video_id']
            transcript = self.get_video_transcript(top_video_id)
            channel_data['top_video_transcript'] = transcript
            channel_data['top_video'] = top_videos[0]
        
        channel_data['top_videos'] = top_videos
        channel_data['video_titles'] = [v['title'] for v in top_videos]
        
        return channel_data
    
    @staticmethod
    def _format_subscriber_count(count: str) -> str:
        """Format subscriber count (e.g., 1500000 -> '1.5M')"""
        count = int(count)
        if count >= 1_000_000:
            return f"{count / 1_000_000:.1f}M"
        elif count >= 1_000:
            return f"{count / 1_000:.1f}K"
        return str(count)
