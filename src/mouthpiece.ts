import "./version";
import WiseCatI18n from './i18n';
import { auth } from './firebase-config';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { countryTimezones } from './timezones';
// import { ScamCheck } from './scam-check'; // Logic merged into validateMissionDescription

import './nav-active'; // Set active navigation item
import { MISSION_SCENARIOS } from './mission-scenarios';
import { getFunctions, httpsCallable } from 'firebase/functions';

// ... (Existing code)

// --- Safety Check State ---
let isContentSafe = true; // Still used for form validation, updated by validateMissionDescription


// attachSafetyCheck and blur listener removed to reduce Cloud Function calls.
// Security check is now consolidated into the 'Check Description' AI call.
document.addEventListener('DOMContentLoaded', () => {
    // attachSafetyCheck('script');
});


// Update validateForm to include safety check
// (Appending this logic is tricky with replace_file_content if I can't find the insertion point perfectly.
// Instead, I will assume I need to edit validateForm separately or inject this helper first).


// Global declarations
declare var intlTelInput: any;



let turnstileValidated = false;
let phoneInputPlugin: any = null;
let currentCost = 3; // Default cost for mouthpiece
let defaultRetryCount = 5; // Default retry count if config missing

// ... (omitted shared code)




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
    const consentCheckbox = document.getElementById('consentCheckbox') as HTMLInputElement;

    // 1. Credit Check
    const userSession = localStorage.getItem('wisecat_user');

    // Safety Check
    if (!isContentSafe) {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.innerText = "⚠️ Content Unsafe";
        return;
    } else {
        // Reset text if safe (optional)
        if (btn.innerText === "⚠️ Content Unsafe") {
            const dict = WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en'];
            btn.innerText = (dict as any).btn_submit_task || "Start Call";
        }
    }
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
    const isConsentGiven = consentCheckbox ? consentCheckbox.checked : false;

    if (credits > 0 && turnstileValidated && isPhoneValid && isConsentGiven) {
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

            // Dynamic Retry Count
            if (data.default_retry_count !== undefined) {
                defaultRetryCount = Number(data.default_retry_count);
            }

            // Update Retry Label & Warning UI
            const retryLabel = document.querySelector('label[for="retryOption"] span[data-i18n="label_retry"]');
            const retryWarning = document.querySelector('label[for="retryOption"] span.warning-text');

            if (retryLabel) {
                retryLabel.textContent = `Re-try ${defaultRetryCount} time(s)`;
            }
            if (retryWarning) {
                const totalMaxCost = currentCost + defaultRetryCount;
                retryWarning.textContent = `(Max cost: ${totalMaxCost} credits if all retries used)`;
                (retryWarning as HTMLElement).style.color = "#ff4444";
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

    const loadContactBtn = document.getElementById('loadContactBtn');

    // Check for Contact Picker API support
    const isContactPickerSupported = ('contacts' in navigator && 'ContactsManager' in window);

    if (loadContactBtn) {
        if (isContactPickerSupported) {
            loadContactBtn.style.display = 'flex';

            loadContactBtn.addEventListener('click', async () => {
                const props = ['name', 'tel'];
                const opts = { multiple: false };

                try {
                    const contacts = await (navigator as any).contacts.select(props, opts);

                    if (contacts.length) {
                        const contact = contacts[0];

                        // Populate Name
                        const recipient = document.getElementById('recipientName') as HTMLInputElement;
                        if (recipient && contact.name && contact.name.length) {
                            recipient.value = contact.name[0];
                            // Trigger validation/updates if needed
                        }

                        // Populate Phone
                        const phoneInput = document.getElementById('targetPhone') as HTMLInputElement;
                        if (phoneInput && contact.tel && contact.tel.length) {
                            // Clean the phone number first? 
                            // intl-tel-input usually handles pasting, but setting value directly might need setNumber
                            let tel = contact.tel[0];

                            if (phoneInputPlugin) {
                                phoneInputPlugin.setNumber(tel);
                            } else {
                                phoneInput.value = tel;
                            }

                            // Trigger events for validation and country update
                            phoneInput.dispatchEvent(new Event('input'));
                            phoneInput.dispatchEvent(new Event('countrychange'));
                            phoneInput.dispatchEvent(new Event('blur'));
                        }
                    }
                } catch (ex) {
                    console.error('Contact Picker failed:', ex);
                    // Fail silently or show toast? For now silent as prompt cancellation throws error
                }
            });
        } else {
            loadContactBtn.style.display = 'none';
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

    const consentCheckbox = document.getElementById('consentCheckbox');
    if (consentCheckbox) {
        consentCheckbox.addEventListener('change', validateForm);
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

    // --- Header Sync & Logout ---
    onAuthStateChanged(auth, (user) => {
        const headerUserName = document.getElementById('headerUserName');
        const headerUserAvatar = document.getElementById('headerUserAvatar') as HTMLImageElement | null;
        const creditsDisplay = document.getElementById('creditsDisplay');

        if (user) {
            if (headerUserName) headerUserName.textContent = user.displayName || 'User';
            if (headerUserAvatar && user.photoURL) headerUserAvatar.src = user.photoURL;

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
                window.location.href = '/Entry.html';
            });
        });
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
        btn.disabled = true;

        // Elements
        const missionEl = document.getElementById('mission') as HTMLSelectElement;
        const customMissionEl = document.getElementById('customMission') as HTMLInputElement;
        const userNameEl = document.getElementById('userName') as HTMLInputElement;
        const recipientNameEl = document.getElementById('recipientName') as HTMLInputElement;
        const targetPhoneEl = document.getElementById('targetPhone') as HTMLInputElement;
        const scriptEl = document.getElementById('script') as HTMLTextAreaElement;
        const schedulePreferenceEl = document.getElementById('schedulePreference') as HTMLSelectElement;
        const scriptLanguageEl = document.getElementById('scriptLanguage') as HTMLSelectElement;

        // ... language logic ...

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
            // Determine mission name
            missionDescription: (missionEl.value === 'other')
                ? (customMissionEl.value || '')
                : (MISSION_SCENARIOS.find(m => m.id === missionEl.value)?.description.en || ''),
            userName: userNameEl.value,
            recipientName: recipientNameEl.value,
            targetPhoneNumber: phoneInputPlugin ? phoneInputPlugin.getNumber() : targetPhoneEl.value,
            script: scriptEl.value,
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


        // 4. Force Final Safety Check (Now handled by validateMissionDescription)
        if (!isContentSafe) {
            (window as any).showToast("Content blocked by security policy or mission mismatch.", "error");
            btn.disabled = false;
            return;
        }

        // 1. Transaction...
        try {
            if (!auth.currentUser) {
                (window as any).showToast("Please log in to submit a mouthpiece task.", "error");
                btn.disabled = false;
                return;
            }

            const userDocRef = doc(db, 'users', `uid_${auth.currentUser.uid}`);
            const settingsRef = doc(db, 'users', `uid_${auth.currentUser.uid}`, 'settings', 'settings');
            const cost = currentCost;

            // Final Confirmation Modal
            const details = [
                { label: "Mission", value: payload.missionDescription },
                { label: "Recipient", value: payload.recipientName },
                { label: "Target Phone", value: payload.targetPhoneNumber },
                { label: "Script", value: payload.script },
                { label: "Schedule", value: payload.schedulePreference === 'scheduled' ? (payload as any).scheduleCallTime : "ASAP" },
                { label: "Service Charge", value: `$${cost.toFixed(2)}` }
            ];

            const confirmed = await showConfirmationModal(details);
            if (!confirmed) {
                btn.disabled = false;
                return;
            }

            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                const settingsDoc = await transaction.get(settingsRef);

                if (!userDoc.exists()) {
                    throw "User document does not exist!";
                }

                const userData = userDoc.data();
                const currentCredits = Number(userData.credits || 0);
                const settings = settingsDoc.exists() ? settingsDoc.data() : {};

                if (currentCredits < cost) {
                    // Throwing simple string to be caught below
                    throw `Insufficient credits! This task requires ${cost} credits.`;
                }

                // Deduct Credit
                transaction.update(userDocRef, { credits: currentCredits - cost });

                // Create Task
                transaction.set(taskRef, {
                    ...payload,
                    senderPhoneNumber: settings.phoneNumber || '',
                    vapiPhoneNumberId: settings.vapiPhoneNumberId || '',
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

            (window as any).showToast(`Dear ${userNameEl.value}, we've received the task. We will schedule your call ASAP. Once finished will send result to ${userEmail}.`, "success");

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

});

// ============ Mission Validation Logic ============
// ============ Mission Validation Logic ============




// Update mission description hint when mission changes
function updateMissionDescription() {
    const missionSelect = document.getElementById('mission') as HTMLSelectElement;
    const missionDescElement = document.getElementById('missionDescription');
    const currentLang = WiseCatI18n.currentLang;

    if (missionSelect && missionDescElement) {
        const selectedOption = missionSelect.selectedOptions[0];
        const missionId = selectedOption.value;

        const mission = MISSION_SCENARIOS.find(m => m.id === missionId);
        if (mission) {
            const lang = (currentLang as keyof typeof mission.description);
            missionDescElement.textContent = mission.description[lang] || mission.description.en;
        }
    }

    // Reset validation when mission changes

    const scriptTextarea = document.getElementById('script') as HTMLTextAreaElement;
    if (scriptTextarea) {
        scriptTextarea.style.borderColor = '';
        scriptTextarea.style.boxShadow = '';
    }
    const feedbackDiv = document.getElementById('validationFeedback');
    if (feedbackDiv) {
        feedbackDiv.style.display = 'none';
    }
    validateForm();
}

// Validate description against selected mission
async function validateMissionDescription() {
    const validateBtn = document.getElementById('validateBtn') as HTMLButtonElement;
    const feedbackDiv = document.getElementById('validationFeedback');
    const scriptTextarea = document.getElementById('script') as HTMLTextAreaElement;
    const missionSelect = document.getElementById('mission') as HTMLSelectElement;

    if (!scriptTextarea || !missionSelect || !feedbackDiv || !validateBtn) return;

    const description = scriptTextarea.value.trim();
    const missionId = missionSelect.value;
    // const selectedOption = missionSelect.selectedOptions[0]; // Unused
    // const missionNameKey = selectedOption.getAttribute('data-mission-name'); // Unused

    if (description.length < 10) {
        feedbackDiv.textContent = '❌ Description is too short. Please provide at least 10 characters.';
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.background = 'rgba(239, 68, 68, 0.1)';
        feedbackDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        feedbackDiv.style.color = '#f87171';
        return;
    }

    // Show loading state
    validateBtn.disabled = true;
    validateBtn.textContent = '⏳ Validating...';
    feedbackDiv.style.display = 'block';
    feedbackDiv.textContent = 'Checking with AI...';
    feedbackDiv.style.background = 'rgba(59, 130, 246, 0.1)';
    feedbackDiv.style.border = '1px solid rgba(59, 130, 246, 0.3)';
    feedbackDiv.style.color = '#60a5fa';

    try {
        const functions = getFunctions();
        const validateFunction = httpsCallable(functions, 'validateMissionDescription');

        const mission = MISSION_SCENARIOS.find(m => m.id === missionId);
        const currentLang = WiseCatI18n.currentLang;
        const missionName = mission ? mission.name[currentLang as keyof typeof mission.name] : missionId;

        const result: any = await validateFunction({
            missionId,
            missionName,
            description,
            language: currentLang
        });



        const data = result.data as { valid: boolean; refinedText?: string; explanation?: string };

        if (data.valid) {
            isContentSafe = true; // Content is verified safe by backend
            validateForm();

            // Success - green border
            scriptTextarea.style.border = '2px solid #10b981';
            scriptTextarea.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';

            feedbackDiv.style.background = 'rgba(16, 185, 129, 0.1)';
            feedbackDiv.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            feedbackDiv.style.color = '#10b981';

            // Handle Refinement Suggestion
            // Use a more lenient comparison to ensure localized differences don't block the UI
            const isDifferent = data.refinedText && data.refinedText.trim().replace(/\s/g, '') !== description.trim().replace(/\s/g, '');

            if (isDifferent) {

                feedbackDiv.innerHTML = `
                    <div style="margin-bottom: 10px;">✅ <strong>Mission Matched!</strong></div>
                    <div style="margin-bottom: 12px; font-style: italic; color: #9ca3af; border-left: 2px solid #10b981; padding-left: 10px;">
                        "${data.explanation || 'I have a more professional suggestion for your message.'}"
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 12px; white-space: pre-wrap;">${data.refinedText}</div>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" class="btn-refine-apply" style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Apply Suggestion</button>
                        <button type="button" class="btn-refine-keep" style="flex: 1; padding: 8px; background: transparent; color: #9ca3af; border: 1px solid #444; border-radius: 6px; cursor: pointer;">Keep Original</button>
                    </div>
                `;

                // Add event listeners for the buttons
                const applyBtn = feedbackDiv.querySelector('.btn-refine-apply');
                const keepBtn = feedbackDiv.querySelector('.btn-refine-keep');

                if (applyBtn) {
                    applyBtn.addEventListener('click', () => {
                        scriptTextarea.value = data.refinedText || '';
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
                feedbackDiv.textContent = '✅ Description matches the mission and is safe!';
            }
        } else {
            isContentSafe = false;
            validateForm();
            // Fail - red border

            scriptTextarea.style.border = '2px solid #ef4444';
            scriptTextarea.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            feedbackDiv.textContent = `❌ ${data.explanation || "Description doesn't match the mission. Please revise."}`;
            feedbackDiv.style.background = 'rgba(239, 68, 68, 0.1)';
            feedbackDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            feedbackDiv.style.color = '#f87171';
        }

    } catch (error) {
        console.error('Validation error:', error);
        // On error, be permissive

        feedbackDiv.textContent = '⚠️ Validation service unavailable. Proceeding...';
        feedbackDiv.style.background = 'rgba(251, 191, 36, 0.1)';
        feedbackDiv.style.border = '1px solid rgba(251, 191, 36, 0.3)';
        feedbackDiv.style.color = '#fbbf24';
        scriptTextarea.style.borderColor = '';
        scriptTextarea.style.boxShadow = '';
    } finally {
        validateBtn.disabled = false;
        validateBtn.innerHTML = '<span data-i18n="validate_btn">🔍 Check Description</span>';
        validateForm();
    }
}

// Initialize validation UI
document.addEventListener('DOMContentLoaded', () => {
    const missionSelect = document.getElementById('mission');
    const validateBtn = document.getElementById('validateBtn');
    const scriptTextarea = document.getElementById('script');

    if (missionSelect) {
        missionSelect.addEventListener('change', updateMissionDescription);
        // Set initial description
        updateMissionDescription();
    }

    if (validateBtn) {
        validateBtn.addEventListener('click', validateMissionDescription);
    }

    // Reset validation when script changes
    if (scriptTextarea) {
        scriptTextarea.addEventListener('input', () => {

            validateForm();
        });
    }
});

// Update validateForm to include mission validation check
// Note: This assumes validateForm exists and manages submit button state
// If needed, modify the existing validateForm function to check isDescriptionValidated


// Translate mission dropdown options when language changes
function translateMissionOptions() {
    const missionSelect = document.getElementById('mission') as HTMLSelectElement;
    if (!missionSelect) return;

    const currentLang = WiseCatI18n.currentLang;

    missionSelect.querySelectorAll('option').forEach((option) => {
        const missionId = option.value;
        const mission = MISSION_SCENARIOS.find(m => m.id === missionId);

        if (mission) {
            const lang = (currentLang as keyof typeof mission.name);
            const emoji = option.textContent?.split(' ')[0] || '';
            option.textContent = `${emoji} ${mission.name[lang] || mission.name.en}`;
        }
    });
}

// Re-translate when language changes
document.addEventListener('DOMContentLoaded', () => {
    // Listen for language change events from i18n system
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
        languageSelector.addEventListener('change', () => {
            // Wait for i18n to apply, then translate missions
            setTimeout(translateMissionOptions, 100);
        });
    }

    // Initial translation
    translateMissionOptions();
});

