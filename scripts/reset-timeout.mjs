
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

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
const db = getFirestore(app, "reservation");

async function setDefaultTimeout() {
    console.log("Resetting session timeout to 30 minutes...");
    try {
        const configRef = doc(db, 'configuration', 'settings');
        await updateDoc(configRef, {
            session_timeout_minutes: 30
        });
        console.log("Success! Timeout set to 30 minutes.");
    } catch (e) {
        console.error("Error updating config:", e);
    }
    process.exit(0);
}

setDefaultTimeout();
