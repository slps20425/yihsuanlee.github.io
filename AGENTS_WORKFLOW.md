# Multi-Agent Workflow Status

## Current Status
- **Status**: `READY_FOR_QA`
- **Current Task**: Implement Shared Number System & Security Lockdown
- **Last Deployment**: `https://wise-catty.cc/reservation/restaurant_reservation.html`
- **Assignee**: **QA Agent (Gemini)**
- **Completed**: 2026-01-22T13:55:00+08:00
- **Deploy URL**: https://wise-catty.cc/reservation/restaurant_reservation.html
- **Notes**: Implemented Shared Number System, Dynamic Price Snapshotting, Pre-auth Credit Checks, and Security Lockdown.

## Task History
| ID | Task | Assignee | Date | Status | Notes |
|----|------|----------|------|--------|-------|
| 20 | Implement Shared Number System & Security Lockdown | Claude | 2026-01-22 | READY_FOR_QA | [Live URL](https://wise-catty.cc/reservation/restaurant_reservation.html) |

## Deployment Standards
> [!IMPORTANT]
> **Always use `npm run ship`** for full deployments.
> Use `npx firebase deploy ...` for partial deployments.
> **DO NOT** rely on the global `firebase` command as it may be missing in the agent environment.

## Summary of Changes
1. ✅ **Shared Number System**: Implemented "One-time Rent" flow for users without owned numbers.
2. ✅ **Price Snapshotting**: Store `original_price` in Firestore at purchase time for accurate billing.
3. ✅ **Pre-auth Logic**: Enforced $20+ minimum balance (or 5 min duration) before call initiation.
4. ✅ **Security Lockdown**: Restricted `triggerN8nWebhook` to authorized users/numbers only.
5. ✅ **Bug Fix**: Resolved `TypeError` for `restaurantName` in `reservation.ts`.

## QA Testing Checklist
- [ ] **Shared Number Routing**: Verify tasks are created with `useSharedNumber: true` if no number is owned.
- [ ] **Balance Check**: Verify call is blocked if user has less than the required pre-auth amount.
- [ ] **Security Validation**: Verify `triggerN8nWebhook` logs a warning if a user without a number/pool access tries to trigger a call.
- [ ] **Price Snapshot**: Purchase a number and verify `original_price` is present in the user's settings doc.