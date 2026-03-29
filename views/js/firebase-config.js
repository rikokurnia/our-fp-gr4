let cachedConfig = null;

export async function getFirebaseWebConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const response = await fetch('/api/public-config', {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    },
    cache: 'no-store'
  });

  const payload = await response.json();

  if (!response.ok || !payload?.firebase) {
    throw new Error(payload?.message || 'Gagal memuat konfigurasi Firebase dari server.');
  }

  cachedConfig = payload.firebase;
  return cachedConfig;
}
