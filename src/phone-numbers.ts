import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app, auth, db } from "./firebase-config"; // Use shared config

const functions = getFunctions(app);

// State
let currentUser: any = null;
let selectedNumber: any = null;

// Elements (make optional since not all pages have all elements)
const areaCodeInput = document.getElementById('areaCodeInput') as HTMLInputElement | null;
const searchBtn = document.getElementById('searchBtn') as HTMLButtonElement | null;
const resultsCard = document.getElementById('resultsCard') as HTMLElement | null;
const numbersList = document.getElementById('numbersList') as HTMLUListElement | null;

const phoneNumberCard = document.getElementById('phoneNumberCard') as HTMLElement | null;
const currentPhoneNumber = document.getElementById('currentPhoneNumber') as HTMLElement | null;
const purchasedDate = document.getElementById('purchasedDate') as HTMLElement | null;
const phoneStatus = document.getElementById('phoneStatus') as HTMLElement | null;
const releaseBtn = document.getElementById('releaseBtn') as HTMLButtonElement | null;

const userName = document.getElementById('userName') as HTMLElement | null;
const userEmail = document.getElementById('userEmail') as HTMLElement | null;
const userAvatar = document.getElementById('userAvatar') as HTMLImageElement | null;
const creditsDisplay = document.getElementById('creditsDisplay') as HTMLElement | null;
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement | null;

// Dialogs
const purchaseDialog = document.getElementById('purchaseDialog') as HTMLDialogElement | null;
const confirmPhoneNumber = document.getElementById('confirmPhoneNumber') as HTMLElement | null;
const confirmLocation = document.getElementById('confirmLocation') as HTMLElement | null;
const cancelPurchaseBtn = document.getElementById('cancelPurchaseBtn') as HTMLButtonElement | null;
const confirmPurchaseBtn = document.getElementById('confirmPurchaseBtn') as HTMLButtonElement | null;

