import "./version";
import WiseCatI18n from './i18n';
import { setupSessionTimeout } from './session-timeout';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebase-config';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize i18n
    WiseCatI18n.init();

    // 2. FAQ Accordion Logic
    initFAQ();

    // 3. Hamburger Menu Logic
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebar = document.querySelector('.sidebar-navigation');

    if (hamburgerMenu && sidebar) {
        hamburgerMenu.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
        });
    }

    // AI Services Dropdown Logic (New)
    const dropdownToggle = document.getElementById('aiDropdownToggle');
    const dropdown = dropdownToggle?.parentElement; // .nav-dropdown

    if (dropdownToggle && dropdown) {
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target as Node)) {
                dropdown.classList.remove('open');
            }
        });
    }

    // Logout Button
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener('click', async () => {
            // We can import signOut or use auth directly
            const { signOut } = await import("firebase/auth");
            try {
                await signOut(auth);
                window.location.href = '/Entry.html';
            } catch (e) {
                console.error("Logout failed", e);
            }
        });
    }

    // 4. Session Timeout
    setupSessionTimeout();

    // 5. Auth State for Sidebar
    onAuthStateChanged(auth, (user) => {
        const headerUserName = document.getElementById('headerUserName');
        const headerUserAvatar = document.getElementById('headerUserAvatar') as HTMLImageElement;
        const creditsDisplay = document.getElementById('creditsDisplay');

        if (user) {
            // Update User Info
            if (headerUserName) headerUserName.textContent = user.displayName || 'User';
            if (headerUserAvatar) {
                headerUserAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`;
            }

            // Fetch Credits (optional, reused from phone-numbers logic or local storage)
            // For now, let's try to get from localStorage for instant feedback
            const cachedUser = localStorage.getItem('wisecat_user');
            if (cachedUser) {
                try {
                    const u = JSON.parse(cachedUser);
                    if (u.credits !== undefined) {
                        if (creditsDisplay) creditsDisplay.textContent = `$${parseFloat(u.credits).toFixed(2)}`;
                    }
                } catch (e) { }
            }

            // Also could listen to Firestore if we wanted real-time credits here, 
            // but for FAQ page, static or cached is probably fine.

        } else {
            // Guest
            if (headerUserName) headerUserName.textContent = 'Guest';
            if (headerUserAvatar) headerUserAvatar.src = 'https://ui-avatars.com/api/?name=Guest';
            if (creditsDisplay) creditsDisplay.textContent = '$0.00';
        }
    });
});

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close other items
                faqItems.forEach(i => i.classList.remove('active'));

                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
}
