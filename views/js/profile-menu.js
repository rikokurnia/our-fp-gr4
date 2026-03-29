import { logoutCurrentUser } from '/js/firebase-auth.js';
import { requireAuth, getDisplayName } from '/js/user-session.js';
import {
  applyAvatarPreview,
  getAvatarDataUrl,
  readAvatarFile,
  saveAvatarDataUrl
} from '/js/profile-store.js';

function ensureProfileModal() {
  let modal = document.querySelector('[data-profile-modal]');
  let overlay = document.querySelector('[data-profile-overlay]');

  if (modal && overlay) return { modal, overlay };

  overlay = document.createElement('div');
  overlay.setAttribute('data-profile-overlay', '');
  overlay.className = 'profile-overlay';

  modal = document.createElement('section');
  modal.setAttribute('data-profile-modal', '');
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.className = 'profile-modal';
  modal.innerHTML = `
    <div class="flex items-start justify-between gap-4 mb-5">
      <div class="flex items-center gap-3 min-w-0">
        <div class="profile-avatar-shell">
          <img data-profile-avatar class="profile-avatar-image hidden" alt="Foto profil" />
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
      <label class="profile-action cursor-pointer">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-[#005620] text-[20px]">photo_camera</span>
          Ubah Foto Profil
        </span>
        <span class="material-symbols-outlined text-[18px]">upload</span>
        <input data-profile-upload type="file" accept="image/*" class="hidden" />
      </label>
      <a href="profile.html" class="profile-action">
        <span class="inline-flex items-center gap-2">
          <span class="material-symbols-outlined text-[#005620] text-[20px]">badge</span>
          Lihat Halaman Profil
        </span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </a>
      <button data-profile-logout type="button" class="profile-action profile-action-danger">
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

function syncTriggerAvatar(dataUrl) {
  document.querySelectorAll('[data-profile-trigger]').forEach((trigger) => {
    const image = trigger.querySelector('[data-profile-trigger-avatar]');
    const icon = trigger.querySelector('[data-profile-trigger-icon]');
    applyAvatarPreview(image, icon, dataUrl);
  });
}

function setProfileTriggerVisibility(isLoggedIn) {
  const loginLinks = document.querySelectorAll('[data-auth-login-link]');
  const triggers = document.querySelectorAll('[data-profile-trigger]');

  if (isLoggedIn) {
    loginLinks.forEach((el) => el.classList.add('hidden'));
    triggers.forEach((el) => el.classList.remove('hidden'));
    syncTriggerAvatar(getAvatarDataUrl());
    return;
  }

  loginLinks.forEach((el) => el.classList.remove('hidden'));
  triggers.forEach((el) => el.classList.add('hidden'));
}

function initModalController(modal, overlay) {
  const closeBtn = modal.querySelector('[data-profile-close]');

  function open(trigger) {
    modal.classList.add('is-open');
    overlay.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    trigger?.setAttribute('aria-expanded', 'true');
  }

  function close() {
    modal.classList.remove('is-open');
    overlay.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    document.querySelectorAll('[data-profile-trigger]').forEach((el) => {
      el.setAttribute('aria-expanded', 'false');
    });
  }

  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  return { open, close };
}

function bindModalActions(modal) {
  const uploadInput = modal.querySelector('[data-profile-upload]');
  const logoutBtn = modal.querySelector('[data-profile-logout]');
  const avatarImage = modal.querySelector('[data-profile-avatar]');
  const avatarFallback = modal.querySelector('[data-profile-avatar-fallback]');

  uploadInput?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readAvatarFile(file);
      saveAvatarDataUrl(dataUrl);
      applyAvatarPreview(avatarImage, avatarFallback, dataUrl);
      syncTriggerAvatar(dataUrl);
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

  logoutBtn?.addEventListener('click', async () => {
    try {
      await logoutCurrentUser();
    } finally {
      window.location.href = 'login.html';
    }
  });
}

function bindTriggers(modalController) {
  document.querySelectorAll('[data-profile-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      modalController.open(trigger);
    });
  });
}

function setModalUserData(modal, user) {
  const nameEl = modal.querySelector('[data-profile-name]');
  const emailEl = modal.querySelector('[data-profile-email]');
  const avatarImage = modal.querySelector('[data-profile-avatar]');
  const avatarFallback = modal.querySelector('[data-profile-avatar-fallback]');

  if (nameEl) nameEl.textContent = getDisplayName(user);
  if (emailEl) emailEl.textContent = user?.email || '-';
  applyAvatarPreview(avatarImage, avatarFallback, getAvatarDataUrl());
}

async function initProfileMenu() {
  const hasTrigger = document.querySelector('[data-profile-trigger]');
  const hasLoginLink = document.querySelector('[data-auth-login-link]');
  if (!hasTrigger && !hasLoginLink) return;

  const { modal, overlay } = ensureProfileModal();
  const modalController = initModalController(modal, overlay);
  bindModalActions(modal);
  bindTriggers(modalController);

  await requireAuth(
    (user) => {
      setProfileTriggerVisibility(true);
      setModalUserData(modal, user);
    },
    () => {
      setProfileTriggerVisibility(false);
      modalController.close();
    }
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfileMenu);
} else {
  initProfileMenu();
}
