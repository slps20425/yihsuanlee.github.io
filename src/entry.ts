import "../styles.css";
import "./version";
import { registerPWA } from './pwa';
registerPWA();

import WiseCatI18n from './i18n';
import { setupSessionTimeout } from './session-timeout';
import { initTheme, createThemeToggleButton } from './theme-toggle';

import { GoogleAuthProvider, OAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from './firebase-config';

// (window as any).firebaseInitialized = true; // No longer needed here if imported elsewhere or handled by modules

// Auth Providers
const googleProvider = new GoogleAuthProvider();

(window as any).firebaseInitialized = true;





// State
let unsubscribeUser: any = null;

// --- Initialization ---

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme
    initTheme();
    createThemeToggleButton();

    // Initialize i18n explicitly
    WiseCatI18n.init();

    // Check if returning from a redirect login
    checkRedirectResult();

    // Bind buttons
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const microsoftLoginBtn = document.getElementById('microsoftLoginBtn');
    const lineLoginBtn = document.getElementById('lineLoginBtn');

    if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => handleSocialLogin(googleProvider));
    if (microsoftLoginBtn) {
        microsoftLoginBtn.addEventListener('click', () => {
            const microsoftProvider = new OAuthProvider('microsoft.com');
            microsoftProvider.addScope('email');
            microsoftProvider.addScope('openid'); // Standard OIDC scopes
            microsoftProvider.addScope('profile');
            // microsoftProvider.setCustomParameters({
            //    prompt: 'select_account' 
            // });
            handleSocialLogin(microsoftProvider);
        });
    }
    if (lineLoginBtn) lineLoginBtn.addEventListener('click', handleLineLogin);

    // Guest Login
    const guestLoginBtn = document.getElementById('guestLoginBtn');
    if (guestLoginBtn) guestLoginBtn.addEventListener('click', handleGuestLogin);

    // Expose logout globally for the inline onclick handler in HTML (or we can bind it here)
    (window as any).logout = logout;
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    // --- Config Seeder (Auto-create if missing) ---
    const { doc, getDoc, setDoc } = await import("firebase/firestore");
    const { db } = await import("./firebase-config");

    try {
        const configRef = doc(db, 'configuration', 'settings');
        const configSnap = await getDoc(configRef);
        if (!configSnap.exists()) {
            await setDoc(configRef, {
                enable_trial: true,
                enable_reservation: true,
                enable_mouthpiece: true,
                session_timeout_minutes: 30,
                description: "Global Feature Flags. Set to false to disable features."
            });
            console.log("Configuration document initialized.");
        }
    } catch (e) {
        console.warn("Config seed check failed (likely permission):", e);
    }

    // --- Session Timeout Logic ---
    setupSessionTimeout();
});

// --- Auth Logic ---

// Revised Auth Logic using Redirect for Mobile Compatibility
import { signInWithRedirect, getRedirectResult } from "firebase/auth";

// Auth Debugging & State Management
const AUTH_DEBUG = true; // Set to false in production
const AUTH_PROCESSING_KEY = 'wisecat_auth_processing';
const AUTH_STATE_KEY = 'wisecat_auth_state';
const AUTH_REDIRECT_HANDLED_KEY = 'wisecat_redirect_handled';

function authLog(...args: any[]) {
    if (AUTH_DEBUG) {
        const timestamp = new Date().toISOString();
        console.log(`%c[AUTH DEBUG ${timestamp}]`, 'color: #3b82f6; font-weight: bold;', ...args);
    }
}

function getAuthState() {
    return {
        processing: sessionStorage.getItem(AUTH_PROCESSING_KEY),
        state: sessionStorage.getItem(AUTH_STATE_KEY),
        redirectHandled: sessionStorage.getItem(AUTH_REDIRECT_HANDLED_KEY),
        cachedUser: localStorage.getItem('wisecat_user'),
        currentUser: auth.currentUser?.uid || null
    };
}

