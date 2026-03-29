import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirebaseWebConfig } from "./firebase-config.js";

let authInstance = null;
let googleProvider = null;
let initPromise = null;

async function initFirebaseAuth() {
  if (authInstance && googleProvider) {
    return { auth: authInstance, googleProvider };
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const firebaseWebConfig = await getFirebaseWebConfig();
    const app = initializeApp(firebaseWebConfig);
    authInstance = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
    return { auth: authInstance, googleProvider };
  })();

  return initPromise;
}

function mapAuthError(error) {
  const code = error?.code || "";

  if (code === "auth/invalid-credential") return "Email atau kata sandi salah.";
  if (code === "auth/user-not-found") return "Akun tidak ditemukan.";
  if (code === "auth/wrong-password") return "Kata sandi salah.";
  if (code === "auth/email-already-in-use") return "Email sudah terdaftar.";
  if (code === "auth/weak-password") return "Kata sandi terlalu lemah (minimal 6 karakter).";
  if (code === "auth/popup-closed-by-user") return "Login Google dibatalkan.";
  if (code === "auth/unauthorized-domain") return "Domain belum diizinkan di Firebase Authentication.";

  return "Terjadi kesalahan autentikasi. Coba lagi.";
}

async function loginWithEmail(email, password) {
  const { auth } = await initFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

async function registerWithEmail(name, email, password) {
  const { auth } = await initFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (name?.trim()) {
    await updateProfile(credential.user, {
      displayName: name.trim()
    });
  }

  return credential;
}

async function loginWithGoogle() {
  const { auth, googleProvider: provider } = await initFirebaseAuth();
  return signInWithPopup(auth, provider);
}

async function logoutCurrentUser() {
  const { auth } = await initFirebaseAuth();
  return signOut(auth);
}

async function subscribeToAuthState(callback) {
  const { auth } = await initFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

export {
  initFirebaseAuth,
  loginWithEmail,
  loginWithGoogle,
  logoutCurrentUser,
  mapAuthError,
  subscribeToAuthState,
  registerWithEmail
};
