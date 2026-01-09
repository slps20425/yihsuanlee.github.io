import './entry'; // Re-use entry config to init app if needed, or just init here.
// Actually entry.ts initializes app. Let's ensure we access the same instance or re-init.

// Re-declare since entry.ts declares them in global scope or just relies on window.
declare var firebase: any;

document.addEventListener('DOMContentLoaded', () => {
    // Check if firebase initialized. If not, we might need to copy init code or import from a shared module.
    // Since entry.ts runs on DOMContentLoaded of entry.html, it won't run here unless we duplicate init logic.
    // For simplicity, let's duplicate the config for now or assume this page has the scripts.
    // login-success.html has the CDN scripts.

    const firebaseConfig = {
        apiKey: "AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",
        authDomain: "wise-catty.cc",
        projectId: "wisecat-8df8d",
        storageBucket: "wisecat-8df8d.firebasestorage.app",
        messagingSenderId: "1078479155773",
        appId: "1:1078479155773:web:cd62907516951aa47db054",
        measurementId: "G-30M228G3VP",
        databaseId: "reservation"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        firebase.auth().signInWithCustomToken(token)
            .then(() => {
                console.log("Login successful, redirecting...");
                window.location.href = '/entry.html'; // Or reservation/restaurant_reservation.html
            })
            .catch((error: any) => {
                console.error("Custom token login failed", error);
                document.body.innerHTML = `<h3>Login Failed</h3><p>${error.message}</p><a href="/">Go Back</a>`;
            });
    } else {
        console.error("No token found");
        window.location.href = '/';
    }
});