async function checkRedirectResult() {
    authLog('🔍 checkRedirectResult() called');
    authLog('Current auth state:', getAuthState());

    // Check if redirect was handled recently (within last 5 minutes)
    const redirectHandled = sessionStorage.getItem(AUTH_REDIRECT_HANDLED_KEY);
    const redirectTime = sessionStorage.getItem('wisecat_redirect_time');

    if (redirectHandled === 'true' && redirectTime) {
        const elapsed = Date.now() - parseInt(redirectTime);
        const fiveMinutes = 5 * 60 * 1000;

        if (elapsed < fiveMinutes) {
            authLog(`⚠️ Redirect handled recently (${Math.floor(elapsed / 1000)}s ago), skipping`);
            return;
        } else {
            authLog(`🕐 Redirect flag expired (${Math.floor(elapsed / 1000)}s old), clearing and checking again`);
            sessionStorage.removeItem(AUTH_REDIRECT_HANDLED_KEY);
            sessionStorage.removeItem('wisecat_redirect_time');
        }
    }

    const processing = sessionStorage.getItem(AUTH_PROCESSING_KEY);
    if (processing === 'true') {
        authLog('⚠️ Auth already processing, skipping duplicate call');
        return;
    }

    authLog('🚀 Starting redirect result check...');
    sessionStorage.setItem(AUTH_PROCESSING_KEY, 'true');
    sessionStorage.setItem(AUTH_STATE_KEY, 'checking');

    try {
        const result = await getRedirectResult(auth);
        if (result) {
            authLog('✅ Redirect result found:', {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                providerId: result.providerId
            });
            sessionStorage.setItem(AUTH_STATE_KEY, 'processing_login');
            sessionStorage.setItem(AUTH_REDIRECT_HANDLED_KEY, 'true');
            sessionStorage.setItem('wisecat_redirect_time', Date.now().toString());
            await processLoginSuccess(result.user);
        } else {
            authLog('ℹ️ No redirect result (normal page load)');
            sessionStorage.removeItem(AUTH_PROCESSING_KEY);
            sessionStorage.setItem(AUTH_STATE_KEY, 'idle');
        }
    } catch (error: any) {
        authLog('❌ Redirect error:', {
            code: error.code,
            message: error.message,
            stack: error.stack?.substring(0, 200)
        });
        sessionStorage.removeItem(AUTH_PROCESSING_KEY);
        sessionStorage.setItem(AUTH_STATE_KEY, 'error');
        const authError = document.getElementById('authError');
        if (authError) authError.textContent = 'Auth error: ' + error.message;
    }
}

async function handleSocialLogin(provider: any) {
    authLog('👆 User clicked login button');
    authLog('Provider:', provider.providerId || 'unknown');

    const termsCheckbox = document.getElementById('termsCheckbox') as HTMLInputElement;
    if (termsCheckbox && !termsCheckbox.checked) {
        authLog('⚠️ Terms not accepted');
        alert("Please agree to the terms and fraud prevention policy to continue.");
        return;
    }

    const authError = document.getElementById('authError');
    if (authError) authError.textContent = '';

    try {
        authLog('🔐 Setting persistence to LOCAL...');
        const { setPersistence, browserLocalPersistence } = await import("firebase/auth");
        await setPersistence(auth, browserLocalPersistence);

        authLog('🌐 Initiating redirect to provider...');
        // Clear previous state before redirect
        sessionStorage.removeItem(AUTH_REDIRECT_HANDLED_KEY);
        sessionStorage.setItem(AUTH_STATE_KEY, 'redirecting');
        sessionStorage.setItem(AUTH_PROCESSING_KEY, 'false');

        // Switch to Redirect for mobile compatibility (avoids 403 disallowed_useragent)
        await signInWithRedirect(auth, provider);
        // The page will redirect; execution stops here.

    } catch (error: any) {
        authLog('❌ Social login init error:', error);
        sessionStorage.setItem(AUTH_STATE_KEY, 'error');
        if (authError) authError.textContent = 'Auth init error: ' + error.message;
    }
}

