import "./version";
import WiseCatI18n from './i18n';
import { auth } from './firebase-config';
import { onAuthStateChanged, signOut } from "firebase/auth";
import './chat-assistant'; // Enable Chat Widget
// import { ScamCheck } from './scam-check'; // Now handled by validateMissionDescription

// Declare globals from CDNs
declare var google: any;
declare var intlTelInput: any;
declare var VANTA: any;

// Configuration

const GOOGLE_MAPS_API_KEY = 'AIzaSyBSWqDNkLh1v29kFEbUod0iaX3v3v8UtT4';

// State
let map: any;
let placesService: any;
let searchTimeout: any;
let currentMarker: any = null;
let selectedRestaurantData: any = null;
let currentPlaceOpeningHours: any = null;
let phoneInputPlugin: any = null;
let userPhonePlugin: any = null;
let turnstileValidated = false;
// let turnstileValidated = false; // Already declared at line 23

let currentCost = 5; // Default cost
let defaultRetryCount = 5; // Default retry count if config missing
let minPreorderDays = 3; // Default 3 days



// ...



// Cache
const placeDetailsCache: Record<string, any> = {};

// Local ScamDetector removed as logic is now consolidated into the backend validation function.


// --- Initialization ---

// --- Turnstile Integration ---

// Define callback globally so Turnstile can find it
(window as any).onTurnstileSuccess = function (_token: string) {
    turnstileValidated = true;
    // Potentially re-validate form here if needed, but reservation form enables button only on validation check usually
    // We can trigger a validation check if there's a function for it, or just rely on state
    console.log("Turnstile Verified");
    // Ensure button state is updated if all other conditions met
    const dateInput = document.getElementById('resDate') as HTMLInputElement;
    if (dateInput) {
        // Trigger validation indirectly or directly
        // For now just set state. The form submit check will see turnstileValidated=true
    }
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

// --- Initialization ---

document.addEventListener("DOMContentLoaded", async function () {
    // Initialize i18n explicitly
    WiseCatI18n.init();

    // Global Config Variables
    // Variable shadowing removed to ensure onSnapshot updates the global state.
    // let minPreorderDays = 3; // Default 3 days

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
    const { db } = await import("./firebase-config"); // Revert
    // Removed storage imports

    const configRef = doc(db, 'configuration', 'settings');
    const resBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;
    const configAlert = document.createElement('div');
    configAlert.style.cssText = "display: none; background: #ff4444; color: white; padding: 10px; border-radius: 8px; margin-top: 10px; text-align: center; font-weight: bold;";
    configAlert.innerHTML = "⚠️ This service is currently under maintenance.";

    if (resBtn && resBtn.parentNode) {
        resBtn.parentNode.insertBefore(configAlert, resBtn);
    }



    onSnapshot(configRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const isEnabled = data.enable_reservation !== false; // Default true if field missing

            // Dynamic Cost
            if (data.cost_reservation !== undefined) {
                currentCost = Number(data.cost_reservation);
            }

            // Min Preorder Days
            if (data.min_preorder_days !== undefined) {
                minPreorderDays = Number(data.min_preorder_days);
            }
            updatePreorderHint(); // Update dynamic hint manually if config changes

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
                (retryWarning as HTMLElement).textContent = `(Max cost: ${totalMaxCost} credits if all retries used)`;
                (retryWarning as HTMLElement).style.color = "#ff4444"; // Ensure it's visible warning color
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

            if (resBtn) {
                if (!isEnabled) {
                    resBtn.disabled = true;
                    resBtn.style.opacity = "0.5";
                    resBtn.style.cursor = "not-allowed";
                    configAlert.style.display = "block";
                } else {
                    configAlert.style.display = "none";
                    resBtn.style.opacity = "1";
                    resBtn.style.cursor = "pointer";
                    // Validation logic elsewhere handles the specific disabled state for inputs
                    // We just lift the "maintenance" lock
                }
            }
        }
    });

    // Check if script already loaded before us
    if ((window as any).isTurnstileLoaded) {
        renderTurnstile();
    }
    // Fallback check immediately (just in case)
    renderTurnstile();

    // Robust Initialization for intl-tel-input
    const initPhoneInputs = () => {
        if (typeof intlTelInput === 'undefined') {
            console.warn("intlTelInput not loaded yet, retrying...");
            setTimeout(initPhoneInputs, 100);
            return;
        }

        // Initialize userPhone (Confirmation)
        const userPhoneInput = document.querySelector("#userPhone");
        if (userPhoneInput && !userPhonePlugin) {
            userPhonePlugin = intlTelInput(userPhoneInput, {
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
        }

        const input = document.querySelector("#targetPhone");
        if (input && !phoneInputPlugin) {
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
        }
    };

    // Attempt init
    initPhoneInputs();

    // Add dial code search feature
    let dialCodeBuffer = "";
    let dialCodeTimeout: number | null = null;

    document.addEventListener("keydown", (e: KeyboardEvent) => {
        const dropdown = document.querySelector(".iti__country-list");
        if (!dropdown || dropdown.classList.contains("iti__hide")) return;

        // Only handle number keys
        if (e.key >= "0" && e.key <= "9") {
            e.preventDefault();
            dialCodeBuffer += e.key;

            // Clear previous timeout
            if (dialCodeTimeout) clearTimeout(dialCodeTimeout);

            // Search for country with matching dial code
            const countries = dropdown.querySelectorAll(".iti__country");
            for (const country of countries) {
                const dialCode = country.querySelector(".iti__dial-code")?.textContent?.replace("+", "");
                if (dialCode && dialCode.startsWith(dialCodeBuffer)) {
                    country.scrollIntoView({ block: "nearest", behavior: "smooth" });
                    // Highlight the country
                    countries.forEach(c => c.classList.remove("iti__highlight"));
                    country.classList.add("iti__highlight");
                    break;
                }
            }

            // Reset buffer after 1 second
            dialCodeTimeout = window.setTimeout(() => {
                dialCodeBuffer = "";
            }, 1000);
        }
    });


    // --- Custom Dropdown Logic (Replaces Native Selects) ---
    const initCustomDropdowns = () => {
        const wrappers = document.querySelectorAll('.custom-select-wrapper');

        wrappers.forEach(wrapper => {
            if (wrapper.hasAttribute('data-initialized')) return; // Prevent double init

            const trigger = wrapper.querySelector('.custom-select-trigger');
            const options = wrapper.querySelector('.custom-select-options');
            const input = wrapper.querySelector('input[type="hidden"]') as HTMLInputElement;
            const triggerText = trigger?.querySelector('span');

            if (!trigger || !options || !input) return;

            // Toggle Open/Close
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close others
                document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
                    if (w !== wrapper) w.classList.remove('open');
                });
                wrapper.classList.toggle('open');
            });

            // Handle Option Click (Event Delegation)
            options.addEventListener('click', (e) => {
                e.stopPropagation();
                const opt = (e.target as HTMLElement).closest('.custom-option');
                if (!opt) return;

                const value = opt.getAttribute('data-value');
                const text = opt.textContent;

                // Update UI
                if (triggerText && text) triggerText.textContent = text;

                // Update Hidden Input
                if (value !== null) {
                    input.value = value;
                    // Trigger 'change' event manually for listeners
                    const event = new Event('change', { bubbles: true });
                    input.dispatchEvent(event);
                }

                // Update Selected State
                options.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');

                // Close
                wrapper.classList.remove('open');
            });

            wrapper.setAttribute('data-initialized', 'true');
        });

        // Close all when clicking outside (Only add once globally or ensure harmless redundancy)
        if (!document.body.hasAttribute('data-click-listener-attached')) {
            document.addEventListener('click', (e) => {
                if (!(e.target as Element).closest('.custom-select-wrapper')) {
                    document.querySelectorAll('.custom-select-wrapper.open').forEach(w => w.classList.remove('open'));
                }
            });
            document.body.setAttribute('data-click-listener-attached', 'true');
        }
    };

    // Initialize generic dropdowns first
    initCustomDropdowns();


    // Initialize Custom Time Picker (Updated for Custom Dropdowns)
    const timeDisplay = document.getElementById('resTimeDisplay');
    const timeDropdown = document.getElementById('resTimeDropdown');
    const timeHourInput = document.getElementById('resTimeHour') as HTMLInputElement;
    const timeMinuteInput = document.getElementById('resTimeMinute') as HTMLInputElement;
    const timeInput = document.getElementById('resTime') as HTMLInputElement;
    const ampmButtons = document.querySelectorAll('.time-ampm-btn');

    // Populate Custom Hour Options
    const hourOptionsContainer = document.getElementById('hourOptions');
    if (hourOptionsContainer) {
        hourOptionsContainer.innerHTML = '';
        for (let i = 1; i <= 12; i++) {
            const div = document.createElement('div');
            div.className = 'custom-option';
            div.setAttribute('data-value', i.toString());
            div.textContent = i.toString();
            hourOptionsContainer.appendChild(div);
        }
    }

    // Populate Custom Minute Options
    const minuteOptionsContainer = document.getElementById('minuteOptions');
    if (minuteOptionsContainer) {
        minuteOptionsContainer.innerHTML = '';
        [0, 15, 30, 45].forEach(min => {
            const div = document.createElement('div');
            div.className = 'custom-option';
            const minStr = min.toString().padStart(2, '0');
            div.setAttribute('data-value', minStr);
            div.textContent = minStr;
            minuteOptionsContainer.appendChild(div);
        });
    }

    // Re-bind listeners for the newly populated options
    initCustomDropdowns();

    if (timeDisplay && timeDropdown && timeHourInput && timeMinuteInput) {

        // Toggle dropdown (Time Picker Main)
        timeDisplay.addEventListener('click', () => {
            timeDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!timeDisplay.contains(e.target as Node) && !timeDropdown.contains(e.target as Node)) {
                timeDropdown.classList.remove('show');
            }
        });

        // Update time when selections change
        const updateTime = () => {
            const hour = timeHourInput.value;
            const minute = timeMinuteInput.value;
            const activePeriod = document.querySelector('.time-ampm-btn.active')?.getAttribute('data-period');

            if (hour && minute && activePeriod) {
                // Display format: 12:30 PM
                timeDisplay.textContent = `${hour}:${minute} ${activePeriod}`;

                // Convert to 24-hour format for backend
                let hour24 = parseInt(hour);
                if (activePeriod === 'PM' && hour24 !== 12) {
                    hour24 += 12;
                } else if (activePeriod === 'AM' && hour24 === 12) {
                    hour24 = 0;
                }
                const time24 = `${hour24.toString().padStart(2, '0')}:${minute}`;
                timeInput.value = time24;

                // Trigger validation
                validateForm();
            }
        };

        timeHourInput.addEventListener('change', updateTime);
        timeMinuteInput.addEventListener('change', updateTime);

        // AM/PM toggle
        ampmButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                ampmButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateTime();
            });
        });
    }







    // Clear calendar
    // dateCalendar.innerHTML = ''; 
    // ... omitting full calendar redraw for brevity in this specific tool call if existing logic was correct. 
    // Wait, I cannot omit logic in a replace_content. I must include the full block if I am replacing the surrounding area.
    // Let's look at the EndLine. It is 800. The original file goes to ~2000.
    // I should replace ONLY the initialization logic for the time picker and dropdowns.

    // Re-evaluating the replace block size.
    // My previous thought was to replace lines 643-657 (Mission Logic) as well since it uses `change` event.
    // I need to ensure the MISSION change listener still works.
    // The code above triggers `input.dispatchEvent(new Event('change', ...))` so existing logic should ideally work if it listens on the generic input.
    // BUT, the original code had: `const missionSelect = document.getElementById('mission') as HTMLSelectElement;`
    // Now `mission` is an `<input type="hidden">`.
    // So I MUST update the Mission Logic block (around line 643) as well.

    // Let's refine the replacement strategy. I will emit a SEPARATE replacement for the Mission Logic block later.
    // This replacement handles the Generic Dropdown + Time Picker Init.

    // Wait, line 389 was "Initialize Custom Time Picker".
    // I am replacing from ~390 to ~463.

    // I will use `multi_replace_file_content` for better precision.
    // Actually, `default_api:replace_file_content` is being used here.
    // I will replace the Time Picker section only in this call.
    // And use another call for the `initCustomDropdowns` insertion.

    // Changing strategy: One big replace for the Time Picker logic since it's contiguous.
    // I will replace `// Initialize Custom Time Picker` block.

    // I ALSO need to insert `initCustomDropdowns` earlier or inside the `DOMContentLoaded`.
    // I'll put it right after `// Check if script already loaded before us` block (around line 304) OR replace the Time Picker block entirely and include it there.
    // Replacing Time Picker block seems safest.

    // Wait, the `initCustomDropdowns` needs to run for ALL dropdowns (Mission, Schedule, Time).
    // I should add it once.

    // Let's execute this tool call to REPLACE the Time Picker logic with the NEW logic + `initCustomDropdowns` definition.
    // BUT `initCustomDropdowns` handles ALL wrappers.

    // I will replace the block from `// Initialize Custom Time Picker` (line 389) down to the end of the time picker logic (line 463).



    // Initialize Custom Date Picker
    const dateDisplay = document.getElementById('resDateDisplay');
    const dateDropdown = document.getElementById('resDateDropdown');
    const dateCalendar = document.getElementById('dateCalendar');
    const dateMonthYear = document.getElementById('dateMonthYear');
    const datePrevMonth = document.getElementById('datePrevMonth');
    const dateNextMonth = document.getElementById('dateNextMonth');
    const dateInput = document.getElementById('resDate') as HTMLInputElement;

    if (dateDisplay && dateDropdown && dateCalendar && dateMonthYear && datePrevMonth && dateNextMonth) {
        let currentDate = new Date();
        let selectedDate: Date | null = null;

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const renderCalendar = () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            // Update header
            dateMonthYear.textContent = `${monthNames[month]} ${year}`;

            // Clear calendar
            dateCalendar.innerHTML = '';

            // Add day headers
            dayNames.forEach(day => {
                const header = document.createElement('div');
                header.className = 'date-picker-day-header';
                header.textContent = day;
                dateCalendar.appendChild(header);
            });

            // Get first day of month and number of days
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();

            // Add previous month's trailing days
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = document.createElement('div');
                day.className = 'date-picker-day other-month';
                day.textContent = (daysInPrevMonth - i).toString();
                dateCalendar.appendChild(day);
            }

            // Add current month's days
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset to start of day for comparison

            for (let i = 1; i <= daysInMonth; i++) {
                const day = document.createElement('div');
                day.className = 'date-picker-day';
                day.textContent = i.toString();

                const dayDate = new Date(year, month, i);
                dayDate.setHours(0, 0, 0, 0); // Reset to start of day for comparison

                // Disable past dates
                if (dayDate < today) {
                    day.classList.add('disabled');
                    dateCalendar.appendChild(day);
                    continue; // Skip adding click handler for past dates
                }

                // Highlight today
                if (dayDate.toDateString() === today.toDateString()) {
                    day.classList.add('today');
                }

                // Highlight selected date
                if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
                    day.classList.add('selected');
                }

                // Click handler
                day.addEventListener('click', () => {
                    selectedDate = dayDate;
                    const formattedDate = `${(month + 1).toString().padStart(2, '0')}/${i.toString().padStart(2, '0')}/${year}`;
                    dateDisplay.textContent = formattedDate;

                    // Set value in YYYY-MM-DD format for backend
                    const isoDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
                    dateInput.value = isoDate;

                    // Close dropdown
                    dateDropdown.classList.remove('show');

                    // Trigger validation
                    validateForm();
                });

                dateCalendar.appendChild(day);
            }

            // Add next month's leading days
            const totalCells = dateCalendar.children.length - 7; // Subtract day headers
            const remainingCells = 42 - totalCells - 7; // 6 rows * 7 days - headers
            for (let i = 1; i <= remainingCells; i++) {
                const day = document.createElement('div');
                day.className = 'date-picker-day other-month';
                day.textContent = i.toString();
                dateCalendar.appendChild(day);
            }
        };

        // Toggle dropdown
        dateDisplay.addEventListener('click', () => {
            dateDropdown.classList.toggle('show');
            if (dateDropdown.classList.contains('show')) {
                renderCalendar();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dateDisplay.contains(e.target as Node) && !dateDropdown.contains(e.target as Node)) {
                dateDropdown.classList.remove('show');
            }
        });

        // Month navigation
        datePrevMonth.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        dateNextMonth.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Initialize Map and Vanta
    initMap();

    // Initialize Vanta Waves
    try {
        VANTA.WAVES({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x2e5482,
            shininess: 30.00,
            waveHeight: 15.00,
            waveSpeed: 1.00,
            zoom: 1.00
        });
    } catch (e) {
        console.warn("Vanta initialization failed", e);
    }

    // User Session & UI Init
    const userSession = localStorage.getItem('wisecat_user');
    const btn = document.getElementById('submitBtn') as HTMLButtonElement;
    const creditsDisplay = document.getElementById('creditsDisplay');

    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            (document.getElementById('userName') as HTMLInputElement).value = user.name || "";

            // Update Credits Display
            const credits = user.credits || 0;
            if (creditsDisplay) {
                const dict = WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en'];
                const creditTextTemplate = (dict as any).text_credits || "Current Credits: $0 USD";
                creditsDisplay.innerText = creditTextTemplate.replace('$0', `$${credits}`);
            }

            // Mission Logic
            const missionSelect = document.getElementById('mission') as HTMLSelectElement;
            if (missionSelect) {
                missionSelect.addEventListener('change', (e: Event) => {
                    const target = e.target as HTMLSelectElement;
                    const backup = document.getElementById('preorderBackup');
                    const preorderFields = document.getElementById('preorderFields');
                    const isPreorder = target.value === 'reservation_food_preorder';

                    if (backup) backup.style.display = isPreorder ? 'block' : 'none';
                    if (preorderFields) preorderFields.style.display = isPreorder ? 'block' : 'none';

                    updatePreorderHint();
                    validateForm(); // Re-validate date when mode changes
                });
            }

            // --- Order List Logic ---
            const orderItemsList = document.getElementById('orderItemsList');
            const addOrderItemBtn = document.getElementById('addOrderItemBtn');
            const preorderAgreeCheck = document.getElementById('preorderAgree') as HTMLInputElement;

            const addOrderItemRow = () => {
                if (!orderItemsList) return;
                const div = document.createElement('div');
                div.className = 'order-item-row';
                div.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: center;';

                div.innerHTML = `
                    <input type="text" placeholder="Item Name (e.g. Burger)" class="order-item-name" 
                        style="flex: 1; min-width: 150px; padding: 8px; border-radius: 4px; border: 1px solid #555; background: #222; color: white;">
                    <input type="number" value="1" min="1" max="99" class="order-item-qty" 
                        style="width: 50px; padding: 8px; border-radius: 4px; border: 1px solid #555; background: #222; color: white; text-align: center;">
                    <button type="button" class="remove-item-btn" 
                        style="flex: 0 0 auto; width: 24px; height: 24px; padding: 0; background: none; border: none; color: #ff4444; font-size: 16px; line-height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
                `;

                div.querySelector('.remove-item-btn')?.addEventListener('click', () => {
                    div.remove();
                });

                orderItemsList.appendChild(div);
            };

            if (addOrderItemBtn) {
                addOrderItemBtn.addEventListener('click', addOrderItemRow);
            }

            // Initial row if empty
            if (orderItemsList && orderItemsList.children.length === 0) {
                addOrderItemRow();
            }

            // Sync disclaimer
            const toggleOrderInputs = () => {
                const shouldDisable = !preorderAgreeCheck.checked;
                if (addOrderItemBtn) (addOrderItemBtn as HTMLButtonElement).disabled = shouldDisable;
                const inputs = orderItemsList?.querySelectorAll('input, button');
                inputs?.forEach(inp => (inp as any).disabled = shouldDisable);
            }
            if (preorderAgreeCheck) {
                preorderAgreeCheck.addEventListener('change', toggleOrderInputs);
                toggleOrderInputs(); // init
            }

            // Initial button state check
            if (btn && credits <= 0) {
                btn.disabled = true;
                btn.style.opacity = "0.5";
            }
        } catch (e) {
            console.error('Error loading user session:', e);
        }
    }

    // --- Header Sync & Logout ---
    onAuthStateChanged(auth, (user) => {
        const headerUserName = document.getElementById('headerUserName');
        const headerUserAvatar = document.getElementById('headerUserAvatar') as HTMLImageElement | null;
        const creditsDisplay = document.getElementById('creditsDisplay');

        if (user) {
            if (headerUserName) headerUserName.textContent = user.displayName || 'User';
            if (headerUserAvatar && user.photoURL) headerUserAvatar.src = user.photoURL;

            // Re-fetch credits if needed, or rely on localStorage if already updated
            const userSession = localStorage.getItem('wisecat_user');
            if (userSession && creditsDisplay) {
                const u = JSON.parse(userSession);
                creditsDisplay.textContent = `$${(u.credits || 0).toFixed(2)} `;
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

    // Helper Buddy Logic
    const buddy = document.getElementById('helperBuddy');
    const panel = document.getElementById('helperPanel');
    const close = document.getElementById('helperClose');

    if (buddy && panel) buddy.addEventListener('click', () => panel.classList.toggle('show'));
    if (close && panel) close.addEventListener('click', () => panel.classList.remove('show'));

    // --- Number Input Controls (Party Size & Food Quantity) ---
    const initNumberInput = (displayId: string, inputId: string, minusId: string, plusId: string, min: number, max: number) => {
        const display = document.getElementById(displayId);
        const input = document.getElementById(inputId) as HTMLInputElement;
        const minusBtn = document.getElementById(minusId) as HTMLButtonElement;
        const plusBtn = document.getElementById(plusId) as HTMLButtonElement;

        if (!display || !input || !minusBtn || !plusBtn) return;

        const updateValue = (newValue: number) => {
            // Clamp value between min and max
            const clampedValue = Math.max(min, Math.min(max, newValue));
            display.textContent = clampedValue.toString();
            input.value = clampedValue.toString();

            // Update button states
            minusBtn.disabled = clampedValue <= min;
            plusBtn.disabled = clampedValue >= max;
        };

        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value) || min;
            updateValue(currentValue - 1);
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(input.value) || min;
            updateValue(currentValue + 1);
        });

        // Initialize button states
        updateValue(parseInt(input.value) || min);
    };

    // Initialize Party Size (min: 1, max: 50)
    initNumberInput('partySizeDisplay', 'partySize', 'partySizeMinus', 'partySizePlus', 1, 50);

    // Initialize Food Quantity (min: 1, max: 4)
    // initNumberInput('foodQuantityDisplay', 'foodQuantity', 'foodQuantityMinus', 'foodQuantityPlus', 1, 4); // Removed for dynamic order list

    // Bind event listeners using the centralized bind function
    bindValidationListeners();
    bindSearchListeners();

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

    // Timezone Mapping (Expanded)
    const updateTimezone = async () => {
        if (!phoneInputPlugin) return; // Target phone plugin
        const countryData = phoneInputPlugin.getSelectedCountryData();
        const countryCode = countryData.iso2;
        const tzDisplay = document.getElementById('detectedTimezone');

        // Dynamic import to ensure comprehensive coverage
        const { countryTimezones } = await import('./timezones');

        let tz = '';
        let source = '';

        if (countryCode && countryTimezones[countryCode]) {
            tz = countryTimezones[countryCode];
            source = `based on ${countryCode.toUpperCase()} `;
        } else {
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

    const phoneInputForTimezone = document.querySelector("#targetPhone");
    if (phoneInputForTimezone) {
        phoneInputForTimezone.addEventListener('countrychange', updateTimezone);
        setTimeout(updateTimezone, 1000);
    }
});

// --- Validation Logic ---

function bindValidationListeners() {
    const validationInputs = ['targetPhone', 'userPhone', 'resDate', 'resTime'];
    validationInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'targetPhone' || id === 'userPhone') {
                el.addEventListener('countrychange', validateForm);
                el.addEventListener('blur', validateForm);
            }
            el.addEventListener('input', validateForm);
            el.addEventListener('change', validateForm);
        }
    });

    const consentCheckbox = document.getElementById('consentCheckbox');
    if (consentCheckbox) {
        consentCheckbox.addEventListener('change', validateForm);
    }

    // Form Submit
    const form = document.getElementById('resForm');
    if (form) form.addEventListener('submit', handleFormSubmit);
}

