import { logoutCurrentUser } from '/js/firebase-auth.js';
import { getDisplayName, getProviderLabel, requireAuth } from '/js/user-session.js';
import {
  applyAvatarPreview,
  getAvatarDataUrl,
  loadProfilePreferences,
  readAvatarFile,
  saveAvatarDataUrl,
  saveProfilePreferences
} from '/js/profile-store.js';

const elements = {
  profileName: document.getElementById('profile-name'),
  profileEmail: document.getElementById('profile-email'),
  profileProvider: document.getElementById('profile-provider'),
  profileStatus: document.getElementById('profile-status'),
  profileAvatar: document.getElementById('profile-avatar'),
  profileAvatarFallback: document.getElementById('profile-avatar-fallback'),
  profileImageInput: document.getElementById('profile-image-input'),
  weeklyPromoPref: document.getElementById('pref-weekly-promo'),
  personalRecoPref: document.getElementById('pref-personal-reco'),
  logoutBtn: document.getElementById('profile-logout-btn')
};

function bindPreferences() {
  const prefs = loadProfilePreferences();

  if (elements.weeklyPromoPref) {
    elements.weeklyPromoPref.checked = prefs.weeklyPromo;
    elements.weeklyPromoPref.addEventListener('change', persistPreferences);
  }

  if (elements.personalRecoPref) {
    elements.personalRecoPref.checked = prefs.personalRecommendation;
    elements.personalRecoPref.addEventListener('change', persistPreferences);
  }
}

function persistPreferences() {
  saveProfilePreferences({
    weeklyPromo: Boolean(elements.weeklyPromoPref?.checked),
    personalRecommendation: Boolean(elements.personalRecoPref?.checked)
  });
}

function bindAvatarUpload() {
  elements.profileImageInput?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readAvatarFile(file);
      saveAvatarDataUrl(dataUrl);
      applyAvatarPreview(elements.profileAvatar, elements.profileAvatarFallback, dataUrl);
      if (typeof window.showToast === 'function') {
        window.showToast('Foto profil berhasil diperbarui.', 'success');
      }
    } catch (error) {
      if (typeof window.showToast === 'function') {
        window.showToast(error.message, 'error');
      } else {
        alert(error.message);
      }
    } finally {
      event.target.value = '';
    }
  });
}

function bindLogout() {
  elements.logoutBtn?.addEventListener('click', async () => {
    try {
      await logoutCurrentUser();
    } finally {
      window.location.href = 'login.html';
    }
  });
}

function paintUser(user) {
  if (elements.profileName) {
    elements.profileName.textContent = getDisplayName(user);
  }

  if (elements.profileEmail) {
    elements.profileEmail.textContent = user.email || '-';
  }

  if (elements.profileProvider) {
    elements.profileProvider.textContent = getProviderLabel(user);
  }

  if (elements.profileStatus) {
    elements.profileStatus.textContent = user.emailVerified ? 'Terverifikasi' : 'Aktif';
  }

  applyAvatarPreview(elements.profileAvatar, elements.profileAvatarFallback, getAvatarDataUrl());
}

bindPreferences();
bindAvatarUpload();
bindLogout();

requireAuth((user) => {
  paintUser(user);
});
