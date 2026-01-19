import { onAuthStateChanged } from 'firebase/auth'; // Keep types/functions if needed, but use auth instance from config
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase-config'; // Import shared instances


export function initInbox() {
    console.log("Initializing Inbox...");

    const inboxTab = document.getElementById('inboxTab');
    const inboxPlaceholder = inboxTab?.querySelector('.placeholder');
    let unsubscribe: (() => void) | null = null;
    let messagesContainer: HTMLDivElement | null = null;

    // Create container if not exists
    if (inboxTab && !document.getElementById('inboxMessagesContainer')) {
        messagesContainer = document.createElement('div');
        messagesContainer.id = 'inboxMessagesContainer';
        messagesContainer.style.display = 'grid';
        messagesContainer.style.gap = '10px';
        messagesContainer.style.marginTop = '1rem';
        inboxTab.appendChild(messagesContainer);
    } else {
        messagesContainer = document.getElementById('inboxMessagesContainer') as HTMLDivElement;
    }

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
                const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (messages.length === 0) {
                    if (inboxPlaceholder) inboxPlaceholder.removeAttribute('hidden');
                    if (messagesContainer) messagesContainer.innerHTML = '';
                    if (messagesContainer) messagesContainer.style.display = 'none';
                    // Ensure placeholder is visible using style because hidden attribute might be sticky
                    if (inboxPlaceholder) (inboxPlaceholder as HTMLElement).style.display = 'block';
                } else {
                    if (inboxPlaceholder) (inboxPlaceholder as HTMLElement).style.display = 'none'; // Hide placeholder
                    if (messagesContainer) messagesContainer.style.display = 'grid';
                    renderMessages(messages, messagesContainer);
                }
            }, (error) => {
                console.error("Inbox subscription error:", error);
                // Handle permission denied or missing index
                if (error.code === 'failed-precondition') {
                    console.warn("Index might be building...");
                }
            });

        } else {
            // Logged out
            if (messagesContainer) messagesContainer.innerHTML = '';
            if (inboxPlaceholder) (inboxPlaceholder as HTMLElement).style.display = 'block';
        }
    });
}

function renderMessages(messages: any[], container: HTMLDivElement | null) {
    if (!container) return;
    container.innerHTML = '';

    messages.forEach(msg => {
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
            const date = (msg.receivedAt as Timestamp).toDate();
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

        container.appendChild(el);
    });
}

function timeAgo(date: Date) {
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
