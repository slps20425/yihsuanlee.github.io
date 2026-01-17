# Tasks

## High Priority
- [x] [6XnvNW9fYT9kRrL0kE2D] Bug: Fix not able to access mouthpiece page
  - Priority: 5 (Critical)
  - Content: Bug - fix not able to access mouthpiece page
- [x] [Hp5FtA9AHQEAKzSoedUM] Task: Check Retry Mechanism
  - Verify if current retry default is 5.
  - Check if it's taken from `configuration/settings`.
  - Implement if missing.
- [x] [yS9l5F3BObN6lUm12ufo] Bug: Task Description Truncation
  - Fix inability to see full content of description in dev task (admin/tasks).
- [x] [9RAUQv9hE2YHUqBK2EZa] Feature: Limit Delete to Owner
  - Restrict delete action in admin/tasks to the task creator.
- [x] [fZJDQD3vJY0Wx9IHmJyc] Feature: Admin Page Pagination & Numbers
  - Add No. column.
  - Add pagination.
- [x] [izTTdOpGx6bpCmm6P5HX] Feature: Scam Detector Enhancement
  - Phase 1: Firestore Config (Golden List).
  - Phase 2: Backend (Cloud Function `checkMessageSafety`).
  - Phase 3: Frontend UX (Validation, Toaster, Alarm).
  - Phase 4: Trial Message Copy.
- [x] [JQyKbEfDmJhOspkQq2PE] Feature: Partial Quantity Acceptance
  - Default "Agree to partial quantity" to enabled.
  - If disabled, disallow reservation with food-preorder.
- [x] [EhmQowE8UVc0g5Ti9Nev] Bug: Login Unstable (Session Lost)
  - Login lost when switching tabs.
  - Increase session timeout.
- [x] [jUqXhbjuhvx7t76psGnP] Feature: Session Timeout Popup
  - Change browser default popup to centered toaster.
- [x] [1kyakEzZmNXTBLlof6Bj] Bug: Fix able to delete other user task
  - "not allow to delete other user task"
- [x] [t7UZtginqdVTuIlyYcmm] Feature: Allow admin dev task to be editable
  - "allow admin dev task is editable for pending task"
- [x] [SORT_BUG] Bug: Fix sorting in admin tasks
  - Report: "why the sorting function not working in admin/tasks please check"

## Completed
- [x] [Ex2Sn0N8oTrc5ZlZAUD5] Feature: Admin Page Improvements
- [x] [3kAIBjSwvfRexWbMDgYQ] Feature: Restaurant Pre-order Warning Popup
- [x] [xp3T5gfbXd4pEtknJn5z] New Feature: Pre-order Date Logic
- [x] [qD0bKDvf7jL0pdTLFz0i] New Feature: Delete Dev Task
- [x] [VekLP5lAdUq2A7IU26xA] bug fix: Infinite URL Redirection
- [x] [sOguqwdjXXewt2IAY3I7] feature dev_task adding new field
- [x] [Nb677QYLmAYmapGgbh6f] Create Task Entry Page (/admin/tasks)
- [x] [ADMIN_PROFILE] Feature: Improve Admin Profile Display
- [x] [INTL_TEL_BUG] Bug: Fix Intl-Tel-Input Initialization
  - "phone number country code not display required a refresh"
  - Investigate `onload` race condition.


## Pending Tasks
- [/] [VyD5R9OUuGKx79NUScto] Feature: Subaccount & Phone Number Management  
  - Priority: 5 (HIGH)
  - Implement Twilio subaccount creation per user
  - Phone number purchase flow with Vapi integration
  - Backend GCF: purchasePhoneNumber, searchNumbers
  - Frontend: Purchase confirmation dialog
  - Firestore schema updates for settings
- [ ] [D3EwAFfOxo7SUyojiv4C] Feature: SMS Inbox
  - Priority: 4
  - Create personal inbox for each user to receive SMS
  - For announcements, ads, and policy notifications
  - Each user has their own phone number
- [x] [87VX2nLsZQj45c7CCven] Feature: Restaurant Page UI Enhancement
  - Priority: 3
  - Add increment/decrement buttons for party size and quantity
  - Ensure UI alignment with other elements
- [x] [BadQpTrsAQjiNEjoH30c] Bug: Fix Admin Task Upload (CORS Issue)
  - Priority: 3
  - Fix CORS preflight issue preventing screenshot uploads
  - Error: HTTP status of preflight request didn't indicate success
  - Note: Fixed by initializing Firebase Storage (not CORS)
- [x] [l2SHMD6EKvJAgFSSPZ05] Bug: Admin Page Mobile UI
  - Priority: 3
  - Fix admin page UI that looks messy on mobile
  - Note: Added responsive CSS with media queries for mobile/tablet
- [ ] [zCsqtM37u6uWLkrGgNuN] Feature: Enhanced Success Message
  - Priority: 3
  - Update success messages for all services (restaurant, mouthpiece, trial)
  - Template: "Dear {{client_name}} we've receive the task. we will schedule your call ASAP. once finished will send result to {{client_email}}."
- [ ] [NL8cMOdrF8yjasb8LmqN] Feature: Background Consistency
  - Priority: 2
  - Change trial and mouthpiece background to match entry page

## Backlog
- [ ] Example Task 1
