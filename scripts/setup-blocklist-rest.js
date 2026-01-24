#!/usr/bin/env node
/**
 * Setup location_blocklist in Firestore using REST API
 * Run: node scripts/setup-blocklist-rest.js
 */

const projectId = 'wisecat-8df8d';
const apiKey = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCjcWq7Y5H5x50D-Qr9jx-RvvGl2uMI5Vk';

const blocklistData = {
    types: {
        arrayValue: {
            values: [
                { stringValue: 'police' },
                { stringValue: 'hospital' },
                { stringValue: 'government_office' },
                { stringValue: 'courthouse' },
                { stringValue: 'fire_station' },
                { stringValue: 'military_base' },
                { stringValue: 'prison' },
                { stringValue: 'detention_center' },
                { stringValue: 'city_hall' },
                { stringValue: 'parliament' },
                { stringValue: 'senate' },
                { stringValue: 'embassy' },
                { stringValue: 'consulate' }
            ]
        }
    },
    keywords: {
        arrayValue: {
            values: [
                { stringValue: 'police' },
                { stringValue: 'hospital' },
                { stringValue: 'government' },
                { stringValue: 'courthouse' },
                { stringValue: 'jail' },
                { stringValue: 'prison' },
                { stringValue: 'military' },
                { stringValue: 'fbi' },
                { stringValue: 'cia' },
                { stringValue: 'dea' },
                { stringValue: 'embassy' },
                { stringValue: 'consulate' },
                { stringValue: 'parliament' },
                { stringValue: 'congress' },
                { stringValue: 'senate' },
                { stringValue: 'city hall' },
                { stringValue: 'fire station' },
                { stringValue: 'detention' }
            ]
        }
    },
    active: { booleanValue: true },
    lastUpdated: { timestampValue: new Date().toISOString() }
};

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/reservation/documents/configuration/location_blocklist?key=${apiKey}`;

async function setupBlocklist() {
    try {
        console.log('🚀 Setting up location_blocklist via Firestore REST API...\n');

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fields: blocklistData
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Error:', error);
            process.exit(1);
        }

        const result = await response.json();

        console.log('✅ Successfully created settings/location_blocklist');
        console.log('\nDocument contents:');
        console.log('├── types: 13 items');
        console.log('├── keywords: 18 items');
        console.log('├── active: true');
        console.log('└── lastUpdated:', new Date().toISOString());

        console.log('\n✨ Setup complete! The blocklist is now live.');
        console.log('To update it, go to Firebase Console > Firestore > settings > location_blocklist\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up blocklist:', error.message);
        process.exit(1);
    }
}

setupBlocklist();