function updatePreorderHint() {
    const missionSelect = document.getElementById('mission') as HTMLSelectElement;
    const preorderDateHint = document.getElementById('preorderDateHint');
    const dict = WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en'];

    if (missionSelect && missionSelect.value === 'reservation_food_preorder' && preorderDateHint) {
        // Show hint proactively
        const hintTemplate = (dict as any).validation_preorder_date_hint || `Note: Pre - orders must be booked at least ${minPreorderDays} days in advance.`;
        preorderDateHint.innerText = hintTemplate.replace('{N}', minPreorderDays.toString());

        // Use a neutral color for the proactive hint (vs error red)
        preorderDateHint.style.color = "#4a90e2";
        preorderDateHint.style.display = "block";
    }
}

// Global scope for Turnstile callback
(window as any).onTurnstileSuccess = function (token: string) {
    console.log("Turnstile Success, Token:", token);
    turnstileValidated = true;
    validateForm();
};

function validateForm() {
    const btn = document.getElementById('submitBtn') as HTMLButtonElement;
    const phoneInput = document.getElementById('targetPhone') as HTMLInputElement;
    const phoneHint = document.getElementById('phoneHint');
    const consentCheckbox = document.getElementById('consentCheckbox') as HTMLInputElement;

    if (!btn || !phoneInput) return;

    // 1. Credit Check
    const userSession = localStorage.getItem('wisecat_user');
    let credits = 0;
    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            credits = parseFloat(user.credits) || 0;
        } catch (e) { }
    }

    // 2. Phone Validation - Permissive but reject invalid characters
    let isPhoneValid = false;
    if (phoneInputPlugin && phoneInput.value) {
        // Only allow digits, spaces, dashes, parentheses, and +
        const validCharsOnly = /^[\d\s\-\(\)\+]+$/.test(phoneInput.value);
        const digitsOnly = phoneInput.value.replace(/\D/g, '');
        isPhoneValid = validCharsOnly && digitsOnly.length >= 5;
    }

    if (phoneInput.value && !isPhoneValid) {
        phoneInput.style.borderColor = "#ff4d4d";
        if (phoneHint) phoneHint.style.display = "block";
    } else {
        phoneInput.style.borderColor = "";
        if (phoneHint) phoneHint.style.display = "none";
    }

    // 2.1 User Phone Validation (New)
    let isUserPhoneValid = false;
    const userPhoneInput = document.getElementById('userPhone') as HTMLInputElement;
    const userPhoneHint = document.getElementById('userPhoneHint');

    if (userPhonePlugin && userPhoneInput && userPhoneInput.value) {
        const validCharsOnly = /^[\d\s\-\(\)\+]+$/.test(userPhoneInput.value);
        const digitsOnly = userPhoneInput.value.replace(/\D/g, '');
        isUserPhoneValid = validCharsOnly && digitsOnly.length >= 5;
    }

    // UI for User Phone
    if (userPhoneInput && userPhoneInput.value && !isUserPhoneValid) {
        userPhoneInput.style.borderColor = "#ff4d4d";
        if (userPhoneHint) userPhoneHint.style.display = "block";
    } else if (userPhoneInput) {
        userPhoneInput.style.borderColor = "";
        if (userPhoneHint) userPhoneHint.style.display = "none";
    }

    // 2.5 Time Validation
    const isTimeValid = validateReservationTime();


    // 2.6 Safety Check
    if (!isContentSafe) {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.innerText = "⚠️ Content Unsafe";
        return;
    } else {
        // Reset text if safe (optional, but good for UX)
        if (btn.innerText === "⚠️ Content Unsafe") {
            btn.innerText = (document.getElementById('i18n-btn_submit_reservation') as HTMLElement)?.innerText || "Submit Reservation";
        }
    }

    // 3. Combined Logic
    const hasRestaurant = !!selectedRestaurantData;
    const isConsentGiven = consentCheckbox ? consentCheckbox.checked : false;

    // Check isUserPhoneValid as well
    if (credits > 0 && turnstileValidated && isPhoneValid && isUserPhoneValid && isTimeValid && hasRestaurant && isConsentGiven) {
        btn.disabled = false;
        btn.style.opacity = "1";
    } else {
        btn.disabled = true;
        btn.style.opacity = "0.5";
    }
}

