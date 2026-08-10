# TikTok Login & Video Upload Platform v2.0

A modern, scalable platform for authenticating with TikTok OAuth and uploading/publishing videos. Built with Node.js + TypeScript backend and Vue 3 + TypeScript frontend.

## 🎯 What's New in v2.0

### Architecture Improvements
- ✅ Complete TypeScript rewrite for type safety
- ✅ Modular backend structure (auth, video, user modules)
- ✅ Comprehensive error handling with standardized error codes
- ✅ Professional logging with Winston
- ✅ Separation of concerns (controllers, services, middleware)

### Frontend Enhancements
- ✅ Modern Vue 3 with Composition API
- ✅ Pinia for state management
- ✅ Tailwind CSS for styling
- ✅ Type-safe components with TypeScript
- ✅ OAuth flow integration
- ✅ Drag & drop file upload
- ✅ Real-time upload progress tracking

### Backend Features
- ✅ OAuth 2.0 state validation (CSRF protection)
- ✅ Automatic token refresh (5 min before expiry)
- ✅ Chunked video upload support
- ✅ Draft & publish options
- ✅ Privacy settings and content restrictions
- ✅ Comprehensive API error responses

## 📦 Project Structure

```
.
├── src/                          # Backend TypeScript source
│   ├── modules/
│   │   ├── auth/                # OAuth & authentication
│   │   ├── video/               # Video upload & publish
│   │   └── user/                # User management (planned)
│   ├── shared/                  # Shared utilities & middleware
│   ├── config/                  # Configuration
│   ├── types/                   # TypeScript types
│   └── server.ts                # Express server entry
├── frontend/                     # Vue 3 frontend
│   ├── src/
│   │   ├── pages/               # Page components
│   │   ├── components/          # Reusable components
│   │   ├── stores/              # Pinia stores
│   │   ├── services/            # API services
│   │   ├── router/              # Vue Router
│   │   └── assets/              # Styles & assets
│   ├── index.html               # HTML entry
│   └── vite.config.ts           # Vite configuration
├── docker-compose.yml           # Multi-container setup
├── Dockerfile                   # Backend container
├── DEVELOPMENT.md               # Development guide
├── SDD_TIKTOK_LOGIN_UPLOAD.md  # Software design document
└── package.json                 # Backend dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS)
- Docker & Docker Compose (optional)
- TikTok OAuth credentials from https://developer.tiktok.com

### 1. Setup Backend

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update with your TikTok credentials
# TIKTOK_CLIENT_KEY=your_key
# TIKTOK_CLIENT_SECRET=your_secret
# TIKTOK_REDIRECT_URI=http://localhost:3000/api/v1/auth/callback
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

cd ..
```

### 3. Development

**Terminal 1 - Backend (Port 3000)**
```bash
npm run dev
```

**Terminal 2 - Frontend (Port 5173)**
```bash
cd frontend && npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Docker Setup (Optional)

```bash
# Start all services
docker-compose up --build

# Application will be at http://localhost:3000
# Backend API: http://localhost:3000/api/v1
```

## 📡 API Documentation

### Authentication Endpoints

#### Get OAuth URL
```bash
GET /api/v1/auth/url
```

Response:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://www.tiktok.com/v2/auth/authorize/...",
    "state": "abc123..."
  },
  "timestamp": "2026-08-10T12:00:00Z"
}
```

#### OAuth Callback
```bash
GET /api/v1/auth/callback?code=AUTH_CODE&state=STATE
```

#### Get User Info
```bash
GET /api/v1/auth/user
```

Requires authentication. Returns user profile from session.

#### Logout
```bash
POST /api/v1/auth/logout
```

### Video Upload Endpoints

#### Upload as Draft
```bash
POST /api/v1/video/upload-draft
Content-Type: multipart/form-data

Fields:
- video (File, required): MP4/MOV video file
- title (String): Video caption (max 2200 chars)
- privacyLevel (String): PUBLIC | FRIENDS | SELF_ONLY
- disableComment (Boolean): Disable comments
- disableDuet (Boolean): Disable duets
- disableStitch (Boolean): Disable stitches
```

#### Publish Video
```bash
POST /api/v1/video/publish
Content-Type: multipart/form-data

Same fields as upload-draft, plus:
- hashtags (String): Space-separated hashtags
```

### Health Check
```bash
GET /health

Response:
{
  "success": true,
  "message": "Server is healthy",
  "data": {
    "timestamp": "2026-08-10T12:00:00Z",
    "environment": "development",
    "tikTokMode": "SANDBOX"
  },
  "timestamp": "2026-08-10T12:00:00Z"
}
```

## 🔐 Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
CORS_ORIGIN=*

