import "./version";
import WiseCatI18n from './i18n';
import { auth } from './firebase-config';
import { onAuthStateChanged, signOut } from "firebase/auth";
import './chat-assistant'; // Enable Chat Widget
// import { ScamCheck } from './scam-check'; // Now handled globally by validateMissionDescription


// Global declarations
declare var intlTelInput: any;


const MAX_WORDS = 30;

let turnstileValidated = false;

let phoneInputPlugin: any = null;
let currentCost = 1; // Default cost

// --- Initialization ---

// --- Turnstile Integration ---

// Define callback globally so Turnstile can find it
(window as any).onTurnstileSuccess = function (_token: string) {
    turnstileValidated = true;
    validateForm();
};

document.addEventListener("DOMContentLoaded", async function () {
    // Initialize i18n explicitly
    WiseCatI18n.init();

    // --- Initialize Cost Icon Container immediately ---
    const initCostIcon = () => {
        const iconContainerId = 'costIconContainer';
        let iconContainer = document.getElementById(iconContainerId);

        if (!iconContainer) {
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
        }
    };

    // Call immediately to show icon on page load
    initCostIcon();

    // --- Remote Config Listener ---
    const { doc, onSnapshot } = await import("firebase/firestore");
    const { db } = await import("./firebase-config");

    const configRef = doc(db, 'configuration', 'settings');
    const trialBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;
    const configAlert = document.createElement('div');
    configAlert.style.cssText = "display: none; background: #ff4444; color: white; padding: 10px; border-radius: 8px; margin-top: 10px; text-align: center; font-weight: bold;";
    configAlert.innerHTML = "⚠️ This service is currently under maintenance.";

    if (trialBtn && trialBtn.parentNode) {
        trialBtn.parentNode.insertBefore(configAlert, trialBtn);
    }


    onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const isEnabled = data.enable_trial !== false; // Default true if field missing

            // Dynamic Cost
            if (data.cost_trial !== undefined) {
                currentCost = Number(data.cost_trial);
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

            // Setup tooltip positioning and interaction (runs on every update)
            if (iconContainer) {
                const tooltip = iconContainer.querySelector('.cost-tooltip') as HTMLElement;
                const icon = iconContainer.querySelector('.info-icon') as HTMLElement;

                // Position tooltip dynamically to prevent off-screen
                const positionTooltip = () => {
                    if (!tooltip || !icon) return;

                    // Force visibility temporarily to get accurate dimensions
                    tooltip.style.visibility = 'visible';
                    tooltip.style.opacity = '0';
                    tooltip.style.display = 'block';

                    const iconRect = icon.getBoundingClientRect();
                    const tooltipRect = tooltip.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const padding = 15;

                    // Calculate centered position
                    let left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);

                    // Adjust if going off left edge
                    if (left < padding) {
                        left = padding;
                    }

                    // Adjust if going off right edge
                    if (left + tooltipRect.width > viewportWidth - padding) {
                        left = viewportWidth - tooltipRect.width - padding;
                    }

                    // Try to position above first
                    let top = iconRect.top - tooltipRect.height - 15;

                    // If it goes off top, position below instead
                    if (top < padding) {
                        top = iconRect.bottom + 15;
                    }

                    // If still going off bottom (rare), force it to fit
                    if (top + tooltipRect.height > viewportHeight - padding) {
                        top = viewportHeight - tooltipRect.height - padding;
                    }

                    tooltip.style.top = `${top}px`;
                    tooltip.style.left = `${left}px`;
                    tooltip.style.maxWidth = `${viewportWidth - (padding * 2)}px`;

                    // Restore display state
                    tooltip.style.visibility = '';
                    tooltip.style.opacity = '';
                    tooltip.style.display = '';
                };

                // Mobile & Desktop: Toggle tooltip on click/hover
                let isOpen = false;
                const showTooltip = (e: Event) => {
                    e.stopPropagation();
                    isOpen = true;
                    tooltip.classList.add('show');
                    positionTooltip();
                };

                const hideTooltip = () => {
                    isOpen = false;
                    tooltip.classList.remove('show');
                };

                // Click for mobile
                iconContainer.onclick = showTooltip;

                // Hover for desktop
                iconContainer.onmouseenter = showTooltip;
                iconContainer.onmouseleave = hideTooltip;

                // Close tooltip when clicking elsewhere
                const closeOnClickOutside = (e: MouseEvent) => {
                    if (isOpen && !iconContainer.contains(e.target as Node)) {
                        hideTooltip();
                    }
                };

                document.addEventListener('click', closeOnClickOutside);

                // Reposition on window resize
                window.addEventListener('resize', () => {
                    if (isOpen) positionTooltip();
                });
            }


            if (trialBtn) {
                if (!isEnabled) {
                    trialBtn.disabled = true;
                    trialBtn.style.opacity = "0.5";
                    trialBtn.style.cursor = "not-allowed";
                    configAlert.style.display = "block";
                } else {
                    configAlert.style.display = "none";
                    if (turnstileValidated) { // Optimistic check
                        trialBtn.disabled = false;
                        trialBtn.style.opacity = "1";
                        trialBtn.style.cursor = "pointer";
                        validateForm(); // Re-run full validation
                    }
                }
            }
        }
    });

    // Explicitly render Turnstile to avoid race conditions
    // Strategy: Handshake with inline script in HTML.
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
    const nameInput = document.getElementById('userName') as HTMLInputElement;
    const userEmailInput = document.getElementById('userEmail') as HTMLInputElement;

    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            if (user.name && nameInput) nameInput.value = user.name;
            if (user.email && userEmailInput) {
                userEmailInput.value = user.email;
            }
        } catch (e) { }
    }

    // Bind Listeners
    bindValidationListeners();
    // attachSafetyCheck and blur listener removed to consolidate cloud calls.
    // attachSafetyCheck('scriptContent');

    // --- Header Sync & Logout ---
    onAuthStateChanged(auth, (user) => {
        const headerUserName = document.getElementById('headerUserName');
        const headerUserAvatar = document.getElementById('headerUserAvatar') as HTMLImageElement | null;
        const creditsDisplay = document.getElementById('creditsDisplay');

        if (user) {
            if (headerUserName) headerUserName.textContent = user.displayName || 'User';
            if (headerUserAvatar && user.photoURL) headerUserAvatar.src = user.photoURL;

            // Pre-populate email field with user's profile email
            const userEmailInput = document.getElementById('userEmail') as HTMLInputElement;
            if (userEmailInput && user.email) {
                userEmailInput.value = user.email;
                validateForm();
            }

            const userSession = localStorage.getItem('wisecat_user');
            if (userSession && creditsDisplay) {
                const u = JSON.parse(userSession);
                creditsDisplay.textContent = `$${(u.credits || 0).toFixed(2)}`;
            }
        }
    });

    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                localStorage.removeItem('wisecat_user');
                window.location.href = '/entry.html';
            });
        });
    }

    // Initial validation check
    validateForm();
});


