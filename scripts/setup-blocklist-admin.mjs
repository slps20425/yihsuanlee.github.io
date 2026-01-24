#!/usr/bin/env node
/**
 * Setup location_blocklist using gcloud + Firestore REST API with authentication
 * Run: npx -y -p @google-cloud/firestore-bundle node scripts/setup-blocklist-admin.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const projectId = 'wisecat-8df8d';

async function setupWithGcloud() {
    try {
        console.log('🚀 Setting up location_blocklist using gcloud...\n');

        // Get access token from gcloud
        const token = execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();

        const blocklistData = {
            types: [
                'police', 'hospital', 'government_office', 'courthouse',
                'fire_station', 'military_base', 'prison', 'detention_center',
                'city_hall', 'parliament', 'senate', 'embassy', 'consulate'
            ],
            keywords: [
                'police', 'hospital', 'government', 'courthouse', 'jail',
                'prison', 'military', 'fbi', 'cia', 'dea', 'embassy',
                'consulate', 'parliament', 'congress', 'senate', 'city hall',
                'fire station', 'detention'
            ],
            active: true,
            lastUpdated: new Date().toISOString()
        };

        // Format for Firestore REST API
        const firestoreData = {
            fields: {
                types: {
                    arrayValue: {
                        values: blocklistData.types.map(t => ({ stringValue: t }))
                    }
                },
                keywords: {
                    arrayValue: {
                        values: blocklistData.keywords.map(k => ({ stringValue: k }))
                    }
                },
                active: { booleanValue: true },
                lastUpdated: { timestampValue: blocklistData.lastUpdated }
            }
        };

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/reservation/documents/configuration/location_blocklist`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(firestoreData)
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Error:', error);
            process.exit(1);
        }

        console.log('✅ Successfully created settings/location_blocklist');
        console.log('\nDocument contents:');
        console.log('├── types:', blocklistData.types.length, 'items');
        console.log('├── keywords:', blocklistData.keywords.length, 'items');
        console.log('├── active: true');
        console.log('└── lastUpdated:', blocklistData.lastUpdated);

        console.log('\n✨ Setup complete! The blocklist is now live.');
        console.log('To update it, go to Firebase Console > Firestore > settings > location_blocklist\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setupWithGcloud();
