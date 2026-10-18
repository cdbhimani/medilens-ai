import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import reportRoutes from './routes/reportRoutes';
import demoRoutes from './routes/demoRoutes';
import healthRoutes from './routes/healthRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend local and production origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

// Body parsing with safe limits
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check Endpoints (for Cloud Run, App Engine, K8s)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// API Endpoints
app.use('/api/reports', reportRoutes);
app.use('/api/demo', demoRoutes);

// Static frontend serving for production / unified Cloud Run container
function getClientBuildPath(): string | null {
  const candidates = [
    path.resolve(__dirname, '../public'),
    path.resolve(__dirname, 'public'),
    path.resolve(process.cwd(), 'public'),
    path.resolve(process.cwd(), 'dist/public'),
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    '/app/public'
  ];

  for (const candidate of candidates) {
    try {
      const indexHtml = path.join(candidate, 'index.html');
      if (fs.existsSync(indexHtml)) {
        return candidate;
      }
    } catch {
      // continue
    }
  }
  return null;
}

const clientBuildPath = getClientBuildPath();

if (clientBuildPath) {
  console.log(`[MediLens AI] Serving frontend application from: ${clientBuildPath}`);
  app.use(express.static(clientBuildPath));

  // Explicit root route handler for Frontend SPA
  app.get('/', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });

  // SPA Catch-all: send index.html for any client-side routes (except API & health)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  console.warn('[MediLens AI] Frontend build directory not detected; falling back to API JSON.');
  // Root route fallback if frontend is not built
  app.get('/', (_req, res) => {
    res.json({
      name: 'MediLens AI Backend API',
      tagline: 'Understand your medical reports. Prepare for better conversations.',
      docs: '/api/health',
      status: 'online'
    });
  });
}

// Centralized error handling
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[MediLens AI Server Error]:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` MediLens AI Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` Gemini Configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
    console.log(`====================================================`);
  });
}

export default app;