function validateReservationTime(): boolean {
    const resDateInput = document.getElementById('resDate') as HTMLInputElement;
    const resTimeInput = document.getElementById('resTime') as HTMLInputElement;
    const timeHint = document.getElementById('timeHint');
    const dateHint = document.getElementById('dateHint');

    const resDateVal = resDateInput ? resDateInput.value : '';
    const resTimeVal = resTimeInput ? resTimeInput.value : '';

    const dict = WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en'];

    if (!timeHint) return true;

    // Step 1: Missing Data check
    if (!resDateVal || !resTimeVal || !currentPlaceOpeningHours) {
        if (timeHint) timeHint.style.display = "none";
        if (dateHint) dateHint.style.display = "none";
        return true;
    }

    // Step 1.5: Check if selected time is in the past (for today only)
    const [y, m, d] = resDateVal.split('-').map(Number);
    const selectedDate = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // Step 1.2: Check Pre-order constraint
    const missionSelect = document.getElementById('mission') as HTMLSelectElement;
    const preorderDateHint = document.getElementById('preorderDateHint');
    // const dict = WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en'];

    if (missionSelect && missionSelect.value === 'reservation_food_preorder') {
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + minPreorderDays);

        if (selectedDate < minDate) {
            if (preorderDateHint) {
                const hintTemplate = (dict as any).validation_preorder_date || `Pre - orders require booking at least ${minPreorderDays} days in advance.`;
                const msg = hintTemplate.replace('{N}', minPreorderDays.toString());
                preorderDateHint.innerText = msg;
                preorderDateHint.style.display = "block";

                // Show Popup using the same message
                if ((window as any).showToast) {
                    (window as any).showToast(`⚠️ ${msg} `, "error");
                }
            }
            if (dateHint) dateHint.style.display = "none"; // Hide standard close hint
            return false;
        } else {
            if (preorderDateHint) preorderDateHint.style.display = "none";
        }
    } else {
        if (preorderDateHint) preorderDateHint.style.display = "none";
    }

    // Step 1.5: Check if selected time is in the past (for today only)
    if (selectedDate.getTime() === today.getTime()) {
        const [resHour, resMin] = resTimeVal.split(':').map(Number);
        const now = new Date();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTotalMinutes = currentHour * 60 + currentMin;
        const resTotalMinutes = resHour * 60 + resMin;

        if (resTotalMinutes < currentTotalMinutes) {
            if (timeHint) {
                timeHint.innerText = (dict as any).validation_past_time || "Cannot select a time in the past";
                timeHint.style.display = "block";
            }
            if (dateHint) dateHint.style.display = "none";
            return false;
        }
    }

    // Step 2: Get day of week (already parsed selectedDate above)
    const dayOfWeek = selectedDate.getDay(); // 0 (Sun) to 6 (Sat)

    // Step 3: Parse user time in minutes (already parsed above)
    const [resHour, resMin] = resTimeVal.split(':').map(Number);
    const resTotalMinutes = resHour * 60 + resMin;

    // Step 4: Handle cases with NO periods
    if (!currentPlaceOpeningHours.periods || currentPlaceOpeningHours.periods.length === 0) {
        timeHint.style.display = "none";
        return true;
    }

    // Step 5: Handle 24/7 Special Case
    const periods = currentPlaceOpeningHours.periods;
    const is24h = periods.length === 1 && periods[0].open.day === 0 && periods[0].open.time === "0000" && !periods[0].close;
    if (is24h) {
        if (timeHint) timeHint.style.display = "none";
        if (dateHint) dateHint.style.display = "none";
        return true;
    }

    let isValid = false;
    let dayStartsAnyPeriod = false; // Does any period START on this day?
    let currentPotentialError = (dict as any).validation_out_of_hours || "Outside operating hours";

    for (const period of periods) {
        const openDay = period.open.day;
        const openTime = parseInt(period.open.time);
        const openTotal = Math.floor(openTime / 100) * 60 + (openTime % 100);

        // Check Case A: Period starts on the selected day
        if (openDay === dayOfWeek) {
            dayStartsAnyPeriod = true;
            if (!period.close) { isValid = true; break; }

            const closeDay = period.close.day;
            const closeTime = parseInt(period.close.time);
            let closeTotal = Math.floor(closeTime / 100) * 60 + (closeTime % 100);

            if (closeDay !== openDay) closeTotal += 1440; // Spans after midnight

            if (resTotalMinutes >= openTotal && resTotalMinutes <= (closeTotal - 30)) {
                isValid = true;
                break;
            } else if (resTotalMinutes > (closeTotal - 30) && resTotalMinutes <= closeTotal) {
                currentPotentialError = (dict as any).validation_too_late;
            }
        }
        // Check Case B: Period started YESTERDAY and ends TODAY
        else if (period.close && period.close.day === dayOfWeek) {
            const closeTime = parseInt(period.close.time);
            const closeTotal = Math.floor(closeTime / 100) * 60 + (closeTime % 100);

            // User is picking a time in the "morning-after" window
            if (resTotalMinutes <= (closeTotal - 30)) {
                isValid = true;
                break;
            } else if (resTotalMinutes > (closeTotal - 30) && resTotalMinutes <= closeTotal) {
                currentPotentialError = (dict as any).validation_too_late;
            }
        }
    }

    // Step 6: Final UI Update
    if (isValid) {
        if (timeHint) timeHint.style.display = "none";
        if (dateHint) dateHint.style.display = "none";
        return true;
    } else {
        // Determine which hint to show
        if (!dayStartsAnyPeriod && resTotalMinutes > 300) {
            if (dateHint) {
                dateHint.innerText = (dict as any).validation_closed || "Closed on this date";
                dateHint.style.display = "block";
            }
            if (timeHint) timeHint.style.display = "none";
        } else {
            if (timeHint) {
                timeHint.innerText = currentPotentialError;
                timeHint.style.display = "block";
            }
            if (dateHint) dateHint.style.display = "none";
        }
        return false;
    }
}

