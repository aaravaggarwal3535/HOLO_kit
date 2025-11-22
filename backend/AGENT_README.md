# LangGraph Creator Analyzer Agent

## Overview

A multi-agent LangGraph workflow that analyzes YouTube/GitHub creator profiles with the following features:

### **Main Agent Flow:**
1. **Platform Detection** → Detect if URL is YouTube or GitHub
2. **Data Fetching** → Fetch channel/profile data
3. **Transcript Retrieval** → Get transcripts for top 2 videos (YouTube only)
4. **Subsidiary Agent** → Summarize transcripts using Gemini
5. **Content Analysis** → Generate one-word descriptor + short summary
6. **Output Formatting** → Return structured results

### **Output:**
- ✅ **Channel Name**
- ✅ **Subscribers/Followers**
- ✅ **Content Descriptor** (one word, e.g., "Educator", "Innovator")
- ✅ **Content Summary** (short description based on channel about + transcript analysis)
- ✅ **Top 2 Videos/Repos**
- ✅ **Transcript Summaries** (YouTube only)

## Installation

```bash
# Install all dependencies
pip install -r requirements.txt

# Configure API keys in .env
cp .env.example .env
# Add your YOUTUBE_API_KEY, GEMINI_API_KEY, GITHUB_TOKEN
```

## Usage

### **Option 1: Run the Agent Directly**
```bash
python example_agent.py
```

### **Option 2: Test the Full Workflow**
```bash
python test_agent.py
```

### **Option 3: Start the FastAPI Server**
```bash
python main.py
# or
uvicorn main:app --reload
```

Then make a POST request:
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/@mkbhd"}'
```

### **Option 4: Use in Your Code**
```python
from agents.creator_analyzer import CreatorAnalyzerAgent

agent = CreatorAnalyzerAgent()
result = agent.analyze("https://www.youtube.com/@channel")

print(f"Channel: {result['channel_name']}")
print(f"Subscribers: {result['subscribers']}")
print(f"Vibe: {result['content_descriptor']}")
print(f"Summary: {result['content_summary']}")
```

## Architecture

### **LangGraph Nodes:**

```
START
  ↓
detect_platform
  ↓
[YouTube Path]              [GitHub Path]
  ↓                             ↓
fetch_youtube_data          fetch_github_data
  ↓                             ↓
get_transcripts                 |
  ↓                             |
summarize_transcripts           |
  ↓                             ↓
  └─────→ analyze_content ←─────┘
              ↓
        format_output
              ↓
             END
```

### **Subsidiary Agent:**
- **TranscriptSummarizer** → Takes transcripts, returns concise summaries using Gemini 1.5 Flash

## Mock Data Support

The agent works **without API keys** using mock data:
- No `YOUTUBE_API_KEY` → Returns demo channel data
- No `GEMINI_API_KEY` → Returns mock descriptors/summaries
- `GITHUB_TOKEN` is optional (higher rate limits if provided)

## API Response Example

```json
{
  "platform": "youtube",
  "channel_name": "MKBHD",
  "subscribers": "18.5M",
  "content_descriptor": "Reviewer",
  "content_summary": "MKBHD creates in-depth tech reviews and product analyses with a focus on smartphones, gadgets, and emerging technology.",
  "about": "Quality Tech Videos...",
  "top_content": [
    {
      "title": "iPhone 15 Pro Review",
      "video_id": "abc123",
      "view_count": 5000000
    }
  ],
  "summaries": [
    {
      "title": "iPhone 15 Pro Review",
      "summary": "Comprehensive review of Apple's flagship phone..."
    }
  ]
}
```

## Key Features

✅ **Multi-Agent Architecture** → Main analyzer + subsidiary summarizer  
✅ **LangGraph Workflow** → State-based execution with conditional routing  
✅ **Gemini Integration** → AI-powered content analysis  
✅ **Platform Support** → YouTube & GitHub  
✅ **Transcript Analysis** → Fetches & summarizes video content  
✅ **FastAPI Ready** → Production-ready REST API  
✅ **Mock Data Fallback** → Works without API keys  

## Files

```
backend/
├── main.py                      # FastAPI server with /analyze endpoint
├── agents/
│   ├── creator_analyzer.py      # Main LangGraph agent
│   └── summarizer_agent.py      # Subsidiary transcript summarizer
├── utils/
│   ├── youtube_api.py           # YouTube Data API wrapper
│   ├── github_api.py            # GitHub API wrapper
│   └── helpers.py               # Utilities & mock data
├── test_agent.py                # Full test suite
└── example_agent.py             # Quick example
```
