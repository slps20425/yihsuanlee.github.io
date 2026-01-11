import WiseCatI18n from './i18n';
import { auth } from './firebase-config';

// Global declarations
declare var intlTelInput: any;



let turnstileValidated = false;
let phoneInputPlugin: any = null;
let currentCost = 3; // Default cost for mouthpiece

// --- Turnstile Callback ---
// --- Turnstile Integration ---

// Define callback globally so Turnstile can find it
(window as any).onTurnstileSuccess = function (token: string) {
    console.log("Turnstile Success, Token:", token);
    turnstileValidated = true;
    validateForm();
};

let isTurnstileRendered = false;

const renderTurnstile = () => {
    if (isTurnstileRendered) return; // Prevent double render
    if ((window as any).turnstile) {
        (window as any).turnstile.render('#turnstile-widget', {
            sitekey: '0x4AAAAAACKreG1nTIC_lSzg',
            callback: (window as any).onTurnstileSuccess,
        });
        isTurnstileRendered = true;
    }
};

// Expose render function for the inline script to call if it loads later
(window as any).renderAppTurnstile = renderTurnstile;

// Check if script already loaded before us
if ((window as any).isTurnstileLoaded) {
    renderTurnstile();
}
// Fallback check immediately (just in case)
renderTurnstile();