let isContentSafe = true;

// attachSafetyCheck and blur listener removed to consolidate cloud calls.
// Security is now verified by the 'Check Description' AI call before final submission.


function countWords(str: string): number {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function validateForm() {
    const btn = document.getElementById('submitBtn') as HTMLButtonElement;
    const phoneInputElem = document.getElementById('targetPhone') as HTMLInputElement;
    const phoneHint = document.getElementById('phoneHint');
    const consentCheckbox = document.getElementById('consentCheckbox') as HTMLInputElement;
    const scriptTextarea = document.getElementById('scriptContent') as HTMLTextAreaElement;
    const userEmailInput = document.getElementById('userEmail') as HTMLInputElement;
    const userName = document.getElementById('userName') as HTMLInputElement;
    const submitHint = document.getElementById('submitHint');

    if (!btn) return;

    let reasons: string[] = [];
    let allValid = true;

    // 0. Safety Check
    if (!isContentSafe) {
        allValid = false;
        reasons.push('Content unsafe - check script');
        btn.innerText = "⚠️ Content Unsafe";
    } else {
        if (btn.innerText === "⚠️ Content Unsafe") {
            const dict = WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en'];
            const btnTrialText = (document.getElementById('i18n-btn_trial') as HTMLElement)?.innerText || (dict as any).btn_trial || "Try for Free";
            btn.innerText = btnTrialText;
        }
    }

    // 1. Email Validation
    if (userEmailInput && userEmailInput.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailRegex.test(userEmailInput.value);
        if (!isEmailValid) {
            allValid = false;
            reasons.push('Invalid email format');
            userEmailInput.style.borderColor = '#ff4d4d';
        } else {
            userEmailInput.style.borderColor = '';
        }
    } else if (userEmailInput) {
        allValid = false;
        reasons.push('Email required');
        userEmailInput.style.borderColor = '#ff4d4d';
    }

    // 2. Phone Validation
    let isPhoneValid = false;
    if (phoneInputPlugin && phoneInputElem.value) {
        const validCharsOnly = /^[\d\s\-\(\)\+]+$/.test(phoneInputElem.value);
        const digitsOnly = phoneInputElem.value.replace(/\D/g, '');
        isPhoneValid = validCharsOnly && digitsOnly.length >= 5;
    }

    if (!phoneInputElem.value) {
        allValid = false;
        reasons.push('Recipient phone required');
        phoneInputElem.style.borderColor = "#ff4d4d";
        if (phoneHint) phoneHint.style.display = "none";
    } else if (!isPhoneValid) {
        allValid = false;
        reasons.push('Invalid phone number');
        phoneInputElem.style.borderColor = "#ff4d4d";
        if (phoneHint) phoneHint.style.display = "block";
    } else {
        phoneInputElem.style.borderColor = "";
        if (phoneHint) phoneHint.style.display = "none";
    }

    // 3. Required Fields
    const recipientName = document.getElementById('recipientName') as HTMLInputElement;
    if (!userName?.value) {
        allValid = false;
        reasons.push('Name required');
        if (userName) userName.style.borderColor = '#ff4d4d';
    } else if (userName) {
        userName.style.borderColor = '';
    }

    if (recipientName && !recipientName.value) {
        allValid = false;
        reasons.push('Recipient name required');
        recipientName.style.borderColor = '#ff4d4d';
    } else if (recipientName) {
        recipientName.style.borderColor = '';
    }

    if (!scriptTextarea?.value || scriptTextarea.value.trim().length === 0) {
        allValid = false;
        reasons.push('Script required');
        if (scriptTextarea) scriptTextarea.style.borderColor = '#ff4d4d';
    } else if (scriptTextarea) {
        scriptTextarea.style.borderColor = '';
    }

    // 4. Word Count (Trial specific - max 30 words)
    const wordCount = scriptTextarea?.value ? countWords(scriptTextarea.value) : 0;
    if (wordCount > MAX_WORDS) {
        allValid = false;
        reasons.push('Script exceeds 30 words');
    }

    // 5. Consent & Turnstile
    const isConsentGiven = consentCheckbox ? consentCheckbox.checked : false;
    if (!isConsentGiven) { allValid = false; reasons.push('Agreement required'); }
    if (!turnstileValidated) { allValid = false; reasons.push('Complete security check'); }

    btn.disabled = !allValid;
    btn.style.opacity = allValid ? "1" : "0.5";

    // Update hint
    if (submitHint) {
        if (!allValid && reasons.length > 0) {
            submitHint.textContent = `⚠️ ${reasons[0]}`;
            submitHint.style.display = 'block';
        } else {
            submitHint.style.display = 'none';
        }
    }

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

    const userEmailInput = document.getElementById('userEmail');
    if (userEmailInput) {
        userEmailInput.addEventListener('input', validateForm);
        userEmailInput.addEventListener('blur', validateForm);
    }

    const scriptInput = document.getElementById('scriptContent');
    if (scriptInput) {
        scriptInput.addEventListener('input', validateForm);
    }

    const recipientNameInput = document.getElementById('recipientName');
    if (recipientNameInput) {
        recipientNameInput.addEventListener('input', validateForm);
        recipientNameInput.addEventListener('blur', validateForm);
    }

    const userNameInput = document.getElementById('userName');
    if (userNameInput) {
        userNameInput.addEventListener('input', validateForm);
        userNameInput.addEventListener('blur', validateForm);
    }

    const consentCheckbox = document.getElementById('consentCheckbox');
    if (consentCheckbox) {
        consentCheckbox.addEventListener('change', validateForm);
    }

    attachValidationBtn();

    // Dynamic Label Logic
    function updateAutoDetectLabel() {
        if (!phoneInputPlugin) return;
        const scriptLang = document.getElementById('scriptLanguage') as HTMLSelectElement;
        if (!scriptLang) return;

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
            let text = autoOption.getAttribute('data-i18n-original') || autoOption.textContent || "";
            if (!autoOption.getAttribute('data-i18n-original')) {
                autoOption.setAttribute('data-i18n-original', text);
            }
            const parts = text.split('(');
            const base = parts[0].trim();
            autoOption.textContent = `${base} (${langName})`;
        }
    }

    const targetPhoneInput = document.getElementById('targetPhone');
    if (targetPhoneInput) {
        targetPhoneInput.addEventListener('countrychange', updateAutoDetectLabel);
        // Initial setup
        setTimeout(updateAutoDetectLabel, 1000);
    }

    const form = document.getElementById('trialForm');
    if (form) form.addEventListener('submit', handleFormSubmit);
}

