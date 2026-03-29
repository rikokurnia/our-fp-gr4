import { initFirebaseAuth, subscribeToAuthState } from '/js/firebase-auth.js';

export function getDisplayName(user) {
  return user?.displayName || user?.email || 'Pengguna';
}

export function getProviderLabel(user) {
  const providers = user?.providerData || [];

  if (providers.some((provider) => provider.providerId === 'google.com')) {
    return 'Google';
  }

  if (providers.some((provider) => provider.providerId === 'password')) {
    return 'Email';
  }

  return 'Akun';
}

export function redirectToLogin() {
  window.location.href = 'login.html';
}

export async function requireAuth(onAuthenticated, onUnauthenticated = redirectToLogin) {
  try {
    await initFirebaseAuth();
    await subscribeToAuthState((user) => {
      if (!user) {
        onUnauthenticated();
        return;
      }

      onAuthenticated(user);
    });
  } catch (_error) {
    onUnauthenticated();
  }
}
