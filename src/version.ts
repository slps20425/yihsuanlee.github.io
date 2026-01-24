// Version checker - displays in console
const APP_VERSION = '1.0.0'; // Auto-synced from package.json
const BUILD_TIME = '2026-01-24T08:25:42.580Z';

console.log(
    '%c🐱 WiseCat AI %cv' + APP_VERSION,
    'color: #10b981; font-size: 16px; font-weight: bold;',
    'color: #3b82f6; font-size: 14px;'
);
console.log(
    '%cBuild: %c' + BUILD_TIME,
    'color: #9ca3af; font-size: 12px;',
    'color: #d1d5db; font-size: 12px;'
);
console.log(
    '%cTo check version: %cwindow.WiseCatVersion',
    'color: #9ca3af; font-size: 12px;',
    'color: #f59e0b; font-size: 12px; font-family: monospace;'
);

// Make version accessible globally
(window as any).WiseCatVersion = {
    version: APP_VERSION,
    buildTime: BUILD_TIME,
    checkUpdate: () => {
        console.log('%c🔍 Checking version...', 'color: #3b82f6; font-size: 14px;');
        console.log(`%cCurrent: v${APP_VERSION}`, 'color: #10b981; font-size: 12px;');
        console.log(`%cBuild: ${BUILD_TIME}`, 'color: #9ca3af; font-size: 12px;');
        console.log('%c💡 Hard refresh (Ctrl+Shift+R) to get latest version', 'color: #f59e0b; font-size: 12px;');
    }
};

export { APP_VERSION, BUILD_TIME };
