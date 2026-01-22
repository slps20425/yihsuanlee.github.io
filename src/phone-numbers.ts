import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, auth, db } from "./firebase-config"; // Use shared config
import WiseCatI18n from "./i18n";
import { ScamCheck } from "./scam-check";
import { setupSessionTimeout } from "./session-timeout";
import { initSessionEnforcement, clearSessionEnforcement } from "./session-enforcement"; // [NEW] Single Session
import { initInbox, updateInboxCredits } from "./inbox"; // Import inbox initialization
import { showToast } from "./utility-toast"; // Import toast utility

const functions = getFunctions(app);

// Initialize session timeout for dashboard
setupSessionTimeout();

// Initialize inbox to display SMS messages
initInbox();


// New Elements
const rateCheckInput = document.getElementById('rateCheckInput') as HTMLInputElement | null;
const rateCheckBtn = document.getElementById('rateCheckBtn') as HTMLButtonElement | null;
const rateResult = document.getElementById('rateResult') as HTMLElement | null;
const refreshUsageBtn = document.getElementById('refreshUsageBtn') as HTMLButtonElement | null;
const usageTableBody = document.getElementById('usageHistoryBody') as HTMLElement | null;

// --- SMS Rate Caching Logic ---
const smsRateCache: Record<string, { rate: number, currency: string }> = {};

