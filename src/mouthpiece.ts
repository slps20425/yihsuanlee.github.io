import WiseCatI18n from './i18n';
import { auth } from './firebase-config';

// Global declarations
declare var intlTelInput: any;



let turnstileValidated = false;
let phoneInputPlugin: any = null;

// --- Turnstile Callback ---
(window as any).onTurnstileSuccess = function (token: string) {
    console.log("Turnstile Success, Token:", token);
    turnstileValidated = true;
    validateForm();
};

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
document.addEventListener('DOMContentLoaded', () => {
    // Initialize i18n explicitly
    try {
        WiseCatI18n.init();
    } catch (e) {
        console.error("i18n init failed:", e);
    }

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

    // Elements
    const missionEl = document.getElementById('mission') as HTMLSelectElement;
    const customMissionEl = document.getElementById('customMission') as HTMLInputElement;
    const userNameEl = document.getElementById('userName') as HTMLInputElement;
    const recipientNameEl = document.getElementById('recipientName') as HTMLInputElement;
    const targetPhoneEl = document.getElementById('targetPhone') as HTMLInputElement;
    const scriptContentEl = document.getElementById('scriptContent') as HTMLTextAreaElement;
    const schedulePreferenceEl = document.getElementById('schedulePreference') as HTMLSelectElement;

    const { doc, collection, setDoc, serverTimestamp } = await import("firebase/firestore");
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
        createdAt: new Date().toISOString()
    };

    const dict = (WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en']) as any;

    const namePattern = /^[a-zA-Z\s\-_]*$/;
    if (!namePattern.test(payload.userName) || !namePattern.test(payload.recipientName)) {
        alert(dict.validation_name || "Name must be English letters only");
        btn.disabled = false;
        return;
    }

    try {
        // 1. Log to Firestore
        await setDoc(taskRef, {
            ...payload,
            createdAt: serverTimestamp(),
            userId: (auth.currentUser ? auth.currentUser.uid : 'n/a')
        });
        console.log("Task logged to Firestore:", taskId);

        // 2. Success UI (No Webhook)
        btn.innerText = dict.msg_success;

        // Need userEmail. In mouthpiece.ts we parse localStorage earlier.
        // Let's re-parse or use a variable if we had one. 
        // Looking at the view_file (1421), 'userSession' is parsed in DOMContentLoaded.
        // We should move that parsing to top of handleFormSubmit or rely on localStorage again.
        let userEmail = "you";
        const stored = localStorage.getItem('wisecat_user');
        if (stored) {
            try { const u = JSON.parse(stored); if (u.email) userEmail = u.email; } catch (e) { }
        }

        alert(`We've received your task. Will email to here ${userEmail} to you when ready.\n\nWe will start call within 5 minutes.`);

    } catch (error) {
        console.error("Error submitting mouthpiece:", error);
        btn.innerText = dict.msg_failed;
        alert(dict.msg_fail_alert);
        btn.disabled = false;
    }
}
