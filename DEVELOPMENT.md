# TikTok Login & Upload Platform - Development Guide v2.0

## 📋 Overview

This is a complete redesign of the TikTok Login & Video Upload Platform using modern TypeScript architecture with proper separation of concerns, error handling, and scalability in mind.

## 🏗️ Architecture

### Project Structure

```
src/
├── config/          # Configuration management
├── modules/         # Feature modules
│   ├── auth/        # Authentication (OAuth)
│   ├── video/       # Video upload & publishing
│   └── user/        # User management (planned)
├── shared/          # Shared utilities & middleware
│   ├── middleware/  # Express middleware
│   ├── guards/      # Route guards
│   ├── utils/       # Utility functions
│   ├── constants/   # Constants & enums
│   └── types/       # TypeScript types
├── types/           # Global types
└── server.ts        # Main server file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS)
- npm or yarn
- TikTok OAuth credentials (from https://developer.tiktok.com)

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd tiktok
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your TikTok credentials:
```
TIKTOK_CLIENT_KEY=your_key
TIKTOK_CLIENT_SECRET=your_secret
TIKTOK_REDIRECT_URI=http://localhost:3000/api/v1/auth/callback
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Format code
npm run format
```

### Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## 🐳 Docker Setup

### Using Docker Compose

```bash
# Build and start all services
docker-compose up --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

The application will be available at `http://localhost:3000`

## 📡 API Endpoints

### Authentication

- `GET /api/v1/auth/url` - Get OAuth authorization URL
- `GET /api/v1/auth/callback` - OAuth callback (handled by TikTok)
- `GET /api/v1/auth/user` - Get current user info (requires auth)
- `POST /api/v1/auth/logout` - Logout user (requires auth)

### Video Upload

- `POST /api/v1/video/upload-draft` - Upload as draft (requires auth, multipart/form-data)
- `POST /api/v1/video/publish` - Publish immediately (requires auth, multipart/form-data)

### Health Check

- `GET /health` - Server health status

## 📝 Request Examples

### OAuth Flow

1. Get authorization URL:
```bash
curl http://localhost:3000/api/v1/auth/url
```

Response:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://www.tiktok.com/v2/auth/authorize/?client_key=...",
    "state": "abc123..."
  },
  "timestamp": "2026-08-10T12:00:00Z"
}
```

2. User clicks link and authorizes → redirected to `/api/v1/auth/callback`

3. Check if authenticated:
```bash
curl http://localhost:3000/api/v1/auth/user \
  -b "connect.sid=session_cookie"
```

### Upload Video as Draft

```bash
curl -X POST http://localhost:3000/api/v1/video/upload-draft \
  -F "video=@video.mp4" \
  -F "title=My Awesome Video" \
  -F "privacyLevel=SELF_ONLY" \
  -b "connect.sid=session_cookie"
```

### Publish Video

```bash
curl -X POST http://localhost:3000/api/v1/video/publish \
  -F "video=@video.mp4" \
  -F "title=My Awesome Video" \
  -F "hashtags=#trending #video" \
  -F "privacyLevel=PUBLIC" \
  -b "connect.sid=session_cookie"
```

## 🧪 Testing

### Unit Tests (Planned)

```bash
npm run test
```

### Integration Tests (Planned)

```bash
npm run test:integration
```

### Coverage Report (Planned)

```bash
npm run test:cov
```

## 📊 Configuration

All configuration is managed in `src/config/index.ts`. Environment variables are loaded from `.env` file.

Key configuration options:

- **NODE_ENV**: `development` | `production`
- **TIKTOK_SANDBOX**: `true` | `false` - Use sandbox API for testing
- **LOG_LEVEL**: `debug` | `info` | `warn` | `error`
- **CORS_ORIGIN**: Allowed origins for CORS

## 🔐 Security Features

- ✅ OAuth 2.0 state validation (CSRF protection)
- ✅ HttpOnly cookies for session tokens
- ✅ Secure headers with Helmet.js
- ✅ CORS configuration
- ✅ Input validation & sanitization
- ✅ Rate limiting (planned)
- ✅ Token expiration & auto-refresh

## 📚 Error Handling

All errors follow a standardized format:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Security validation failed. Please try again.",
    "details": {}
  },
  "timestamp": "2026-08-10T12:00:00Z"
}
```

Error codes are defined in `src/shared/constants/error-codes.ts`

## 📝 Logging

Logging is handled by Winston. Logs are output to console and files (in production).

Log levels:
- `ERROR`: Application errors
- `WARN`: Warning messages
- `INFO`: General information
- `HTTP`: HTTP requests
- `DEBUG`: Debug information

## 🔄 Token Refresh Flow

Tokens are automatically refreshed 5 minutes before expiration:

1. Check if token expires in < 5 minutes
2. If yes, call refresh endpoint on TikTok API
3. Update session with new tokens
4. Continue request

## 🚀 Deployment

### Docker Image

```bash
# Build image
docker build -t tiktok-app:latest .

# Run container
docker run -p 3000:3000 --env-file .env tiktok-app:latest
```

### Environment Variables for Production

```
NODE_ENV=production
TIKTOK_SANDBOX=false
TIKTOK_API_BASE_URL=https://open.tiktokapis.com
```

## 📋 Checklist Before Production

- [ ] All environment variables configured
- [ ] TikTok OAuth credentials verified
- [ ] SSL/HTTPS enabled
- [ ] CORS origins whitelist set
- [ ] Session secret changed from default
- [ ] Logging level set to `info`
- [ ] Database (if used) migrated
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry) configured
- [ ] Performance monitoring setup

## 🐛 Troubleshooting

### OAuth Error: "invalid_state"
- State validation failed - possible CSRF attack or expired state
- Solution: Clear browser cookies and try logging in again

### Upload Fails: "FILE_TOO_LARGE"
- Video file exceeds 2GB limit
- Solution: Use smaller video file

### Token Refresh Fails
- Refresh token may have expired (revoked by TikTok)
- Solution: User must log in again

### Docker Container Exit
- Check logs: `docker-compose logs app`
- Ensure environment variables are set
- Verify network connectivity to TikTok API

## 📚 Resources

- [TikTok Open API Docs](https://developers.tiktok.com/doc/login-kit-web)
- [Express.js Docs](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)

## 📄 License

MIT - See LICENSE file

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/name`
4. Open Pull Request

---

**Last Updated**: 2026-08-10  
**Version**: 2.0.0  
**Status**: Specification & Initial Implementation