async function getCachedSMSRate(country: string): Promise<{ rate: number, currency: string }> {
    if (smsRateCache[country]) return smsRateCache[country];

    // Check sessionStorage to fulfill "do not like request all the time"
    const cacheKey = `wisecat_sms_rate_${country}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        try {
            smsRateCache[country] = JSON.parse(cached);
            return smsRateCache[country];
        } catch (e) {
            sessionStorage.removeItem(cacheKey);
        }
    }

    try {
        const getSMSRates = httpsCallable(functions, 'getSMSRates');
        const result = await getSMSRates({ country });
        const data = result.data as any;

        // Find local/mobile rate or default to 0.05
        const bestRate = data.rates?.find((r: any) => r.type === 'local' || r.type === 'mobile') || data.rates?.[0] || { user_price: 0.10 };
        const rateData = {
            rate: bestRate.user_price,
            currency: data.currency === 'USD' ? '$' : (data.currency || '$')
        };

        smsRateCache[country] = rateData;
        sessionStorage.setItem(cacheKey, JSON.stringify(rateData));
        return rateData;
    } catch (e) {
        console.error("Failed to fetch SMS rate for", country, e);
        return { rate: 0.10, currency: '$' };
    }
}


// State
let currentUser: any = null;
let selectedNumber: any = null;

// Elements (make optional since not all pages have all elements)
const areaCodeInput = document.getElementById('areaCodeInput') as HTMLInputElement | null;
const searchBtn = document.getElementById('searchBtn') as HTMLButtonElement | null;
const resultsCard = document.getElementById('resultsCard') as HTMLElement | null;
const numbersList = document.getElementById('numbersList') as HTMLUListElement | null;

const releaseBtn = document.getElementById('releaseBtn') as HTMLButtonElement | null;

const userName = document.getElementById('userName') as HTMLElement | null;
const userEmail = document.getElementById('userEmail') as HTMLElement | null;
const userAvatar = document.getElementById('userAvatar') as HTMLImageElement | null;
const creditsDisplay = document.getElementById('creditsDisplay') as HTMLElement | null;

// Phone Requirement Tracking
let hasActivePhoneNumber = false;
const noNumberReminder = document.getElementById('noNumberReminder');
const linkRestaurant = document.getElementById('linkRestaurant');
const linkMouthpiece = document.getElementById('linkMouthpiece');
const noNumberDialog = document.getElementById('noNumberDialog') as HTMLDialogElement | null;
const goToAddTabBtn = document.getElementById('goToAddTabBtn');
const closeNoNumberBtn = document.getElementById('closeNoNumberBtn');
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement | null;
const headerLogoutBtn = document.getElementById('headerLogoutBtn') as HTMLButtonElement | null;

// Dialogs
const purchaseDialog = document.getElementById('purchaseDialog') as HTMLDialogElement | null;
const confirmPhoneNumber = document.getElementById('confirmPhoneNumber') as HTMLElement | null;
const confirmLocation = document.getElementById('confirmLocation') as HTMLElement | null;
const cancelPurchaseBtn = document.getElementById('cancelPurchaseBtn') as HTMLButtonElement | null;
const confirmPurchaseBtn = document.getElementById('confirmPurchaseBtn') as HTMLButtonElement | null;

const releaseDialog = document.getElementById('releaseDialog') as HTMLDialogElement | null;
const cancelReleaseBtn = document.getElementById('cancelReleaseBtn') as HTMLButtonElement | null;
const confirmReleaseBtn = document.getElementById('confirmReleaseBtn') as HTMLButtonElement | null;

// --- Initialize i18n ---
WiseCatI18n.init();

// --- Restore Session from LocalStorage (Immediate UI Feedback) ---
console.log("Dashboard loaded at " + new Date().toISOString());
try {
    const cachedUser = localStorage.getItem('wisecat_user');
    if (cachedUser) {
        const u = JSON.parse(cachedUser);
        console.log("✅ Restoring session from localStorage:", u);

        // Update Header
        const headerUserName = document.getElementById('headerUserName');
        const headerUserAvatar = document.getElementById('headerUserAvatar') as HTMLImageElement;

        if (headerUserName) {
            headerUserName.textContent = u.name;
            // Restore click to profile behavior
            headerUserName.onclick = () => {
                const profileTab = document.querySelector('[data-tab="profile"]') as HTMLElement;
                if (profileTab) profileTab.click();
            };
        }
        if (headerUserAvatar) headerUserAvatar.src = u.picture;

        const mobileHeaderAvatar = document.getElementById('mobileHeaderAvatar') as HTMLImageElement;
        if (mobileHeaderAvatar) {
            mobileHeaderAvatar.src = u.picture;
            mobileHeaderAvatar.style.display = 'block';
        }

        // Update Profile Tab
        if (userName) userName.textContent = u.name;
        if (userEmail) userEmail.textContent = u.email;
        if (userAvatar) userAvatar.src = u.picture;

        // Update Credits if available in cache
        if (u.credits !== undefined) {
            const fmt = `$${parseFloat(u.credits).toFixed(2)}`;
            const creditsDisplay = document.getElementById('creditsDisplay');
            const profileCredits = document.getElementById('profileCredits');
            if (creditsDisplay) creditsDisplay.textContent = fmt;
            if (profileCredits) profileCredits.textContent = fmt;
        }
    } else {
        console.warn("⚠️ No 'wisecat_user' found in localStorage.");
    }
} catch (e) {
    console.error("❌ Error restoring session:", e);
}
// ----------------------------------------------------------------

// Auth Check
// Auth Check
onAuthStateChanged(auth, async (user) => {
    const timestamp = new Date().toISOString();
    console.log(`%c[DASHBOARD AUTH ${timestamp}]`, 'color: #22c55e; font-weight: bold;',
        user ? `✅ User logged in: ${user.uid}` : '❌ No user (logged out)');

    // Clear user info on logout button removed as it's handled globally
    // ... logic moved to event listener below

    if (!user) {
        // If we have a cached user, we can wait a bit longer for Firebase to catch up
        const cachedUser = localStorage.getItem('wisecat_user');
        const authState = sessionStorage.getItem('wisecat_auth_state');

        console.log(`%c[DASHBOARD AUTH]`, 'color: #f59e0b; font-weight: bold;', 'No user detected:', {
            hasCachedUser: !!cachedUser,
            authState: authState,
            currentPath: window.location.pathname
        });

        if (cachedUser || authState === 'processing_login' || authState === 'checking') {
            // Check if it is a Guest User
            try {
                const u = JSON.parse(cachedUser || '{}');
                if (u.isGuest) {
                    console.log("🕵️ Guest access detected. Skipping auth enforcement.");
                    currentUser = u;
                    initDashboardUI(u);
                    return; // Allow access
                }
            } catch (e) { }

            console.log(`%c[DASHBOARD AUTH]`, 'color: #3b82f6; font-weight: bold;',
                '⏳ Waiting 5 seconds for Firebase Auth to catch up...');

            // Increased from 3 seconds to 5 seconds
            setTimeout(() => {
                if (!auth.currentUser) {
                    // Last Guest Check before redirect
                    const finalCache = localStorage.getItem('wisecat_user');
                    if (finalCache && JSON.parse(finalCache).isGuest) {
                        console.log("🕵️ Guest access confirmed during timeout.");
                        return;
                    }

                    console.log(`%c[DASHBOARD AUTH]`, 'color: #ef4444; font-weight: bold;',
                        '❌ Still no user after 5s delay. Redirecting to entry...');
                    window.location.href = '/';
                } else {
                    console.log(`%c[DASHBOARD AUTH]`, 'color: #22c55e; font-weight: bold;',
                        '✅ User authenticated after delay:', auth.currentUser.uid);
                }
            }, 5000); // Increased from 3000
            return;
        }

        console.log(`%c[DASHBOARD AUTH]`, 'color: #ef4444; font-weight: bold;',
            '🔄 No cached user or auth state. Redirecting immediately...');
        clearSessionEnforcement();
        window.location.href = '/';
        return;
    }
    currentUser = user;

    if (user) {
        initSessionEnforcement(user); // [NEW] Start session enforcement
        initDashboardUI(user);
    }
});

function initDashboardUI(user: any) {
    const headerUserName = document.getElementById('headerUserName');
    const headerUserAvatar = document.getElementById('headerUserAvatar') as HTMLImageElement;

    // Update user info in Profile tab
    if (userName) userName.textContent = user.displayName || user.name || 'User';
    if (userEmail) userEmail.textContent = user.email || '';
    if (userAvatar && (user.photoURL || user.picture)) {
        userAvatar.src = user.photoURL || user.picture;
    }

    // Update header info
    if (headerUserName) {
        headerUserName.textContent = user.displayName || user.name || 'User';
        // Remove redirect onclick if logged in, or make it go to profile
        headerUserName.onclick = () => {
            const profileTab = document.querySelector('[data-tab="profile"]') as HTMLElement;
            if (profileTab) profileTab.click();
        };
    }
    if (headerUserAvatar && (user.photoURL || user.picture)) {
        headerUserAvatar.src = user.photoURL || user.picture;
    } else if (headerUserAvatar) {
        headerUserAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}`;
    }

    // Mobile Header Avatar
    const mobileHeaderAvatar = document.getElementById('mobileHeaderAvatar') as HTMLImageElement;
    if (mobileHeaderAvatar) {
        const picUrl = user.photoURL || user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}`;
        mobileHeaderAvatar.src = picUrl;
        mobileHeaderAvatar.style.display = 'block'; // Show it now that we have data
    }

    // --- SELF-HEALING: Update LocalStorage Cache ---
    if (!user.isGuest) {
        const sessionData: any = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'User',
            picture: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`,
            // We'll update credits later if we fetch them
        };
        // Merge with existing to keep credits if possible, or just overwrite
        const existing = localStorage.getItem('wisecat_user');
        if (existing) {
            try {
                const parsed = JSON.parse(existing);
                sessionData['credits'] = parsed.credits; // preserve known credits
            } catch (e) { }
        }
        console.log("💾 Dashboard: Healing localStorage session cache.");
        localStorage.setItem('wisecat_user', JSON.stringify(sessionData));
        loadUserSettings();
    } else {
        // Guest Mode: Just load credits from object
        const formattedCredits = `$${(user.credits || 100).toFixed(2)}`;
        if (creditsDisplay) creditsDisplay.textContent = formattedCredits;
        const profileCredits = document.getElementById('profileCredits');
        if (profileCredits) profileCredits.textContent = formattedCredits;
    }
    // -----------------------------------------------
}

