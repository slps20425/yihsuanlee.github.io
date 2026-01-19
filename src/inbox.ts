import { onAuthStateChanged } from 'firebase/auth'; // Keep types/functions if needed, but use auth instance from config
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase-config'; // Import shared instances


// State
let currentMessages: any[] = [];
let cachedCredits: number | null = null;
let cachedThreshold = 10; // Default fallback

export function updateInboxCredits(credits: number) {
    cachedCredits = credits;
    renderInbox();
}

export function initInbox() {
    console.log("Initializing Inbox...");

    const inboxTab = document.getElementById('inboxTab');

    // Ensure container exists
    if (inboxTab && !document.getElementById('inboxMessagesContainer')) {
        const c = document.createElement('div');
        c.id = 'inboxMessagesContainer';
        c.style.display = 'grid';
        c.style.gap = '10px';
        c.style.marginTop = '1rem';
        inboxTab.appendChild(c);
    }

    // Listen to Global Config for Threshold
    // Path: configuration/settings -> billing.low_balance_threshold
    try {
        const configRef = doc(db, 'configuration', 'settings');
        onSnapshot(configRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.billing && typeof data.billing.low_balance_threshold === 'number') {
                    cachedThreshold = data.billing.low_balance_threshold;
                    console.log("Inbox: Updated low balance threshold to:", cachedThreshold);
                    renderInbox();
                }
            }
        }, (err) => {
            console.warn("Inbox: Could not fetch global config (using default 10):", err);
        });
    } catch (e) {
        console.warn("Inbox: Config listener setup failed:", e);
    }

    let unsubscribe: (() => void) | null = null;

    onAuthStateChanged(auth, (user) => {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }

        if (user) {
            console.log("Inbox: User logged in, subscribing...");
            const inboxRef = collection(db, `users/uid_${user.uid}/inbound_messages`);
            const q = query(inboxRef, orderBy("receivedAt", "desc"), limit(50));

            unsubscribe = onSnapshot(q, (snapshot) => {
                currentMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderInbox();
            }, (error) => {
                console.error("Inbox subscription error:", error);
            });

        } else {
            currentMessages = [];
            cachedCredits = null;
            renderInbox();
        }
    });
}

function renderInbox() {
    const inboxTab = document.getElementById('inboxTab');
    const inboxPlaceholder = inboxTab?.querySelector('.placeholder') as HTMLElement;
    const messagesContainer = document.getElementById('inboxMessagesContainer') as HTMLDivElement;

    if (!messagesContainer) return;

    // Check for Low Balance Warning
    const showWarning = (cachedCredits !== null && cachedCredits < cachedThreshold);

    // Determine visibility
    const hasContent = currentMessages.length > 0 || showWarning;

    if (!hasContent) {
        messagesContainer.innerHTML = '';
        messagesContainer.style.display = 'none';
        if (inboxPlaceholder) inboxPlaceholder.style.display = 'block';
        return;
    }

    // Show Content
    if (inboxPlaceholder) inboxPlaceholder.style.display = 'none';
    messagesContainer.style.display = 'grid';
    messagesContainer.innerHTML = '';

    // 1. Render Warning (if needed)
    if (showWarning && cachedCredits !== null) {
        const el = document.createElement('div');
        el.className = 'card warning-item';
        el.style.marginBottom = '0';
        el.style.borderLeft = '4px solid #f59e0b';
        el.style.background = 'rgba(245, 158, 11, 0.1)';
        el.style.padding = '1rem';
        el.style.cursor = 'pointer';
        el.onclick = () => {
            // Open Profile Tab to top up
            const profileTab = document.querySelector('[data-tab="profile"]') as HTMLElement;
            if (profileTab) profileTab.click();
        };

        el.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="bi bi-exclamation-triangle-fill text-warning" style="font-size: 1.2rem;"></i>
                <div>
                    <div style="font-weight: bold; color: var(--text-primary);">Low Balance ($${cachedCredits.toFixed(2)})</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">
                        Balance is below $${cachedThreshold}. Please top up to keep your numbers active.
                    </div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(el);
    }

    // 2. Render Messages
    currentMessages.forEach(msg => {
        const el = document.createElement('div');
        el.className = 'card message-item';
        // Add specific message styling
        el.style.marginBottom = '0'; // Override card default
        el.style.borderLeft = msg.isRead ? '4px solid transparent' : '4px solid var(--accent)';
        el.style.padding = '1rem';
        el.style.cursor = 'pointer';
        el.style.transition = 'background 0.2s';

        // Hover effect helper
        el.onmouseenter = () => el.style.background = 'rgba(255,255,255,0.03)';
        el.onmouseleave = () => el.style.background = 'var(--card-bg)';

        // Timestamp formatting
        let timeStr = 'Check time';
        if (msg.receivedAt) {
            const date = (msg.receivedAt as Timestamp).toDate ? (msg.receivedAt as Timestamp).toDate() : new Date(msg.receivedAt);
            timeStr = timeAgo(date);
        }

        const sender = msg.sender || 'Unknown';
        const body = msg.body || '(No content)';

        el.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">${formatPhoneNumber(sender)}</span>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">${timeStr}</span>
            </div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.4;">
                ${escapeHtml(body)}
            </div>
        `;

        // Click to Mark as Read
        el.onclick = async () => {
            if (!msg.isRead) {
                try {
                    const user = auth.currentUser;
                    if (user) {
                        const docRef = doc(db, `users/uid_${user.uid}/inbound_messages/${msg.id}`);
                        await updateDoc(docRef, { isRead: true });
                    }
                } catch (e) {
                    console.error("Error marking read:", e);
                }
            }
        };

        messagesContainer.appendChild(el);
    });
}

function timeAgo(date: Date) {
    if (isNaN(date.getTime())) return "Unknown";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
}

function escapeHtml(text: string) {
    if (!text) return text;
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function formatPhoneNumber(phoneNumberString: string) {
    // Simple formatting
    try {
        // You might use libphonenumber-js if available, otherwise just return
        return phoneNumberString;
    } catch (e) {
        return phoneNumberString;
    }
}
