#!/usr/bin/env node

/**
 * Setup script to create shared_numbers collection in Firestore
 *
 * Usage:
 *   node scripts/setup-shared-numbers.js
 *
 * Make sure you have:
 * - Firebase credentials configured (GOOGLE_APPLICATION_CREDENTIALS env var)
 * - Or Firebase CLI authenticated (firebase login)
 */

const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
try {
    admin.initializeApp({
        projectId: 'wisecat-8df8d'
    });
} catch (error) {
    console.error('Failed to initialize Firebase:', error.message);
    process.exit(1);
}

// Connect to the 'reservation' database
const db = getFirestore('reservation');

/**
 * Shared number configurations to add
 */
const sharedNumbers = [
    {
        id: 'secondary',
        data: {
            phoneNumber: '+18393334143',
            vapiPhoneNumberId: '76705f8f-8ece-4a0e-a757-9581097c9ace',
            phoneNumberStatus: 'active',
            friendlyName: 'US Business',
            originalPrice: 1.75, // Cost we paid Twilio for this number
            smsEnabled: true,
            capabilities: {
                MMS: true,
                SMS: true,
                fax: true,
                voice: true
            },
            twilioSubaccountSid: 'AC69d839f395b4d082982faa0fd1c3cfe9',
            twilioSubaccountAuthToken: '7f4742f8ccf138c8032f4292eead3caf',
            phoneNumberPurchasedAt: admin.firestore.Timestamp.fromDate(new Date('2026-01-17T09:39:50Z')),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
    }
];

/**
 * Main function to setup shared numbers
 */
async function setupSharedNumbers() {
    console.log('🚀 Setting up shared_numbers collection...\n');

    try {
        for (const { id, data } of sharedNumbers) {
            console.log(`📝 Adding shared number: ${id}`);
            console.log(`   - Phone: ${data.phoneNumber}`);
            console.log(`   - Vapi ID: ${data.vapiPhoneNumberId}`);
            console.log(`   - Status: ${data.phoneNumberStatus}`);

            await db.collection('shared_numbers').doc(id).set(data, { merge: true });

            console.log(`✅ Successfully added: ${id}\n`);
        }

        console.log('🎉 All shared numbers configured successfully!');
        console.log('\nSetup complete. The app will now fetch from the shared_numbers collection.');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error setting up shared numbers:', error.message);
        console.error('\nMake sure you:');
        console.error('  1. Have Firebase CLI installed: npm install -g firebase-tools');
        console.error('  2. Are logged in: firebase login');
        console.error('  3. Or have GOOGLE_APPLICATION_CREDENTIALS set to your service account JSON');
        process.exit(1);
    }
}

// Run the setup
setupSharedNumbers();