// Load User Settings
function loadUserSettings() {
    if (!currentUser) return;

    // Note: 'users' collection is in 'reservation' DB (handled by shared 'db' export)
    // But check if db in firebase-config is "reservation" or default?
    // src/firebase-config.ts exports 'db' as getFirestore(app, "reservation")
    // So we can use it directly.
    const userDoc = doc(db, 'users', `uid_${currentUser.uid}`);

    // Listen to user credits
    onSnapshot(userDoc, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            const credits = data.credits || 0;
            const formattedCredits = `$${credits.toFixed(2)}`;

            // Sync with Inbox
            updateInboxCredits(credits);

            // Update header credits
            if (creditsDisplay) creditsDisplay.textContent = formattedCredits;

            // Update profile tab credits
            const profileCredits = document.getElementById('profileCredits');
            if (profileCredits) profileCredits.textContent = formattedCredits;

            // Update credit progress bar (max $50 = 100%)
            const maxCredits = 50;
            const percentage = Math.min((credits / maxCredits) * 100, 100);
            const progressBar = document.getElementById('creditProgressBar');

            if (progressBar) {
                progressBar.style.width = `${percentage}%`;

                // Dynamic color based on percentage
                if (percentage < 25) {
                    progressBar.style.background = '#ef4444'; // Red (0-25%)
                } else if (percentage < 50) {
                    progressBar.style.background = 'linear-gradient(90deg, #ef4444 0%, #f59e0b 100%)'; // Red→Yellow
                } else if (percentage < 75) {
                    progressBar.style.background = 'linear-gradient(90deg, #f59e0b 0%, #22c55e 100%)'; // Yellow→Green
                } else {
                    progressBar.style.background = '#22c55e'; // Green (75-100%)
                }
            }
        }
    });

    // Listen to phone number settings
    const settingsDoc = doc(db, 'users', `uid_${currentUser.uid}`, 'settings', 'settings');
    onSnapshot(settingsDoc, (snapshot) => {
        if (snapshot.exists()) {
            const settings = snapshot.data();
            const myNumberSection = document.getElementById('myNumberSection');
            const searchNumberSection = document.getElementById('searchNumberSection');
            const tableBody = document.getElementById('myNumberTableBody');

            if (settings.phoneNumberStatus === 'active' && settings.phoneNumber) {
                // HIDE Search, SHOW Table
                if (searchNumberSection) searchNumberSection.hidden = true;
                if (myNumberSection) myNumberSection.hidden = false;

                // Populate Table Row
                if (tableBody) {
                    const capabilities = settings.capabilities || {};
                    const capsHtml = `
                        <div style="display: flex; gap: 8px;">
                            ${capabilities.voice || capabilities.Voice ? '<span>📞 Voice</span>' : ''}
                            ${capabilities.sms || capabilities.SMS ? '<span>💬 SMS</span>' : ''}
                        </div>
                    `;

                    // Mask Phone ID
                    const rawId = settings.vapiPhoneNumberId || '';
                    let maskedId = '-';
                    if (rawId && rawId.length > 10) {
                        maskedId = rawId.substring(0, 4) + '••••' + rawId.substring(rawId.length - 4);
                    } else {
                        maskedId = rawId;
                    }

                    tableBody.innerHTML = `
                        <tr>
                            <td style="padding: 10px; font-weight: bold; color: var(--success); vertical-align: middle;">
                                ${settings.phoneNumber}
                                <div id="myNumberSmsRate" style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal; margin-top: 2px;">
                                    Fetching SMS rate...
                                </div>
                            </td>
                            <td style="padding: 10px; font-family: monospace; color: var(--text-secondary); vertical-align: middle;">
                                ${maskedId}
                            </td>
                            <td style="padding: 10px; vertical-align: middle;">
                                <input type="text" id="friendlyNameInput" 
                                    value="${settings.friendlyName || ''}" 
                                    placeholder="Enter label..."
                                    style="background: transparent; border: 1px solid var(--border); color: var(--text-primary); padding: 4px 8px; border-radius: 4px; width: 100%; max-width: 150px;">
                            </td>
                            <!-- Added Purchased Date Column -->
                            <td style="padding: 10px; color: var(--text-muted); font-size: 0.9rem; vertical-align: middle;">
                                ${(() => {
                            if (!settings.phoneNumberPurchasedAt) return 'N/A';
                            const d = typeof settings.phoneNumberPurchasedAt.toDate === 'function'
                                ? settings.phoneNumberPurchasedAt.toDate()
                                : new Date(settings.phoneNumberPurchasedAt);
                            return isNaN(d.getTime()) ? 'N/A' : WiseCatI18n.formatDate(d);
                        })()}
                            </td>
                            <td style="padding: 10px; vertical-align: middle;">
                                ${capsHtml}
                            </td>
                            <td style="padding: 10px; vertical-align: middle;">
                                <button id="releaseBtnInTable" class="btn btn-outline-danger" style="padding: 4px 8px; font-size: 0.85rem;">Release</button>
                            </td>
                        </tr>
                    `;

                    // Update SMS rate asynchronously
                    (async () => {
                        const countryCode = settings.phoneNumber.startsWith('+1') ? 'US' : 'GB'; // Simple heuristic or improve later
                        const rateInfo = await getCachedSMSRate(countryCode);
                        const rateEl = document.getElementById('myNumberSmsRate');
                        if (rateEl) {
                            rateEl.innerHTML = `<i class="bi bi-chat-dots"></i> Inbound SMS: ${rateInfo.currency}${rateInfo.rate.toFixed(3)}/msg`;
                        }
                    })();

                    // Safe Date Parsing Logic
                    const getJsDate = (val: any) => {
                        if (!val) return null;
                        const d = typeof val.toDate === 'function' ? val.toDate() : new Date(val);
                        return isNaN(d.getTime()) ? null : d;
                    };

                    const purchaseDate = getJsDate(settings.phoneNumberPurchasedAt);
                    const renewDateStr = purchaseDate
                        ? WiseCatI18n.formatDate(new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000))
                        : 'Monthly';

                    // Add Renewal Warning Footer
                    const warningConfig = {
                        monthlyCost: settings.monthlyCost || '$3.45',
                        renewDate: renewDateStr,
                        purchaseDateStr: purchaseDate ? WiseCatI18n.formatDate(purchaseDate) : 'N/A'
                    };

                    const footer = document.createElement('div');
                    footer.style.marginTop = '10px';
                    footer.style.padding = '10px';
                    footer.style.background = 'rgba(255, 193, 7, 0.1)';
                    footer.style.border = '1px solid rgba(255, 193, 7, 0.3)';
                    footer.style.borderRadius = '6px';
                    footer.style.color = 'var(--text-secondary)';
                    footer.style.fontSize = '0.85rem';
                    footer.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <i class="bi bi-info-circle text-warning"></i>
                            <span>
                                <strong>Monthly Cost:</strong> ${warningConfig.monthlyCost} (Auto-renews). 
                                Please ensure you have sufficient credits. 
                                <br>
                                <span style="font-size: 0.8rem; opacity: 0.8;">
                                    Purchased: ${warningConfig.purchaseDateStr} | Next billing estimate: ${warningConfig.renewDate}
                                </span>
                            </span>
                        </div>
                    `;
                    // Append footer to the section container (parent of table-responsive)
                    // We need to find where tableBody is. It's inside a table.
                    // The 'tableBody' is passed or found? 
                    // 'tableBody' variable is defined in the scope (lines 280-ish).
                    // We should append to 'myNumberSection' or after the table.
                    // 'myNumberSection' contains the table.
                    const container = document.getElementById('myNumberSection');
                    // Remove old footer if exists
                    const oldFooter = document.getElementById('renewalWarningFooter');
                    if (oldFooter) oldFooter.remove();
                    footer.id = 'renewalWarningFooter';
                    if (container) container.appendChild(footer);


                    // Re-attach release button listener
                    const releaseBtnInTable = document.getElementById('releaseBtnInTable');
                    if (releaseBtnInTable) {
                        releaseBtnInTable.addEventListener('click', () => {
                            if (releaseDialog) releaseDialog.showModal();
                        });
                    }

                    // Attach Friendly Name Edit Listener
                    const friendlyNameInput = document.getElementById('friendlyNameInput') as HTMLInputElement;
                    if (friendlyNameInput) {
                        friendlyNameInput.addEventListener('change', async (e) => {
                            const params = (e.target as HTMLInputElement).value;
                            try {
                                // We have 'doc' and 'db' imported at top.
                                // We can use: import { updateDoc } from "firebase/firestore";
                                // But let's check imports at top of file needed.
                                // Actually, I'll use the 'doc' ref we already have: settingsDoc
                                // We need 'updateDoc' or 'setDoc'. importing dynamically or assuming availability.
                                // Let's use dynamic import to be safe if not at top, or just use existing imports.
                                // Checking imports: 'import { doc, onSnapshot } from "firebase/firestore";'
                                // Need to add 'setDoc' to imports? No, I can't edit top of file easily with this tool if I don't target it.
                                // I'll use dynamic import for updateDoc to be safe and clean.
                                const { updateDoc } = await import("firebase/firestore");
                                await updateDoc(settingsDoc, { friendlyName: params });
                                console.log("Friendly Name updated to:", params);

                                // Optional: Visual feedback
                                friendlyNameInput.style.borderColor = 'var(--success)';
                                setTimeout(() => friendlyNameInput.style.borderColor = 'var(--border)', 1000);
                            } catch (err) {
                                console.error("Failed to update friendly name:", err);
                                alert("Failed to save name.");
                            }
                        });
                    }
                }
            } else {
                // SHOW Search, HIDE Table
                if (searchNumberSection) searchNumberSection.hidden = false;
                if (myNumberSection) myNumberSection.hidden = true;
            }

            // Handle Shared Number Display (Persisted)
            if (settings.phoneNumberType === 'shared' && settings.phoneNumber) {
                // User is using a shared number - show the temp shared number section
                if (tempSharedNumberSection) {
                    tempSharedNumberSection.hidden = false;

                    // Update the phone number display with actual number from Firestore
                    const phoneDisplay = tempSharedNumberSection.querySelector('span[style*="color: var(--success)"]') as HTMLElement;
                    if (phoneDisplay) {
                        // Format the phone number
                        const phone = settings.phoneNumber;
                        // Simple formatting: +1234567890 -> +1 (234) 567-8900
                        let formatted = phone;
                        if (phone.startsWith('+1') && phone.length === 12) {
                            formatted = `${phone.slice(0, 2)} (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
                        }
                        phoneDisplay.textContent = formatted;
                    }
                }

                // Hide the dedicated number section
                if (searchNumberSection) searchNumberSection.hidden = true;
                if (myNumberSection) myNumberSection.hidden = true;
            } else if (tempSharedNumberSection && settings.phoneNumberType !== 'shared') {
                // Hide temp shared section if user doesn't have a shared number
                tempSharedNumberSection.hidden = true;
            }

            // Sync Requirement UI (legacy support for reminders)
            hasActivePhoneNumber = (settings.phoneNumberStatus === 'active' && !!settings.phoneNumber);
            if (noNumberReminder) {
                noNumberReminder.style.display = hasActivePhoneNumber ? 'none' : 'flex';
            }
        } else {
            // No settings doc yet
            const myNumberSection = document.getElementById('myNumberSection');
            const searchNumberSection = document.getElementById('searchNumberSection');
            if (myNumberSection) myNumberSection.hidden = true;
            if (searchNumberSection) searchNumberSection.hidden = false;
        }
    });
}



