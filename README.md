# 🌟 Holo-Kit - Live 3D Holographic Media Kits

> **Transform static PDFs into live, AI-powered 3D holographic profiles**

A next-generation platform that analyzes YouTube, GitHub, and Instagram profiles in real-time, providing companies and creators with a marketplace for content collaboration.

![Holo-Kit Banner](https://via.placeholder.com/1200x400/22D3EE/ffffff?text=Holo-Kit)

## ✨ Features

### 🎨 3D Holographic Visualization
- **Real-time Profile Analysis** with AI-powered insights
- **Interactive 3D Glass Cards** with mouse-responsive tilt effects
- **Dynamic Star Fields** and floating glassmorphic elements
- **Platform-Specific Themes** (YouTube Red, GitHub Purple, Instagram Pink)

### 🤖 AI-Powered Analysis
- **Multi-Agent LangGraph System** with 8-node workflow
- **Google Gemini 2.0 Flash** for content analysis
- **Multi-Language Transcript Support** with automatic fallback
- **Smart Platform Detection** (YouTube, GitHub, Instagram)

### 👥 Two-Sided Marketplace

#### For Companies 🏢
- Create content creation requests
- View creator applications with full analysis
- Top 5 creator rankings by reach
- Detailed profile insights with AI summaries

#### For Creators 🎨
- Browse open opportunities
- Apply with social media profile
- Automatic profile analysis
- Track application status

### 🎭 Dynamic Profile Pages
- **AI-Generated Cover Images** (optional with Replicate API)
- **3D Interactive Cards** for Reach and Category
- **Mouse-Responsive Animations**
- **Content Deep Dive** with video summaries
- **Top Content Showcase**

## 🚀 Tech Stack

### Backend
- **FastAPI 0.115.0** - Modern async Python API
- **MongoDB** with Motor (async driver)
- **LangGraph 0.2.45** - Multi-agent AI workflows
- **Google Gemini 2.0 Flash** - AI content analysis
- **JWT Authentication** with bcrypt

### Frontend
- **React 19.2.0** with Vite 7.2.4
- **@react-three/fiber & @react-three/drei** - 3D graphics
- **Framer Motion** - Smooth animations
- **Tailwind CSS 4.1** - Styling
- **React Router v6** - Navigation

### APIs & Integrations
- YouTube Data API v3
- GitHub REST API
- Instagram Graph API (Business Discovery)
- Replicate API (optional - for image generation)

## 📦 Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Add your API keys to .env
GEMINI_API_KEY=your_gemini_key
YOUTUBE_API_KEY=your_youtube_key
GITHUB_TOKEN=your_github_token
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=holo_kit
JWT_SECRET_KEY=your-secret-key

# Optional for Instagram
INSTAGRAM_ACCESS_TOKEN=your_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_id

# Optional for AI image generation
REPLICATE_API_TOKEN=your_replicate_token

# Run server
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs at: http://localhost:5173

## 🎯 Usage

### 1. Sign Up
- Choose user type: **Company** or **Creator**
- Create account with username and password

### 2. For Companies
1. Login → Dashboard
2. Click **"Create New Request"**
3. Fill in: Title, Description, Budget, Requirements, Deadline
4. View applications from creators
5. See **Top 5 ranked creators** by reach
6. Click any application to see **full profile analysis**

### 3. For Creators
1. Login → Dashboard
2. Browse **Available Requests**
3. Click **"Apply Now"**
4. Enter your profile URL (YouTube, GitHub, or Instagram)
5. Profile gets **automatically analyzed by AI**
6. Track application status

### 4. Profile Analyzer
- Paste any YouTube, GitHub, or Instagram URL
- Get instant AI analysis with:
  - Subscriber/follower count
  - Content category
  - AI-generated summary
  - Top content
  - Engagement metrics

## 🏗️ Project Structure

```
IIIT-Delhi/
├── backend/
│   ├── agents/
│   │   └── creator_analyzer.py      # LangGraph workflow
│   ├── database/
│   │   └── mongodb.py                # Async MongoDB
│   ├── models/
│   │   ├── user.py                   # User models
│   │   └── request.py                # Request/Application models
│   ├── routes/
│   │   ├── auth.py                   # Authentication
│   │   ├── requests.py               # Request management
│   │   └── image_gen.py              # Image generation
│   ├── utils/
│   │   ├── auth.py                   # JWT utilities
│   │   ├── youtube_api.py            # YouTube integration
│   │   ├── github_api.py             # GitHub integration
│   │   └── instagram_api.py          # Instagram integration
│   └── main.py                       # FastAPI app
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx       # Main search
│   │   │   ├── GlassCard.jsx         # 3D result card
│   │   │   ├── Login.jsx             # Auth
│   │   │   ├── Signup.jsx            # Auth
│   │   │   ├── CompanyDashboard.jsx  # Company UI
│   │   │   ├── CreatorDashboard.jsx  # Creator UI
│   │   │   └── ProfileDetail.jsx     # Full profile view
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth
│   │   ├── services/
│   │   │   └── authApi.js            # API client
│   │   └── App.jsx                   # Routes
│   └── package.json
│
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Profile Analysis
- `POST /analyze` - Analyze creator profile

### Requests & Applications
- `POST /requests/create` - Create request (Company)
- `GET /requests/my-requests` - Get company's requests
- `GET /requests/all` - Get open requests (Creator)
- `POST /requests/apply` - Apply to request (Creator)
- `GET /requests/applications/{id}` - Get applications
- `GET /requests/application/{id}` - Get single application
- `GET /requests/my-applications` - Get creator's applications
- `DELETE /requests/{id}` - Delete request

### Image Generation
- `POST /image/generate-profile-cover` - Generate cover image

## 🎨 Key Features Showcase

### 3D Glass Card with Platform Badge
```javascript
// Displays profile data in holographic glass card
- Reach (subscribers/followers)
- Category (content type)
- AI-generated summary
- Platform-specific colors
```

### Mouse-Responsive 3D Tilt
```javascript
// Cards tilt based on mouse position
useMotionValue() + useSpring() = smooth 3D effect
```

### LangGraph Multi-Agent System
```python
# 8-node workflow
detect_platform → fetch_data → get_transcripts → 
summarize → analyze_content → format_output
```

## 🌟 Screenshots

*(Add screenshots here)*

## 🤝 Contributing

Contributions welcome! Please follow these steps:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file

## 👨‍💻 Author

**Aarav Aggarwal**
- GitHub: [@aaravaggarwal3535](https://github.com/aaravaggarwal3535)

## 🙏 Acknowledgments

- Google Gemini API for AI analysis
- YouTube, GitHub, Instagram APIs
- React Three Fiber community
- FastAPI & MongoDB teams

---

**Built with ❤️ for creators and companies**
