
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize with explicit config
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: 'wisecat-8df8d'
        });
    } catch (e) {
        console.error("Init Failed:", e);
        process.exit(1);
    }
}

// Connect to 'reservation' named database
const db = getFirestore(admin.app(), 'reservation');
const uid = 'rBzT6OHSk9h1TUxBJlnxVBKAqZQ2';

async function patchUserDate() {
    try {
        console.log(`Patching data for user: ${uid} in DB: reservation`);
        const settingsRef = db.doc(`users/uid_${uid}/settings/settings`);
        const doc = await settingsRef.get();

        if (!doc.exists) {
            console.error("Settings doc does not exist at path:", settingsRef.path);
            process.exit(1);
        }

        const data = doc.data();
        console.log("Current Settings Found. phoneNumber:", data.phoneNumber);

        if (!data.phoneNumberPurchasedAt) {
            console.log("phoneNumberPurchasedAt is missing. Patching...");
            // Set to Jan 17, 2026 5:39:50 PM UTC+8
            const purchasedAt = new Date('2026-01-17T17:39:50+08:00');
            await settingsRef.set({
                phoneNumberPurchasedAt: admin.firestore.Timestamp.fromDate(purchasedAt)
            }, { merge: true });
            console.log("✅ Patched successfully to:", purchasedAt);
        } else {
            console.log("ℹ️ phoneNumberPurchasedAt already exists:", data.phoneNumberPurchasedAt);
        }
        process.exit(0);

    } catch (e) {
        console.error("❌ Error patching:", e);
        process.exit(1);
    }
}

patchUserDate();
