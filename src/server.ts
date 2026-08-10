import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import { config, validateConfig } from './config/index.js';
import { logger } from './shared/utils/logger.js';
import { errorHandler } from './shared/middleware/error-handler.js';
import { authRoutes } from './modules/auth/routes.js';
import { videoRoutes } from './modules/video/routes.js';
import { ApiResponse } from './types/index.js';

// Validate configuration
validateConfig();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: config.env === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: config.session.maxAge,
    },
  }),
);

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.http(`${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: 'TikTok Login & Upload Server',
    data: {
      version: config.api.version,
      status: 'running',
      environment: config.env,
      mode: config.tiktok.sandbox ? 'SANDBOX' : 'PRODUCTION',
      endpoints: {
        auth: `/api/${config.api.version}/auth`,
        video: `/api/${config.api.version}/video`,
        health: '/health',
      },
    },
    timestamp: new Date(),
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response<ApiResponse>) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    data: {
      timestamp: new Date(),
      environment: config.env,
      tikTokMode: config.tiktok.sandbox ? 'SANDBOX' : 'PRODUCTION',
    },
    timestamp: new Date(),
  });
});

// API Routes
const apiBaseUrl = `/api/${config.api.version}`;

app.use(`${apiBaseUrl}/auth`, authRoutes);
app.use(`${apiBaseUrl}/video`, videoRoutes);

// 404 handler
app.use((req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
    timestamp: new Date(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info('🚀 TikTok Login & Upload Server Started', {
    port: PORT,
    environment: config.env,
    mode: config.tiktok.sandbox ? '🧪 SANDBOX' : '🌐 PRODUCTION',
    apiBaseUrl,
  });

  if (config.env === 'development') {
    logger.info('📍 Health check: http://localhost:${PORT}/health');
    logger.info('📍 API docs: Swagger coming soon');
  }
});

export default app;
