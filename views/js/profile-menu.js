import {
  initFirebaseAuth,
  logoutCurrentUser,
  subscribeToAuthState
} from '/js/firebase-auth.js';

const PROFILE_AVATAR_KEY = 'hijaulokal_profile_avatar';

function toDisplayName(user) {
  return user?.displayName || user?.email || 'Pengguna';
}

function getAvatarDataUrl() {
  return localStorage.getItem(PROFILE_AVATAR_KEY) || '';
}

function setAvatarPreview(imgEl, fallbackIconEl, dataUrl) {
  if (!imgEl || !fallbackIconEl) return;

  if (dataUrl) {
    imgEl.src = dataUrl;
    imgEl.classList.remove('hidden');
    fallbackIconEl.classList.add('hidden');
    return;
  }

  imgEl.removeAttribute('src');
  imgEl.classList.add('hidden');
  fallbackIconEl.classList.remove('hidden');
}

function ensureProfileModal() {
  let modal = document.querySelector('[data-profile-modal]');
  let overlay = document.querySelector('[data-profile-overlay]');

  if (modal && overlay) return { modal, overlay };

  overlay = document.createElement('div');
  overlay.setAttribute('data-profile-overlay', '');
  overlay.className = 'fixed inset-0 bg-black/40 z-[72] opacity-0 pointer-events-none transition-opacity duration-200';

  modal = document.createElement('section');
  modal.setAttribute('data-profile-modal', '');
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.className = 'fixed top-24 right-6 md:right-8 lg:right-12 xl:right-16 w-[92vw] max-w-sm z-[73] bg-[#ffffff] border border-[#d9e2cc] rounded-3xl shadow-2xl p-6 opacity-0 translate-y-3 pointer-events-none transition-all duration-200';
  modal.innerHTML = `
    <div class="flex items-start justify-between gap-4 mb-5">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-14 h-14 rounded-2xl bg-[#f2f7e8] text-[#005620] flex items-center justify-center overflow-hidden">
          <img data-profile-avatar class="w-full h-full object-cover hidden" alt="Foto profil" />
          <span data-profile-avatar-fallback class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">person</span>
        </div>
        <div class="min-w-0">
          <h3 class="text-lg font-extrabold text-[#1d1c10] truncate">Profil Saya</h3>
          <p data-profile-name class="text-sm font-semibold text-[#005620] truncate">Pengguna</p>
          <p data-profile-email class="text-xs text-[#3f493e] truncate">-</p>
        </div>
      </div>
      <button data-profile-close type="button" class="w-8 h-8 rounded-full bg-[#f2eeda] hover:bg-[#e7e3cf] flex items-center justify-center text-[#3f493e] active:scale-95" aria-label="Tutup popup profil">
        <span class="material-symbols-outlined text-sm">close</span>
      </button>
    </div>

    <div class="space-y-3">
      <label class="w-full inline-flex items-center justify-between bg-[#f8f4df] border border-[#d9e2cc] px-4 py-3 rounded-2xl font-semibold text-[#1d1c10] hover:bg-[#efe9cf] transition-colors cursor-pointer">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-[#005620] text-[20px]">photo_camera</span>
          Ubah Foto Profil
        </span>
        <span class="material-symbols-outlined text-[18px]">upload</span>
        <input data-profile-upload type="file" accept="image/*" class="hidden" />
      </label>
      <a href="profile.html" class="w-full inline-flex items-center justify-between bg-[#f8f4df] border border-[#d9e2cc] text-[#1d1c10] px-4 py-3 rounded-2xl font-semibold hover:bg-[#efe9cf] transition-colors">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-[#005620] text-[20px]">badge</span>
          Lihat Halaman Profil
        </span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
      <button data-profile-logout type="button" class="w-full inline-flex items-center justify-between bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#93000a] px-4 py-3 rounded-2xl font-semibold hover:bg-[#ffd0cb] transition-colors">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">logout</span>
          Keluar Akun
        </span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  return { modal, overlay };
}

function setupProfileModal() {
  const { modal, overlay } = ensureProfileModal();

  const closeBtn = modal.querySelector('[data-profile-close]');
  const logoutBtn = modal.querySelector('[data-profile-logout]');
  const uploadInput = modal.querySelector('[data-profile-upload]');

  const avatarImage = modal.querySelector('[data-profile-avatar]');
  const avatarFallback = modal.querySelector('[data-profile-avatar-fallback]');

  function openModal(trigger) {
    modal.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
    modal.classList.add('opacity-100', 'translate-y-0');
    modal.setAttribute('aria-hidden', 'false');

    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');

    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  function closeModal() {
    modal.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
    modal.classList.remove('opacity-100', 'translate-y-0');
    modal.setAttribute('aria-hidden', 'true');

    overlay.classList.add('opacity-0', 'pointer-events-none');
    overlay.classList.remove('opacity-100');

    document.querySelectorAll('[data-profile-trigger]').forEach((el) => {
      el.setAttribute('aria-expanded', 'false');
    });
  }

  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  logoutBtn?.addEventListener('click', async () => {
    try {
      await logoutCurrentUser();
    } finally {
      window.location.href = 'login.html';
    }
  });

  uploadInput?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      localStorage.setItem(PROFILE_AVATAR_KEY, dataUrl);
      setAvatarPreview(avatarImage, avatarFallback, dataUrl);
      syncTriggerAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  });

  document.querySelectorAll('[data-profile-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(trigger);
    });
  });

  return {
    modal,
    setProfileData(user) {
      const nameEl = modal.querySelector('[data-profile-name]');
      const emailEl = modal.querySelector('[data-profile-email]');
      const avatar = getAvatarDataUrl();

      if (nameEl) nameEl.textContent = toDisplayName(user);
      if (emailEl) emailEl.textContent = user?.email || '-';
      setAvatarPreview(avatarImage, avatarFallback, avatar);
    },
    closeModal
  };
}

function syncTriggerAvatar(dataUrl) {
  document.querySelectorAll('[data-profile-trigger]').forEach((trigger) => {
    const image = trigger.querySelector('[data-profile-trigger-avatar]');
    const icon = trigger.querySelector('[data-profile-trigger-icon]');
    setAvatarPreview(image, icon, dataUrl);
  });
}

function syncAuthUi(user) {
  const loginLinks = document.querySelectorAll('[data-auth-login-link]');
  const triggers = document.querySelectorAll('[data-profile-trigger]');

  if (user) {
    loginLinks.forEach((el) => el.classList.add('hidden'));
    triggers.forEach((el) => el.classList.remove('hidden'));
    syncTriggerAvatar(getAvatarDataUrl());
    return;
  }

  loginLinks.forEach((el) => el.classList.remove('hidden'));
  triggers.forEach((el) => el.classList.add('hidden'));
}

async function initProfileMenu() {
  const hasTrigger = document.querySelector('[data-profile-trigger]');
  const hasLoginLink = document.querySelector('[data-auth-login-link]');
  if (!hasTrigger && !hasLoginLink) return;

  const modalApi = setupProfileModal();

  try {
    await initFirebaseAuth();
    await subscribeToAuthState((user) => {
      syncAuthUi(user);
      if (user) {
        modalApi.setProfileData(user);
      } else {
        modalApi.closeModal();
      }
    });
  } catch (_error) {
    syncAuthUi(null);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfileMenu);
} else {
  initProfileMenu();
}