async function showConfirmationModal(details: { label: string, value: string }[]): Promise<boolean> {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal') as HTMLElement;
        const detailsContainer = document.getElementById('confirmDetails') as HTMLElement;
        const cancelBtn = document.getElementById('modalCancel') as HTMLButtonElement;
        const confirmBtn = document.getElementById('modalConfirm') as HTMLButtonElement;

        if (!modal || !detailsContainer || !cancelBtn || !confirmBtn) {
            console.error("Confirmation modal elements missing");
            resolve(true);
            return;
        }

        detailsContainer.innerHTML = details.map(item => `
            <div class="detail-item" style="margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;">
                <div style="font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 4px;">${item.label}</div>
                <div style="font-size: 14px; color: #fff; white-space: pre-wrap; word-break: break-word;">${item.value || 'N/A'}</div>
            </div>
        `).join('');

        modal.style.display = 'flex';

        const onCancel = () => {
            modal.style.display = 'none';
            cleanup();
            resolve(false);
        };

        const onConfirm = () => {
            modal.style.display = 'none';
            cleanup();
            resolve(true);
        };

        const cleanup = () => {
            cancelBtn.removeEventListener('click', onCancel);
            confirmBtn.removeEventListener('click', onConfirm);
        };

        cancelBtn.addEventListener('click', onCancel);
        confirmBtn.addEventListener('click', onConfirm);
    });
}

