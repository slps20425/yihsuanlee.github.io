
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

async function completeTask(taskId) {
    if (!taskId) {
        console.error("Error: Please provide a Task ID as an argument.");
        console.log("Usage: node scripts/complete-task.mjs <TASK_ID>");
        process.exit(1);
    }

    console.log(`Connecting to Firebase to complete task: ${taskId}...`);

    // Reference the specific document in 'dev_task' collection
    const taskRef = doc(db, "dev_task", taskId);

    try {
        // Update both 'completed' boolean and 'state' string to be safe
        await updateDoc(taskRef, {
            completed: true,
            state: "completed",
            completedAt: new Date().toISOString()
        });
        console.log(`✅ Task ${taskId} successfully marked as completed.`);
    } catch (e) {
        console.error("❌ Error updating task:", e.message);
    }
    process.exit(0);
}

// Get task ID from command line arguments
const taskId = process.argv[2];
completeTask(taskId);
