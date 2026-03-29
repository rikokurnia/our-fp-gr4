import { requireAuth, getDisplayName } from '/js/user-session.js';

const greetingElement = document.getElementById('user-greeting');

requireAuth((user) => {
  if (!greetingElement) return;
  greetingElement.textContent = `Halo, ${getDisplayName(user)}!`;
});