// --- Google Maps Logic ---

function loadGoogleMapsAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
        if ((window as any).google && (window as any).google.maps) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        const langMap: Record<string, string> = { 'zh': 'zh-TW', 'jp': 'ja', 'kr': 'ko', 'en': 'en' };
        const mapsLang = (WiseCatI18n.currentLang && langMap[WiseCatI18n.currentLang]) || 'zh-TW';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=${mapsLang}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initMap() {
    try {
        await loadGoogleMapsAPI();

        // Default center (Taipei)
        const defaultLocation = { lat: 25.0330, lng: 121.5654 };

        map = new google.maps.Map(document.getElementById('map'), {
            center: defaultLocation,
            zoom: 15,
            styles: [
                {
                    "elementType": "geometry",
                    "stylers": [{ "color": "#212121" }]
                },
                {
                    "elementType": "labels.text.fill",
                    "stylers": [{ "color": "#757575" }]
                },
                {
                    "elementType": "labels.text.stroke",
                    "stylers": [{ "color": "#212121" }]
                }
            ]
        });

        placesService = new google.maps.places.PlacesService(map);

    } catch (error) {
        console.error('Error loading Google Maps:', error);
        alert('無法載入 Google Maps。請確認網路連線。');
    }
}

function getPlaceDetails(placeId: string): Promise<any> {
    if (placeDetailsCache[placeId]) {
        console.log('Using cached place details');
        return Promise.resolve(placeDetailsCache[placeId]);
    }

    return new Promise((resolve, reject) => {
        const request = {
            placeId: placeId,
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'international_phone_number', 'geometry', 'opening_hours', 'utc_offset_minutes']
        };

        placesService.getDetails(request, (place: any, status: any) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                placeDetailsCache[placeId] = place;
                resolve(place);
            } else {
                reject(status);
            }
        });
    });
}