// Search Numbers
if (searchBtn) {
    searchBtn.addEventListener('click', async () => {
        // Validation: Check if user is logged in
        if (!auth.currentUser) {
            alert("Please log in to search for numbers.");
            return;
        }

        const countrySelect = document.getElementById('countrySelect') as HTMLSelectElement | null;
        const numberTypeSelect = document.getElementById('numberTypeSelect') as HTMLSelectElement | null;
        const voiceCapability = document.getElementById('voiceCapability') as HTMLInputElement | null;
        const smsCapability = document.getElementById('smsCapability') as HTMLInputElement | null;


        const country = countrySelect?.value || 'US';
        const areaCode = areaCodeInput?.value.trim() || '';
        const voice = voiceCapability?.checked || false;
        const sms = smsCapability?.checked || false;


        // Validate at least one capability is selected
        if (!voice && !sms) {
            alert('Please select at least one capability (Voice or SMS)');
            return;
        }

        if (resultsCard && numbersList) {
            resultsCard.hidden = false;
            numbersList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Searching...</div>';
        }
        searchBtn.disabled = true;

        try {
            const fetchStart = Date.now();
            console.log(`[Frontend] Search started for ${country}`);

            const searchNumbers = httpsCallable(functions, 'searchNumbers');
            const result = await searchNumbers({
                country,
                areaCode,
                voice,
                sms,

                type: numberTypeSelect?.value || 'local'
            });
            const fetchDuration = Date.now() - fetchStart;
            console.log(`[Frontend] Search API call took ${fetchDuration}ms`);

            const numbers = (result.data as any).numbers || [];

            if (!numbersList) return;

            if (numbers.length === 0) {
                numbersList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No numbers available with selected criteria</div>';
                return;
            }

            // Display numbers
            numbersList.innerHTML = '';
            numbers.forEach((number: any) => {
                const capabilities = number.capabilities || {};
                const badges: string[] = [];
                if (capabilities.voice) badges.push('<span class="capability-tag capability-voice">Voice</span>');
                if (capabilities.SMS) badges.push('<span class="capability-tag capability-sms">SMS</span>');


                // Backend now filters out 'business' numbers, so we just display what we get.
                // Address requirements are hidden from UI as requested ("dont show this to client").

                const baseCost = number.cost || 3.00;
                const monthlyPrice = baseCost * 2;

                const card = document.createElement('div');
                card.className = 'number-card';
                card.innerHTML = `
                    <div class="number-card-header">
                        <div class="number-card-phone">${number.phoneNumber}</div>
                        <div class="number-card-location">${number.locality || ''}, ${number.region || country}</div>
                    </div>
                    <div class="number-card-capabilities">
                        ${badges.join('')}
                        <div class="sms-rate-badge" data-country="${country}" style="font-size: 0.75rem; background: rgba(255,255,255,0.05); padding: 2px 6px; border-radius: 4px; margin-top: 4px; color: var(--text-muted);">
                            Loading SMS rate...
                        </div>
                    </div>
                    <div class="buy-button-container">
                        <button class="btn btn-primary btn-full">Buy $${monthlyPrice.toFixed(2)}/mo</button>
                    </div>
                `;

                const buyBtn = card.querySelector('button') as HTMLButtonElement;
                buyBtn.addEventListener('click', () => openPurchaseDialog(number, monthlyPrice));

                numbersList.appendChild(card);
            });

            // Update SMS rates in search results (only when searched)
            const rateBadges = document.querySelectorAll('.sms-rate-badge');
            rateBadges.forEach(async (badge) => {
                const countryCode = badge.getAttribute('data-country') || 'US';
                const rateInfo = await getCachedSMSRate(countryCode);
                badge.innerHTML = `<i class="bi bi-chat-dots"></i> SMS Rx: ${rateInfo.currency}${rateInfo.rate.toFixed(3)}/msg`;
            });

        } catch (error: any) {
            if (numbersList) {
                numbersList.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--danger);">❌ ${error.message || 'Failed to search numbers'}</div>`;
            }
            console.error('Search error:', error);
        } finally {
            searchBtn.disabled = false;

        }
    });
}

