let cachedConfig = null;

const FIREBASE_WEB_CONFIG = {
  apiKey: 'AIzaSyCU827MQQfyZ8iinPF1JNPqvQYDusRTdjQ',
  authDomain: 'group4ht.firebaseapp.com',
  projectId: 'group4ht',
  appId: '1:858975045729:web:2f4cfc8e7c95870ed48220'
};

export async function getFirebaseWebConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const hasFirebaseConfig = Object.values(FIREBASE_WEB_CONFIG).every(Boolean);
  if (!hasFirebaseConfig) {
    throw new Error('Firebase web config belum lengkap di views/js/firebase-config.js');
  }

  cachedConfig = FIREBASE_WEB_CONFIG;
  return cachedConfig;
}
