
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

async function run() {
    console.log('Adding retry config to configuration/settings...');
    try {
        await setDoc(doc(db, 'configuration', 'settings'), {
            retry_cost_per_attempt: 0.3,
            retry_interval: 10
        }, { merge: true });
        console.log('✅ Configuration updated successfully.');
    } catch (e) {
        console.error("❌ Error updating config:", e.message);
        console.log("NOTE: If this failed due to permissions, please update Firestore manually manually or ensure your IP is allowlisted/you have auth.");
    }
    process.exit(0);
}

run();