async function processLoginSuccess(user: any) {
    authLog('🎉 processLoginSuccess() called for user:', user.uid);
    authLog('User details:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
    });

    // Robust Document ID: Always use UID as requested with prefix
    const userIdentifier = `uid_${user.uid}`;
    const userRef = doc(db, "users", userIdentifier);

    authLog(`📊 Connecting to Firestore: ${db.app.options.projectId}, DB: ${(db as any)._databaseId?.database || 'default'}`);
    const docSnap = await getDoc(userRef);
    authLog('Firestore doc exists:', docSnap.exists());

    let sessionData;

    if (!docSnap.exists()) {
        const initialData = {
            name: user.displayName || "WiseCat User",
            email: user.email || "N/A",
            uid: user.uid,
            picture: user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email || 'User'),
            credits: 1.00,
            createdAt: serverTimestamp()
        };
        await setDoc(userRef, initialData);
        console.log('New user document created with $1.00 bonus:', userIdentifier);
        // Prepare session data (use 1.00 for credits)
        sessionData = { ...initialData, credits: 1.00, createdAt: Date.now() }; // approximate timestamp
    } else {
        const data = docSnap.data();
        sessionData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
            picture: user.photoURL,
            credits: data.credits || 0
        };
    }

    // Immediate Local Storage Save (Redundancy)
    authLog("💾 Saving session to localStorage:", sessionData);
    localStorage.setItem('wisecat_user', JSON.stringify(sessionData));

    // --- Added for Robustness ---
    const verify = localStorage.getItem('wisecat_user');
    authLog("✅ localStorage verification:", verify ? "EXISTS" : "❌ MISSING");
    if (verify) {
        authLog("📦 Stored data preview:", JSON.parse(verify));
    }

    displayUserProfile(sessionData);

    // Update state before redirect
    sessionStorage.setItem(AUTH_STATE_KEY, 'success');
    sessionStorage.removeItem(AUTH_PROCESSING_KEY);

    // Redirect after short delay to ensure storage commit
    authLog("⏳ Waiting 500ms before redirect to ensure storage commit...");
    setTimeout(() => {
        authLog("🚀 Redirecting to Dashboard...");
        authLog('Final auth state before redirect:', getAuthState());
        window.location.href = '/dashboard.html';
    }, 500);
}

function handleLineLogin() {
    const termsCheckbox = document.getElementById('termsCheckbox') as HTMLInputElement;
    if (termsCheckbox && !termsCheckbox.checked) {
        alert("Please agree to the terms and fraud prevention policy to continue.");
        return;
    }

    const channelId = "2008812650"; // Provided by user
    const redirectUri = encodeURIComponent("https://wise-catty.cc/api/auth/line/callback");
    const state = "random_string_for_security_" + Date.now(); // Should be better
    const scope = "openid%20profile%20email";

    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

    window.location.href = lineAuthUrl;
}

function handleGuestLogin() {
    authLog('🕵️ Guest login initiated');

    // Create Guest Session
    const guestUser = {
        name: "Guest User",
        email: "guest@wisecat.ai",
        uid: "guest_" + Date.now(),
        picture: "https://ui-avatars.com/api/?name=Guest+User&background=random",
        credits: 100.00, // Free credits for testing
        isGuest: true,
        createdAt: Date.now()
    };

    authLog("💾 Saving GUEST session to localStorage:", guestUser);
    localStorage.setItem('wisecat_user', JSON.stringify(guestUser));

    // Clear any auth state that might block us
    sessionStorage.removeItem(AUTH_STATE_KEY);
    sessionStorage.removeItem(AUTH_PROCESSING_KEY);

    // Redirect
    window.location.href = '/dashboard.html';
}

function logout() {
    authLog('👋 Logout initiated');
    signOut(auth)
        .then(() => {
            authLog('✅ Firebase signOut successful');
            // Clear user data
            localStorage.removeItem('wisecat_user');
            // CRITICAL: Clear all auth state flags to allow re-login
            authLog('🧹 Clearing all auth state flags');
            sessionStorage.removeItem(AUTH_REDIRECT_HANDLED_KEY);
            sessionStorage.removeItem(AUTH_PROCESSING_KEY);
            sessionStorage.removeItem(AUTH_STATE_KEY);
            // Redirect to entry page
            authLog('🔄 Redirecting to entry page');
            window.location.href = '/';
        })
        .catch((error: any) => {
            authLog('❌ Sign out error:', error);
            console.error('Sign out error', error);
        });
}

