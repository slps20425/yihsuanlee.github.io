import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";

// Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",
    authDomain: "wise-catty.cc",
    projectId: "wisecat-8df8d",
    storageBucket: "wisecat-8df8d.firebasestorage.app",
    messagingSenderId: "1078479155773",
    appId: "1:1078479155773:web:cd62907516951aa47db054",
    measurementId: "G-30M228G3VP"
    // databaseId not needed for auth-only flow here, but good practice to keep consistent if we used it.
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        signInWithCustomToken(auth, token)
            .then(() => {
                console.log("Login successful, redirecting...");
                window.location.href = '/entry.html';
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