// [TASK 2 Integration] Shared Number Elements
const tempSharedNumberSection = document.getElementById('tempSharedNumberSection');
const upgradeToPermanentBtn = document.getElementById('upgradeToPermanentBtn') as HTMLButtonElement;

// Initialize available shared numbers list
async function initializeSharedNumbersList() {
    const availableNumbersList = document.getElementById('availableNumbersList') as HTMLElement;
    if (!availableNumbersList) return;

    try {
        const { getAllSharedNumbers } = await import('./shared-number-config');
        const sharedNumbers = getAllSharedNumbers();

        if (!sharedNumbers || sharedNumbers.length === 0) {
            availableNumbersList.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 1rem;">No shared numbers available at this time.</div>';
            return;
        }

        // Display top 10 numbers
        const topNumbers = sharedNumbers.slice(0, 10);

        availableNumbersList.innerHTML = topNumbers.map((num) => {
            const formatted = num.phoneNumber.startsWith('+1') && num.phoneNumber.length === 12
                ? `${num.phoneNumber.slice(0, 2)} (${num.phoneNumber.slice(2, 5)}) ${num.phoneNumber.slice(5, 8)}-${num.phoneNumber.slice(8)}`
                : num.phoneNumber;

            return `
                <button
                    class="shared-number-item"
                    data-number-id="${num.id}"
                    data-phone="${num.phoneNumber}"
                    data-vapi-id="${num.vapiPhoneNumberId}"
                    style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; border: 1px solid var(--border); border-radius: 8px; background: rgba(59, 130, 246, 0.03); cursor: pointer; transition: all 0.2s; text-align: left;">
                    <div>
                        <div style="font-family: monospace; font-size: 1.1rem; color: var(--accent); font-weight: 600;">
                            ${formatted}
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
                            Available • $3.50 per call
                        </div>
                    </div>
                    <div style="font-size: 1.5rem;">📞</div>
                </button>
            `;
        }).join('');

        // Add click handlers for each number
        document.querySelectorAll('.shared-number-item').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const button = btn as HTMLElement;
                const phoneNumber = button.dataset.phone || '';
                const vapiId = button.dataset.vapiId || '';

                const user = auth.currentUser;
                if (!user) {
                    showToast("Please log in first.", "error");
                    return;
                }

                // Show confirmation dialog for this specific number
                const confirmed = await showSharedNumberConfirmationDialog(phoneNumber);
                if (!confirmed) return;

                // Disable all buttons during transaction
                document.querySelectorAll('.shared-number-item').forEach(b => {
                    (b as HTMLButtonElement).disabled = true;
                });

                try {
                    const { doc, setDoc } = await import("firebase/firestore");
                    const { db } = await import("./firebase-config");

                    // Save shared number to settings (NO cost deduction yet - will deduct on call submission)
                    const settingsRef = doc(db, 'users', `uid_${user.uid}`, 'settings', 'settings');

                    await setDoc(settingsRef, {
                        phoneNumber: phoneNumber,
                        phoneNumberStatus: 'active',
                        vapiPhoneNumberId: vapiId,
                        phoneNumberType: 'shared',
                        sharedNumberActivatedAt: new Date().toISOString()
                    }, { merge: true });

                    showToast("✅ Shared number ready! Cost ($3.50) will be deducted when you make a call.", "success");

                    // Hide the activation section and show temp number section
                    const sharedPoolCard = document.getElementById('sharedPoolCard');
                    if (sharedPoolCard) {
                        sharedPoolCard.hidden = true;
                    }
                    if (tempSharedNumberSection) {
                        tempSharedNumberSection.hidden = false;
                    }

                } catch (error) {
                    console.error("Error activating shared number:", error);
                    showToast("Failed to activate shared number. Please try again.", "error");
                } finally {
                    // Re-enable all buttons
                    document.querySelectorAll('.shared-number-item').forEach(b => {
                        (b as HTMLButtonElement).disabled = false;
                    });
                }
            });

            // Add hover effect
            btn.addEventListener('mouseenter', () => {
                (btn as HTMLElement).style.borderColor = 'var(--accent)';
                (btn as HTMLElement).style.background = 'rgba(59, 130, 246, 0.1)';
            });
            btn.addEventListener('mouseleave', () => {
                (btn as HTMLElement).style.borderColor = 'var(--border)';
                (btn as HTMLElement).style.background = 'rgba(59, 130, 246, 0.03)';
            });
        });

    } catch (error) {
        console.error("Error initializing shared numbers list:", error);
        availableNumbersList.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 1rem;">Failed to load available numbers.</div>';
    }
}