const releaseDialog = document.getElementById('releaseDialog') as HTMLDialogElement | null;
const cancelReleaseBtn = document.getElementById('cancelReleaseBtn') as HTMLButtonElement | null;
const confirmReleaseBtn = document.getElementById('confirmReleaseBtn') as HTMLButtonElement | null;

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
    console.log("🔥 onAuthStateChanged event:", user ? `Logged in as ${user.uid}` : "Logged out (null)");
    const headerUserName = document.getElementById('headerUserName');
    const headerCredits = document.getElementById('creditsDisplay');
    const headerUserAvatar = document.getElementById('headerUserAvatar') as HTMLImageElement;

    if (!user) {
        console.log("No user logged in on dashboard.");
        if (headerUserName) {
            headerUserName.textContent = 'Guest (Login)';
            headerUserName.onclick = () => window.location.href = '/Entry.html';
        }
        if (headerUserAvatar) {
            headerUserAvatar.src = "https://ui-avatars.com/api/?name=Guest";
        }
        return;
    }

    currentUser = user;

    if (user) {
        // Update user info in Profile tab
        if (userName) userName.textContent = user.displayName || 'User';
        if (userEmail) userEmail.textContent = user.email || '';
        if (userAvatar && user.photoURL) {
            userAvatar.src = user.photoURL;
        }

        // Update header info
        if (headerUserName) {
            headerUserName.textContent = user.displayName || 'User';
            // Remove redirect onclick if logged in, or make it go to profile
            headerUserName.onclick = () => {
                const profileTab = document.querySelector('[data-tab="profile"]') as HTMLElement;
                if (profileTab) profileTab.click();
            };
        }
        if (headerUserAvatar && user.photoURL) {
            headerUserAvatar.src = user.photoURL;
        } else if (headerUserAvatar) {
            headerUserAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`;
        }

        // --- SELF-HEALING: Update LocalStorage Cache ---
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
        // -----------------------------------------------

        loadUserSettings();
    }
});

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

            if (settings.phoneNumberStatus === 'active' && settings.phoneNumber) {
                // Show current number
                if (phoneNumberCard) phoneNumberCard.hidden = false;
                if (currentPhoneNumber) currentPhoneNumber.textContent = settings.phoneNumber;
                if (phoneStatus) phoneStatus.textContent = 'Active';

                if (settings.phoneNumberPurchasedAt && purchasedDate) {
                    const date = settings.phoneNumberPurchasedAt.toDate();
                    purchasedDate.textContent = date.toLocaleDateString();
                }

                // Show Twilio credentials (masked)
                const twilioCredsCard = document.getElementById('twilioCredsCard');
                const twilioSidMasked = document.getElementById('twilioSidMasked');
                const twilioTokenMasked = document.getElementById('twilioTokenMasked');

                if (twilioCredsCard && settings.twilioSubaccountSid && settings.twilioSubaccountAuthToken) {
                    twilioCredsCard.hidden = false;
                    if (twilioSidMasked) {
                        twilioSidMasked.textContent = maskCredential(settings.twilioSubaccountSid);
                    }
                    if (twilioTokenMasked) {
                        twilioTokenMasked.textContent = maskCredential(settings.twilioSubaccountAuthToken);
                    }
                }

                // Hide search button and show message in Add tab
                if (searchBtn) searchBtn.disabled = true;
                const addTabMessage = document.createElement('div');
                addTabMessage.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--text-secondary);"><div style="font-size: 3rem; margin-bottom: 1rem;">📱</div><div style="font-size: 1.2rem; margin-bottom: 0.5rem;">You already have a phone number</div><div>To add a new number, please release your current number first from the Profile tab.</div></div>';
                const addTab = document.getElementById('addTab');
                // Clean up previous message if any
                const existingMsg = document.getElementById('hasNumberMessage');
                if (existingMsg) existingMsg.remove();

                if (addTab) {
                    addTabMessage.id = 'hasNumberMessage';
                    const firstCard = addTab.querySelector('.card') as HTMLElement;
                    if (firstCard) firstCard.style.display = 'none';
                    addTab.appendChild(addTabMessage);
                }
            } else {
                // No active number
                if (phoneNumberCard) phoneNumberCard.hidden = true;
                const twilioCredsCard = document.getElementById('twilioCredsCard');
                if (twilioCredsCard) twilioCredsCard.hidden = true;

                // Re-enable search
                if (searchBtn) searchBtn.disabled = false;
                const hasNumberMsg = document.getElementById('hasNumberMessage');
                if (hasNumberMsg) hasNumberMsg.remove();
                const addTab = document.getElementById('addTab');
                const firstCard = addTab?.querySelector('.card');
                if (firstCard) (firstCard as HTMLElement).style.display = 'block';
            }
        } else {
            if (phoneNumberCard) phoneNumberCard.hidden = true;
            const twilioCredsCard = document.getElementById('twilioCredsCard');
            if (twilioCredsCard) twilioCredsCard.hidden = true;
        }
    });
}

// Mask credential - show first 6 and last 4 characters
function maskCredential(cred: string): string {
    if (!cred || cred.length < 10) return '••••••••••••••••••••••••••••••••';
    const start = cred.substring(0, 6);
    const end = cred.substring(cred.length - 4);
    const middle = '••••••••••••••••••••';
    return `${start}${middle}${end}`;
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
        const mmsCapability = document.getElementById('mmsCapability') as HTMLInputElement | null;

        const country = countrySelect?.value || 'US';
        const areaCode = areaCodeInput?.value.trim() || '';
        const voice = voiceCapability?.checked || false;
        const sms = smsCapability?.checked || false;
        const mms = mmsCapability?.checked || false;

        // Validate at least one capability is selected
        if (!voice && !sms && !mms) {
            alert('Please select at least one capability (Voice, SMS, or MMS)');
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
                mms,
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
                if (capabilities.voice) badges.push('<span style="background: var(--success); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">📞 Voice</span>');
                if (capabilities.SMS) badges.push('<span style="background: var(--accent); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">💬 SMS</span>');
                if (capabilities.MMS) badges.push('<span style="background: var(--warning); color: var(--bg-dark); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">📸 MMS</span>');

                // Dynamic Pricing (Cost * 2) - Each number now has its own cost from backend
                const baseCost = number.cost || 3.00;
                const monthlyPrice = baseCost * 2;

                const li = document.createElement('li');
                li.className = 'number-item';
                li.innerHTML = `
                    <div>
                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">${number.phoneNumber}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">${number.locality || ''}, ${number.region || country}</div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">${badges.join('')}</div>
                    </div>
                    <button class="btn btn-primary">Buy $${monthlyPrice.toFixed(2)}/mo</button>
                `;

                const buyBtn = li.querySelector('button') as HTMLButtonElement;
                buyBtn.addEventListener('click', () => openPurchaseDialog(number, monthlyPrice)); // Pass calculated price

                numbersList.appendChild(li);
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

    // Persist to localStorage
    localStorage.setItem('wisecat_active_tab', tabName);
}

navItems.forEach(navItem => {
    navItem.addEventListener('click', () => {
        const tabName = navItem.getAttribute('data-tab');
        if (tabName) activateTab(tabName);
    });
});

// Restore Tab on Load
document.addEventListener('DOMContentLoaded', () => {
    const savedTab = localStorage.getItem('wisecat_active_tab');
    if (savedTab) {
        activateTab(savedTab);
    } else {
        activateTab('ai'); // Default
    }
});
// --- Logout ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            localStorage.removeItem('wisecat_user');
            window.location.href = '/entry.html';
        }).catch((err) => {
            console.error("Logout error:", err);
        });
    });
}
