# Phone Number Management Setup Guide

## Backend Implementation Complete! ✅

The backend Cloud Functions for phone number management have been implemented and are ready to deploy.

---

## Required Steps Before Deployment

### 1. Configure Firebase Secrets

You need to set three secrets using Firebase CLI:

```bash
# Navigate to your project
cd /Users/yi-hsuanlee/Desktop/yihsuanlee.github.io

# Set Twilio credentials
firebase functions:secrets:set TWILIO_ACCOUNT_SID
# Enter your Twilio Account SID when prompted

firebase functions:secrets:set TWILIO_AUTH_TOKEN
# Enter your Twilio Auth Token when prompted

# Set Vapi API key
firebase functions:secrets:set VAPI_API_KEY
# Enter your Vapi API key when prompted
```

**Where to find these credentials:**
- **Twilio**: https://console.twilio.com → Account Info
  - Account SID (e.g., `AC...`)
  - Auth Token (click to reveal)
- **Vapi**: https://dashboard.vapi.ai → API Keys
  - Create new API key if needed

### 2. Deploy Functions

```bash
cd functions
npm run deploy
```

This will deploy two new Cloud Functions:
- `searchNumbers` - Search available phone numbers
- `purchasePhoneNumber` - Purchase and configure numbers

---

## What's Implemented

### Backend Functions

✅ **searchNumbers**:
- Searches Twilio for available numbers by area code
- Returns list of 10 available numbers
- Requires user authentication

✅ **purchasePhoneNumber**:
- Creates Twilio subaccount (first purchase only)
- Purchases phone number using subaccount
- Imports number to Vapi automatically
- Saves all data to Firestore `users/{uid}/settings`
- Complete error handling and logging

✅ **releasePhoneNumber** (Manual):
- **User-initiated** release via frontend button
- Deletes from Vapi
- Releases from Twilio (stops future billing)
- Updates Firestore status
- **Important**: Twilio charges full month upfront, no refunds

✅ **autoReleaseOnLowCredits** (Scheduled):
- Runs daily at midnight UTC
- Auto-releases when **credits < (phone_cost * 2)**
- Example: If phone costs $3/month, releases when credits < $6
- **Purpose**: Prevent users from accumulating debt
- Users can manually release anytime before this

### Firestore Schema

Data stored in `users/uid_{uid}/settings`:
```javascript
{
  twilioSubaccountSid: "AC...",         // Created once per user
  twilioSubaccountAuthToken: "...",     // Subaccount token
  phoneNumber: "+18001234567",          // Purchased number
  vapiPhoneNumberId: "...",             // Vapi's ID
  phoneNumberStatus: "active",          // "active" | "released" | "auto_released" | "error"
  phoneNumberPurchasedAt: timestamp,    // When purchased
  phoneNumberReleasedAt: timestamp,     // When released
  releaseReason: "low_credits"          // Why auto-released
}
```

**Phone Number Lifecycle & Billing:**
- **Day 0**: Purchase → Twilio charges full month ($1-3 USD)
- **Days 1-28**: Active, can release anytime (no refund)
- **Day 29**: Auto-release (prevents next billing cycle)
- **Day 30**: Would renew and charge again (if not released)

**Manual Release Button (Frontend):**
- User clicks "Release Number" → Immediate release
- No refund for remaining days (Twilio policy)
- Good for: Security concerns, spam prevention, done using
---

**Auto-Release Logic:**
- Checks daily: `if (user.credits < phone_monthly_cost * 2)`
- If true → Auto-release to prevent debt
- Phone monthly cost: ~$1-3 USD (configurable in code)
- User can top up credits anytime to keep number
---

## Testing the Backend

### Test searchNumbers

```javascript
// In browser console (after deploying)
const { getFunctions, httpsCallable } = require('firebase/functions');
const functions = getFunctions();

const searchFn = httpsCallable(functions, 'searchNumbers');
const result = await searchFn({ areaCode: '415' });
console.log(result.data.numbers);
```

### Test purchasePhoneNumber

```javascript
const purchaseFn = httpsCallable(functions, 'purchasePhoneNumber');
const result = await purchaseFn({ phoneNumber: '+14155551234' });
console.log(result.data);
```

---

## Next Steps

### Frontend TODO (Not Yet Implemented)

The backend is ready, but you still need a frontend UI:
1. Phone number search interface
2. Purchase button with confirmation
3. Display of purchased number
4. Error/success notifications

**Would you like me to:**
- Implement the frontend UI components?
- Create a simple test page first?
- Or deploy backend only and test via console?

---

## Cost Warnings ⚠️

- Each phone number costs ~$1-2/month (Twilio billing)
- Calls cost per minute (Twilio + Vapi charges)
- **Test Mode**: Use Twilio test credentials if available
- **Production**: Monitor usage in Twilio/Vapi dashboards

---

## Troubleshooting

**If secrets aren't set:**
- Functions will fail with "SECRET_NAME not defined"
- Set secrets before deploying

**If Vapi import fails:**
- Number is purchased but marked with `status: "error"`
- Check `vapiImportError` field in Firestore
- Contact support to manually import

**Check logs:**
```bash
firebase functions:log --only searchNumbers,purchasePhoneNumber
```