// Updated helper function to show shared number dialog with specific phone number
function showSharedNumberConfirmationDialog(phoneNumber?: string): Promise<boolean> {
    return new Promise((resolve) => {
        const dialog = document.getElementById('sharedNumberDialog') as HTMLDialogElement;
        const confirmBtn = document.getElementById('confirmSharedBtn') as HTMLButtonElement;
        const cancelBtn = document.getElementById('cancelSharedBtn') as HTMLButtonElement;

        // Update dialog content with the specific phone number if provided
        if (phoneNumber) {
            const numberDisplay = dialog.querySelector('[style*="monospace"]') as HTMLElement;
            if (numberDisplay) {
                const formatted = phoneNumber.startsWith('+1') && phoneNumber.length === 12
                    ? `${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)}-${phoneNumber.slice(8)}`
                    : phoneNumber;
                numberDisplay.textContent = formatted;
            }
        }

        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            dialog.removeEventListener('cancel', handleCancel);
            dialog.close();
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        dialog.addEventListener('cancel', handleCancel);

        dialog.showModal();
    });
}

// Initialize the shared numbers list when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeSharedNumbersList();
});

// Upgrade to permanent number button
if (upgradeToPermanentBtn) {
    upgradeToPermanentBtn.addEventListener('click', () => {
        // Switch to the phone numbers tab (switchTab expects tab name without "Tab" suffix)
        if ((window as any).switchTab) {
            (window as any).switchTab('add');
        }
        showToast("Browse available numbers to get your own permanent business number!", "info");
    });
}

if (rateCheckBtn && rateCheckInput && rateResult) {
    rateCheckBtn.addEventListener('click', async () => {
        const country = rateCheckInput.value.trim().toUpperCase();
        if (!country) {
            ScamCheck.showToast("Please enter a country code (e.g. US, GB)", "error");
            return;
        }

        rateResult.innerHTML = '<span style="color: var(--text-secondary);">Checking rates...</span>';
        rateCheckBtn.disabled = true;

        try {
            const getCallRates = httpsCallable(functions, 'getCallRates');
            const result = await getCallRates({ country });
            const data = result.data as any;

            // Display Logic
            let html = `<div style="margin-top:0.5rem; padding:0.5rem; background:rgba(0,0,0,0.2); border-radius:6px;">`;
            html += `<div style="font-weight:bold; margin-bottom:4px; display:flex; justify-content:space-between;">
                        <span>${data.country} Rates</span>
                        <span style="font-size:0.8em; color:var(--accent);">${data.currency} (x${data.multiplier})</span>
                     </div>`;

            // Outbound Sample
            if (data.outbound && data.outbound.length > 0) {
                const p = data.outbound[0]; // Show first prefix usually
                html += `<div style="font-size:0.9rem;">📞 Outbound: <strong>${p.user_price.toFixed(3)}</strong> / min</div>`;
            } else {
                html += `<div style="font-size:0.9rem;">📞 Outbound: N/A</div>`;
            }

            // Inbound Sample
            if (data.inbound && data.inbound.length > 0) {
                const p = data.inbound.find((x: any) => x.type === 'local') || data.inbound[0];
                html += `<div style="font-size:0.9rem;">📱 Inbound: <strong>${p.user_price.toFixed(3)}</strong> / min</div>`;
            }
            html += `</div>`;

            rateResult.innerHTML = html;

        } catch (e: any) {
            console.error("Rate check failed:", e);
            rateResult.innerHTML = `<span style="color: var(--danger);">Error: ${e.message}</span>`;
        } finally {
            rateCheckBtn.disabled = false;
        }
    });
}

