# Shared Numbers System

**Module**: Phone Number Management - Shared Pool Feature
**Status**: Active
**Last Updated**: 2026-01-22

## Overview

The Shared Numbers system allows users to activate temporary phone numbers from a shared pool without purchasing a dedicated number. Each shared number costs $3.50 per call (setup + buffer).

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                 Shared Numbers System                    │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    ┌───▼────┐      ┌────▼───┐       ┌────▼────┐
    │ Firestore│      │Dashboard │      │ Services │
    │Collection│      │Selector  │      │Validation│
    └────────┘       └──────────┘      └─────────┘
```

### Data Flow

**Activation Flow:**
```
User (logged in, no number)
    ↓
Dashboard: Select from available numbers list
    ↓
Confirm dialog with $3.50 cost
    ↓
Save to Firestore: users/{uid}/settings/settings
  - phoneNumber: string
  - phoneNumberStatus: "active"
  - vapiPhoneNumberId: string
  - phoneNumberType: "shared"
  - sharedNumberActivatedAt: timestamp
    ↓
User can now make calls/reservations
```

**Call/Reservation Flow:**
```
User initiates call/reservation
    ↓
Check: phoneNumberType === "shared"?
    ↓ YES
Add $3.50 shared number fee to minRequired cost
    ↓
Check user credits >= minRequired
    ↓
On successful call submission:
  - Deduct call cost (rate × duration)
  - Deduct $3.50 shared number fee
  - Update Firestore transaction
```

## Key Files

### Source Code

| File | Purpose |
|------|---------|
| `src/shared-number-config.ts` | Real-time Firestore listener for shared numbers collection |
| `src/phone-numbers.ts` | Dashboard UI: list selector, activation logic |
| `src/mouthpiece.ts` | Mouthpiece service: cost calculation, number display |
| `src/reservation.ts` | Reservation service: cost calculation, number display |

### HTML Templates

| File | Purpose |
|------|---------|
| `dashboard.html` | Shared numbers list, activation dialog |
| `reservation/mouthpiece.html` | Mouthpiece service page, no-number dialog |
| `reservation/restaurant_reservation.html` | Reservation service page, no-number dialog |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/setup-shared-numbers.js` | Initialize Firestore `shared_numbers` collection |
| `scripts/export-shared-numbers.js` | Export numbers to JSON for manual import |

## Firestore Schema

### Collection: `shared_numbers`

Documents are ordered by `createdAt` descending (newest first).

```javascript
{
  id: "primary" | "secondary" | ... ,
  phoneNumber: "+18393334143",
  vapiPhoneNumberId: "76705f8f-8ece-4a0e-a757-9581097c9ace",
  phoneNumberStatus: "active",
  friendlyName: "US Business",
  smsEnabled: true,
  phoneNumberPurchasedAt: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,

  // Optional metadata
  capabilities: {
    MMS: boolean,
    SMS: boolean,
    fax: boolean,
    voice: boolean
  },
  twilioSubaccountSid: string,
  twilioSubaccountAuthToken: string
}
```

### User Settings: `users/{uid}/settings/settings`

When user activates a shared number:

```javascript
{
  phoneNumber: "+18393334143",
  phoneNumberStatus: "active",
  vapiPhoneNumberId: "76705f8f-8ece-4a0e-a757-9581097c9ace",
  phoneNumberType: "shared", // vs "dedicated"
  sharedNumberActivatedAt: "2026-01-22T10:56:11.727Z"
}
```

## Features

### Dashboard (Shared Pool Card)

1. **Number Selector List**
   - Displays all available shared numbers from Firestore
   - Shows up to 10 numbers
   - Each number shows:
     - Formatted phone number
     - Status: "Available • $3.50 per call"
     - Hover effects for better UX

