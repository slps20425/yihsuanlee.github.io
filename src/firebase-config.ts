import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDMjzdCgNbI9W8pUd6AJoGRQlYDqKNcf_c",
    authDomain: "wise-catty.cc",
    projectId: "wisecat-8df8d",
    storageBucket: "wisecat-8df8d.firebasestorage.app",
    messagingSenderId: "1078479155773",
    appId: "1:1078479155773:web:cd62907516951aa47db054",
    measurementId: "G-30M228G3VP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Connect to the specific "reservation" database
const db = getFirestore(app, "reservation");

export { app, auth, db };