function searchPlaces(query: string) {
    if (!query || query.length < 2) {
        document.getElementById('searchResults')?.classList.remove('show');
        return;
    }

    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '<div class="loading">搜尋中...</div>';
    resultsContainer.classList.add('show');

    if (!placesService) {
        console.error('Places service not initialized');
        resultsContainer.innerHTML = '<div class="loading">服務初始化中，請稍後...</div>';
        return;
    }

    // Auto-detect location based on query
    let location = { lat: 25.0330, lng: 121.5654 }; // Default: Taipei

    // If query contains Japanese characters, search in Tokyo
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(query)) {
        location = { lat: 35.6762, lng: 139.6503 }; // Tokyo
    } else if (WiseCatI18n.currentLang === 'en') {
        location = { lat: 40.7128, lng: -74.0060 }; // Default to NY for EN if no other bias
    }

    const request = {
        query: query + ' restaurant',
        fields: ['name', 'formatted_address', 'place_id', 'geometry'],
        locationBias: location
    };

    placesService.textSearch(request, (results: any[], status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            displaySearchResults(results.slice(0, 5));
        } else {
            resultsContainer.innerHTML = '<div class="loading">找不到餐廳</div>';
        }
    });
}

function displaySearchResults(places: any[]) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    places.forEach(place => {
        const item = document.createElement('div');
        item.className = 'search-result-item';

        const name = document.createElement('div');
        name.className = 'result-name';
        name.textContent = place.name;

        const address = document.createElement('div');
        address.className = 'result-address';
        address.textContent = place.formatted_address || '地址未提供';

        const phone = document.createElement('div');
        phone.className = 'result-phone';
        phone.textContent = '點擊查看電話';

        item.appendChild(name);
        item.appendChild(address);
        item.appendChild(phone);

        item.addEventListener('click', async () => {
            phone.textContent = '載入中...';
            try {
                const detailedPlace = await getPlaceDetails(place.place_id);
                selectPlace(detailedPlace);
            } catch (error) {
                console.error('Error getting place details:', error);
                alert('無法取得餐廳電話，請手動輸入');
                selectPlace(place);
            }
        });

        resultsContainer.appendChild(item);
    });
}

