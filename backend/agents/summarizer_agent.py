"""
Subsidiary Agent: Transcript Summarizer
Uses Gemini to summarize video transcripts
"""
import os
from typing import Dict, List
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage


class TranscriptSummarizer:
    """Agent that summarizes video transcripts using Gemini"""
    
    def __init__(self, api_key: str = None):
        """Initialize the summarizer with Gemini"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        
        if self.api_key:
            self.llm = ChatGoogleGenerativeAI(
                model="models/gemini-2.0-flash",
                google_api_key=self.api_key,
                temperature=0.3
            )
        else:
            self.llm = None
    
    def summarize_transcript(self, transcript: str, video_title: str = "") -> str:
        """
        Summarize a single video transcript
        
        Args:
            transcript: Full video transcript text
            video_title: Title of the video (for context)
        
        Returns:
            Concise summary of the transcript
        """
        if not self.llm:
            return f"[Mock Summary] Video discusses: {video_title}"
        
        system_prompt = """You are a video content summarizer. 
        Create a concise 2-3 sentence summary of the video transcript.
        Focus on the main topic, key points, and overall message.
        Be factual and direct."""
        
        user_prompt = f"""Video Title: {video_title}

Transcript:
{transcript[:3000]}  

Provide a brief summary (2-3 sentences):"""
        
        try:
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = self.llm.invoke(messages)
            return response.content.strip()
        
        except Exception as e:
            print(f"Error summarizing transcript: {e}")
            return f"[Error] Could not summarize: {video_title}"
    
    def summarize_multiple_transcripts(self, transcripts: List[Dict]) -> List[Dict]:
        """
        Summarize multiple video transcripts
        
        Args:
            transcripts: List of dicts with 'title', 'transcript', and 'description' keys
        
        Returns:
            List of dicts with added 'summary' key
        """
        results = []
        
        for item in transcripts:
            title = item.get('title', 'Untitled')
            transcript = item.get('transcript', '')
            description = item.get('description', '')
            
            if not transcript and not description:
                summary = "[No transcript or description available]"
            elif not transcript:
                # Use video description as fallback
                summary = f"Video titled '{title}' - {description[:200] if description else 'No additional info'}"
            else:
                summary = self.summarize_transcript(transcript, title)
            
            results.append({
                **item,
                'summary': summary
            })
        
        return results
    
    def batch_summarize(self, transcripts: List[str], titles: List[str]) -> List[str]:
        """
        Batch summarize transcripts (convenience method)
        
        Args:
            transcripts: List of transcript texts
            titles: List of video titles
        
        Returns:
            List of summaries
        """
        summaries = []
        
        for transcript, title in zip(transcripts, titles):
            if transcript:
                summary = self.summarize_transcript(transcript, title)
            else:
                summary = "[No transcript available]"
            summaries.append(summary)
        
        return summaries
