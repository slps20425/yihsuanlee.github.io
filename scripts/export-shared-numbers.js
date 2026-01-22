#!/usr/bin/env node

/**
 * Export shared numbers configuration as JSON for manual import
 *
 * Usage:
 *   node scripts/export-shared-numbers.js > shared-numbers.json
 *
 * Then import the JSON in Firestore Console:
 * 1. Go to Firestore console
 * 2. Select "Start collection" and name it "shared_numbers"
 * 3. Use a tool like Firestore bulk import or copy the data manually
 */

const sharedNumbers = {
    shared_numbers: [
        {
            id: 'primary',
            fields: {
                phoneNumber: { stringValue: '+18393334143' },
                vapiPhoneNumberId: { stringValue: '76705f8f-8ece-4a0e-a757-9581097c9ace' },
                phoneNumberStatus: { stringValue: 'active' },
                friendlyName: { stringValue: 'US Business' },
                smsEnabled: { booleanValue: true },
                capabilities: {
                    mapValue: {
                        fields: {
                            MMS: { booleanValue: true },
                            SMS: { booleanValue: true },
                            fax: { booleanValue: true },
                            voice: { booleanValue: true }
                        }
                    }
                },
                twilioSubaccountSid: { stringValue: 'AC69d839f395b4d082982faa0fd1c3cfe9' },
                twilioSubaccountAuthToken: { stringValue: '7f4742f8ccf138c8032f4292eead3caf' },
                phoneNumberPurchasedAt: { timestampValue: '2026-01-17T09:39:50Z' },
                createdAt: { timestampValue: new Date().toISOString() },
                updatedAt: { timestampValue: new Date().toISOString() }
            }
        }
    ]
};

console.log(JSON.stringify(sharedNumbers, null, 2));
