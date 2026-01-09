import { signInWithCustomToken } from "firebase/auth";
import { auth } from './firebase-config';

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