// USAGE HISTORY LOGIC
async function loadUsageHistory() {
    if (!usageTableBody) return;

    // Check cache or loading state? 
    // Just load every time user clicks Dashboard? Or explicit refresh?
    // We'll reset to loading only if empty
    if (usageTableBody.children.length === 0 || usageTableBody.firstElementChild?.textContent?.includes("Loading")) {
        usageTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-secondary);">Loading usage data...</td></tr>';
    }

    // Guest Mode Check
    if (currentUser && currentUser.isGuest) {
        usageTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding: 3rem 1rem;">
                    <div style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 1rem;">
                        Authentication required to view payment & usage history.
                    </div>
                    <button class="btn btn-primary" onclick="window.location.href='/'">
                        Sign In / Sign Up
                    </button>
                </td>
            </tr>
        `;
        return;
    }

    try {
        const getTransformedUsageHistory = httpsCallable(functions, 'getTransformedUsageHistory');
        const result = await getTransformedUsageHistory();
        const { usage, multiplier } = result.data as any;

        // Update Cost Header to show multiplier
        const costHeader = document.querySelector('.usage-table th:nth-child(4)');
        if (costHeader && multiplier) {
            costHeader.textContent = `Cost (x${multiplier})`;
            costHeader.setAttribute('title', `Base provider cost x ${multiplier} margin`);
        }

        if (!usage || usage.length === 0) {
            usageTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-secondary);">No usage history found for the last 30 days.</td></tr>';
            return;
        }

        usageTableBody.innerHTML = usage.map((item: any) => {
            let dateStr = 'N/A';
            try {
                // Backend now returns ISO strings for daily records
                if (item.start_date) {
                    const d = new Date(item.start_date);
                    // If the time is exactly midnight UTC, it's likely a Twilio daily aggregate, so show date only.
                    // Otherwise, show date and time for specific Firestore call logs.
                    const isMidnight = d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;

                    if (isMidnight) {
                        dateStr = WiseCatI18n.formatDate(d, { month: 'short', day: 'numeric', year: 'numeric' });
                    } else {
                        dateStr = WiseCatI18n.formatDate(d, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    }
                }
            } catch (e) {
                console.warn("Date parse error", e);
            }

            const cost = parseFloat((item.user_price || 0).toString()).toFixed(2);

            // Determine Type and Description
            let type = "Usage";
            let desc = item.description || item.category;

            if (item.category === "phone-number" || item.category === "phonenumbers") type = "Number";
            else if (item.category && item.category.includes("sms")) type = "SMS";
            else if (item.category && item.category.includes("calls")) type = "Voice";
            else if (item.description && item.description.toLowerCase().includes("recording")) type = "Recording";

            // Clean up description if it's just the category name
            if (desc === item.category) {
                desc = desc.charAt(0).toUpperCase() + desc.slice(1);
            }

            return `
                <tr>
                    <td>${dateStr}</td>
                    <td><span class="capability-tag ${type === 'Number' ? 'capability-voice' : type === 'SMS' ? 'capability-sms' : 'capability-mms'}">${type}</span></td>
                    <td>${desc}</td>
                    <td style="color: var(--warning); font-weight:600;">$${cost}</td>
                </tr>
            `;
        }).join('');

    } catch (e: any) {
        console.error("Failed to load usage:", e);
        usageTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color: var(--danger);">Failed to load history: ${e.message}</td></tr>`;
    }
}

if (refreshUsageBtn) {
    refreshUsageBtn.addEventListener('click', async () => {
        // Show loading animation
        const spinner = document.getElementById('refreshSpinner') as HTMLVideoElement;
        const gradient = document.getElementById('refreshGradient') as HTMLElement;

        if (spinner && gradient) {
            // Aggressively hide gradient
            gradient.setAttribute('style', 'display: none !important; opacity: 0 !important; visibility: hidden !important;');
            spinner.setAttribute('style', 'display: block !important; position: absolute; top: 0; left: 0; object-fit: cover; z-index: 10;');
            spinner.play();
        }

        try {
            await loadUsageHistory();
        } finally {
            // Hide loading animation after refresh completes
            if (spinner && gradient) {
                spinner.pause();
                spinner.currentTime = 0;
                spinner.setAttribute('style', 'display: none; position: absolute; top: 0; left: 0; object-fit: cover; z-index: 10;');
                gradient.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;');
            }
        }
    });
}

// Open Purchase Dialog
function openPurchaseDialog(number: any, price: number = 3.00) {
    selectedNumber = number;
    if (confirmPhoneNumber) confirmPhoneNumber.textContent = number.phoneNumber;
    if (confirmLocation) confirmLocation.textContent = `${number.locality || ''}, ${number.region || ''}`;

    // Update dialog price text if element exists (you might need to add this ID to HTML first, 
    // but for now let's just update the button text if needed, or assume fixed price UI)
    // Actually, let's update the confirm button text to show price
    if (confirmPurchaseBtn) confirmPurchaseBtn.textContent = `Purchase for $${price.toFixed(2)}`;

    if (purchaseDialog) purchaseDialog.showModal();
}

// Cancel Purchase
if (cancelPurchaseBtn) {
    cancelPurchaseBtn.addEventListener('click', () => {
        if (purchaseDialog) purchaseDialog.close();
        selectedNumber = null;
    });
}