function validateForm() {
    const btn = document.getElementById('submitBtn') as HTMLButtonElement;
    const phoneInput = document.getElementById('targetPhone') as HTMLInputElement;
    const phoneHint = document.getElementById('phoneHint');

    // 1. Credit Check
    const userSession = localStorage.getItem('wisecat_user');
    let credits = 0;
    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            credits = parseFloat(user.credits) || 0;
        } catch (e) {
            console.error("Error parsing user session:", e);
        }
    }

    // 2. Phone Validation - Permissive but reject invalid characters
    let isPhoneValid = false;
    if (phoneInputPlugin && phoneInput.value) {
        const validCharsOnly = /^[\d\s\-\(\)\+]+$/.test(phoneInput.value);
        const digitsOnly = phoneInput.value.replace(/\D/g, '');
        isPhoneValid = validCharsOnly && digitsOnly.length >= 5;
    } else if (phoneInput.value) {
        isPhoneValid = false;
    }

    if (phoneInput.value && !isPhoneValid) {
        phoneInput.style.borderColor = "#ff4d4d";
        if (phoneHint) phoneHint.style.display = "block";
    } else {
        phoneInput.style.borderColor = "";
        if (phoneHint) phoneHint.style.display = "none";
    }

    // 3. Combined Logic
    if (credits > 0 && turnstileValidated && isPhoneValid) {
        btn.disabled = false;
        btn.style.opacity = "1";
    } else {
        btn.disabled = true;
        btn.style.opacity = "0.5";
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize i18n explicitly
    try {
        WiseCatI18n.init();
    } catch (e) {
        console.error("i18n init failed:", e);
    }

    // --- Remote Config Listener ---
    const { doc, onSnapshot, runTransaction } = await import("firebase/firestore"); // Added runTransaction
    const { db } = await import("./firebase-config");

    const configRef = doc(db, 'configuration', 'settings');
    const mouthBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;
    const configAlert = document.createElement('div');
    // Styles for mouthpiece (dark theme context)
    configAlert.style.cssText = "display: none; background: #ff4444; color: white; padding: 10px; border-radius: 8px; margin-top: 10px; text-align: center; font-weight: bold;";
    configAlert.innerHTML = "⚠️ This service is currently under maintenance.";

    if (mouthBtn && mouthBtn.parentNode) {
        mouthBtn.parentNode.insertBefore(configAlert, mouthBtn);
    }



    onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const isEnabled = data.enable_mouthpiece !== false; // Default true

            // Dynamic Cost
            if (data.cost_mouthpiece !== undefined) {
                currentCost = Number(data.cost_mouthpiece);
            }

            // Update UI Icon
            const iconContainerId = 'costIconContainer';
            let iconContainer = document.getElementById(iconContainerId);

            if (!iconContainer) {
                // Find Header or Title to append near
                const header = document.querySelector('.header h2') || document.querySelector('h2');

                if (header) {
                    iconContainer = document.createElement('div');
                    iconContainer.id = iconContainerId;
                    iconContainer.className = 'info-icon-container';
                    iconContainer.innerHTML = `
                        <div class="info-icon">i</div>
                        <div class="cost-tooltip">
                            <strong>Cost Information</strong><br>
                            This task costs <span id="dynamicCostDisplay">${currentCost}</span> credit(s).
                        </div>
                    `;
                    header.parentNode?.insertBefore(iconContainer, header.nextSibling);
                }
            } else {
                const display = document.getElementById('dynamicCostDisplay');
                if (display) display.innerText = String(currentCost);
            }

            if (mouthBtn) {
                if (!isEnabled) {
                    mouthBtn.disabled = true;
                    mouthBtn.style.opacity = "0.5";
                    mouthBtn.style.cursor = "not-allowed";
                    configAlert.style.display = "block";
                } else {
                    configAlert.style.display = "none";
                    mouthBtn.style.opacity = "1";
                    mouthBtn.style.cursor = "pointer";
                    validateForm(); // Re-check
                }
            }
        }
    });

    // Initialize intl-tel-input
    const input = document.querySelector("#targetPhone");
    if (input) {
        phoneInputPlugin = intlTelInput(input, {
            initialCountry: "auto",
            geoIpLookup: function (callback: (code: string) => void) {
                fetch("https://ipapi.co/json")
                    .then(res => res.json())
                    .then(data => callback(data.country_code))
                    .catch(() => callback("us"));
            },
            preferredCountries: [],
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            separateDialCode: true
        });

        // Add dial code search feature
        let dialCodeBuffer = "";
        let dialCodeTimeout: number | null = null;

        document.addEventListener("keydown", (e: KeyboardEvent) => {
            const dropdown = document.querySelector(".iti__country-list");
            if (!dropdown || dropdown.classList.contains("iti__hide")) return;

            if (e.key >= "0" && e.key <= "9") {
                e.preventDefault();
                dialCodeBuffer += e.key;

                if (dialCodeTimeout) clearTimeout(dialCodeTimeout);

                const countries = dropdown.querySelectorAll(".iti__country");
                for (const country of countries) {
                    const dialCode = country.querySelector(".iti__dial-code")?.textContent?.replace("+", "");
                    if (dialCode && dialCode.startsWith(dialCodeBuffer)) {
                        country.scrollIntoView({ block: "nearest", behavior: "smooth" });
                        countries.forEach(c => c.classList.remove("iti__highlight"));
                        country.classList.add("iti__highlight");
                        break;
                    }
                }

                dialCodeTimeout = window.setTimeout(() => {
                    dialCodeBuffer = "";
                }, 1000);
            }
        });
    }

    // Listen for input changes
    const phoneInput = document.getElementById('targetPhone');
    const mission = document.getElementById('mission');
    const form = document.getElementById('mouthpieceForm');

    if (phoneInput) {
        phoneInput.addEventListener('input', validateForm);
        phoneInput.addEventListener('countrychange', validateForm);
        phoneInput.addEventListener('blur', validateForm);
    }

    if (mission) {
        mission.addEventListener('change', (e: Event) => {
            const custom = document.getElementById('customMission');
            if (custom) {
                custom.style.display = (e.target as HTMLSelectElement).value === 'other' ? 'block' : 'none';
                if ((e.target as HTMLSelectElement).value === 'other') custom.focus();
            }
        });
    }

    // Load User
    const userSession = localStorage.getItem('wisecat_user');
    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            const userNameInput = document.getElementById('userName') as HTMLInputElement;
            if (user.name && userNameInput) userNameInput.value = user.name;
        } catch (e) { }
    }

    if (form) form.addEventListener('submit', handleFormSubmit);

    // Helper Buddy Logic
    const buddy = document.getElementById('helperBuddy');
    const panel = document.getElementById('helperPanel');
    const close = document.getElementById('helperClose');

    if (buddy && panel) buddy.addEventListener('click', () => panel.classList.toggle('show'));
    if (close && panel) close.addEventListener('click', () => panel.classList.remove('show'));
});

