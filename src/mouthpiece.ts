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
    const scriptLang = document.getElementById('scriptLanguage') as HTMLSelectElement;

    function updateAutoDetectLabel() {
        if (!phoneInputPlugin || !scriptLang) return;
        const countryData = phoneInputPlugin.getSelectedCountryData();
        const dialCode = countryData.dialCode;
        let langName = "English";

        // Simple mapping for display
        switch (dialCode) {
            case "886": langName = "Traditional Chinese"; break;
            case "81": langName = "Japanese"; break;
            case "82": langName = "Korean"; break;
            case "34": langName = "Spanish"; break;
            case "33": langName = "French"; break;
            case "39": langName = "Italian"; break;
            default: langName = "English"; break;
        }

        const autoOption = scriptLang.querySelector('option[value="auto"]');
        if (autoOption) {
            // Get the current text (which might be localized)
            // We assume the verified structure "Something (Something)"
            // If we want to be safe, we just prepend/append.
            // User asked for "Auto-Detect (English)"
            // Current i18n is "Auto-Detect (Based on Country)"
            // We can replace the content within the last parentheses, or just append if none.
            let text = autoOption.getAttribute('data-i18n-original') || autoOption.textContent || "";

            // Store original if not stored yet (hack to keep localization base)
            if (!autoOption.getAttribute('data-i18n-original')) {
                autoOption.setAttribute('data-i18n-original', text);
            }

            // Extract base part (before parenthesis)
            const parts = text.split('(');
            const base = parts[0].trim();

            autoOption.textContent = `${base} (${langName})`;
        }
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', validateForm);
        phoneInput.addEventListener('countrychange', () => {
            validateForm();
            updateAutoDetectLabel();
        });
        phoneInput.addEventListener('blur', validateForm);

        // Initial call
        setTimeout(updateAutoDetectLabel, 1000); // Wait for plugin init
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
    const scheduleContainer = document.getElementById('scheduleContainer');
    const schedulePreference = document.getElementById('schedulePreference');

    if (scheduleContainer && schedulePreference) {
        schedulePreference.addEventListener('change', (e) => {
            const val = (e.target as HTMLSelectElement).value;
            const isScheduled = val === 'scheduled';
            scheduleContainer.style.display = isScheduled ? 'block' : 'none';

            if (isScheduled) {
                const timeInput = document.getElementById('scheduleTime') as HTMLInputElement;
                if (timeInput) {
                    const now = new Date();
                    // ISO string is UTC, so we need to offset it to match local time for the input
                    const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                    timeInput.min = localIso;
                }
            }
        });
    }

    // Timezone Mapping (Simple)
    // Import full timezone map
    // Note: We need a dynamic import or top-level import. Since this is inside DOMContentLoaded, we should move the import to top of file
    // But for now, we can dynamically import it or assume it's available if we change the structure.
    // Actually, `mouthpiece.ts` is likely an ES module. I should add the import at the top.

    // Changing strategy: I will add the import at the very top of the file first.
    // This step only DELETES the local map.
    const updateTimezone = async () => {
        if (!phoneInputPlugin) return;
        const countryData = phoneInputPlugin.getSelectedCountryData();
        const countryCode = countryData.iso2;
        const tzDisplay = document.getElementById('detectedTimezone');

        // Dynamic import to avoid breaking changes at top level if build config is strict
        // But standard import is better. I will add import at top in next step.
        const { countryTimezones } = await import('./timezones');

        let tz = '';
        let source = '';

        if (countryCode && countryTimezones[countryCode]) {
            tz = countryTimezones[countryCode];
            source = `based on ${countryCode.toUpperCase()}`;
        } else {
            // Fallback
            try {
                tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                source = 'your browser time';
            } catch (e) {
                tz = 'UTC';
                source = 'default';
            }
        }

        if (tzDisplay) {
            tzDisplay.innerText = `${tz} (${source})`;
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

    // TEMPORARY DISABLE REMOVED

    // Elements
    const missionEl = document.getElementById('mission') as HTMLSelectElement;
    const customMissionEl = document.getElementById('customMission') as HTMLInputElement;
    const userNameEl = document.getElementById('userName') as HTMLInputElement;
    const recipientNameEl = document.getElementById('recipientName') as HTMLInputElement;
    const targetPhoneEl = document.getElementById('targetPhone') as HTMLInputElement;
    const scriptContentEl = document.getElementById('scriptContent') as HTMLTextAreaElement;
    const schedulePreferenceEl = document.getElementById('schedulePreference') as HTMLSelectElement;
    const scriptLanguageEl = document.getElementById('scriptLanguage') as HTMLSelectElement;

    const { doc, collection, serverTimestamp, runTransaction } = await import("firebase/firestore");
    const { db } = await import("./firebase-config");

    const tasksCol = collection(db, 'tasks');
    const randomId = doc(tasksCol).id;
    const taskId = `task_${randomId}`;
    const taskRef = doc(db, 'tasks', taskId);

    // Determine Language: Manual > Country > Fallback (EN)
    let finalLang = 'en';
    if (scriptLanguageEl && scriptLanguageEl.value !== 'auto') {
        finalLang = scriptLanguageEl.value;
    } else if (phoneInputPlugin) {
        const countryData = phoneInputPlugin.getSelectedCountryData();
        const dialCode = countryData.dialCode; // e.g. "886"

        switch (dialCode) {
            case "886": finalLang = "zh"; break;
            case "81": finalLang = "jp"; break;
            case "82": finalLang = "kr"; break;
            case "34": finalLang = "es"; break;
            case "33": finalLang = "fr"; break;
            case "39": finalLang = "it"; break;
            default: finalLang = "en"; break;
        }
    }

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
        language: finalLang,
        userEmail: (auth.currentUser && auth.currentUser.email) ? auth.currentUser.email :
            (localStorage.getItem('wisecat_user') ? (JSON.parse(localStorage.getItem('wisecat_user') || '{}').email || 'N/A') : 'N/A'),
        userCredits: (localStorage.getItem('wisecat_user') ? Number(JSON.parse(localStorage.getItem('wisecat_user') || '{}').credits || 0) : 0),
        retry_count: 1,
        createdAt: new Date().toISOString()
    };

    // --- Schedule Logic ---
    const schedulePreferenceVal = (document.getElementById('schedulePreference') as HTMLSelectElement).value;
    if (schedulePreferenceVal === 'scheduled') {
        const scheduleTimeInput = document.getElementById('scheduleTime') as HTMLInputElement;
        const scheduleVal = scheduleTimeInput.value;

        if (!scheduleVal) {
            (window as any).showToast("Please select a time for the scheduled call.", "error");
            btn.disabled = false;
            return;
        }

        const tzInfo = document.getElementById('detectedTimezone');
        let tz = tzInfo ? tzInfo.getAttribute('data-tz') : null;

        if (!tz) tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // Fallback to browser

        try {
            // Robust Local -> UTC Conversion
            // We want 'scheduleVal' (e.g., "2023-10-27T10:00") to be treated as time IN 'tz'
            // and get the corresponding UTC timestamp.

            // 1. Parse the local components requested by user
            const d = new Date(scheduleVal);
            const year = d.getFullYear();
            const month = d.getMonth();
            const day = d.getDate();
            const hours = d.getHours();
            const minutes = d.getMinutes();

            // 2. Initial Guess: Treat inputs as UTC
            let guessUTC = new Date(Date.UTC(year, month, day, hours, minutes));

            // 3. Helper to format a UTC date as parts in the Target Zone
            const getPartsInTz = (date: Date, timeZone: string) => {
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone,
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric', second: 'numeric',
                    hour12: false
                });
                const parts = formatter.formatToParts(date);
                const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0');
                const y = get('year');
                const m = get('month') - 1; // 0-indexed
                const d = get('day');
                const h = get('hour') === 24 ? 0 : get('hour'); // some browsers return 24
                const min = get('minute');
                return { y, m, d, h, min };
            };

            // 4. Iteratively Refine
            // Calculate error between "What time is it in TZ at guessUTC?" vs "Target Time"
            for (let i = 0; i < 3; i++) {
                const p = getPartsInTz(guessUTC, tz);
                const currentInTz = new Date(Date.UTC(p.y, p.m, p.d, p.h, p.min));
                const targetInUtcScale = new Date(Date.UTC(year, month, day, hours, minutes));

                const diff = targetInUtcScale.getTime() - currentInTz.getTime();
                if (Math.abs(diff) < 1000) break; // Close enough

                guessUTC = new Date(guessUTC.getTime() + diff);
            }

            const finalDate = guessUTC;

            if (finalDate.getTime() < Date.now()) {
                (window as any).showToast("Scheduled time cannot be in the past.", "error");
                btn.disabled = false;
                return;
            }

            (payload as any).scheduleCallTime = finalDate.toISOString();
            (payload as any).scheduleTimeZone = tz;
        } catch (e) {
            console.error("Timezone conversion error:", e);
            // Fallback: send local string if complex logic fails (e.g. invalid timezone)
            (payload as any).scheduleCallTimeLocal = scheduleVal;
            (payload as any).scheduleTimeZone = tz;
        }
    }
    // ----------------------
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
