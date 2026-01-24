/**
 * Setup script to create language_location_bias in Firestore
 * Run: node scripts/setup-language-bias.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../functions/service-account-key.json');

try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error('❌ Error: service-account-key.json not found at:', serviceAccountPath);
    console.error('Please ensure the file exists. You can download it from Firebase Console > Project Settings > Service Accounts');
    process.exit(1);
}

const db = admin.firestore();

async function setupLanguageBias() {
    try {
        console.log('🚀 Setting up language_location_bias in Firestore...\n');

        const languageData = {
            languages: {
                en: {
                    latitude: null,
                    longitude: null,
                    radius: null,
                    name: 'English - Global'
                },
                zh: {
                    latitude: 25.0330,
                    longitude: 121.5654,
                    radius: 100000,
                    name: 'Chinese - Taiwan'
                },
                jp: {
                    latitude: 35.6762,
                    longitude: 139.6503,
                    radius: 100000,
                    name: 'Japanese - Tokyo'
                },
                kr: {
                    latitude: 37.5665,
                    longitude: 126.9780,
                    radius: 100000,
                    name: 'Korean - Seoul'
                },
                es: {
                    latitude: null,
                    longitude: null,
                    radius: null,
                    name: 'Spanish - Global'
                },
                fr: {
                    latitude: null,
                    longitude: null,
                    radius: null,
                    name: 'French - Global'
                },
                it: {
                    latitude: null,
                    longitude: null,
                    radius: null,
                    name: 'Italian - Global'
                }
            },
            active: true,
            lastUpdated: admin.firestore.Timestamp.now(),
            note: 'Language-to-location bias mapping for Google Places search. Non-ASCII (zh, jp, kr) use regional bias. ASCII (en, es, fr, it) use global search.'
        };

        // Create configuration collection and language_location_bias document
        await db.collection('configuration').doc('language_location_bias').set(languageData);

        console.log('✅ Successfully created settings/language_location_bias');
        console.log('\nDocument contents:');
        console.log('├── languages:');
        console.log('│   ├── en: English (Global - no regional bias)');
        console.log('│   ├── zh: Chinese (Taiwan) - Taipei region');
        console.log('│   ├── jp: Japanese (Tokyo) - Tokyo region');
        console.log('│   ├── kr: Korean (Seoul) - Seoul region');
        console.log('│   ├── es: Spanish (Global - no regional bias)');
        console.log('│   ├── fr: French (Global - no regional bias)');
        console.log('│   └── it: Italian (Global - no regional bias)');
        console.log('├── active: true');
        console.log('└── lastUpdated:', languageData.lastUpdated.toDate());

        console.log('\n✨ Setup complete! Language location bias is now live.');
        console.log('To update it, go to Firebase Console > Firestore > settings > language_location_bias\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up language bias:', error);
        process.exit(1);
    }
}

setupLanguageBias();
