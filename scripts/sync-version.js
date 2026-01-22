#!/usr/bin/env node

/**
 * Version Sync Script
 * Automatically syncs version from package.json to src/version.ts
 * Run before each build to keep versions in sync
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../package.json');
const versionTsPath = path.join(__dirname, '../src/version.ts');

try {
    // Read version from package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version;

    if (!version) {
        throw new Error('Version not found in package.json');
    }

    // Get current build time
    const buildTime = new Date().toISOString();

    // Generate new version.ts content
    const versionTsContent = `// Version checker - displays in console
const APP_VERSION = '${version}'; // Auto-synced from package.json
const BUILD_TIME = '${buildTime}';

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
        console.log(\`%cCurrent: v\${APP_VERSION}\`, 'color: #10b981; font-size: 12px;');
        console.log(\`%cBuild: \${BUILD_TIME}\`, 'color: #9ca3af; font-size: 12px;');
        console.log('%c💡 Hard refresh (Ctrl+Shift+R) to get latest version', 'color: #f59e0b; font-size: 12px;');
    }
};

export { APP_VERSION, BUILD_TIME };
`;

    // Write to version.ts
    fs.writeFileSync(versionTsPath, versionTsContent, 'utf-8');

    console.log(`✅ Version synced: v${version}`);
    console.log(`📅 Build time: ${buildTime}`);
    console.log(`📄 Updated: ${versionTsPath}`);

} catch (error) {
    console.error('❌ Version sync failed:', error.message);
    process.exit(1);
}