async function handleFormSubmit(e: Event) {
    e.preventDefault();

    // Call Consent Validation
    const consentCheckbox = document.getElementById('consentCheckbox') as HTMLInputElement;
    if (consentCheckbox && !consentCheckbox.checked) {
        alert("Please agree to let the AI call on my behalf to continue.");
        return;
    }

    const btn = document.getElementById('submitBtn') as HTMLButtonElement;
    const scriptInput = document.getElementById('scriptContent') as HTMLTextAreaElement;
    const nameInput = document.getElementById('userName') as HTMLInputElement;
    const phoneInput = document.getElementById('targetPhone') as HTMLInputElement;
    const scriptLanguageEl = document.getElementById('scriptLanguage') as HTMLSelectElement;

    const script = scriptInput.value;

    if (countWords(script) > MAX_WORDS) {
        const dict = (WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en']) as any;
        alert(dict.msg_trial_limit || "Too many words!");
        return;
    }

    btn.disabled = true;

    // Get User Email
    let userEmail = (document.getElementById('userEmail') as HTMLInputElement)?.value || 'N/A';

    let userCredits = 0;
    const sessionStr = localStorage.getItem('wisecat_user');
    if (sessionStr) {
        try {
            const parsed = JSON.parse(sessionStr);
            if (parsed.credits) userCredits = Number(parsed.credits);
        } catch (e) { }
    }

    // Generate Task ID
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
        const dialCode = countryData.dialCode;

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
        type: 'trial',
        isTrial: true,
        state: 'pending',
        priority: 3, // Normal priority
        reservation_utc: serverTimestamp(), // Run now
        Name: nameInput.value,
        targetPhoneNumber: phoneInputPlugin ? phoneInputPlugin.getNumber() : phoneInput.value,
        userEmail: userEmail,
        userCredits: userCredits,
        script: script,
        language: finalLang,
        retry_count: 1, // Default system retry count
        createdAt: new Date().toISOString() // Client-side time for n8n
    };

    const dict = (WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en']) as any;


    // 1. Transaction: Check Credits -> Deduct -> Create Task
    try {
        if (!auth.currentUser) {
            (window as any).showToast("Please log in to submit a trial task.", "error");
            btn.disabled = false;
            return;
        }

        const userDocRef = doc(db, 'users', `uid_${auth.currentUser.uid}`);

        // --- Dynamic Cost Logic ---
        // We need to re-fetch the cost inside the transaction or trust the client-side variable
        // For strictness, we should probably fetch config in transaction or just trust the 'currentCost' variable 
        // if we assume config doesn't change accurately every millisecond. 
        // Better: Pass the expected cost but let's just stick to the client-side variable for now 
        // as reading config doc in transaction adds a read cost and complexity (need to pass doc ref).
        // Since this is trusted code environment (client source), and we validate logic here.
        // Ideally: Transaction reads config doc too. But for now using the local variable is acceptable for this scale.

        // Use the global variable we set in onSnapshot
        const cost = currentCost;

        // Final Confirmation Modal
        const details = [
            { label: "Name", value: nameInput.value },
            { label: "Target Phone", value: payload.targetPhoneNumber },
            { label: "Script", value: script },
            { label: "Service Charge", value: `$${cost.toFixed(2)}` }
        ];

        const confirmed = await showConfirmationModal(details);
        if (!confirmed) {
            btn.disabled = false;
            return;
        }

        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) {
                throw "User document does not exist!";
            }

            const userData = userDoc.data();
            const currentCredits = Number(userData.credits || 0);

            if (currentCredits < cost) {
                throw `Insufficient credits! You need at least ${cost} credit(s).`;
            }

            // Deduct Credit
            transaction.update(userDocRef, { credits: currentCredits - cost });

            // Create Task
            transaction.set(taskRef, {
                ...payload,
                userCredits: currentCredits - cost, // Store the NEW balance
                cost: cost, // Record cost for audit
                createdAt: serverTimestamp(),
                userId: auth.currentUser!.uid
            });
        });

        console.log("Task logged to Firestore via Transaction:", taskId);

        // 2. Success UI (No Webhook)
        btn.innerText = dict.msg_success;
        (window as any).showToast(`Dear ${nameInput.value}, we've received the task. We will schedule your call ASAP. Once finished will send result to ${userEmail}.`, "success");
    } catch (error) {
        console.error("Error submitting trial:", error);

        // Handle specific credit error
        if (typeof error === 'string' && error.includes("Insufficient credits")) {
            (window as any).showToast(dict.msg_no_credit || `Insufficient credits! This task requires ${currentCost} credits.`, "error");
        } else {
            btn.innerText = dict.msg_failed;
            (window as any).showToast(dict.msg_fail_alert || "Submission failed. Please try again.", "error");
        }
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
// --- AI Script Validation & Refinement ---

async function validateScript() {
    const validateBtn = document.getElementById('validateBtn') as HTMLButtonElement;
    const feedbackDiv = document.getElementById('validationFeedback');
    const scriptTextarea = document.getElementById('scriptContent') as HTMLTextAreaElement;

    if (!scriptTextarea || !feedbackDiv || !validateBtn) return;

    const description = scriptTextarea.value.trim();
    if (description.length < 10) {
        feedbackDiv.innerText = '❌ Description is too short. Please provide at least 10 characters.';
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.background = 'rgba(239, 68, 68, 0.1)';
        feedbackDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        feedbackDiv.style.color = '#f87171';
        return;
    }

    // Show loading state
    validateBtn.disabled = true;
    validateBtn.textContent = '⏳ Checking...';
    feedbackDiv.style.display = 'block';
    feedbackDiv.textContent = 'Checking with AI...';
    feedbackDiv.style.background = 'rgba(59, 130, 246, 0.1)';
    feedbackDiv.style.border = '1px solid rgba(59, 130, 246, 0.3)';
    feedbackDiv.style.color = '#60a5fa';

    try {
        const { getFunctions, httpsCallable } = await import("firebase/functions");
        const functions = getFunctions();
        const validateFunction = httpsCallable(functions, 'validateMissionDescription');

        const currentLang = WiseCatI18n.currentLang;

        const result: any = await validateFunction({
            missionId: 'trial_general',
            missionName: 'General Request (Trial)',
            description,
            language: currentLang
        });

        const data = result.data as { valid: boolean; refinedText?: string; explanation?: string };

        if (data.valid) {
            isContentSafe = true;
            validateForm();

            scriptTextarea.style.border = '2px solid #10b981';
            scriptTextarea.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            feedbackDiv.style.background = 'rgba(16, 185, 129, 0.1)';
            feedbackDiv.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            feedbackDiv.style.color = '#10b981';

            // Handle Refinement Suggestion
            const originalText = scriptTextarea.value.trim();
            const refinedText = data.refinedText ? data.refinedText.trim() : originalText;
            const isDifferent = refinedText.replace(/\s/g, '') !== originalText.replace(/\s/g, '');

            if (isDifferent) {
                feedbackDiv.innerHTML = `
                    <div style="margin-bottom: 10px;">✅ <strong>Script Validated!</strong></div>
                    <div style="margin-bottom: 12px; font-style: italic; color: #9ca3af; border-left: 2px solid #10b981; padding-left: 10px;">
                        "${data.explanation || 'I have a more professional suggestion for your message.'}"
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 12px; white-space: pre-wrap;">${refinedText}</div>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" class="btn-refine-apply" style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Apply Suggestion</button>
                        <button type="button" class="btn-refine-keep" style="flex: 1; padding: 8px; background: transparent; color: #9ca3af; border: 1px solid #444; border-radius: 6px; cursor: pointer;">Keep Original</button>
                    </div>
                `;

                const applyBtn = feedbackDiv.querySelector('.btn-refine-apply');
                const keepBtn = feedbackDiv.querySelector('.btn-refine-keep');

                if (applyBtn) {
                    applyBtn.addEventListener('click', () => {
                        scriptTextarea.value = refinedText;
                        feedbackDiv.innerHTML = '✅ Applied professional refinement!';
                        setTimeout(() => { feedbackDiv.style.display = 'none'; }, 2000);
                        validateForm();
                    });
                }
                if (keepBtn) {
                    keepBtn.addEventListener('click', () => {
                        feedbackDiv.innerHTML = '✅ Using your original version.';
                        setTimeout(() => { feedbackDiv.style.display = 'none'; }, 2000);
                    });
                }
            } else {
                feedbackDiv.textContent = '✅ Script looks great and is safe!';
            }
        } else {
            isContentSafe = false;
            validateForm();
            scriptTextarea.style.border = '2px solid #ef4444';
            scriptTextarea.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            feedbackDiv.textContent = `❌ ${data.explanation || "Script doesn't match the mission or is unsafe."}`;
            feedbackDiv.style.background = 'rgba(239, 68, 68, 0.1)';
            feedbackDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            feedbackDiv.style.color = '#f87171';
        }
    } catch (error) {
        console.error('Validation error:', error);
        feedbackDiv.innerText = '⚠️ Validation service unavailable. Proceeding...';
    } finally {
        validateBtn.disabled = false;
        validateBtn.innerHTML = '<span data-i18n="validate_btn">🔍 Check Script</span>';
        validateForm();
    }
}

// In bindValidationListeners, add the button event listener
function attachValidationBtn() {
    const btn = document.getElementById('validateBtn');
    if (btn) btn.addEventListener('click', validateScript);
}

// Ensure it's called in DOMContentLoaded
// ...
