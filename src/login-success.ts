import { signInWithCustomToken } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from './firebase-config';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        signInWithCustomToken(auth, token)
            .then(async (userCredential) => {
                console.log("Login successful, restoring session...");
                const user = userCredential.user;

                // Fetch User Data to sync localStorage
                // We need to mirror what handleSocialLogin does in entry.ts
                const userRef = doc(db, 'reservation', 'users', 'uid_' + user.uid);
                let userData: any = {};

                try {
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        userData = docSnap.data();
                    } else {
                        // Create default if missing (similar to handleSocialLogin)
                        userData = {
                            email: user.email,
                            name: user.displayName || 'WiseCat User',
                            picture: user.photoURL || 'https://ui-avatars.com/api/?name=User',
                            credits: 10.00,
                            createdAt: serverTimestamp()
                        };
                        await setDoc(userRef, userData);
                    }
                } catch (e) {
                    console.error("Error fetching user data", e);
                }

                const sessionData = {
                    uid: user.uid,
                    name: userData.name || user.displayName || 'User',
                    email: user.email,
                    picture: userData.picture || user.photoURL,
                    credits: userData.credits || 0
                };

                // Save to localStorage with a delay to ensure it "sticks"
                const json = JSON.stringify(sessionData);
                localStorage.setItem('wisecat_user', json);
                console.log("Session saved to localStorage (Line):", json);

                // Verify
                if (localStorage.getItem('wisecat_user') !== json) {
                    console.error("CRITICAL: localStorage write failed!");
                    // Last ditch effort
                    localStorage.setItem('wisecat_user', json);
                }

                setTimeout(() => {
                    // Redirect to Dashboard (not entry, as user is now logged in) 
                    // OR redirect to entry if that represents the "home" where they can see the dashboard button
                    // User said: "redirect fron entry to dashboard" is working for gmail.
                    // The previous code redirected to /entry.html.
                    // Let's redirect to dashboard.html directly if logged in?
                    // Or back to entry.html which then auto-redirects?
                    // Let's stick to /entry.html as per original but now with persistent data it should show "Dashboard" button
                    // Actually, usually we want to go straight to dashboard.
                    // Let's go to dashboard.html to match the user's specific workflow concern about "seeing Guest".
                    window.location.href = '/dashboard.html';
                }, 500);
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
