import { auth, db } from './firebase-config';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// --- Session Timeout Implementation ---
let sessionTimeoutMinutes = 60; // Default increased to 60
let sessionCheckInterval: any = null;

const ACTIVITY_KEY = 'wisecat_last_activity';

function updateActivity() {
    localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
}

export function setupSessionTimeout() {
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

    // 2. Track Activity (throttled)
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

    if (elapsedMinutes >= sessionTimeoutMinutes) {
        console.log(`Session timed out after ${elapsedMinutes.toFixed(1)} minutes of inactivity.`);
        logout();
        showCenteredToast("Your session has expired due to inactivity.");
    }
}

function logout() {
    signOut(auth)
        .then(() => {
            console.log('User signed out due to inactivity.');
            localStorage.removeItem('wisecat_user');
            localStorage.removeItem(ACTIVITY_KEY);
            window.location.href = '/entry.html';
        })
        .catch((error: any) => {
            console.error('Sign out error', error);
        });
}

// --- UI Helper: Centered Toast ---
function showCenteredToast(message: string) {
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

    const icon = document.createElement('div');
    icon.textContent = "⏳";
    icon.style.fontSize = "32px";
    icon.style.marginBottom = "10px";

    const text = document.createElement('div');
    text.textContent = message;

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

    container.style.pointerEvents = 'auto';
    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'scale(1)';
    });
}
