
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore";

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
const db = getFirestore(app, "reservation"); // Trying "reservation" db first as per project config

async function run() {
    console.log("Connecting to Firebase...");
    try {
        const q = query(collection(db, "dev_task"), where("completed", "==", false)); // Filtering by completed=false
        const querySnapshot = await getDocs(q);

        const tasks = [];
        querySnapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });

        // Sort by priority (descending)
        tasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));

        console.log(`Found ${tasks.length} pending tasks:`);
        tasks.forEach(t => {
            console.log(`\n--- Task [Priority: ${t.priority || 0}] ---`);
            console.log(`ID: ${t.id}`);
            console.log(`Data:`, JSON.stringify(t, null, 2));
        });

        if (tasks.length === 0) {
            console.log("No pending tasks found in 'dev_task' collection (reservation DB).");
        }

    } catch (e) {
        console.error("Error fetching tasks:", e);
    }
    process.exit(0);
}

run();
