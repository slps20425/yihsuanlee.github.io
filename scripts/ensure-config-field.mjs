
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",
    authDomain: "wise-catty.cc",
    projectId: "wisecat-8df8d",
    storageBucket: "wisecat-8df8d.firebasestorage.app",
    messagingSenderId: "1078479155773",
    appId: "1:1078479155773:web:cd62907516951aa47db054",
    measurementId: "G-30M228G3VP"
};

const app = initializeApp(firebaseConfig);
// CORRECTED: Use 'reservation' database
const db = getFirestore(app, "reservation");

async function ensureConfig() {
    console.log("Connecting to Firestore (reservation DB)...");
    const configRef = doc(db, 'configuration', 'settings');

    try {
        const snapshot = await getDoc(configRef);
        if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.session_timeout_minutes === undefined) {
                console.log("Document exists but missing 'session_timeout_minutes'. Updating...");
                await setDoc(configRef, { session_timeout_minutes: 30 }, { merge: true });
                console.log("✅ Updated 'session_timeout_minutes' to 30.");
            } else {
                console.log(`ℹ️ Field 'session_timeout_minutes' already exists. Value: ${data.session_timeout_minutes}`);
            }
        } else {
            console.log("Document does not exist. Creating...");
            await setDoc(configRef, {
                enable_trial: true,
                enable_reservation: true,
                enable_mouthpiece: true,
                session_timeout_minutes: 30,
                description: "Global Feature Flags. Set to false to disable features."
            });
            console.log("✅ Created configuration document with 'session_timeout_minutes: 30'.");
        }
    } catch (error) {
        console.error("❌ Error updating configuration:", error);
    }
    process.exit(0);
}

ensureConfig();
