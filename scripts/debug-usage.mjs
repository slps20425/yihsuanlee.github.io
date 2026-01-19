
import admin from 'firebase-admin';
import twilio from 'twilio';

// Initialize Firebase with Default Creds (relies on gcloud auth or env vars)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}
const db = admin.firestore();

// User UID for yi-hsuan Lee (hanklee0506@gmail.com)
// I'll grab it from the user email query to be safe
const email = 'hanklee0506@gmail.com';

async function debugUsage() {
    console.log(`Searching for user with email: ${email}`);
    const userSnap = await db.collection('users').where('email', '==', email).get();

    if (userSnap.empty) {
        console.error("User not found!");
        return;
    }

    const userDoc = userSnap.docs[0];
    const uid = userDoc.id;
    console.log(`Found User UID: ${uid}`);

    // Get settings
    const settingsRef = db.doc(`users/${uid}/settings/settings`); // Path might be users/uid_${uid}... wait.
    // In codebase it is `users/uid_${uid}`.
    // Let me check the userDoc.ref.path
    console.log(`User Doc Path: ${userDoc.ref.path}`);

    // The codebase assumes structure: users/uid_{uid}/settings/settings
    // Let's try to fetch that specific path
    const realSettingsPath = `users/uid_${uid.replace('uid_', '')}/settings/settings`; // ensure no double prefix
    // Actually, userDoc.id IS the uid.
    // The collection structure seems to be `users` -> doc `uid_XYZ`?
    // Let's look at previous file view of `index.js`:
    // `const settingsRef = db.doc("users/uid_" + uid + "/settings/settings");`

    // Wait, if I queried `collection('users')`, the doc ID might ALREADY be `uid_XYZ` or just `XYZ`?
    // I'll inspect userDoc.id.

    let targetUid = uid;
    if (uid.startsWith('uid_')) targetUid = uid.replace('uid_', '');

    const settingsPath = `users/uid_${targetUid}/settings/settings`;
    console.log(`Fetching settings from: ${settingsPath}`);

    const settingsDoc = await db.doc(settingsPath).get();
    if (!settingsDoc.exists) {
        console.error("Settings doc not found at " + settingsPath);
        // Try alternate path?
        return;
    }

    const settings = settingsDoc.data();
    console.log("Settings found.");
    if (!settings.twilioSubaccountSid || !settings.twilioSubaccountAuthToken) {
        console.error("Missing Twilio Subaccount Creds in settings");
        return;
    }

    const client = twilio(settings.twilioSubaccountSid, settings.twilioSubaccountAuthToken);

    console.log(`\n--- Fetching DAILY Records (Limit 50) ---`);
    console.log(`Subaccount: ${settings.twilioSubaccountSid}`);

    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];
        console.log(`Using startDate: ${startDateStr}`);

        const records = await client.usage.records.daily.list({
            startDate: startDateStr,
            limit: 50
        });

        console.log(`Found ${records.length} records.`);
        if (records.length > 0) {
            records.forEach(r => {
                console.log(`[${r.startDate} -> ${r.endDate}] Cat: "${r.category}" | Desc: "${r.description}" | Usage: ${r.usage} | Price: ${r.price}`);
            });
        } else {
            console.log("No Daily records found.");
        }

        console.log(`\n--- Fetching ALL TIME SUMMARY (Fallback Check) ---`);
        const summary = await client.usage.records.list({ limit: 20 });
        summary.forEach(r => {
            console.log(`[Summary] Cat: "${r.category}" | Desc: "${r.description}" | Price: ${r.price}`);
        });

    } catch (e) {
        console.error("Twilio Error:", e);
    }
}

debugUsage();
