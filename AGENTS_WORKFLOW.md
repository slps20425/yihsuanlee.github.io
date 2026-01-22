# Multi-Agent Workflow Status

## Current Status
- **Status**: `READY_FOR_QA`
- **Current Task**: Unified Dynamic Billing & Usage Tracking
- **Last Deployment**: `https://wise-catty.cc/dashboard.html`
- **Assignee**: **QA Agent (Gemini)**
- **Completed**: 2026-01-22T14:55:00+08:00
- **Deploy URL**: https://wise-catty.cc/dashboard.html
- **Notes**: Implemented Dynamic Flat Rates for Shared Pool (Twilio Live x Multiplier), Unified Usage History (Firestore + Twilio), and consistent credit deduction trigger.

## Task History
| ID | Task | Assignee | Date | Status | Notes |
|----|------|----------|------|--------|-------|
| 21 | Unified Dynamic Billing & Usage Tracking | Claude | 2026-01-22 | READY_FOR_QA | [Live URL](https://wise-catty.cc/dashboard.html) |
| 20 | Implement Shared Number System & Security Lockdown | Claude | 2026-01-22 | COMPLETED | [Live URL](https://wise-catty.cc/reservation/restaurant_reservation.html) |

## Deployment Standards
> [!IMPORTANT]
> **Always use `npm run ship`** for full deployments.
> Use `npx firebase deploy ...` for partial deployments.
> **DO NOT** rely on the global `firebase` command as it may be missing in the agent environment.

## Summary of Changes
1. ✅ **Dynamic Shared Pool Billing**: Implemented live Twilio outbound rate lookup with `common_multiplier` (no more hardcoded flat fees).
2. ✅ **Unified Usage Tracking**: Merged Firestore `usage_history` (from shared pool) and Twilio Subaccount data into the Dashboard profile.
3. ✅ **onTaskCompleted Trigger**: Added a robust Firestore trigger to reconcile credits and log usage immediately upon call completion.
4. ✅ **Frontend Price Estimation**: Updated Mouthpiece and Reservation forms to show estimations aligned with the multiplier-based logic.
5. ✅ **Code Cleanliness**: Resolved all `tsc` build errors and removed unused imports/redundant code.

## QA Testing Checklist
- [ ] **Shared Usage Logging**: Trigger a shared call (asap), complete it in Firestore, and verify a record appears in Profile -> Usage History.
- [ ] **Dynamic Pricing**: Select different countries (US, Taiwan, UK) in Mouthpiece and verify the "Cost Information" estimate changes logically.
- [ ] **Balance Reconciliation**: Verify credits are deducted correctly based on `(Twilio Base Rate * Multiplier * Duration)`.
- [ ] **UI Consistency**: Verify the Dashboard usage table shows timestamps and correct labels for both Voice and Number categories.