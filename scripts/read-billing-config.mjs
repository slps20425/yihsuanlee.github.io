import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();

const db = getFirestore();

async function readBillingConfig() {
    console.log('Reading configuration/settings...');

    try {
        const doc = await db.doc('configuration/settings').get();
        if (doc.exists) {
            console.log("Document data:", JSON.stringify(doc.data(), null, 2));
        } else {
            console.log("Document does not exist!");
        }
    } catch (error) {
        console.error('Error reading configuration:', error);
    }
}

readBillingConfig();
