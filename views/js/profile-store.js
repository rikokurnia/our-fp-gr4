const PROFILE_AVATAR_KEY = 'hijaulokal_profile_avatar';
const PROFILE_PREF_KEY = 'hijaulokal_profile_prefs';
const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

const DEFAULT_PREFS = {
  weeklyPromo: true,
  personalRecommendation: true
};

export function getAvatarDataUrl() {
  return localStorage.getItem(PROFILE_AVATAR_KEY) || '';
}

export function saveAvatarDataUrl(dataUrl) {
  localStorage.setItem(PROFILE_AVATAR_KEY, dataUrl);
}

export function loadProfilePreferences() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROFILE_PREF_KEY) || '{}');
    return {
      weeklyPromo: raw.weeklyPromo !== false,
      personalRecommendation: raw.personalRecommendation !== false
    };
  } catch (_error) {
    return { ...DEFAULT_PREFS };
  }
}

export function saveProfilePreferences(preferences) {
  const next = {
    weeklyPromo: Boolean(preferences?.weeklyPromo),
    personalRecommendation: Boolean(preferences?.personalRecommendation)
  };
  localStorage.setItem(PROFILE_PREF_KEY, JSON.stringify(next));
}

export function applyAvatarPreview(imageElement, fallbackElement, dataUrl) {
  if (!imageElement || !fallbackElement) return;

  if (dataUrl) {
    imageElement.src = dataUrl;
    imageElement.classList.remove('hidden');
    fallbackElement.classList.add('hidden');
    return;
  }

  imageElement.removeAttribute('src');
  imageElement.classList.add('hidden');
  fallbackElement.classList.remove('hidden');
}

export async function readAvatarFile(file) {
  if (!file) {
    throw new Error('File avatar tidak ditemukan.');
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error('Ukuran file maksimal 2MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file avatar.'));
    reader.readAsDataURL(file);
  });
}
