module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: 'Method tidak diizinkan.'
    });
  }

  const firebase = {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    appId: process.env.FIREBASE_APP_ID || ''
  };

  const hasFirebaseConfig = Object.values(firebase).every(Boolean);

  if (!hasFirebaseConfig) {
    return res.status(500).json({
      message: 'Firebase web config belum lengkap di environment variable Vercel.'
    });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ firebase });
};
