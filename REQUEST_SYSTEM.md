# Holo-Kit - Request & Application System

## New Features Added

### 🏢 Company Dashboard
Companies can now:
- **Create Content Requests**: Post opportunities for creators with budget, requirements, and deadlines
- **View Applications**: See all creator applications for each request
- **Top 5 Rankings**: Automatically ranked creators based on followers/subscribers
- **Profile Analysis**: Full AI-powered analysis of each applicant's profile
- **Request Management**: Delete requests and track status

### 👨‍🎨 Creator Dashboard
Creators can now:
- **Browse Requests**: View all open content creation opportunities
- **Apply with Profile URL**: Submit YouTube, GitHub, or Instagram profile
- **Automatic Analysis**: Profile gets analyzed by AI instantly upon application
- **Track Applications**: View status of all submitted applications
- **Profile Preview**: See how your analyzed profile data appears to companies

## How It Works

### For Companies:
1. Login as Company user type
2. Navigate to Dashboard (button in top-right)
3. Click "Create New Request"
4. Fill in: Title, Description, Budget, Requirements, Deadline
5. View applications once creators apply
6. See Top 5 ranked creators based on reach
7. View full profile analysis for each applicant

### For Creators:
1. Login as Creator user type
2. Navigate to Dashboard (button in top-right)
3. Browse available open requests
4. Click "Apply Now" on interesting requests
5. Enter your profile URL (YouTube, GitHub, or Instagram)
6. Submit - your profile will be analyzed automatically
7. Track application status in "My Applications" section

## API Endpoints

### Request Management
- `POST /requests/create` - Create new content request (Company only)
- `GET /requests/my-requests` - Get company's requests
- `GET /requests/all` - Get all open requests (Creator only)
- `DELETE /requests/{id}` - Delete request (Company only)

### Applications
- `POST /requests/apply` - Apply to request with profile URL (Creator only)
- `GET /requests/applications/{request_id}` - Get applications for request (Company only)
- `GET /requests/my-applications` - Get creator's applications

## Profile Analysis Integration

When a creator applies:
1. **LangGraph Agent** automatically analyzes the profile URL
2. **Platform Detection**: Identifies YouTube, GitHub, or Instagram
3. **Data Extraction**: Gets subscribers, content type, recent activity
4. **AI Analysis**: Gemini 2.0 Flash generates content summary and vibe check
5. **Storage**: Full profile data stored with application
6. **Ranking**: Creators ranked by follower count for Top 5 display

## Tech Stack

### Backend Routes
- `backend/routes/requests.py` - Full request/application management
- Integrated with existing CreatorAnalyzerAgent
- MongoDB collections: `content_requests`, `creator_applications`

### Frontend Components
- `frontend/src/components/CompanyDashboard.jsx` - Company view
- `frontend/src/components/CreatorDashboard.jsx` - Creator view
- Glassmorphism design matching existing UI
- Real-time profile analysis feedback

## Running the Application

### Backend
```bash
cd backend
uvicorn main:app --reload
```
Server: http://localhost:8000

### Frontend
```bash
cd frontend
npm run dev
```
Server: http://localhost:5173

## Usage Flow

### Test Scenario
1. **Create Company Account**
   - Signup as "company" user type
   - Login and go to Dashboard
   - Create a request: "Tech Product Review - $500 - 10K+ subscribers"

2. **Create Creator Account**
   - Signup as "creator" user type
   - Login and go to Dashboard
   - See the company's request
   - Apply with profile: `https://www.youtube.com/@mkbhd`

3. **Company Views Applications**
   - Refresh company dashboard
   - Click "View Applications" on request
   - See MKBHD's profile analyzed: 19.5M subscribers, tech content
   - View Top 5 ranking (if multiple applications)

## Features Implemented

✅ Separate dashboards for Company and Creator user types
✅ Request creation with full CRUD operations
✅ Application submission with automatic profile analysis
✅ Top 5 creator ranking based on follower count
✅ Real-time profile data display
✅ Application status tracking (pending/accepted/rejected)
✅ Glassmorphism UI matching existing design
✅ Mobile-responsive layout
✅ Error handling and loading states

## Next Steps (Optional Enhancements)

- [ ] Accept/Reject application functionality
- [ ] Email notifications for new applications
- [ ] Advanced filtering (by platform, follower range)
- [ ] Creator messaging system
- [ ] Request templates for companies
- [ ] Analytics dashboard (application rates, avg response time)
- [ ] Portfolio showcase for creators
