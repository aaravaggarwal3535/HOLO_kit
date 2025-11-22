# Holo-Kit Backend API

FastAPI backend for the Holo-Kit holographic media kit generator.

## Setup

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Configure API Keys**
Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

Required API keys:
- **YouTube Data API v3**: [Get key](https://console.cloud.google.com/apis/credentials)
- **Google Gemini API**: [Get key](https://makersuite.google.com/app/apikey)
- **GitHub Token** (optional): [Generate token](https://github.com/settings/tokens)

3. **Run the Server**
```bash
uvicorn main:app --reload
```

## API Endpoints

### `POST /analyze`
Analyzes a creator's YouTube or GitHub profile.

**Request:**
```json
{
  "url": "https://youtube.com/@channel"
}
```

**Response:**
```json
{
  "platform": "youtube",
  "name": "Creator Name",
  "subscribers": "1.5M",
  "vibe": "Chaotic Good Tech Reviewer",
  "estimated_rate": "$15,000 - $25,000",
  "data": { /* full profile data */ }
}
```

## Features

- **YouTube Analysis**: Channel stats, subscriber count, top videos, transcripts
- **GitHub Analysis**: Profile stats, top repos, languages, activity
- **AI Vibe Check**: Gemini-powered personality analysis
- **Mock Data Mode**: Works without API keys for development

## Project Structure

```
backend/
├── main.py              # FastAPI app
├── requirements.txt     # Dependencies
├── .env.example        # Environment template
└── utils/
    ├── youtube_api.py  # YouTube Data API wrapper
    ├── github_api.py   # GitHub API wrapper
    └── helpers.py      # Utilities & mock data
```
