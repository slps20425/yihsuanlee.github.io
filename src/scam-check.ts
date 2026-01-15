
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase-config"; // Ensure you export 'app' from firebase-config

const functions = getFunctions(app);
const checkMessageSafety = httpsCallable(functions, 'checkMessageSafety');

let alarmAudio: HTMLAudioElement | null = null; // Cache audio

export const ScamCheck = {
    async validate(text: string): Promise<{ safe: boolean; reason?: string }> {
        if (!text || text.trim().length === 0) return { safe: true };

        try {
            const result: any = await checkMessageSafety({ text });
            // result.data contains { status: 'safe' | 'blocked', reason?: string }
            const data = result.data;

            if (data.status === 'blocked') {
                this.triggerAlarm();
                return { safe: false, reason: data.reason };
            }

            return { safe: true };
        } catch (error) {
            console.error("Scam Check Error:", error);
            // Fail safe? Or block on error? 
            // Usually fail safe for network errors unless strict.
            return { safe: true };
        }
    },

    triggerAlarm() {
        if (!alarmAudio) {
            alarmAudio = new Audio('/assets/alarm.mp3');
        }
        alarmAudio.play().catch(e => console.warn("Audio play blocked:", e));

        // Visual Toast
        this.showToast("🚨 Security Alert: Potential scam detected.", "error");
    },

    showToast(message: string, type: 'success' | 'error' = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999;";
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 1rem 1.5rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        toast.innerHTML = type === 'error' ? `<span>🚫</span> ${message}` : `<span>✅</span> ${message}`;

        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        // Remove after 5s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
};