async function handleFormSubmit(e: Event) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn') as HTMLButtonElement;
    btn.disabled = true;

    // TEMPORARY DISABLE
    alert("This service is currently disabled/under maintenance.");
    btn.disabled = false;
    return;

    // Elements
    const missionEl = document.getElementById('mission') as HTMLSelectElement;
    const customMissionEl = document.getElementById('customMission') as HTMLInputElement;
    const userNameEl = document.getElementById('userName') as HTMLInputElement;
    const recipientNameEl = document.getElementById('recipientName') as HTMLInputElement;
    const targetPhoneEl = document.getElementById('targetPhone') as HTMLInputElement;
    const scriptContentEl = document.getElementById('scriptContent') as HTMLTextAreaElement;
    const schedulePreferenceEl = document.getElementById('schedulePreference') as HTMLSelectElement;

    const { doc, collection, serverTimestamp, runTransaction } = await import("firebase/firestore");
    const { db } = await import("./firebase-config");

    const tasksCol = collection(db, 'tasks');
    const randomId = doc(tasksCol).id;
    const taskId = `task_${randomId}`;
    const taskRef = doc(db, 'tasks', taskId);

    const payload = {
        taskId: taskId,
        type: 'mouthpiece',
        isTrial: false,
        state: 'pending',
        priority: 5, // Highest priority (ASAP)
        reservation_utc: serverTimestamp(), // Run now
        mission: missionEl.value,
        customMission: missionEl.value === 'other' ? customMissionEl.value : '',
        userName: userNameEl.value,
        recipientName: recipientNameEl.value,
        targetPhoneNumber: phoneInputPlugin ? phoneInputPlugin.getNumber() : targetPhoneEl.value,
        script: scriptContentEl.value,
        schedulePreference: schedulePreferenceEl.value,
        language: WiseCatI18n.currentLang,
        userEmail: (auth.currentUser && auth.currentUser.email) ? auth.currentUser.email :
            (localStorage.getItem('wisecat_user') ? (JSON.parse(localStorage.getItem('wisecat_user') || '{}').email || 'N/A') : 'N/A'),
        userCredits: (localStorage.getItem('wisecat_user') ? Number(JSON.parse(localStorage.getItem('wisecat_user') || '{}').credits || 0) : 0),
        createdAt: new Date().toISOString()
    };

    const dict = (WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en']) as any;

    const namePattern = /^[a-zA-Z\s\-_]*$/;
    if (!namePattern.test(payload.userName) || !namePattern.test(payload.recipientName)) {
        (window as any).showToast(dict.validation_name || "Name must be English letters only", "error");
        btn.disabled = false;
        return;
    }


    // 1. Transaction: Check Credits -> Deduct -> Create Task
    try {
        if (!auth.currentUser) {
            (window as any).showToast("Please log in to submit a mouthpiece task.", "error");
            btn.disabled = false;
            return;
        }

        const userDocRef = doc(db, 'users', `uid_${auth.currentUser.uid}`);
        const cost = currentCost;

        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw "User document does not exist!";
            }

            const userData = userDoc.data();
            const currentCredits = Number(userData.credits || 0);

            if (currentCredits < cost) {
                // Throwing simple string to be caught below
                throw `Insufficient credits! This task requires ${cost} credits.`;
            }

            // Deduct Credit
            transaction.update(userDocRef, { credits: currentCredits - cost });

            // Create Task
            transaction.set(taskRef, {
                ...payload,
                userCredits: currentCredits - cost, // Store NEW balance
                cost: cost,
                createdAt: serverTimestamp(),
                userId: auth.currentUser!.uid
            });
        });

        console.log("Task logged to Firestore via Transaction:", taskId);

        // 2. Success UI (No Webhook)
        btn.innerText = dict.msg_success;

        // Need userEmail. In mouthpiece.ts we parse localStorage earlier.
        let userEmail = "you";
        const stored = localStorage.getItem('wisecat_user');
        if (stored) {
            try { const u = JSON.parse(stored); if (u.email) userEmail = u.email; } catch (e) { }
        }

        (window as any).showToast(`We've received your task. Will email to ${userEmail} when ready.`, "success");

    } catch (error) {
        console.error("Error submitting mouthpiece:", error);

        let msg = (dict.msg_fail_alert || "Submission failed. Please try again.");
        if (typeof error === 'string' && error.includes("Insufficient credits")) {
            msg = error;
        }

        btn.innerText = dict.msg_failed;
        (window as any).showToast(msg, "error");
        btn.disabled = false;
    }
}

// Helper: Toast Notification
(window as any).showToast = function (message: string, type: 'success' | 'error' | 'info' = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
};

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}