function bindSearchListeners() {
    const searchInput = document.getElementById('restaurantSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e: Event) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchPlaces((e.target as HTMLInputElement).value);
            }, 500);
        });
    }

    document.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.search-container')) {
            document.getElementById('searchResults')?.classList.remove('show');
        }
    });
}

// --- Drawer & Selection Logic ---

function toggleDrawer() {
    const drawer = document.getElementById('restaurantDrawer');
    const content = document.getElementById('drawerContent');
    if (drawer && content) {
        const isOpen = drawer.classList.toggle('open');
        content.style.display = isOpen ? 'block' : 'none';
    }
}

// Attach toggleDrawer to window so it can be called from potential inline refs (though ideally we remove them)
(window as any).toggleDrawer = toggleDrawer;

function showConfirmModal(place: any) {
    const modal = document.getElementById('confirmModal');
    const details = document.getElementById('confirmDetails');
    const dict = WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en'];

    if (!modal || !details) return;

    let hoursHtml = 'N/A';
    if (place.opening_hours && place.opening_hours.weekday_text) {
        hoursHtml = `<ul style="padding-left: 20px; list-style-type: disc;">
            ${place.opening_hours.weekday_text.map((day: string) => `<li>${day}</li>`).join('')}
        </ul>`;
    }

    details.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">${(dict as any).label_detail_address || '📍 Address'}</span>
            <span class="detail-value">${place.formatted_address || 'N/A'}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">${(dict as any).label_detail_phone || '📞 Phone'}</span>
            <span class="detail-value">${place.international_phone_number || place.formatted_phone_number || 'N/A'}</span>
        </div>
        <div class="detail-item" style="max-height: 150px; overflow-y: auto;">
            <span class="detail-label">${(dict as any).label_detail_hours || '⏰ Opening Hours'}</span>
            <span class="detail-value">${hoursHtml}</span>
        </div>
    `;

    modal.style.display = 'flex';

    const onConfirm = () => {
        applyPlaceSelection(place);
        modal.style.display = 'none';
        cleanup();
    };
    const onCancel = () => {
        modal.style.display = 'none';
        cleanup();
    };
    const cleanup = () => {
        document.getElementById('modalConfirm')?.removeEventListener('click', onConfirm);
        document.getElementById('modalCancel')?.removeEventListener('click', onCancel);
    };

    document.getElementById('modalConfirm')?.addEventListener('click', onConfirm);
    document.getElementById('modalCancel')?.addEventListener('click', onCancel);
}

function selectPlace(place: any) {
    showConfirmModal(place);
}

function applyPlaceSelection(place: any) {
    console.log('Applying selection:', place);
    selectedRestaurantData = place;
    currentPlaceOpeningHours = place.opening_hours || null;

    // Fill in phone number
    const phoneNumber = place.international_phone_number || place.formatted_phone_number;

    if (phoneNumber) {
        console.log('Phone found:', phoneNumber);
        if (phoneInputPlugin) {
            phoneInputPlugin.setNumber(phoneNumber);
        } else {
            const phoneInput = document.getElementById('targetPhone') as HTMLInputElement;
            if (phoneInput) phoneInput.value = phoneNumber;
        }
    } else {
        (window as any).showToast("⚠️ Phone number not found for this location. Please enter it manually.", "warning");
    }
    validateForm();

    // Fill in searching input
    const searchInput = document.getElementById('restaurantSearch') as HTMLInputElement;
    if (searchInput) searchInput.value = place.name;
    document.getElementById('searchResults')?.classList.remove('show');

    // Render details
    const drawerContent = document.getElementById('drawerContent');
    const drawer = document.getElementById('restaurantDrawer');
    const dict = WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en'];

    if (!drawerContent || !drawer) return;

    let hoursHtml = '<span style="color: #888;">N/A</span>';
    if (place.opening_hours && place.opening_hours.weekday_text) {
        hoursHtml = '<ul style="padding-left: 20px; margin: 5px 0; list-style-type: disc;">' +
            place.opening_hours.weekday_text.map((day: string) => `<li>${day}</li>`).join('') +
            '</ul>';
    }

    drawerContent.innerHTML = `
        <div class="detail-item" style="margin-bottom: 10px;">
            <div style="font-weight: bold; color: #888; font-size: 11px;">${(dict as any).label_detail_address || '📍 Address'}</div>
            <div style="color: #fff;">${place.formatted_address || 'N/A'}</div>
        </div>
        <div class="detail-item" style="margin-bottom: 10px;">
            <div style="font-weight: bold; color: #888; font-size: 11px;">${(dict as any).label_detail_phone || '📞 Phone'}</div>
            <div style="color: #fff;">${place.international_phone_number || place.formatted_phone_number || 'N/A'}</div>
        </div>
        <div class="detail-item">
            <div style="font-weight: bold; color: #888; font-size: 11px;">${(dict as any).label_detail_hours || '⏰ Opening Hours'}</div>
            <div style="color: #ccc;">${hoursHtml}</div>
        </div>
        ${place.website ? `<a href="${place.website}" target="_blank" style="color: var(--primary-color);">Visit Website</a>` : ''}
    `;

    drawer.style.display = "block";
    // Auto open drawer
    if (!drawer.classList.contains('open')) toggleDrawer();

    // Update map
    if (place.geometry && place.geometry.location) {
        if (map) {
            map.setCenter(place.geometry.location);
            map.setZoom(17);

            if (currentMarker) currentMarker.setMap(null);

            currentMarker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
                title: place.name,
                animation: google.maps.Animation.DROP
            });

            document.getElementById('mapContainer')?.classList.add('show');
        }
    }

    validateForm();
}


// --- Form Handler ---

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

    // Opening Hours Validation
    if (!validateReservationTime()) {
        return;
    }

    // Call Consent Validation
    const consentCheckbox = document.getElementById('consentCheckbox') as HTMLInputElement;
    if (consentCheckbox && !consentCheckbox.checked) {
        alert("Please agree to let the AI call on your behalf to continue.");
        return;
    }

    // Security and refinement is now handled unified by the 'Check Description' AI call before final submission.
    if (!isContentSafe) {
        alert("⚠️ Suspicious content detected or mission mismatch, please check your input.");
        return;
    }

    const nameInput = document.getElementById('userName') as HTMLInputElement;
    const phoneInput = document.getElementById('targetPhone') as HTMLInputElement;
    const noteInput = document.getElementById('note') as HTMLTextAreaElement;

    const name = nameInput.value;
    const note = noteInput.value;
    const btn = document.getElementById('submitBtn') as HTMLButtonElement;
    btn.disabled = true;

    // Get number from plugin if possible for E.164 format
    let fullPhoneNumber = phoneInput.value;
    if (phoneInputPlugin) {
        fullPhoneNumber = phoneInputPlugin.getNumber(); // Get full global number including country code
    }

    const userPhoneInput = document.getElementById('userPhone') as HTMLInputElement;
    let userPhoneNumberFull = userPhoneInput.value;
    if (userPhonePlugin) {
        userPhoneNumberFull = userPhonePlugin.getNumber();
    }

    // Get User Email
    let userEmail = "N/A";
    if (auth.currentUser && auth.currentUser.email) {
        userEmail = auth.currentUser.email;
    } else {
        const userSession = localStorage.getItem('wisecat_user');
        if (userSession) {
            try {
                const parsed = JSON.parse(userSession);
                if (parsed.email) userEmail = parsed.email;
            } catch (e) { }
        }
    }

    let userCredits = 0;
    const sessionStr = localStorage.getItem('wisecat_user');
    if (sessionStr) {
        try {
            const parsed = JSON.parse(sessionStr);
            if (parsed.credits) userCredits = Number(parsed.credits);
        } catch (e) { }
    }

    const missionSelect = document.getElementById('mission') as HTMLSelectElement;
    const preorderBackupSelect = document.getElementById('preorderBackupChoice') as HTMLSelectElement;
    const partySizeInput = document.getElementById('partySize') as HTMLInputElement;
    const resDateInput = document.getElementById('resDate') as HTMLInputElement;
    const resTimeInput = document.getElementById('resTime') as HTMLInputElement;
    const schedulePrefSelect = document.getElementById('schedulePreference') as HTMLSelectElement;

    const retryCheck = document.getElementById('retryOption') as HTMLInputElement;

    // Food Pre-order Inputs
    const preorderAgreeCheck = document.getElementById('preorderAgree') as HTMLInputElement;

    const { doc, collection, serverTimestamp, runTransaction } = await import("firebase/firestore");
    const { db } = await import("./firebase-config");

    const tasksCol = collection(db, 'tasks');
    const randomId = doc(tasksCol).id;
    const taskId = `task_${randomId}`;
    const taskRef = doc(db, 'tasks', taskId);

    // --- Handle File Upload (Removed Per Request) ---
    let preOrderImageUrl = "n/a";

    // --- Handle Structured Order List ---
    let orderDetailsFn = 'n/a';
    if (missionSelect.value === 'reservation_food_preorder') {
        const listContainer = document.getElementById('orderItemsList');
        const items: string[] = [];
        if (listContainer) {
            listContainer.querySelectorAll('.order-item-row').forEach(row => {
                const nameInp = row.querySelector('.order-item-name') as HTMLInputElement;
                const qtyInp = row.querySelector('.order-item-qty') as HTMLInputElement;
                if (nameInp && nameInp.value.trim()) {
                    items.push(`${nameInp.value.trim()} x${qtyInp.value}`);
                }
            });
        }
        if (items.length > 0) {
            orderDetailsFn = items.join(', ');
        } else {
            orderDetailsFn = "No items listed";
        }
    }

    const payload = {
        taskId: taskId,
        type: 'restaurant',
        isTrial: false,
        state: 'pending',
        priority: 4, // High priority
        userCredits: userCredits,
        reservation_utc: calculateReservationUTC(resDateInput.value, resTimeInput.value, selectedRestaurantData?.utc_offset_minutes),
        mission: missionSelect.value,
        preorderBackup: missionSelect.value === 'reservation_food_preorder' ? preorderBackupSelect.value : 'n/a',
        preOrderDetails: orderDetailsFn,
        preOrderImageUrl: preOrderImageUrl, // Kept as 'n/a' for schema compatibility
        foodName: orderDetailsFn, // Legacy map
        foodQuantity: "See details",
        Name: name,
        'Party Size': partySizeInput.value,
        'date/month/year': resDateInput.value,
        time: resTimeInput.value,
        targetPhoneNumber: fullPhoneNumber,
        userPhoneNumber: userPhoneNumberFull,
        userEmail: userEmail,
        note: note,
        language: WiseCatI18n.currentLang,
        schedulePreference: schedulePrefSelect.value,
        retryOneTime: retryCheck.checked,
        retry_count: retryCheck.checked ? 1 : 0, // 1 if checked, 0 if not
        createdAt: new Date().toISOString(), // Client-side time for webhook
        // Enhanced Map Data
        placeDetails: selectedRestaurantData ? {
            name: selectedRestaurantData.name,
            address: selectedRestaurantData.formatted_address,
            international_phone: selectedRestaurantData.international_phone_number,
            opening_hours: selectedRestaurantData.opening_hours ? selectedRestaurantData.opening_hours.weekday_text : null,
            utc_offset: selectedRestaurantData.utc_offset_minutes
        } : null
    };

    console.log("Calculated UTC Payload:", payload.reservation_utc);

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
        if (!tz) tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

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

    // i18n Dictionary for script alerts
    const dict = WiseCatI18n.translations[WiseCatI18n.currentLang] || WiseCatI18n.translations['en'];

    // Validation for Name
    const namePattern = /^[a-zA-Z\s\-_]*$/;
    if (!namePattern.test(payload.Name)) {
        (window as any).showToast((dict as any).validation_name || "Name must be English letters only", "error");
        btn.disabled = false;
        return;
    }

    // Validation for Food Pre-order
    if (payload.mission === 'reservation_food_preorder') {
        if (!payload.foodName || payload.foodName.trim() === '') {
            (window as any).showToast((dict as any).label_food_name + " is required", "error");
            btn.disabled = false;
            return;
        }
        if (!preorderAgreeCheck.checked) {
            (window as any).showToast((dict as any).validation_preorder_agree || "You must agree to the partial quantity policy", "error");
            btn.disabled = false;
            return;
        }
    }


    // 4. Force Final Safety Check (Note) - Now handled by isContentSafe toggle from validateNote
    if (!isContentSafe) {
        (window as any).showToast("Content blocked by security policy or mission mismatch.", "error");
        btn.disabled = false;
        return;
    }


    // 1. Transaction: Check Credits -> Deduct -> Create Task
    try {
        if (!auth.currentUser) {
            (window as any).showToast("Please log in to submit a reservation.", "error");
            btn.disabled = false;
            return;
        }

        const userDocRef = doc(db, 'users', `uid_${auth.currentUser.uid}`);
        const settingsRef = doc(db, 'users', `uid_${auth.currentUser.uid}`, 'settings', 'settings');
        const cost = currentCost;

        // Final Confirmation Modal
        const details = [
            { label: "Restaurant", value: (document.getElementById('restaurantName') as HTMLInputElement).value },
            { label: "Date & Time", value: `${resDateInput.value} ${resTimeInput.value}` },
            { label: "Party Size", value: partySizeInput.value },
            { label: "Target Phone", value: fullPhoneNumber },
            { label: "Special Requests", value: noteInput.value || 'None' },
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
        btn.innerText = (dict as any).msg_success;
        (window as any).showToast(`Dear ${name}, we've received the task. We will schedule your call ASAP. Once finished will send result to ${userEmail}.`, "success");

    } catch (error) {
        console.error("Error submitting reservation:", error);

        let msg = (dict as any).msg_failed || "Submission failed. Please try again.";
        if (typeof error === 'string' && error.includes("Insufficient credits")) {
            msg = error;
        }

        const originalText = (dict as any).btn_submit_reservation || "Submit Reservation";
        btn.innerText = originalText;
        (window as any).showToast(msg, "error");
        btn.disabled = false;
    }
}

