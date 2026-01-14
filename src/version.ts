export const APP_VERSION = 'v1.1.7-tooltip-mobile-fix';
export const BUILD_TIMESTAMP = new Date().toISOString();

export function displayVersion() {
    const el = document.createElement('div');
    el.id = 'app-version-display';
    el.style.cssText = `
        position: fixed;
        bottom: 5px;
        right: 5px;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.3);
        z-index: 9999;
        pointer-events: none;
        font-family: monospace;
    `;
    el.innerText = `${APP_VERSION} (${new Date().toLocaleTimeString()})`;
    document.body.appendChild(el);
}

// Auto-run if imported
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayVersion);
} else {
    displayVersion();
}
