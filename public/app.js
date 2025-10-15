// --- 1. FIREBASE MODULE IMPORTS ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// --- 2. CONFIGURATION (YOUR ACTUAL CONFIGURATION) ---
const firebaseConfig = {
  apiKey: "AIzaSyBSu8yGqZV7ruhm7k9DW3NHdyA_b1RuDC0",
  authDomain: "gov-doc-share.firebaseapp.com",
  projectId: "gov-doc-share",
  storageBucket: "gov-doc-share.firebasestorage.app",
  messagingSenderId: "563920572255",
  appId: "1:563920572255:web:f4d2e2a45b72876182f0ea"
};

// --- 3. GLOBAL FIREBASE INSTANCES ---
let auth, db, storage;


// --- 4. MODULAR LOGGING FUNCTION ---
function logAction(level, action, details = {}) {
    const timestamp = new Date().toISOString();
    const currentUser = auth ? auth.currentUser : null;
    const uid = currentUser ? currentUser.uid : 'N/A';

    const logEntry = {
        timestamp,
        uid: uid,
        level: level.toUpperCase(), 
        action,
        details
    };
    
    if (level === 'error') {
        console.error(`[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.action}:`, logEntry.details);
    } else if (level === 'warn') {
        console.warn(`[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.action}:`, logEntry.details);
    } else {
        console.info(`[${logEntry.timestamp}] [${logEntry.level}] ${logEntry.action}:`, logEntry.details);
    }
}


// --- 5. UTILITY & OBSERVER FUNCTIONS ---

// Function to switch between login/register/dashboard screens
function showScreen(screenId) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('register-screen').style.display = 'none';
    document.getElementById('dashboard-screen').style.display = 'none';
    document.getElementById(screenId).style.display = 'block';

    logAction('info', 'Screen Switch', { screen: screenId });
}

async function fetchUserProfile(user) {
    try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            
            document.getElementById('user-display-name').textContent = userData.name || 'Citizen';
            document.getElementById('user-display-email').textContent = user.email;
            document.getElementById('user-display-aadhaar').textContent = userData.aadhaar || 'N/A';
            
            logAction('info', 'Profile Fetch Success', { uid: user.uid });
        } else {
            logAction('warn', 'Profile Data Missing', { uid: user.uid });
        }
    } catch (error) {
        logAction('error', 'Error fetching profile', { uid: user.uid, code: error.code });
    }
}

function setupAuthObserver() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            logAction('info', 'User Logged In', { uid: user.uid });
            showScreen('dashboard-screen');
            fetchUserProfile(user); 
        } else {
            logAction('info', 'User Logged Out', { message: 'Showing login screen' });
            showScreen('login-screen');
        }
    });
}


// --- 6. AUTHENTICATION LOGIC ---

async function handleRegistration(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const name = document.getElementById('reg-name').value;
    const aadhaar = document.getElementById('reg-aadhaar').value;
    
    logAction('info', 'Registration Attempt', { email, name });

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: email,
            name: name,
            aadhaar: aadhaar,
            registeredAt: new Date().toISOString()
        });

        logAction('info', 'Registration Success', { uid: user.uid, email: email });
        alert(`Registration successful! Welcome, ${name}.`);

    } catch (error) {
        logAction('error', 'Registration Failed', { email, code: error.code, message: error.message });
        alert(`Registration failed: ${error.message}`);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    logAction('info', 'Login Attempt', { email });

    try {
        await signInWithEmailAndPassword(auth, email, password);
        logAction('info', 'Login Success', { uid: auth.currentUser.uid });
    } catch (error) {
        logAction('error', 'Login Failed', { email, code: error.code, message: error.message });
        alert(`Login failed: ${error.message}`);
    }
}

function handleLogout() {
    logAction('info', 'Logout Initiated', { uid: auth.currentUser ? auth.currentUser.uid : 'N/A' });
    signOut(auth).then(() => {
        // Observer handles the redirect
    }).catch((error) => {
        logAction('error', 'Logout Failed', { code: error.code });
    });
}


// --- 7. INITIALIZATION AND LISTENERS (UPDATED) ---

function setupListeners() {
    // Form submission listeners
    document.getElementById('register-form').addEventListener('submit', handleRegistration);
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Screen switching listeners (NEW)
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('login-screen');
    });

    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('register-screen');
    });
}

function initApp() {
    const app = initializeApp(firebaseConfig);
    
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    logAction('info', 'App Initialized', { status: 'Firebase services loaded' });

    setupAuthObserver();
    setupListeners();
}

// Start the application setup when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);