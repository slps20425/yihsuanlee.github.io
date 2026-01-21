# WiseCat Project Setup

> **Add this to your user rules so agents remember the setup!**

## ⚠️ CRITICAL DEVELOPMENT RULES
1. **Firestore Database**: ALWAYS use the named database `reservation`.
   - **Frontend**: Import `db` from `./src/firebase-config.ts`. DO NOT initialize `getFirestore()` yourself.
   - **Backend**: Use `getFirestore(app, "reservation")`.
2. **Auth**: Import `auth` from `./src/firebase-config.ts`.
3. **UI/UX**: Never use native browser alerts (`alert`, `confirm`). Use `showToast()` for notifications.


## ✅ Installed Tools

### Global Tools (Already Installed)
- ✅ **Node.js** - v20+
- ✅ **npm** - Package manager
- ✅ **Firebase CLI** - `firebase-tools` (already installed globally)
- ✅ **Git** - Version control

### Project Dependencies (Already Installed)
- ✅ **Vite** - Frontend build tool
- ✅ **TypeScript** - Type safety
- ✅ **Firebase SDK** - Auth, Firestore, Functions
- ✅ **Intl-Tel-Input** - Phone input widget

## 🔧 Environment Setup

### Firebase Secrets (Production Only)
```bash
# Set these ONCE before deploying Cloud Functions
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set VAPI_API_KEY
```

**Values:**
- `TWILIO_ACCOUNT_SID` - Your Twilio master account SID (starts with AC...)
- `TWILIO_AUTH_TOKEN` - Your Twilio master auth token
- `VAPI_API_KEY` - Your Vapi.ai API key

## 📁 Project Structure

```
yihsuanlee.github.io/
├── src/                    # TypeScript source files
│   ├── entry.ts           # Login page logic
│   ├── phone-numbers.ts   # Dashboard & phone management
│   ├── reservation.ts     # Restaurant booking
│   ├── mouthpiece.ts      # Mouthpiece service
│   └── trial.ts           # Trial service
├── functions/             # Firebase Cloud Functions
│   └── index.js          # All backend logic
├── Entry.html            # Login page
├── dashboard.html        # Phone number management dashboard
├── reservation.html      # Restaurant page
└── vite.config.ts       # Build config
```

## 🚀 Common Commands

### Development
```bash
# Start dev server (localhost:3000)
npx vite

# Run in background
npx vite &
```

### Deployment
```bash
# Deploy Cloud Functions
cd functions
npm run deploy
cd ..

# Deploy Frontend (GitHub Pages)
npm run ship
```

### Firebase
```bash
# Login to Firebase
firebase login

# Check current project
firebase use

# View secrets
firebase functions:secrets:access TWILIO_ACCOUNT_SID
```

## 🗄️ Firebase Setup

### Databases
- **Default (firestore)** - Main database for users, tasks, credits
- **Reservation** - Restaurant bookings, phone settings

### Cloud Functions
- `searchNumbers` - Search available Twilio numbers
- `purchasePhoneNumber` - Buy number, create subaccount, import to Vapi
- `releasePhoneNumber` - Release number from Twilio & Vapi
- `priorityDispatcher` - Task queue management
- `invokeAI` - Vapi AI assistant calls

## 🔐 Security Notes

1. **Never commit secrets** to Git
2. **Use Firebase secrets** for API keys
3. **Auth required** for all phone number operations
4. **One number per user** enforced in backend

## 📝 Key Features

### Phone Number Management
- 🌍 43 countries supported
- 📞 Voice/SMS/MMS capability filters
- 🎨 Dynamic credit progress bar (red → yellow → green)
- 🔐 Auto-creates Twilio subaccounts
- 📱 Auto-imports to Vapi

### Dashboard
- 📱 Mobile-first design (bottom nav)
- 🖥️ Desktop sidebar (>1024px)
- 🎨 Gradient background
- 📊 Real-time credit tracking
- 👤 User profile with masked credentials

## 🐛 Troubleshooting

### "Firebase CLI not found"
Already installed! Just use: `firebase` (no npx needed)

### "Permission denied" on npm install -g
Already installed globally, skip this step

### Changes not reflecting
```bash
# Hard refresh browser
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)
```

### Functions deploy fails
Check that secrets are set:
```bash
firebase functions:secrets:access TWILIO_ACCOUNT_SID
```

## 📞 Testing Phone Numbers

1. Login at `/Entry.html`
2. Navigate to `/dashboard.html`
3. Click "Add Number" tab
4. Select country, capabilities, optional area code
5. Search and purchase
6. Check Profile tab for Vapi phone ID

## 💡 Tips

- **Dev Server**: Always run `npx vite` before testing
- **Secrets**: Only need to set once, they persist
- **Deploy**: Frontend and Functions deploy separately
- **Logs**: Check Firebase Console → Functions → Logs for errors
