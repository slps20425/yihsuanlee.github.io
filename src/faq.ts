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

    // 4. Session Timeout
    setupSessionTimeout();

    // 5. Auth State (Optional for FAQ, but good for consistent UI)
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // If user is not logged in, we can still show FAQ, 
            // but maybe hide some dashboard-specific sidebars?
            // For now, let's just keep it visible.
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
