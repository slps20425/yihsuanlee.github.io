import "./version";
import WiseCatI18n from './i18n';
import { auth } from './firebase-config';

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
let currentCost = 5; // Default cost
let defaultRetryCount = 5; // Default retry count if config missing


// ...



// Cache
const placeDetailsCache: Record<string, any> = {};

// Scam Detector
const ScamDetector = {
    patterns: [
        /投資獲利|飆股|加賴|加LINE|賺錢|兼職|獲利|高報酬|博弈/i,
        /investment|profit|crypto|jackpot|lottery|free money|giveaway/i,
        /恭喜中獎|領取獎品|點擊連結|驗證身分|帳戶異常/i,
        /congratulations|winner|claim prize|verify account|unusual activity/i,
        /kiếm tiền|nhận thưởng|หัวหน้า|โบนัส/i
    ],
    isScam(text: string): boolean {
        const cleanText = text.replace(/[^\w\s\u4e00-\u9fa5]/gi, '').replace(/\s+/g, '');
        return this.patterns.some(regex => regex.test(cleanText));
    }
};

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
    const { doc, onSnapshot, runTransaction } = await import("firebase/firestore"); // Added runTransaction
    const { db } = await import("./firebase-config");

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
                retryWarning.style.color = "#ff4444"; // Ensure it's visible warning color
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

                    const iconRect = icon.getBoundingClientRect();
                    const tooltipRect = tooltip.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;

                    // Default: position above
                    let top = iconRect.top - tooltipRect.height - 10;
                    let left = iconRect.left + (iconRect.width / 2) - (tooltipRect.width / 2);

                    // Check if tooltip goes off top
                    if (top < 10) {
                        // Position below instead
                        top = iconRect.bottom + 10;
                    }

                    // Check if tooltip goes off left
                    if (left < 10) {
                        left = 10;
                    }

                    // Check if tooltip goes off right
                    if (left + tooltipRect.width > viewportWidth - 10) {
                        left = viewportWidth - tooltipRect.width - 10;
                    }

                    tooltip.style.top = `${top}px`;
                    tooltip.style.left = `${left}px`;
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

    // Initialize userPhone (Confirmation)
    const userPhoneInput = document.querySelector("#userPhone");
    if (userPhoneInput) {
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
    }

    // Initialize Custom Time Picker
    const timeDisplay = document.getElementById('resTimeDisplay');
    const timeDropdown = document.getElementById('resTimeDropdown');
    const timeHourSelect = document.getElementById('resTimeHour') as HTMLSelectElement;
    const timeMinuteSelect = document.getElementById('resTimeMinute') as HTMLSelectElement;
    const timeInput = document.getElementById('resTime') as HTMLInputElement;
    const ampmButtons = document.querySelectorAll('.time-ampm-btn');

    if (timeDisplay && timeDropdown && timeHourSelect && timeMinuteSelect) {
        // Populate hours (1-12)
        for (let i = 1; i <= 12; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = i.toString();
            timeHourSelect.appendChild(option);
        }

        // Populate minutes (00, 15, 30, 45)
        [0, 15, 30, 45].forEach(min => {
            const option = document.createElement('option');
            const minStr = min.toString().padStart(2, '0');
            option.value = minStr;
            option.textContent = minStr;
            timeMinuteSelect.appendChild(option);
        });

        // Toggle dropdown
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
            const hour = timeHourSelect.value;
            const minute = timeMinuteSelect.value;
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

        timeHourSelect.addEventListener('change', updateTime);
        timeMinuteSelect.addEventListener('change', updateTime);

        // AM/PM toggle
        ampmButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                ampmButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateTime();
            });
        });
    }

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
                });
            }

            // Initial button state check
            if (btn && credits <= 0) {
                btn.disabled = true;
                btn.style.opacity = "0.5";
            }
        } catch (e) {
            console.error('Error loading user session:', e);
        }
    } else {
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = "0.5";
        }
    }

    // Helper Buddy Logic
    const buddy = document.getElementById('helperBuddy');
    const panel = document.getElementById('helperPanel');
    const close = document.getElementById('helperClose');

    if (buddy && panel) buddy.addEventListener('click', () => panel.classList.toggle('show'));
    if (close && panel) close.addEventListener('click', () => panel.classList.remove('show'));

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
            source = `based on ${countryCode.toUpperCase()}`;
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

    // Form Submit
    const form = document.getElementById('resForm');
    if (form) form.addEventListener('submit', handleFormSubmit);
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

    // 3. Combined Logic
    const hasRestaurant = !!selectedRestaurantData;

    // Check isUserPhoneValid as well
    if (credits > 0 && turnstileValidated && isPhoneValid && isUserPhoneValid && isTimeValid && hasRestaurant) {
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

    // If the selected date is today, check if the time has passed
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

async function handleFormSubmit(e: Event) {
    e.preventDefault();

    // Opening Hours Validation
    if (!validateReservationTime()) {
        return;
    }

    // Scam Detection Check
    const nameInput = document.getElementById('userName') as HTMLInputElement;
    const phoneInput = document.getElementById('targetPhone') as HTMLInputElement;
    const noteInput = document.getElementById('note') as HTMLTextAreaElement;

    const name = nameInput.value;
    const phone = phoneInput.value;
    const note = noteInput.value;
    const userInput = name + phone + note;

    if (ScamDetector.isScam(userInput)) {
        alert("⚠️ Suspicious content detected, please check your input.");
        return;
    }

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
    const foodNameInput = document.getElementById('foodName') as HTMLInputElement;
    const foodQuantitySelect = document.getElementById('foodQuantity') as HTMLSelectElement;
    const preorderAgreeCheck = document.getElementById('preorderAgree') as HTMLInputElement;

    const { doc, collection, serverTimestamp, runTransaction } = await import("firebase/firestore");
    const { db } = await import("./firebase-config");

    const tasksCol = collection(db, 'tasks');
    const randomId = doc(tasksCol).id;
    const taskId = `task_${randomId}`;
    const taskRef = doc(db, 'tasks', taskId);

    const payload = {
        taskId: taskId,
        type: 'restaurant',
        isTrial: false,
        state: 'pending',
        priority: 4, // High priority
        userCredits: userCredits,
        reservation_utc: serverTimestamp(), // Run now (Book ASAP)
        mission: missionSelect.value,
        preorderBackup: missionSelect.value === 'reservation_food_preorder' ? preorderBackupSelect.value : 'n/a',
        foodName: missionSelect.value === 'reservation_food_preorder' ? foodNameInput.value : 'n/a',
        foodQuantity: missionSelect.value === 'reservation_food_preorder' ? foodQuantitySelect.value : 'n/a',
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


    // 1. Transaction: Check Credits -> Deduct -> Create Task
    try {
        if (!auth.currentUser) {
            (window as any).showToast("Please log in to submit a reservation.", "error");
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
        btn.innerText = (dict as any).msg_success;
        (window as any).showToast(`We've received your task. Will email to ${userEmail} when ready`, "success");

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


