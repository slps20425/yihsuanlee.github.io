export function registerPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW Registered:', registration.scope);
                })
                .catch(err => {
                    console.log('SW Registration Failed:', err);
                });
        });
    }
}
