import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
    credential: applicationDefault(),
    projectId: 'wisecat-8df8d'
});

const db = getFirestore();

async function testQuery() {
    console.log('Testing Collection Group query for settings/phoneNumber...');
    const testNumber = '+1234567890'; // Dummy number
    try {
        const snapshot = await db.collectionGroup('settings')
            .where('phoneNumber', '==', testNumber)
            .limit(1)
            .get();

        console.log('Query Successful!');
        console.log(`Found ${snapshot.size} docs (expected 0 or 1)`);
        console.log('Status: Index is READY.');
    } catch (error) {
        console.error('Query Failed!');
        console.error('Error Code:', error.code);
        console.error('Error Details:', error.details);
        console.error('Full Error:', error);

        if (error.code === 5 || error.message.includes('index')) {
            console.log('\n--- DIAGNOSIS ---');
            console.log('The "NOT_FOUND" (5) error usually confirms the index is missing or building.');
            console.log('If there is a URL above, please click it to create/view the index.');
        }
    }
}

testQuery();
