import WiseCatI18n from './i18n';

// Global declarations for Firebase CDN
declare var firebase: any;

// Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",
    authDomain: "wise-catty.cc",
    projectId: "wisecat-8df8d",
    storageBucket: "wisecat-8df8d.firebasestorage.app",
    messagingSenderId: "1078479155773",
    appId: "1:1078479155773:web:cd62907516951aa47db054",
    measurementId: "G-30M228G3VP"
};

// Initialize Firebase
if (!(window as any).firebaseInitialized) {
    firebase.initializeApp(firebaseConfig);
    (window as any).firebaseInitialized = true;
}
const auth = firebase.auth();
const db = firebase.firestore();

// Auth Providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
const microsoftProvider = new firebase.auth.OAuthProvider('microsoft.com');
const lineProvider = new firebase.auth.OAuthProvider('oidc.line');

// State
let unsubscribeUser: any = null;

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Initialize i18n explicitly
    WiseCatI18n.init();

    // Bind buttons
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const microsoftLoginBtn = document.getElementById('microsoftLoginBtn');
    const lineLoginBtn = document.getElementById('lineLoginBtn');

    if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => handleSocialLogin(googleProvider));
    if (microsoftLoginBtn) microsoftLoginBtn.addEventListener('click', () => handleSocialLogin(microsoftProvider));
    if (lineLoginBtn) lineLoginBtn.addEventListener('click', () => handleSocialLogin(lineProvider));

    // Expose logout globally for the inline onclick handler in HTML (or we can bind it here)
    (window as any).logout = logout;
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// --- Auth Logic ---

async function handleSocialLogin(provider: any) {
    const authError = document.getElementById('authError');
    if (authError) authError.textContent = '';

    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        console.log('Social login success:', user.email || user.uid);

        // Robust Document ID: Email or UID
        const userIdentifier = user.email || user.uid;
        const userRef = db.collection("users").doc(userIdentifier);
        const doc = await userRef.get();

        if (!doc.exists) {
            const initialData = {
                name: user.displayName || "WiseCat User",
                email: user.email || "N/A",
                uid: user.uid,
                picture: user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email || 'User'),
                credits: 1.00,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await userRef.set(initialData);
            console.log('New user document created with $1.00 bonus:', userIdentifier);
        }
    } catch (error: any) {
        console.error('Social login error:', error);
        if (authError) authError.textContent = 'Auth error: ' + error.message;
    }
}

function logout() {
    auth.signOut()
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

auth.onAuthStateChanged((user: any) => {
    if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
    }

    if (user) {
        // Real-time listener: Priority one
        const userIdentifier = user.email || user.uid;
        unsubscribeUser = db.collection("users").doc(userIdentifier)
            .onSnapshot((doc: any) => {
                if (doc.exists) {
                    const data = doc.data();
                    const userSession = {
                        name: data.name || user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
                        email: user.email || "N/A",
                        picture: data.picture || user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email || 'User'),
                        sub: user.uid,
                        credits: data.credits || 0.00
                    };

                    // Sync to localStorage as a cache for other pages
                    localStorage.setItem('wisecat_user', JSON.stringify(userSession));
                    displayUserProfile(userSession);
                }
            }, (error: any) => {
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
