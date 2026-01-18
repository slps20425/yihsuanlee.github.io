import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp();

const db = getFirestore();

async function seedBilling() {
    console.log('Seeding configuration/settings with billing defaults...');

    const billingConfig = {
        billing: {
            number_multiplier: 2.0,
            common_multiplier: 3.0,
            min_balance_threshold: 10.0,
            country_multipliers: {
                "US": 5.0,
                "JP": 3.0,
                "TW": 3.0,
                "GB": 4.0
            },
            services: {
                mouthpiece: 4.0,
                restaurant: 4.0
            }
        }
    };

    try {
        await db.doc('configuration/settings').set(billingConfig, { merge: true });
        console.log('Successfully updated billing configuration.');
    } catch (error) {
        console.error('Error updating billing configuration:', error);
    }
}

seedBilling();
