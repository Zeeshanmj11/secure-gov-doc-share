// firebase-config.js
// This file sets the configuration as global variables that the main 'index.html' script expects.

const firebaseConfig = {
  apiKey: "AIzaSyDOar_J9pS09WU71o-hCzIpgICJRDAFO4Q",
  authDomain: "mynewappbackend.firebaseapp.com",
  projectId: "mynewappbackend",
  storageBucket: "mynewappbackend.firebasestorage.app",
  messagingSenderId: "419499455039",
  appId: "1:419499455039:web:3d861b008f2ffff4b03e8a"
};

// --- CRITICAL STEP: Assigning to the global variables the main script requires ---

// 1. __firebase_config must be a JSON STRING that the main script will parse.
window.__firebase_config = JSON.stringify(firebaseConfig); 

// 2. __app_id is used for Firestore collection paths (e.g., /artifacts/{appId}/...).
window.__app_id = firebaseConfig.projectId;

// 3. __initial_auth_token is for auto-login (we leave it null/undefined for email/password flow).
// If this variable is undefined, the main script defaults to signInAnonymously().
// We will explicitly set it to null to ensure email/password is used:
window.__initial_auth_token = null; 

console.log("Firebase config loaded and set to global environment variables.");