// Helper: Toast Notification
(window as any).showToast = function (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';
    if (type === 'warning') icon = '⚠️';

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
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
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



function calculateReservationUTC(dateStr: string, timeStr: string, utcOffsetMinutes: number | undefined): Date | null {
    if (!dateStr || !timeStr) return null;

    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    // Create a Date object representing the time in the restaurant's timezone
    // We treat it as UTC first to get the components straight without browser TZ
    const localTimeRef = new Date(Date.UTC(year, month - 1, day, hour, minute));

    let targetUtcTime = localTimeRef.getTime();

    if (utcOffsetMinutes !== undefined) {
        // UTC = Local - Offset
        targetUtcTime -= (utcOffsetMinutes * 60 * 1000);
    } else {
        console.warn("No UTC offset found for restaurant, using time as-is (UTC)");
    }

    return new Date(targetUtcTime);
}

// --- Safety Check State ---
let isContentSafe = true;

// Add generic safety check listener to input fields
// attachSafetyCheck removed as security logic is now consolidated into the backend validation function.


// --- AI Note Validation & Refinement ---

async function validateNote() {
    const validateBtn = document.getElementById('validateBtn') as HTMLButtonElement;
    const feedbackDiv = document.getElementById('validationFeedback');
    const noteTextarea = document.getElementById('note') as HTMLTextAreaElement;
    const missionSelect = document.getElementById('mission') as HTMLSelectElement;

    if (!noteTextarea || !feedbackDiv || !validateBtn || !missionSelect) return;

    const description = noteTextarea.value.trim();
    if (!description) return;

    if (description.length < 10) {
        feedbackDiv.innerText = '❌ Request is too short. Please provide at least 10 characters.';
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

        const missionId = missionSelect.value;
        const currentLang = WiseCatI18n.currentLang;
        const missionName = missionSelect.selectedOptions[0]?.text || missionId;

        const result: any = await validateFunction({
            missionId,
            missionName,
            description,
            language: currentLang
        });

        const data = result.data as { valid: boolean; refinedText?: string; explanation?: string };

        if (data.valid) {
            isContentSafe = true;
            (document.getElementById('submitBtn') as HTMLButtonElement).disabled = false;

            noteTextarea.style.border = '2px solid #10b981';
            noteTextarea.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            feedbackDiv.style.background = 'rgba(16, 185, 129, 0.1)';
            feedbackDiv.style.border = '1px solid rgba(16, 185, 129, 0.3)';
            feedbackDiv.style.color = '#10b981';

            // Handle Refinement Suggestion
            const originalNote = noteTextarea.value.trim();
            const refinedNote = data.refinedText ? data.refinedText.trim() : originalNote;
            const isDifferent = refinedNote.replace(/\s/g, '') !== originalNote.replace(/\s/g, '');

            if (isDifferent) {
                feedbackDiv.innerHTML = `
                    <div style="margin-bottom: 10px;">✅ <strong>Mission Matched!</strong></div>
                    <div style="margin-bottom: 12px; font-style: italic; color: #9ca3af; border-left: 2px solid #10b981; padding-left: 10px;">
                        "${data.explanation || 'I have a more professional suggestion for your request.'}"
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; margin-bottom: 12px; white-space: pre-wrap;">${data.refinedText}</div>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" class="btn-refine-apply" style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Apply Suggestion</button>
                        <button type="button" class="btn-refine-keep" style="flex: 1; padding: 8px; background: transparent; color: #9ca3af; border: 1px solid #444; border-radius: 6px; cursor: pointer;">Keep Original</button>
                    </div>
                `;

                const applyBtn = feedbackDiv.querySelector('.btn-refine-apply');
                const keepBtn = feedbackDiv.querySelector('.btn-refine-keep');

                if (applyBtn) {
                    applyBtn.addEventListener('click', () => {
                        noteTextarea.value = data.refinedText || '';
                        feedbackDiv.innerHTML = '✅ Applied professional refinement!';
                        setTimeout(() => { feedbackDiv.style.display = 'none'; }, 2000);
                    });
                }
                if (keepBtn) {
                    keepBtn.addEventListener('click', () => {
                        feedbackDiv.innerHTML = '✅ Using your original version.';
                        setTimeout(() => { feedbackDiv.style.display = 'none'; }, 2000);
                    });
                }
            } else {
                feedbackDiv.textContent = '✅ Request looks great and is safe!';
            }
        } else {
            isContentSafe = false;
            (document.getElementById('submitBtn') as HTMLButtonElement).disabled = true;
            noteTextarea.style.border = '2px solid #ef4444';
            noteTextarea.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            feedbackDiv.textContent = `❌ ${data.explanation || "Request doesn't match or is unsafe. Please revise."}`;
            feedbackDiv.style.background = 'rgba(239, 68, 68, 0.1)';
            feedbackDiv.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            feedbackDiv.style.color = '#f87171';
        }
    } catch (error) {
        console.error('Validation error:', error);
        feedbackDiv.innerText = '⚠️ Validation service unavailable. Proceeding...';
    } finally {
        validateBtn.disabled = false;
        validateBtn.innerHTML = '<span data-i18n="validate_btn">🔍 Check Description</span>';
    }
}

// Security and refinement is now verified by the unified 'Check Description' call.
document.addEventListener('DOMContentLoaded', () => {
    // attachSafetyCheck('note');
    const validateBtn = document.getElementById('validateBtn');
    if (validateBtn) validateBtn.addEventListener('click', validateNote);
});


