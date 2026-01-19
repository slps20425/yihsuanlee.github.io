import "./version";
import WiseCatI18n from './i18n';
import { setupSessionTimeout } from './session-timeout';

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

async function checkRedirectResult() {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            console.log('Redirect login success:', result.user.uid);
            await processLoginSuccess(result.user);
        }
    } catch (error: any) {
        console.error('Redirect login error:', error);
        const authError = document.getElementById('authError');
        if (authError) authError.textContent = 'Auth error: ' + error.message;
    }
}

async function handleSocialLogin(provider: any) {
    const termsCheckbox = document.getElementById('termsCheckbox') as HTMLInputElement;
    if (termsCheckbox && !termsCheckbox.checked) {
        alert("Please agree to the terms and fraud prevention policy to continue.");
        return;
    }

    const authError = document.getElementById('authError');
    if (authError) authError.textContent = '';

    try {
        // Enforce persistence explicitly
        const { setPersistence, browserLocalPersistence } = await import("firebase/auth");
        await setPersistence(auth, browserLocalPersistence);

        // Switch to Redirect for mobile compatibility (avoids 403 disallowed_useragent)
        await signInWithRedirect(auth, provider);
        // The page will redirect; execution stops here.

    } catch (error: any) {
        console.error('Social login init error:', error);
        if (authError) authError.textContent = 'Auth init error: ' + error.message;
    }
}

async function processLoginSuccess(user: any) {
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

    // --- Added for Robustness ---
    const verify = localStorage.getItem('wisecat_user');
    console.log("📝 Value verification:", verify ? "EXISTS" : "MISSING");

    displayUserProfile(sessionData);

    // Redirect after short delay to ensure storage commit
    setTimeout(() => {
        console.log("🚀 Redirecting to Dashboard...");
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

function logout() {
    signOut(auth)
        .then(() => {
            console.log('User signed out.');
            localStorage.removeItem('wisecat_user');
            // Redirect to entry page
            window.location.href = '/entry.html';
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