# TikTok
TIKTOK_CLIENT_KEY=your_key
TIKTOK_CLIENT_SECRET=your_secret
TIKTOK_REDIRECT_URI=http://localhost:3000/api/v1/auth/callback
TIKTOK_SANDBOX=true

# Session
SESSION_SECRET=your_secret_change_in_production

# Logging
LOG_LEVEL=info
```

### Frontend (frontend/.env)

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

## 🧪 Testing

### Backend Tests (Planned)
```bash
npm run test
npm run test:cov
```

### Frontend Tests (Planned)
```bash
cd frontend && npm run test
```

## 📚 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide, API examples, troubleshooting
- **[SDD_TIKTOK_LOGIN_UPLOAD.md](./SDD_TIKTOK_LOGIN_UPLOAD.md)** - Complete software design document
- **[TikTok API Docs](https://developers.tiktok.com/doc/login-kit-web)** - Official TikTok documentation

## 🔄 OAuth Flow

1. User clicks "Login with TikTok" on frontend
2. Frontend calls `GET /api/v1/auth/url` to get authorization URL
3. User redirected to TikTok login/authorization page
4. User grants permissions
5. TikTok redirects to `GET /api/v1/auth/callback?code=...&state=...`
6. Backend validates state (CSRF) and exchanges code for token
7. Backend fetches user info from TikTok API
8. Session created with user data
9. Frontend redirected to dashboard
10. User can now upload/publish videos

## 📤 Upload Flow

1. User selects video file (drag & drop or file picker)
2. Frontend displays preview and metadata form
3. User fills caption, hashtags, privacy settings
4. User clicks "Publish" or "Save as Draft"
5. Frontend sends multipart/form-data request with video file
6. Backend validates file (format, size, metadata)
7. Backend initializes upload on TikTok API
8. Backend uploads video in chunks
9. Backend finalizes upload (as draft or published)
10. Frontend shows success and redirects to dashboard

## 🛡️ Security Features

- ✅ OAuth 2.0 with state parameter (CSRF protection)
- ✅ HttpOnly cookies for session tokens (XSS protection)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Token expiration and auto-refresh
- ✅ Rate limiting (planned)

## 📊 Error Handling

All errors follow a standardized format:

```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_FAILED",
    "message": "Failed to upload video",
    "details": {}
  },
  "timestamp": "2026-08-10T12:00:00Z"
}
```

Error codes:
- `AUTH_001` - Invalid state (CSRF)
- `AUTH_002` - Token expired
- `VIDEO_001` - Invalid file format
- `VIDEO_002` - File too large
- `TIKTOK_001` - TikTok API error

See `src/shared/constants/error-codes.ts` for complete list.

## 🚀 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
TIKTOK_SANDBOX=false
TIKTOK_API_BASE_URL=https://open.tiktokapis.com
CORS_ORIGIN=https://yourdomain.com
SESSION_SECRET=your_very_secure_random_string
```

### Build

```bash
# Build backend
npm run build

# Build frontend
cd frontend && npm run build
```

### Run

```bash
# Start backend
npm start

# Serve frontend from CDN or web server
```

### Docker

```bash
docker-compose -f docker-compose.yml up -d
```

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Make changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Commit: `git commit -m "feat: description"`
6. Push: `git push origin feature/name`
7. Create Pull Request

## 📝 Git Workflow

Current branch: `claude/tiktok-login-upload-specs-288tzf`

All development should happen on this branch. When ready:
1. Ensure all tests pass
2. Ensure linting passes
3. Create comprehensive commit messages
4. Push to origin
5. Create PR when ready for review

## 🐛 Troubleshooting

### OAuth Error: "invalid_state"
- State validation failed
- Clear browser cookies
- Try logging in again
- Check session secret matches

### Upload Error: "FILE_TOO_LARGE"
- Video exceeds 2GB limit
- Use smaller video file

### Token Refresh Fails
- Refresh token expired (revoked by TikTok)
- User must log in again

### Docker Issues
- Check logs: `docker-compose logs app`
- Verify environment variables
- Ensure network access to TikTok API

## 📄 License

MIT - See LICENSE file for details

## 👨‍💻 Author

Created as a complete redesign of the TikTok upload platform with modern best practices.

- **Version**: 2.0.0
- **Last Updated**: 2026-08-10
- **Status**: Active Development

---

**Next Steps:**
- [ ] Add database integration (PostgreSQL)
- [ ] Add video history tracking
- [ ] Implement analytics dashboard
- [ ] Add batch upload support
- [ ] Implement scheduled publishing
- [ ] Add integration tests
- [ ] Setup CI/CD pipeline
- [ ] Deploy to production
