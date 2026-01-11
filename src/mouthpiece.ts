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

    // --- Scheduler UI Logic ---
    const enableSchedule = document.getElementById('enableSchedule');
    const scheduleContainer = document.getElementById('scheduleContainer');
    const schedulePreference = document.getElementById('schedulePreference');

    if (enableSchedule && scheduleContainer && schedulePreference) {
        enableSchedule.addEventListener('change', (e) => {
            const isChecked = (e.target as HTMLInputElement).checked;
            scheduleContainer.style.display = isChecked ? 'block' : 'none';
            schedulePreference.style.display = isChecked ? 'none' : 'block';
        });
    }

    // Timezone Mapping (Simple)
    const countryToTz: Record<string, string> = {
        'tw': 'Asia/Taipei', 'jp': 'Asia/Tokyo', 'kr': 'Asia/Seoul',
        'cn': 'Asia/Shanghai', 'us': 'America/New_York', 'uk': 'Europe/London',
        'au': 'Australia/Sydney', 'th': 'Asia/Bangkok', 'vn': 'Asia/Ho_Chi_Minh'
        // Add more as needed, fallback to UTC
    };

    const updateTimezone = () => {
        if (!phoneInputPlugin) return;
        const countryData = phoneInputPlugin.getSelectedCountryData();
        const countryCode = countryData.iso2;
        const tzDisplay = document.getElementById('detectedTimezone');

        let tz = 'UTC'; // Fallback
        if (countryCode && countryToTz[countryCode]) {
            tz = countryToTz[countryCode];
        } else if (countryCode) {
            // Generic attempt? No, just default
            try {
                // If browser supports it, we could try map common ones
                tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // Default to user's browser if unknown
            } catch (e) { }
        }

        if (tzDisplay) {
            tzDisplay.innerText = `${tz} (based on ${countryCode.toUpperCase()})`;
            tzDisplay.setAttribute('data-tz', tz);
        }
    };

    if (input) {
        input.addEventListener('countrychange', updateTimezone);
        // Initial update
        setTimeout(updateTimezone, 1000);
    }
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

    // --- Schedule Logic ---
    const enableSchedule = (document.getElementById('enableSchedule') as HTMLInputElement).checked;
    if (enableSchedule) {
        const scheduleTimeInput = document.getElementById('scheduleTime') as HTMLInputElement;
        const scheduleVal = scheduleTimeInput.value;

        if (!scheduleVal) {
            (window as any).showToast("Please select a time for the scheduled call.", "error");
            btn.disabled = false;
            return;
        }

        // Calculate UTC time
        const targetDate = new Date(scheduleVal); // This parses as local time of the browser usually
        // But we want to interpret it in the TARGET timezone?
        // Actually, datetime-local IS just a string "YYYY-MM-DDTHH:mm".
        // Use logic to interpret this string as belonging to the detected timezone.

        // Simple approach: Use detected offset
        const tzInfo = document.getElementById('detectedTimezone');
        let tz = tzInfo ? tzInfo.getAttribute('data-tz') : null; // We will store tz in attribute

        if (!tz) tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // Fallback to browser

        // Create date object treating the input string as being in 'tz'
        // Using a library like luxon is best, but to keep it light/vanilla:
        // We will construct a string with offset if possible, or just Convert via Date
        // "2023-10-27T10:30" -> we need to find what UTC that is given 'tz'.

        // Allow browser to handle it simply for now: presume user enters time in THEIR local time relative to that country?
        // Actually, user is entering time. If user is in US but target is TW, user might be confused.
        // Alert says: "Timezone: Asia/Taipei". So user enters 10:00. This implies 10:00 Taipei time.
        // We need to convert "10:00 Taipei" to UTC.

        const targetTime = new Date(new Date(scheduleVal).toLocaleString("en-US", { timeZone: tz }));
        // Wait, standard Date parsing is browser local.
        // Hack: Create a date object that represents that absolute moment if it were UTC, then shift it.
        // Or better: pass the raw string and timezone to Backend/N8N?
        // N8N prefers ISO UTC.

        // Let's try to approximate offset
        try {
            // Helper to get offset in minutes for a timezone at a specific date
            const getOffset = (timeZone: string, date: Date) => {
                const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
                const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
                return (tzDate.getTime() - utcDate.getTime()) / 60000;
            };

            const localDate = new Date(scheduleVal); // Treated as browser local by default behavior, but we just want components
            // We can't easily parse "2023-10-20T10:00" as "Asia/Taipei" natively without heavy lifting.
            // Compromise: We will send the ISODate string AND the Target Timezone to Firestore.
            // N8N can handle the conversion or we just rely on "scheduleCallTime" being ISO with offset?

            // Let's store two fields:
            // scheduleCallTimeLocal: "2023-10-20T10:00"
            // scheduleTimeZone: "Asia/Taipei"
            (payload as any).scheduleCallTimeLocal = scheduleVal;
            (payload as any).scheduleTimeZone = tz;

            // Also try to calc UTC for sorting if possible (Best Effort)
            // For now, sending local + TZ is safest for N8N to process correctly.
        } catch (e) {
            console.error(e);
        }
    }
    // ----------------------

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
