# YouTube API Setup Guide

## Error: "YouTube Data API v3 has not been used in project... or it is disabled"

Your API key is valid, but the YouTube Data API v3 needs to be enabled in your Google Cloud project.

## Quick Fix (5 minutes):

### Step 1: Enable the API
Click this direct link (it auto-opens the correct project):
```
https://console.developers.google.com/apis/api/youtube.googleapis.com/overview?project=1057959227379
```

### Step 2: Click "Enable"
- You'll see a big blue "ENABLE" button
- Click it and wait 30-60 seconds

### Step 3: Test Again
```bash
python test_apis.py
```

---

## Alternative: Manual Setup

If the direct link doesn't work:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Select Your Project**
   - Click the project dropdown at the top
   - Select project ID: `1057959227379`

3. **Enable YouTube Data API v3**
   - In the left menu, go to: **APIs & Services > Library**
   - Search for: `YouTube Data API v3`
   - Click on it
   - Click **ENABLE**

4. **Wait 1-2 Minutes**
   - API enablement takes a moment to propagate

5. **Verify Your API Key**
   - Go to: **APIs & Services > Credentials**
   - Your key should show: `AIzaSyBz2vKXKRm5tND2RlK_3S-W0h1KAwm8sTc`
   - Make sure "YouTube Data API v3" is listed under restrictions

---

## Test Without YouTube (Use Mock Data)

If you want to skip YouTube setup for now, the app works with mock data:

### Option 1: Remove the API key temporarily
Edit `.env`:
```bash
# Comment out the YouTube key
# YOUTUBE_API_KEY=AIzaSyBz2vKXKRm5tND2RlK_3S-W0h1KAwm8sTc
```

### Option 2: Test GitHub only
```bash
python -c "
from utils.github_api import GitHubAPI
gh = GitHubAPI()
result = gh.analyze_url('https://github.com/torvalds')
print(result)
"
```

### Option 3: Test with mock data
```bash
python -c "
from utils.helpers import MockDataGenerator
mock = MockDataGenerator.youtube_mock()
print(mock)
"
```

---

## Good News: GitHub API Works Perfectly! ✅

Your GitHub integration is working flawlessly:
- ✅ Fetched Linus Torvalds' profile (256K followers)
- ✅ Retrieved top repos with stars
- ✅ Extracted README content
- ✅ Got language statistics

The UI will work great with GitHub URLs while you enable YouTube.

---

## Security Note

Your API key is now exposed in the terminal output. After enabling the API:

1. **Regenerate your API key**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click on your API key
   - Click "REGENERATE KEY"

2. **Update `.env`**:
   ```bash
   YOUTUBE_API_KEY=your_new_key_here
   ```

3. **Never commit `.env` to git**
   - Already added to `.gitignore` ✅
