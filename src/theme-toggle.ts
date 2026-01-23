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

    setTheme(theme);
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
        button.textContent = theme === THEME_DARK ? '☀️' : '🌙';
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
