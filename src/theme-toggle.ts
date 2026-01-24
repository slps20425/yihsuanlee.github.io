/**
 * Theme Toggle Module
 * Manages dark/light theme switching with localStorage persistence
 */

const THEME_KEY = 'wisecat_theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

/**
 * Initialize theme on page load
 */
export function initTheme(): void {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? THEME_DARK : THEME_LIGHT);

    setTheme(theme as 'dark' | 'light');
}

/**
 * Set the current theme
 */
export function setTheme(theme: 'dark' | 'light'): void {
    if (theme === THEME_LIGHT || theme === THEME_DARK) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            if (theme === THEME_LIGHT) {
                metaThemeColor.setAttribute('content', '#faf8f3');
            } else {
                metaThemeColor.setAttribute('content', '#0f172a');
            }
        }

        console.log(`[Theme] Switched to ${theme} mode`);
    }
}

/**
 * Toggle between dark and light themes
 */
export function toggleTheme(): void {
    const currentTheme = document.documentElement.getAttribute('data-theme') || THEME_DARK;
    const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    setTheme(newTheme as 'dark' | 'light');
}

/**
 * Get current theme
 */
export function getCurrentTheme(): 'dark' | 'light' {
    return (document.documentElement.getAttribute('data-theme') || THEME_DARK) as 'dark' | 'light';
}

/**
 * Create and attach theme toggle button
 */
export function createThemeToggleButton(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Toggle theme');
    button.setAttribute('title', 'Switch between light and dark theme');

    const updateIcon = () => {
        const theme = getCurrentTheme();
        // SVG Icons for Premium Look
        const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

        button.innerHTML = theme === THEME_DARK ? SUN_SVG : MOON_SVG;
    };

    updateIcon();

    button.addEventListener('click', () => {
        toggleTheme();
        updateIcon();
    });

    // Update icon when theme changes externally
    const observer = new MutationObserver(() => {
        updateIcon();
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    document.body.appendChild(button);
    return button;
}

// Initialize on module load
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        createThemeToggleButton();
    });

    // Fallback for immediate load
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initTheme();
        if (!document.querySelector('.theme-toggle')) {
            createThemeToggleButton();
        }
    }
}
