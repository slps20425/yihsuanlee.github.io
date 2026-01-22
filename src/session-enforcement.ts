import { auth, db } from "./firebase-config";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";

const SESSION_STORAGE_KEY = "wisecat_session_id";
let sessionUnsubscribe: (() => void) | null = null;
let isEnforcementActive = false;

// Generate a random session ID
function generateSessionId(): string {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
}

// UI Helper for "Session Expired" alert
function showSessionExpiredAlert() {
    const alert = document.createElement("div");
    alert.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 99999;
        font-family: sans-serif;
        text-align: center;
        padding: 20px;
        backdrop-filter: blur(5px);
    `;

    alert.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 20px;">🔒</div>
        <h2 style="font-size: 2rem; margin-bottom: 10px;">Session Expired</h2>
        <p style="font-size: 1.2rem; color: #ccc; max-width: 400px; line-height: 1.5;">
            You have logged in from another device or browser tab.<br>
            This session has been terminated to prevent conflicts.
        </p>
        <button onclick="window.location.reload()" style="
            margin-top: 30px;
            padding: 12px 30px;
            font-size: 1rem;
            background: #4ade80;
            color: #000;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(74, 222, 128, 0.4);
        ">Reload Page</button>
    `;

    document.body.appendChild(alert);
}

export async function initSessionEnforcement(user: any) {
    if (isEnforcementActive || !user || user.isGuest) return;
    const uid = user.uid;
    const userSessionRef = doc(db, `users/${uid}/private/session`);

    // 1. Get or Create Local Session ID
    let currentSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
    const isNewLogin = !currentSessionId;

    if (isNewLogin) {
        // New login logic: Create new ID and take over
        currentSessionId = generateSessionId();
        localStorage.setItem(SESSION_STORAGE_KEY, currentSessionId);

        try {
            await setDoc(userSessionRef, {
                activeSessionId: currentSessionId,
                lastLoginAt: new Date().toISOString(),
                userAgent: navigator.userAgent
            }, { merge: true });
            console.log("🔒 [Session] New session established:", currentSessionId);
        } catch (e) {
            console.error("🔒 [Session] Failed to set active session:", e);
        }
    } else {
        // Existing page refresh: Ensure server matches our ID (self-healing)
        // Optimization: Only update if server is different, or trust the listener to kill us if we are wrong?
        // Better: Just start listening. If server disagrees, we die. 
        // BUT if we just refreshed, we want to keep our session.
        console.log("🔒 [Session] Resuming existing session:", currentSessionId);
    }

    // 2. Start Real-time Enforcement
    isEnforcementActive = true;

    sessionUnsubscribe = onSnapshot(userSessionRef, async (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            const serverSessionId = data.activeSessionId;

            // If server has a session ID and it's NOT ours -> Logout
            if (serverSessionId && serverSessionId !== currentSessionId) {
                console.warn("🔒 [Session] CONFLICT DETECTED. Server:", serverSessionId, "Local:", currentSessionId);
                await performRemoteLogout();
            }
        } else {
            // Document missing? Maybe deleted? Should probably re-establish or logout. 
            // For now, assume if we are logged in, we should be the active session.
            // If the doc is deleted, let's write our session ID to claim it.
            if (currentSessionId) {
                setDoc(userSessionRef, {
                    activeSessionId: currentSessionId,
                    lastLoginAt: new Date().toISOString()
                }, { merge: true }).catch(console.error);
            }
        }
    }, (error) => {
        console.error("🔒 [Session] Listener error:", error);
    });
}

async function performRemoteLogout() {
    isEnforcementActive = false;
    if (sessionUnsubscribe) {
        sessionUnsubscribe();
        sessionUnsubscribe = null;
    }

    // Clear local sensitive data
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem('wisecat_user');

    // Show blocking UI
    showSessionExpiredAlert();

    // Sign out from Firebase
    try {
        await signOut(auth);
        console.log("🔒 [Session] Signed out successfully.");
    } catch (e) {
        console.error("🔒 [Session] Error signing out:", e);
    }
}

// Cleanup on actual logout action (user clicked logout)
export function clearSessionEnforcement() {
    isEnforcementActive = false;
    if (sessionUnsubscribe) {
        sessionUnsubscribe();
        sessionUnsubscribe = null;
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
}
