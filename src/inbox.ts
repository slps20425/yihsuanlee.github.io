import { onAuthStateChanged } from 'firebase/auth'; // Keep types/functions if needed, but use auth instance from config
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase-config'; // Import shared instances


// State
let currentMessages: any[] = [];
let cachedCredits: number | null = null;
let cachedThreshold = 10;
let cachedPolicy: string | null = null;
const dismissedAlerts = new Set<string>();

export function updateInboxCredits(credits: number) {
    cachedCredits = credits;
    renderInbox();
}

export function initInbox() {
    console.log("Initializing Inbox...");

    const inboxTab = document.getElementById('inboxTab');
    if (!inboxTab) return;

    // Reset Dismissed Alerts on Init (Session-like behavior)
    // dismissedAlerts.clear(); // Actually, don't clear on simple re-init, clear on auth change

    // 1. Build the Unified Container Structure ONCE
    // We replace the current content with our Big Card structure if not present
    if (!document.getElementById('inboxMainCard')) {
        inboxTab.innerHTML = ''; // Clear existing static HTML

        const card = document.createElement('div');
        card.id = 'inboxMainCard';
        card.className = 'card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.height = 'calc(100vh - 200px)'; // Dynamic height or fixed?
        card.style.minHeight = '500px';
        card.style.padding = '0'; // Custom padding layout
        card.style.overflow = 'hidden'; // Inner scroll

        card.innerHTML = `
            <div style="padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <i class="bi bi-chat-square-text-fill" style="color: var(--accent);"></i>
                    <h2 style="margin: 0; font-size: 1.25rem;">Inbox</h2>
                </div>
                <p style="margin: 5px 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">
                    Receive SMS messages and campaign announcements
                </p>
            </div>
            
            <div id="inboxAlerts" style="flex-shrink: 0;"></div>
            
            <div id="inboxMessagesList" style="flex-grow: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 10px;">
                <!-- Content injected here -->
            </div>
        `;
        inboxTab.appendChild(card);
    }

    // Listen to Global Config
    try {
        const configRef = doc(db, 'configuration', 'settings');
        onSnapshot(configRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                // Threshold
                if (data.billing && typeof data.billing.low_balance_threshold === 'number') {
                    cachedThreshold = data.billing.low_balance_threshold;
                }
                // Global Policy
                if (data.global_policy_message) {
                    cachedPolicy = data.global_policy_message;
                } else {
                    cachedPolicy = null;
                }
                renderInbox();
            }
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
            dismissedAlerts.clear(); // Reset dismissed alerts on new login session

            const inboxRef = collection(db, `users/uid_${user.uid}/inbound_messages`);
            const q = query(inboxRef, orderBy("receivedAt", "desc"), limit(50));

            unsubscribe = onSnapshot(q, (snapshot) => {
                currentMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderInbox();
            });

        } else {
            currentMessages = [];
            cachedCredits = null;
            renderInbox();
        }
    });
}

function renderInbox() {
    const alertsContainer = document.getElementById('inboxAlerts');
    const messagesContainer = document.getElementById('inboxMessagesList');

    if (!alertsContainer || !messagesContainer) return;

    alertsContainer.innerHTML = '';
    messagesContainer.innerHTML = '';

    // --- 1. Render Alerts (Pinned) ---

    // A. Global Policy
    if (cachedPolicy && !dismissedAlerts.has('global_policy')) {
        renderAlert(alertsContainer, 'global_policy', 'System Announcement', cachedPolicy, 'info');
    }

    // B. Low Balance
    if ((cachedCredits !== null && cachedCredits < cachedThreshold) && !dismissedAlerts.has('low_balance')) {
        renderAlert(alertsContainer, 'low_balance', `Low Balance ($${cachedCredits.toFixed(2)})`,
            `Your balance is below $${cachedThreshold}. Please top up to maintain service.`, 'warning');
    }


    // --- 2. Render Messages ---
    if (currentMessages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="placeholder" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="bi bi-inbox" style="font-size: 2rem; display: block; margin-bottom: 1rem; opacity: 0.5;"></i>
                No messages yet
            </div>
        `;
        return;
    }

    currentMessages.forEach(msg => {
        const el = document.createElement('div');
        el.className = 'card message-item';
        // Add specific message styling
        el.style.backgroundColor = 'var(--bg-dark)'; // Contrast against card
        el.style.marginBottom = '0';
        el.style.border = '1px solid rgba(255,255,255,0.05)';
        el.style.borderLeft = msg.isRead ? '4px solid transparent' : '4px solid var(--accent)';
        el.style.padding = '1rem';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.2s';

        // Hover effect helper
        el.onmouseenter = () => { el.style.backgroundColor = 'rgba(255,255,255,0.05)'; };
        el.onmouseleave = () => { el.style.backgroundColor = 'var(--bg-dark)'; };

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

function renderAlert(container: HTMLElement, id: string, title: string, body: string, type: 'info' | 'warning') {
    const el = document.createElement('div');
    const color = type === 'warning' ? '#f59e0b' : '#3b82f6';
    const bg = type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)';
    const icon = type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';

    el.style.borderLeft = `4px solid ${color}`;
    el.style.background = bg;
    el.style.padding = '1rem';
    el.style.margin = '0'; // Flush in container
    el.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    el.style.display = 'flex';
    el.style.gap = '10px';
    el.style.alignItems = 'start';
    el.style.position = 'relative';

    el.innerHTML = `
        <i class="bi ${icon}" style="color: ${color}; font-size: 1.2rem; margin-top: 2px;"></i>
        <div style="flex-grow: 1; padding-right: 25px;">
            <div style="font-weight: bold; color: var(--text-primary); margin-bottom: 2px;">${title}</div>
            <div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.4;">${escapeHtml(body)}</div>
        </div>
        <button class="dismiss-btn-circle">
            &times;
        </button>
    `;

    // Dismiss Logic
    const btn = el.querySelector('.dismiss-btn-circle') as HTMLButtonElement;
    btn.onclick = () => {
        dismissedAlerts.add(id);
        renderInbox();
    };

    container.appendChild(el);
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