// --- Auth State Listener ---

onAuthStateChanged(auth, (user) => {
    if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
    }

    if (user) {
        // TEMP DISABLED: Auto-redirect causing loops  
        // To use dashboard: manually go to /dashboard.html
        /*
        const pathname = window.location.pathname.toLowerCase();
        const isEntryPage = pathname.includes('entry') || pathname === '/';

        if (isEntryPage) {
            console.log('User logged in, redirecting to dashboard...');
            window.location.href = '/dashboard.html';
            return;
        }
        */


        // Note: Code below won't execute due to redirect, but kept for reference
        // Real-time listener: Priority one
        const userIdentifier = `uid_${user.uid}`;
        const userRef = doc(db, "users", userIdentifier);

        unsubscribeUser = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const userSession = {
                    name: data.name || user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
                    email: user.email || "N/A",
                    picture: data.picture || user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email || 'User'),
                    sub: user.uid,
                    credits: data.credits || 0.00
                };

                // Sync to localStorage
                console.log("📝 Saving user session to localStorage:", userSession);
                localStorage.setItem('wisecat_user', JSON.stringify(userSession));
                displayUserProfile(userSession);
            } else {
                // Document missing -> Create it
                console.log("User document missing, creating new one with prefix:", userIdentifier);
                const initialData = {
                    name: user.displayName || "WiseCat User",
                    email: user.email || "N/A",
                    uid: user.uid,
                    picture: user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email || 'User'),
                    credits: 10.00,
                    createdAt: serverTimestamp()
                };
                // We can't use await here easily inside onSnapshot, but setDoc is async.
                // onSnapshot doesn't wait, but that's fine.
                setDoc(userRef, initialData).then(() => {
                    console.log("Created missing user doc");
                }).catch(err => console.error("Error creating missing doc:", err));
            }
        }, (error) => {
            console.error('Firestore snapshot error:', error);
        });
    } else {
        // User is signed out
        localStorage.removeItem('wisecat_user');
        const loginPrompt = document.getElementById('loginPrompt');
        const userProfile = document.getElementById('userProfile');
        const creditsAmount = document.getElementById('creditsAmount');

        if (loginPrompt) loginPrompt.classList.remove('hide');
        if (userProfile) userProfile.classList.remove('show');
        if (creditsAmount) creditsAmount.textContent = '$0.00 USD';
    }
});

// --- UI Logic ---

function displayUserProfile(user: any) {
    const loginPrompt = document.getElementById('loginPrompt');
    const userProfile = document.getElementById('userProfile');

    if (loginPrompt) loginPrompt.classList.add('hide');
    if (userProfile) userProfile.classList.add('show');

    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAvatar = document.getElementById('userAvatar') as HTMLImageElement;
    const creditsAmount = document.getElementById('creditsAmount');

    if (userName) userName.textContent = user.name;
    if (userEmail) userEmail.textContent = user.email;
    if (userAvatar) userAvatar.src = user.picture;

    if (creditsAmount) {
        // We trigger i18n refresh because the text might depend on translation
        // But for direct update:
        creditsAmount.textContent = `$${(user.credits || 0).toFixed(2)} USD`;

        // Also fire event for i18n to pick up if needed
        window.dispatchEvent(new Event('userUpdated'));
    }
}

// --- Background Animation ---

function startBackgroundAnimation() {
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    // CRITICAL FIX: Ensure canvas never blocks clicks
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let particles: Particle[] = [];
    const particleCount = 50;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;

        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            if (!ctx) return;
            ctx.fillStyle = 'rgba(0, 185, 0, 0.3)';
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

// Start animation on load
document.addEventListener('DOMContentLoaded', startBackgroundAnimation);
