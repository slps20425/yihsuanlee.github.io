# Setup Scripts

This directory contains scripts to help configure Firestore for the WiseCat application.

## Shared Numbers Setup

### Option 1: Automatic Setup (Recommended)

**Requirements:**
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in to Firebase: `firebase login`
- Or have `GOOGLE_APPLICATION_CREDENTIALS` environment variable set

**Run the setup:**

```bash
node scripts/setup-shared-numbers.js
```

This will automatically create the `shared_numbers` collection and add the primary shared number configuration.

### Option 2: Manual Import via Firestore Console

**Step 1: Generate the JSON export**

```bash
node scripts/export-shared-numbers.js > shared-numbers.json
```

**Step 2: Add to Firestore manually**

1. Go to [Firebase Console](https://console.firebase.google.com) → Firestore Database
2. Click **"Start collection"** and name it `shared_numbers`
3. Click **"Add document"** and use ID `primary`
4. Manually add these fields:

```
phoneNumber: "+18393334143"
vapiPhoneNumberId: "76705f8f-8ece-4a0e-a757-9581097c9ace"
phoneNumberStatus: "active"
friendlyName: "US Business"
smsEnabled: true
createdAt: (server timestamp)
updatedAt: (server timestamp)
phoneNumberPurchasedAt: January 17, 2026 at 9:39:50 AM UTC

capabilities (map):
├── MMS: true
├── SMS: true
├── fax: true
└── voice: true

twilioSubaccountSid: "AC69d839f395b4d082982faa0fd1c3cfe9"
twilioSubaccountAuthToken: "7f4742f8ccf138c8032f4292eead3caf"
```

### Option 3: Using Firestore Admin SDK

If you have service account credentials, you can authenticate directly:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/serviceAccountKey.json
node scripts/setup-shared-numbers.js
```

## Adding Multiple Shared Numbers

To add more shared numbers, edit `setup-shared-numbers.js` and add entries to the `sharedNumbers` array:

```javascript
const sharedNumbers = [
    {
        id: 'primary',
        data: { /* existing config */ }
    },
    {
        id: 'secondary',
        data: {
            phoneNumber: '+1234567890',
            vapiPhoneNumberId: 'your-vapi-id',
            // ... other fields
        }
    }
];
```

The app will automatically use the most recent one (ordered by `createdAt` descending).

## Firestore Collection Structure

```
shared_numbers (collection)
├── primary (document)
│   ├── phoneNumber: string
│   ├── vapiPhoneNumberId: string
│   ├── phoneNumberStatus: string
│   ├── friendlyName: string
│   ├── smsEnabled: boolean
│   ├── capabilities: map
│   ├── twilioSubaccountSid: string
│   ├── twilioSubaccountAuthToken: string
│   ├── phoneNumberPurchasedAt: timestamp
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
└── secondary (document, optional)
    └── ... (same structure)
```

## Verification

After running the script or manual setup:

1. Go to Firestore Console
2. Look for `shared_numbers` collection
3. Verify the `primary` document has all fields
4. The app will automatically fetch and cache this data

## Troubleshooting

**"Failed to initialize Firebase"**
- Make sure `firebase login` is run, or set `GOOGLE_APPLICATION_CREDENTIALS`

**"Collection not found"**
- Run the script again to create the collection
- Or manually create it in Firestore Console

**Changes not reflecting in app**
- Wait for the 5-minute cache to expire in Cloud Functions
- Or restart the app to clear the client-side cache
