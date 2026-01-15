
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

const keywords = "crypto, transfer, deposit, winner, prize, investment, bank account, card details, 匯款, 投資, 虛擬貨幣, 獲獎, 轉帳, 獎金, 兼職, 振込, 当選, 仮想通貨, 口座, 송금, 당첨, 가상화폐, 계좌, transferencia, premio, cuenta bancaria, inversión, bonifico, vincitore, conto bancario";

async function seed() {
    console.log('Seeding configuration/settings...');
    try {
        await setDoc(doc(db, 'configuration', 'settings'), {
            custom_scam_keywords: keywords,
            session_timeout_minutes: 60
        }, { merge: true });
        console.log('Done.');
    } catch (e) {
        console.error("Error seeding config (Permission Denied?):", e.message);
    }
    process.exit(0);
}

seed();
