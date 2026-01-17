import "./version";
import WiseCatI18n from './i18n';

import { GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { app, auth, db } from './firebase-config';

// (window as any).firebaseInitialized = true; // No longer needed here if imported elsewhere or handled by modules

// Auth Providers
const googleProvider = new GoogleAuthProvider();

(window as any).firebaseInitialized = true;


const microsoftProvider = new OAuthProvider('microsoft.com');

// State
let unsubscribeUser: any = null;

// --- Initialization ---

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize i18n explicitly
    WiseCatI18n.init();

    // Bind buttons
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const microsoftLoginBtn = document.getElementById('microsoftLoginBtn');
    const lineLoginBtn = document.getElementById('lineLoginBtn');

    if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => handleSocialLogin(googleProvider));
    if (microsoftLoginBtn) microsoftLoginBtn.addEventListener('click', () => handleSocialLogin(microsoftProvider));
    if (lineLoginBtn) lineLoginBtn.addEventListener('click', handleLineLogin);

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

// --- Session Timeout Implementation ---
let sessionTimeoutMinutes = 60; // Default increased to 60
// We don't use a local variable for time anymore, we purely rely on localStorage
// let lastActivityTime = Date.now(); 
let sessionCheckInterval: any = null;

const ACTIVITY_KEY = 'wisecat_last_activity';

function updateActivity() {
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
}

function setupSessionTimeout() {
    // 0. Initialize activity if missing
    if (!localStorage.getItem(ACTIVITY_KEY)) {
        updateActivity();
    }

    // 1. Listen for dynamic config updates
    try {
        const configRef = doc(db, 'configuration', 'settings');
        onSnapshot(configRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.session_timeout_minutes) {
                    const newTimeout = Number(data.session_timeout_minutes);
                    if (!isNaN(newTimeout) && newTimeout > 0) {
                        sessionTimeoutMinutes = newTimeout;
                        console.log(`Session timeout updated to ${sessionTimeoutMinutes} minutes`);
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error setting up config listener:", error);
    }

    // 2. Track Activity (debounced slightly or just set logic)
    // Writing to localStorage on every mousemove is expensive. Let's throttle it.
    let throttleTimer: any = null;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    events.forEach(event => {
        document.addEventListener(event, () => {
            if (!throttleTimer) {
                updateActivity();
                throttleTimer = setTimeout(() => {
                    throttleTimer = null;
                }, 5000); // Update at most every 5 seconds
            }
        }, { passive: true });
    });

    // 3. Periodic Check (every 1 minute)
    if (sessionCheckInterval) clearInterval(sessionCheckInterval);
    sessionCheckInterval = setInterval(checkSessionTimeout, 60 * 1000);
}

function checkSessionTimeout() {
    const user = auth.currentUser;
    if (!user) return; // Only check if logged in

    const now = Date.now();
    const storedActivity = localStorage.getItem(ACTIVITY_KEY);
    const lastActivityTime = storedActivity ? Number(storedActivity) : now;

    const elapsedMinutes = (now - lastActivityTime) / (1000 * 60);

    // Debug log (can be removed in prod)
    // console.log(`Session check: ${elapsedMinutes.toFixed(1)} / ${sessionTimeoutMinutes} mins elapsed.`);

    if (elapsedMinutes >= sessionTimeoutMinutes) {
        console.log(`Session timed out after ${elapsedMinutes.toFixed(1)} minutes of inactivity.`);
        logout();
        showCenteredToast("Your session has expired due to inactivity.");
    }
}

// --- UI Helper: Centered Toast ---
function showCenteredToast(message: string) {
    // 1. Create or get container
    let container = document.getElementById('centered-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'centered-toast-container';
        container.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
        `;
        document.body.appendChild(container);
    }

    // 2. Create Toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(40, 40, 40, 0.95);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        font-family: inherit;
        font-size: 16px;
        text-align: center;
        opacity: 0;
        transform: scale(0.9);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
    `;

    // Icon
    const icon = document.createElement('div');
    icon.textContent = "⏳";
    icon.style.fontSize = "32px";
    icon.style.marginBottom = "10px";

    // Text
    const text = document.createElement('div');
    text.textContent = message;

    // Close Button (optional, but good for UX)
    const btn = document.createElement('button');
    btn.textContent = "OK";
    btn.style.cssText = `
        margin-top: 15px;
        padding: 8px 20px;
        background: white;
        color: black;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-weight: bold;
        pointer-events: auto;
    `;
    btn.onclick = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'scale(0.9)';
        setTimeout(() => {
            if (container && container.contains(toast)) container.removeChild(toast);
            if (container && container.childNodes.length === 0) document.body.removeChild(container);
        }, 300);
    };

    toast.appendChild(icon);
    toast.appendChild(text);
    toast.appendChild(btn);

    // Make container interactive for button
    container.style.pointerEvents = 'auto';
    container.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'scale(1)';
    });

    // Auto-dismiss after 5 seconds if not clicked? Maybe not for session timeout.
    // Let's force user to click OK or just leave it.
}

// --- Auth Logic ---

async function handleSocialLogin(provider: any) {
    const authError = document.getElementById('authError');
    if (authError) authError.textContent = '';

    try {
        // Enforce persistence explicitly
        const { setPersistence, browserLocalPersistence } = await import("firebase/auth");
        await setPersistence(auth, browserLocalPersistence);

        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log('Social login success:', user.uid);

        // Robust Document ID: Always use UID as requested with prefix
        const userIdentifier = `uid_${user.uid}`;
        const userRef = doc(db, "users", userIdentifier);

        console.log(`Connecting to DB: ${db.app.options.projectId}, DB ID: ${(db as any)._databaseId?.database || 'default'}`);
        const docSnap = await getDoc(userRef);

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
        console.log("📝 Immediate Save from Login:", sessionData);
        localStorage.setItem('wisecat_user', JSON.stringify(sessionData));
        displayUserProfile(sessionData);

    } catch (error: any) {
        console.error('Social login error:', error);
        if (authError) authError.textContent = 'Auth error: ' + error.message;
    }
}

function handleLineLogin() {
    const channelId = "2008812650"; // Provided by user
    const redirectUri = encodeURIComponent("https://wise-catty.cc/api/auth/line/callback");
    const state = "random_string_for_security_" + Date.now(); // Should be better
    const scope = "openid%20profile%20email";

    const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

    window.location.href = lineAuthUrl;
}

function logout() {
    signOut(auth)
        .then(() => {
            console.log('User signed out.');
            localStorage.removeItem('wisecat_user');
            // UI updates handled by onAuthStateChanged
        })
        .catch((error: any) => {
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
                // Document missing (e.g. first time LINE login) -> Create it
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
