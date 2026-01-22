# Auth Flow Test Instructions

## Current Setup:
- Entry page: `http://localhost:3000/Entry.html`
- Dashboard: `http://localhost:3000/dashboard.html`

## Expected Behavior:

### Test 1: Not Logged In
1. Open browser in **Incognito/Private mode** (to clear auth)
2. Visit: `http://localhost:3000/dashboard.html`
3. **Expected**: Should redirect to `/Entry.html` (login page)

### Test 2: After Login
1. Stay in same browser
2. Login via Entry.html (Google/Microsoft/LINE)
3. **Expected**: Should redirect to `/dashboard.html`

### Test 3: Already Logged In
1. If already logged in from before
2. Visit: `http://localhost:3000/Entry.html`
3. **Expected**: Should redirect to `/dashboard.html`

## Troubleshooting:

**If no redirect happens:**
- You might already be logged in
- Try: Open DevTools → Console → Check for "User logged in, redirecting..." message
- Or: Logout first, then test

**To force logout:**
1. Go to entry.html
2. If you see user profile, click "Logout"
3. Then test the flow again

## Current URLs (case-sensitive!):
- ✅ Entry: `/entry.html` (lowercase e)
- ✅ Dashboard: `/dashboard.html` (lowercase d)
