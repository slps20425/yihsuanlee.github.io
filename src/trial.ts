import WiseCatI18n from './i18n';
import { auth } from './firebase-config';

// Global declarations
declare var intlTelInput: any;


const MAX_WORDS = 30;

let turnstileValidated = false;

let phoneInputPlugin: any = null;

// --- Initialization ---

document.addEventListener("DOMContentLoaded", function () {
    // Initialize i18n explicitly
    WiseCatI18n.init();



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



        // Helper specifically for target phone dropdown but we can generalize if needed
        // For now let's keep it simple or duplicate/abstract. 
        // Given complexity, I will just leave the existing listener for dial code which targets the global dropdown structure of intl-tel-input
        // But intl-tel-input might have multiple. 'iti__country-list' selector might be ambiguous if multiple exist.
        // intl-tel-input appends the dropdown to the input container usually. Validating strictness:
        // The original code uses document.querySelector(".iti__country-list"). This will only select the first one.
        // We should probably rely on click behavior which is built-in. The search feature was custom.
        // I'll leave the custom search as is for 'targetPhone' mostly, or simpler, let's just proceed.
    }

    // Load User info if logged in
    const userSession = localStorage.getItem('wisecat_user');
    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            const nameInput = document.getElementById('userName') as HTMLInputElement;
            if (user.name && nameInput) nameInput.value = user.name;
        } catch (e) { }
    }

    // Bind Listeners
    bindValidationListeners();
});

// --- Turnstile Callback ---
(window as any).onTurnstileSuccess = function (_token: string) {
    turnstileValidated = true;
    validateForm();
};

function countWords(str: string): number {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function validateForm() {
    const btn = document.getElementById('submitBtn') as HTMLButtonElement;
    const phoneInput = document.getElementById('targetPhone') as HTMLInputElement;
    const scriptInput = document.getElementById('scriptContent') as HTMLTextAreaElement;
    const phoneHint = document.getElementById('phoneHint');

    if (!btn || !phoneInput || !scriptInput) return;

    let isPhoneValid = false;
    // Validate Target Phone
    if (phoneInputPlugin && phoneInput.value) {
        const validCharsOnly = /^[\d\s\-\(\)\+]+$/.test(phoneInput.value);
        const digitsOnly = phoneInput.value.replace(/\D/g, '');
        isPhoneValid = validCharsOnly && digitsOnly.length >= 5;
    }



    const wordCount = countWords(scriptInput.value);
    const isScriptValid = wordCount > 0 && wordCount <= MAX_WORDS;

    if (turnstileValidated && isPhoneValid && isScriptValid) {
        btn.disabled = false;
        btn.style.opacity = "1";
    } else {
        btn.disabled = true;
        btn.style.opacity = "0.5";
    }

    // UI feedback for target phone
    if (phoneInput.value && !isPhoneValid) {
        phoneInput.style.borderColor = "#ff4d4d";
        if (phoneHint) phoneHint.style.display = "block";
    } else {
        phoneInput.style.borderColor = "";
        if (phoneHint) phoneHint.style.display = "none";
    }

    // UI for user phone


    // Word counter UI
    const counter = document.getElementById('wordCounter');
    if (counter) {
        counter.innerText = `${wordCount} / ${MAX_WORDS} words`;
        counter.style.color = wordCount > MAX_WORDS ? "#ff4d4d" : "#888";
    }
}



// Bind listeners
function bindValidationListeners() {
    const phoneInputEl = document.getElementById('targetPhone');
    if (phoneInputEl) {
        phoneInputEl.addEventListener('input', validateForm);
        phoneInputEl.addEventListener('countrychange', validateForm);
        phoneInputEl.addEventListener('blur', validateForm);
    }



    const scriptInput = document.getElementById('scriptContent');
    if (scriptInput) {
        scriptInput.addEventListener('input', validateForm);
    }

    const form = document.getElementById('trialForm');
    if (form) form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e: Event) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn') as HTMLButtonElement;
    const scriptInput = document.getElementById('scriptContent') as HTMLTextAreaElement;
    const nameInput = document.getElementById('userName') as HTMLInputElement;
    const phoneInput = document.getElementById('targetPhone') as HTMLInputElement;

    const script = scriptInput.value;

    if (countWords(script) > MAX_WORDS) {
        const dict = (WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en']) as any;
        alert(dict.msg_trial_limit || "Too many words!");
        return;
    }

    btn.disabled = true;



    let userEmail = "N/A";
    const userSession = localStorage.getItem('wisecat_user');
    if (userSession) {
        try {
            const parsed = JSON.parse(userSession);
            if (parsed.email) userEmail = parsed.email;
        } catch (e) { }
    }

    // Generate Task ID
    const { doc, collection, setDoc, serverTimestamp } = await import("firebase/firestore");
    const { db } = await import("./firebase-config");

    const tasksCol = collection(db, 'tasks');
    const randomId = doc(tasksCol).id;
    const taskId = `task_${randomId}`;
    const taskRef = doc(db, 'tasks', taskId);

    const payload = {
        taskId: taskId,
        type: 'trial',
        isTrial: true,
        state: 'pending',
        priority: 3, // Normal priority
        reservation_utc: serverTimestamp(), // Run now
        Name: nameInput.value,
        targetPhoneNumber: phoneInputPlugin ? phoneInputPlugin.getNumber() : phoneInput.value,
        userEmail: userEmail,
        script: script,
        language: WiseCatI18n.currentLang,
        createdAt: new Date().toISOString() // Client-side time for n8n
    };

    const dict = (WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en']) as any;

    try {
        // 1. Log to Firestore
        await setDoc(taskRef, {
            ...payload,
            createdAt: serverTimestamp(), // Server-side time for Firestore
            userId: (auth.currentUser ? auth.currentUser.uid : 'n/a')
        });
        console.log("Task logged to Firestore:", taskId);

        // 2. Success UI (No Webhook)
        btn.innerText = dict.msg_success;
        alert(`We've received your task. Will email to here ${userEmail} to you when ready.\n\nWe will start call within 5 minutes, please carefully check your phone number.`);

    } catch (error) {
        console.error("Error submitting trial:", error);
        btn.innerText = dict.msg_failed;
        alert(dict.msg_fail_alert);
        btn.disabled = false;
    }
}
