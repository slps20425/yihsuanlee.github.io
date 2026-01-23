/**
 * Setup script to create the location_blocklist in Firestore
 * Run: node scripts/setup-blocklist.js
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

async function setupBlocklist() {
    try {
        console.log('🚀 Setting up location_blocklist in Firestore...\n');

        const blocklistData = {
            types: [
                'police',
                'hospital',
                'government_office',
                'courthouse',
                'fire_station',
                'military_base',
                'prison',
                'detention_center',
                'city_hall',
                'parliament',
                'senate',
                'embassy',
                'consulate'
            ],
            keywords: [
                'police',
                'hospital',
                'government',
                'courthouse',
                'jail',
                'prison',
                'military',
                'fbi',
                'cia',
                'dea',
                'embassy',
                'consulate',
                'parliament',
                'congress',
                'senate',
                'city hall',
                'fire station',
                'detention'
            ],
            active: true,
            lastUpdated: admin.firestore.Timestamp.now()
        };

        // Create settings collection and location_blocklist document
        await db.collection('settings').doc('location_blocklist').set(blocklistData);

        console.log('✅ Successfully created settings/location_blocklist');
        console.log('\nDocument contents:');
        console.log('├── types:', blocklistData.types.length, 'items');
        console.log('├── keywords:', blocklistData.keywords.length, 'items');
        console.log('├── active:', blocklistData.active);
        console.log('└── lastUpdated:', blocklistData.lastUpdated.toDate());

        console.log('\n✨ Setup complete! The blocklist is now live.');
        console.log('To update it, go to Firebase Console > Firestore > settings > location_blocklist\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up blocklist:', error);
        process.exit(1);
    }
}

setupBlocklist();
