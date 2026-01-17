---
description: Rules for using Firebase CLI
---

# Firebase CLI Usage Rule

## 🚫 STOP AND READ
**NEVER** assume `firebase` is installed globally or in the PATH.
**NEVER** try to install firebase-tools globally (`npm install -g firebase-tools`).

## ✅ CORRECT USAGE
ALWAYS use `npx` with the `-y` and `-p` flags for ANY firebase command:

```bash
npx -y -p firebase-tools firebase <command>
```

### Examples:
- Login: `npx -y -p firebase-tools firebase login`
- Deploy: `npx -y -p firebase-tools firebase deploy --only functions`
- Secrets: `npx -y -p firebase-tools firebase functions:secrets:set TWILIO_ACCOUNT_SID`