// Confirm Purchase
if (confirmPurchaseBtn) {
    confirmPurchaseBtn.addEventListener('click', async () => {
        if (!selectedNumber) return;

        confirmPurchaseBtn.disabled = true;
        confirmPurchaseBtn.textContent = 'Purchasing...';

        try {
            const purchasePhoneNumber = httpsCallable(functions, 'purchasePhoneNumber');
            await purchasePhoneNumber({ phoneNumber: selectedNumber.phoneNumber });

            if (purchaseDialog) purchaseDialog.close();
            alert('✅ Phone number purchased successfully!');

            // Clear search results
            if (numbersList) numbersList.innerHTML = '';
            if (areaCodeInput) areaCodeInput.value = '';

        } catch (error: any) {
            alert('❌ Purchase failed: ' + error.message);
            console.error('Purchase error:', error);
        } finally {
            confirmPurchaseBtn.disabled = false;
            confirmPurchaseBtn.textContent = 'Purchase';
            selectedNumber = null;
        }
    });
}

// Release Number
if (releaseBtn) {
    releaseBtn.addEventListener('click', () => {
        if (releaseDialog) releaseDialog.showModal();
    });
}

if (cancelReleaseBtn) {
    cancelReleaseBtn.addEventListener('click', () => {
        if (releaseDialog) releaseDialog.close();
    });
}

if (confirmReleaseBtn) {
    confirmReleaseBtn.addEventListener('click', async () => {
        confirmReleaseBtn.disabled = true;
        confirmReleaseBtn.textContent = 'Releasing...';

        try {
            const releasePhoneNumber = httpsCallable(functions, 'releasePhoneNumber');
            await releasePhoneNumber();

            if (releaseDialog) releaseDialog.close();
            alert('✅ Phone number released successfully!');

        } catch (error: any) {
            alert('❌ Release failed: ' + error.message);
            console.error('Release error:', error);
        } finally {
            confirmReleaseBtn.disabled = false;
            confirmReleaseBtn.textContent = 'Yes, Release';
        }
    });
}

// Tab Navigation
const navItems = document.querySelectorAll('.nav-item');
const tabSections = document.querySelectorAll('.tab-section');

// Function to activate tab
function activateTab(tabName: string) {
    // Validate tab name
    const targetTab = document.getElementById(`${tabName}Tab`);
    if (!targetTab) return;

    // Remove active from all nav items
    navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Hide all tab sections
    tabSections.forEach(section => section.classList.remove('active'));

    // Show selected tab
    targetTab.classList.add('active');

    // Update Header Title
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) {
        let title = 'WiseCat AI - Dashboard';
        switch (tabName) {
            case 'profile':
                title = 'WiseCat AI - Profile';
                break;
            case 'add':
                title = 'WiseCat AI - Phone Number';
                break;
            case 'inbox':
                title = 'WiseCat AI - Inbox';
                break;
            default:
                title = 'WiseCat AI - Dashboard';
        }
        headerTitle.textContent = title;
    }

    // Persist to localStorage
    localStorage.setItem('wisecat_active_tab', tabName);

    // If Profile, load usage history if needed
    if (tabName === 'profile') {
        loadUsageHistory();
    }
}

// Expose to window for inline onclick handlers
(window as any).switchTab = activateTab;

navItems.forEach(navItem => {
    navItem.addEventListener('click', () => {
        const tabName = navItem.getAttribute('data-tab');
        if (tabName) activateTab(tabName);
    });
});

// Restore Tab on Load
// Restore Tab on Load
document.addEventListener('DOMContentLoaded', () => {
    // Check URL Params first
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');

    let savedTab = tabFromUrl || localStorage.getItem('wisecat_active_tab');
    if (savedTab === 'dashboard') savedTab = 'profile'; // Handle grandfathered 'dashboard' state

    // Check if tab element exists
    if (savedTab && document.getElementById(`${savedTab}Tab`)) {
        activateTab(savedTab);
    } else {
        activateTab('ai'); // Default fallback to AI Services
    }
});

// AI Dropdown Logic
const aiDropdownToggle = document.getElementById('aiDropdownToggle');
const aiDropdownMenu = document.getElementById('aiDropdownMenu');

if (aiDropdownToggle && aiDropdownMenu) {
    aiDropdownToggle.addEventListener('click', (e) => {
        // Toggle dropdown visibility
        aiDropdownMenu.classList.toggle('show');
        e.stopPropagation();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (aiDropdownMenu.classList.contains('show')) {
            if (!aiDropdownToggle.contains(e.target as Node) && !aiDropdownMenu.contains(e.target as Node)) {
                aiDropdownMenu.classList.remove('show');
            }
        }
    });

    // Also close on tab switch if not AI? 
    // Actually, if we switch away from AI tab, we probably want to close it?
    // Let's leave it simple for now.
}
// --- Logout Logic ---
function handleLogout() {
    clearSessionEnforcement(); // [NEW] Stop listening
    signOut(auth).then(() => {
        localStorage.removeItem('wisecat_user');
        window.location.href = '/';
    }).catch((err) => {
        console.error("Logout error:", err);
    });
}

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', handleLogout);

// --- AI Service Protection ---
function handleAIServiceClick(e: Event) {
    if (!hasActivePhoneNumber) {
        e.preventDefault();
        noNumberDialog?.showModal();
    }
}

linkRestaurant?.addEventListener('click', handleAIServiceClick);
linkMouthpiece?.addEventListener('click', handleAIServiceClick);

goToAddTabBtn?.addEventListener('click', () => {
    noNumberDialog?.close();
    // Simulate clicking the "Add" tab button
    const addTabBtn = document.querySelector('[data-tab="add"]') as HTMLButtonElement | null;
    if (addTabBtn) {
        addTabBtn.click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

closeNoNumberBtn?.addEventListener('click', () => {
    noNumberDialog?.close();
});
