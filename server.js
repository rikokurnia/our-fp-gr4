const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || '';
const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN || '';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || '';
const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID || '';

const viewsDir = path.join(__dirname, 'views');

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan(isProduction ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'hijaulokal-web',
    env: NODE_ENV,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/public-config', (_req, res) => {
  const hasFirebaseConfig = [
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_APP_ID
  ].every(Boolean);

  if (!hasFirebaseConfig) {
    return res.status(500).json({
      message: 'Firebase web config belum lengkap di environment variable server.'
    });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    firebase: {
      apiKey: FIREBASE_API_KEY,
      authDomain: FIREBASE_AUTH_DOMAIN,
      projectId: FIREBASE_PROJECT_ID,
      appId: FIREBASE_APP_ID
    }
  });
});

app.use(express.static(viewsDir, {
  etag: true,
  maxAge: isProduction ? '1h' : 0,
  index: false
}));

app.get('/', (_req, res) => {
  res.sendFile(path.join(viewsDir, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error('[SERVER_ERROR]', error);
  res.status(500).json({
    message: 'Terjadi kesalahan pada server.'
  });
});

app.listen(PORT, HOST, () => {
  console.log(`HijauLokal berjalan di http://${HOST}:${PORT} (${NODE_ENV})`);
});
