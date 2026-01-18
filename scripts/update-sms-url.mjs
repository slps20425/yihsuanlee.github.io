import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();

const db = getFirestore();

const SMS_WEBHOOK_URL = 'https://us-central1-wisecat-8df8d.cloudfunctions.net/twilioInboundWebhook';

async function updateSmsUrl() {
    console.log(`Updating configuration/settings with inboundSmsUrl: ${SMS_WEBHOOK_URL}`);

    try {
        await db.doc('configuration/settings').set({
            inboundSmsUrl: SMS_WEBHOOK_URL
        }, { merge: true });

        console.log('Successfully updated configuration/settings.');
    } catch (error) {
        console.error('Error updating configuration:', error);
    }
}

updateSmsUrl();