2. **Activation Dialog**
   - Shows selected phone number
   - Displays cost breakdown: $1.00 setup + $2.50 buffer
   - SMS warning (shared numbers don't support SMS)
   - "Activate Now" button triggers Firestore save

3. **Persistent Display**
   - After activation, shows "✨ Shared Business Number" section
   - Phone number persists across page refreshes
   - "Upgrade to permanent number" option

### Service Pages (Mouthpiece & Reservation)

1. **Cost Calculation**
   ```typescript
   let minRequired = ratePerMin * defaultOnHold;
   if (useSharedNumber) {
       minRequired += 3.50; // $3.50 shared number fee
   }
   ```

2. **Error Messages**
   - Detailed breakdown: "Need $X.XX ($Y.YY call + $3.50 shared number fee)"

3. **No-Number Dialog**
   - Shown when user is logged in but has no phone number
   - Clear CTA: "Get a Number"
   - Links to dashboard to purchase/activate

## Cost Model

| Component | Cost |
|-----------|------|
| One-time Setup Fee | $1.00 |
| Call Buffer (Pre-auth Hold) | $2.50 |
| **Total per Usage** | **$3.50** |

Costs are deducted when:
- User makes a call (Mouthpiece service)
- User creates a reservation (Reservation service)

## Integration Points

### With Payment System
- `minRequired` cost calculation in mouthpiece.ts and reservation.ts
- Transaction deduction in Cloud Functions

### With User Management
- Settings stored in `users/{uid}/settings/settings`
- `phoneNumberType: 'shared'` field discriminates from dedicated numbers

### With Inbox/SMS
- Shared numbers don't support SMS
- SMS filtering checks `phoneNumberType` field

## API/Function Exports

### `shared-number-config.ts`

```typescript
// Initialize real-time listener
export function initSharedNumberConfig(): void

// Get first (newest) shared number
export function getSharedNumberConfig(): {
  id: string;
  phoneNumber: string;
  vapiPhoneNumberId: string;
} | null

// Get all shared numbers (top 10 limit)
export function getAllSharedNumbers(): Array<{...}>

// Fetch one-time (fallback if listener not initialized)
export async function fetchSharedNumberConfigOnce(): Promise<{...}>
```

## How to Add More Shared Numbers

### Option 1: Update Setup Script

Edit `scripts/setup-shared-numbers.js`:

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
            vapiPhoneNumberId: 'new-vapi-id',
            // ... other fields
        }
    }
];
```

Then run:
```bash
node scripts/setup-shared-numbers.js
```

### Option 2: Manual Firestore Entry

1. Go to Firebase Console → Firestore
2. Collection: `shared_numbers`
3. Add document with ID (e.g., "primary", "secondary")
4. Fill in all required fields
5. Dashboard list will auto-update

## Testing

### Test Scenarios

1. **Activation**
   - [ ] Log in without phone number
   - [ ] Navigate to dashboard
   - [ ] Click shared number from list
   - [ ] Confirm dialog appears
   - [ ] Click "Activate Now"
   - [ ] Number persists after refresh

2. **Cost Deduction**
   - [ ] User with $10 credits
   - [ ] Initiate call with shared number
   - [ ] Verify `minRequired` includes $3.50 fee
   - [ ] Complete call
   - [ ] Verify both call cost + $3.50 deducted

3. **No Number State**
   - [ ] Log in without phone number
   - [ ] Navigate to /reservation/mouthpiece.html
   - [ ] No-number dialog appears
   - [ ] Click "Get a Number" → redirects to dashboard

4. **Multiple Numbers**
   - [ ] Add 2+ numbers to Firestore
   - [ ] Dashboard shows all in list
   - [ ] Each can be activated independently

## Error Handling

| Error | Handling |
|-------|----------|
| No numbers in Firestore | Shows "No shared numbers available" message |
| User not logged in | Shows "Not logged in" message |
| User has no number | Shows phone number required dialog |
| Firestore fetch fails | Fallback to cached data or error message |
| Insufficient credits | Shows detailed cost breakdown error |

## Performance Notes

- Firestore queries ordered by `createdAt DESC` for fast retrieval
- Client-side filtering to top 10 numbers
- Real-time listener in `shared-number-config.ts` updates cache
- Dashboard fetches directly from Firestore (no cache dependency)

## Future Enhancements

1. **Number Rotation**: Auto-select least-used number
2. **Regional Selection**: Filter numbers by country/region
3. **Usage Analytics**: Track which shared numbers are most used
4. **Pricing Tiers**: Different costs for different number types
5. **Bulk Purchase**: Discount for multiple shared number activations
