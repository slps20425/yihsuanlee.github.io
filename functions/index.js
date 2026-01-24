const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const axios = require("axios");
const twilio = require('twilio');

admin.initializeApp();
const db = admin.firestore();

// Define secrets
const lineChannelId = defineSecret("LINE_CHANNEL_ID");
const lineChannelSecret = defineSecret("LINE_CHANNEL_SECRET");
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const TWILIO_ACCOUNT_SID = defineSecret("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = defineSecret("TWILIO_AUTH_TOKEN");
const VAPI_API_KEY = defineSecret("VAPI_API_KEY");
const PINECONE_API_KEY = defineSecret("PINECONE_API_KEY");

// ... (Existing code remains the same until exports.checkMessageSafety)

// ... Imports
const { getFirestore } = require("firebase-admin/firestore"); // Import getFirestore

// ...

// checkMessageSafety logic merged into validateMissionV2 to reduce cloud invocation costs.

// Global set for debouncing duplicate requests
const processedCodes = new Set();

// Cache for shared number configs (fetched from Firestore collection)
let cachedSharedNumbers = [];
let sharedNumberConfigFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch shared numbers from Firestore collection with caching
 * Returns array of shared number configs ordered by createdAt (newest first)
 */
async function getSharedNumbers() {
    const now = Date.now();

    // Return cached if still valid
    if (cachedSharedNumbers.length > 0 && (now - sharedNumberConfigFetchTime) < CACHE_DURATION) {
        return cachedSharedNumbers;
    }

    try {
        const snapshot = await db.collection('shared_numbers')
            .orderBy('createdAt', 'desc')
            .get();

        cachedSharedNumbers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        sharedNumberConfigFetchTime = now;

        console.log(`Cached ${cachedSharedNumbers.length} shared numbers`);
        return cachedSharedNumbers;
    } catch (error) {
        console.error('Error fetching shared numbers:', error);
        return [];
    }
}

/**
 * Get the first (most recent) shared number
 * Falls back to hardcoded if collection is empty
 */
async function getFirstSharedNumber() {
    const numbers = await getSharedNumbers();
    if (numbers.length > 0) {
        return numbers[0];
    }

    // Fallback to hardcoded
    return {
        phoneNumber: "+18393334143",
        vapiPhoneNumberId: "76705f8f-8ece-4a0e-a757-9581097c9ace"
    };
}

exports.lineCallback = onRequest(
    { secrets: [lineChannelId, lineChannelSecret] },
    async (req, res) => {
        // ... (Existing Line Callback Logic - Unchanged)
        const rawCode = req.query.code;
        if (!rawCode) return res.status(400).send("No code");

        // --- 1: Anti-Duplicate (Race Condition) ---
        if (processedCodes.has(rawCode)) {
            console.log("Skipping duplicate request for code:", rawCode.substring(0, 5));
            console.log("Skipping duplicate request for code:", rawCode.substring(0, 5));
            // FIXED: Don't just end() which causes white screen. Show a helpful page.
            res.send(`
                <html>
                <head>
                    <title>Login Processing...</title>
                    <meta http-equiv="refresh" content="3;url=https://wise-catty.cc/dashboard.html">
                    <style>
                        body { font-family: sans-serif; text-align: center; padding: 50px; background: #f9fafb; color: #333; }
                        .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        h2 { color: #2563eb; }
                        p { color: #666; }
                        a { color: #2563eb; text-decoration: none; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Login Processing...</h2>
                        <p>We detected a duplicate request (common with some browsers).</p>
                        <p>You should be logged in automatically.</p>
                        <p>If not redirected, <a href="https://wise-catty.cc/dashboard.html">click here to go to Dashboard</a>.</p>
                    </div>
                </body>
                </html>
            `);
            return;
        }
        processedCodes.add(rawCode);
        setTimeout(() => processedCodes.delete(rawCode), 10000);

        const cId = String(lineChannelId.value()).trim();
        const cSecret = String(lineChannelSecret.value()).trim();
        const rUri = "https://wise-catty.cc/api/auth/line/callback";

        try {
            // --- 2: Strict Encoding ---
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', rawCode);
            params.append('redirect_uri', rUri);
            params.append('client_id', cId);
            params.append('client_secret', cSecret);

            const response = await axios.post(
                "https://api.line.me/oauth2/v2.1/token",
                params,
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            // Decode Token
            const decoded = require("jsonwebtoken").decode(response.data.id_token);
            const uid = `line:${decoded.sub}`;
            const email = decoded.email;
            const displayName = decoded.name;
            const photoURL = decoded.picture;

            // --- 3: Account Merging (Handle "Email already in use") ---
            try {
                // Try to find existing user by email
                const existingUser = await admin.auth().getUserByEmail(email);
                const targetUid = existingUser.uid;

                // Merge: Update existing user with LINE info
                await admin.auth().updateUser(targetUid, {
                    displayName: displayName,
                    photoURL: photoURL,
                    // emailVerified: true
                });

                // Mint token for EXISTING UID
                const customToken = await admin.auth().createCustomToken(targetUid);
                return res.redirect(`https://wise-catty.cc/login-success.html?token=${customToken}`);

            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    // No existing user, create NEW one with LINE UID
                    await admin.auth().createUser({
                        uid: uid,
                        email: email,
                        displayName: displayName,
                        photoURL: photoURL,
                        emailVerified: true
                    });
                    const customToken = await admin.auth().createCustomToken(uid);
                    return res.redirect(`https://wise-catty.cc/login-success.html?token=${customToken}`);
                }
                throw error;
            }

        } catch (error) {
            console.error("EXCHANGE_ERROR:", error.response?.data || error);
            res.status(500).json({ detail: error.response?.data || error.message });
        }
    }
);

// --- New Trigger: Priority Queue Dispatcher ---
exports.triggerN8nWebhook = onDocumentCreated(
    {
        document: "tasks/{taskId}",
        database: "reservation", // Explicitly target "reservation" database
        secrets: [lineChannelId, lineChannelSecret] // (Optional if needed, but safe to include)
    },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) return; // No data

        const taskData = snapshot.data();
        if (taskData.state !== 'pending') return; // Only process pending tasks

        console.log(`New Task Created: ${event.params.taskId}, Priority: ${taskData.priority}`);

        // Query for the Highest Priority Pending Task
        // We use a transaction to ensure we pick and lock one atomically-ish (or at least robustly)
        // Note: Firestore Transactions require operations to be read then write.
        // However, we need to query a collection.

        try {
            // 1. Find the winner
            // Use the Firestore instance from the event itself to ensure correct DB connection
            const db = event.data.ref.firestore;
            const tasksRef = db.collection('tasks');
            const querySnapshot = await tasksRef
                .where('state', '==', 'pending')
                .orderBy('priority', 'desc')       // 5 -> 3
                .orderBy('reservation_utc', 'asc') // Oldest first
                .orderBy('createdAt', 'asc')       // Tie-breaker
                .limit(1)
                .get();

            if (querySnapshot.empty) {
                console.log("No pending tasks found (strange, seeing as we just triggered).");
                return;
            }

            const winnerDoc = querySnapshot.docs[0];
            const winnerData = winnerDoc.data();
            const winnerId = winnerDoc.id;

            console.log(`Winner Task Identified: ${winnerId} (Priority: ${winnerData.priority})`);

            // --- [TASK 3 & 4] Security Lockdown & Pre-auth Middleware ---
            const uid = winnerData.uid || winnerData.userId; // Support both naming variants
            if (!uid) {
                console.error(`[Lockdown] Task ${winnerId} missing UID. ABORTING.`);
                await tasksRef.doc(winnerId).update({ state: 'error', error: 'Missing User ID' });
                return;
            }

            const userRef = db.doc(`users/${uid.startsWith('uid_') ? uid : 'uid_' + uid}`);
            const settingsRef = userRef.collection('settings').doc('settings');

            // 1. Validate Access (Owned Number OR Valid Shared Number)
            const settingsDoc = await settingsRef.get();
            const settings = settingsDoc.data() || {};
            const hasActiveNumber = settings.phoneNumberStatus === 'active' && !!settings.phoneNumber;
            const sharedNumberConfig = await getFirstSharedNumber();
            const sharedPoolId = sharedNumberConfig?.vapiPhoneNumberId || "76705f8f-8ece-4a0e-a757-9581097c9ace"; // Fallback to hardcoded if config unavailable
            const isUsingShared = (winnerData.vapiPhoneNumberId === sharedPoolId || winnerData.useSharedNumber === true);

            if (!hasActiveNumber && !isUsingShared) {
                console.warn(`[Lockdown] Unauthorized Attempt for UID: ${uid}. No active number and not using pool.`);
                // Log security alert
                await db.collection('security_logs').add({
                    uid,
                    taskId: winnerId,
                    type: winnerData.type,
                    reason: 'Attempted call without number pool access',
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });
                await tasksRef.doc(winnerId).update({ state: 'error', error: 'Service Unavailable: No active phone number or shared pool selected.' });
                return;
            }

            // 2. Pre-auth (On-Hold) Check
            const configSettings = await db.doc('configuration/settings').get();
            const configData = configSettings.data() || {};
            const defaultOnHold = configData.default_callOnHold_minutes || 5;

            const billing = await getBillingConfig(db);
            const region = (winnerData.region || 'US').toUpperCase();

            // Priority 1: Flat Rate per Country (User's new "Simple" request)
            let ratePerMin = (billing.per_minute_rates && billing.per_minute_rates[region]);

            if (!ratePerMin) {
                // Priority 2: Multiplier Logic (Legacy/Fallback)
                const serviceMultiplier = (billing.services && billing.services[winnerData.type]) || 4.0;
                const regionMultiplier = (billing.country_multipliers && billing.country_multipliers[region]) || (region === 'US' ? 1 : 3);

                // Baseline fallback if NO flat rate exists: 
                // US: $0.30 per min, TW: $0.50 per min
                const baseline = (region === 'US' ? 0.30 : (region === 'TW' ? 0.50 : 0.40));
                ratePerMin = baseline;
            }

            const minRequired = ratePerMin * defaultOnHold;

            const userDoc = await userRef.get();
            const currentBalance = (userDoc.data() && userDoc.data().credits) || 0;

            console.log(`[Pre-auth] User ${uid} Balance: $${currentBalance}, Required (Flat Rate: $${ratePerMin.toFixed(2)}/min): $${minRequired.toFixed(2)}`);

            if (currentBalance < minRequired) {
                console.warn(`[Pre-auth] Aborting Task ${winnerId} due to low balance.`);
                await tasksRef.doc(winnerId).update({
                    state: 'error',
                    error: `Insufficient balance for pre-auth. At least $${minRequired.toFixed(2)} is required (based on ${defaultOnHold} min duration).`
                });
                return;
            }

            // NOTE: Shared number activation fee is charged once in phone-numbers.ts
            // when user activates the number, NOT per-call.
            // Call costs are handled separately based on duration and destination rate.

            // 4. Lock it (Set to WIP)
            await tasksRef.doc(winnerId).update({ state: 'WIP' });

            // 3. Send to N8N
            try {
                // Ensure payload has taskId
                const payload = { ...winnerData, taskId: winnerId };

                // Backfill retry_count if missing (e.g. old tasks in queue)
                if (payload.retry_count === undefined) {
                    if (payload.type === 'restaurant' || payload.type === 'reservation') {
                        payload.retry_count = 0;
                    } else {
                        payload.retry_count = 1;
                    }
                }

                await axios.post(
                    "https://n8n-1078479155773.asia-east1.run.app/webhook/tasker",
                    payload
                );
                console.log(`Task ${winnerId} dispatched to N8N successfully.`);

            } catch (webhookError) {
                console.error(`Failed to send task ${winnerId} to N8N:`, webhookError.message);
                // Revert state to pending so it can be retried? 
                // Or keep as WIP/Error to prevent loop? 
                // Let's set to 'error' or revert to 'pending' with a retry count.
                // For now, revert to pending to retry.
                await tasksRef.doc(winnerId).update({ state: 'pending', retry_count: (winnerData.retry_count || 0) + 1 });
            }

        } catch (err) {
            console.error("Error in Priority Dispatcher:", err);
        }
    }
);


/**
 * Log shared number usage and reconcile credits when a task is completed.
 */
exports.onTaskCompleted = onDocumentUpdated(
    {
        document: "tasks/{taskId}",
        database: "reservation"
    },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) return;

        const newData = snapshot.after.data();
        const oldData = snapshot.before.data();

        // 1. Only proceed if state JUST changed to 'completed'
        if (oldData.state === 'completed' || newData.state !== 'completed') return;

        // 2. Only proceed if this task used a shared number
        const sharedNumberConfig = await getFirstSharedNumber();
        const sharedPoolId = sharedNumberConfig?.vapiPhoneNumberId || "76705f8f-8ece-4a0e-a757-9581097c9ace"; // Fallback to hardcoded if config unavailable
        const isUsingShared = (newData.vapiPhoneNumberId === sharedPoolId || newData.useSharedNumber === true);
        if (!isUsingShared) {
            console.log(`[onTaskCompleted] Task ${event.params.taskId} is private, skipping auto-logging.`);
            return;
        }

        console.log(`[onTaskCompleted] Shared task completed: ${event.params.taskId}`);
        // if (!isUsingShared) {
        //     console.log(`[onTaskCompleted] Task ${event.params.taskId} is private, skipping auto-logging.`);
        //     return;
        // }

        console.log(`[onTaskCompleted] Task completed: ${event.params.taskId} (Shared: ${isUsingShared})`);

        try {
            const db = snapshot.after.ref.firestore;
            const uid = newData.userId;
            const userRef = db.doc(`users/uid_${uid}`);

            // 3. Extract Duration and Initial Cost
            // Vapi usually returns duration in seconds in results or top level
            const durationSec = newData.duration || (newData.result && newData.result.duration) || 0;
            const durationMin = Math.max(1, Math.ceil(durationSec / 60)); // Min 1 min

            const billing = await getBillingConfig(db);
            let finalCost = 0;
            let logDescription = "";

            if (isUsingShared) {
                // Shared Number Path: Dynamic Flat Rate (Twilio Outbound x Multiplier)
                let countryCode = newData.countryCode;
                if (!countryCode && newData.targetPhoneNumber) {
                    // Primitive E.164 parser for fallback
                    if (newData.targetPhoneNumber.startsWith('+886')) countryCode = 'TW';
                    else if (newData.targetPhoneNumber.startsWith('+81')) countryCode = 'JP';
                    else if (newData.targetPhoneNumber.startsWith('+1')) countryCode = 'US';
                    else if (newData.targetPhoneNumber.startsWith('+852')) countryCode = 'HK';
                    else countryCode = 'US'; // Default to US if unknown
                }

                const mainClient = twilio(TWILIO_ACCOUNT_SID.value(), TWILIO_AUTH_TOKEN.value());

                const basePrice = await retrieveOutboundCallRate(countryCode || 'US', mainClient, db);
                const multiplier = billing.common_multiplier || 3.0;

                finalCost = durationMin * basePrice * multiplier;
                logDescription = `Shared Number Call to ${newData.targetPhoneNumber} (${durationMin}m)`;
                console.log(`[onTaskCompleted] Shared Dynamic: ${durationMin}m x ($${basePrice} x ${multiplier}) = $${finalCost.toFixed(2)}`);
            } else {
                // Dedicated Number Path: Retrieve from Twilio API
                const settingsDoc = await db.doc(`users/uid_${uid}/settings/settings`).get();
                const settings = settingsDoc.data() || {};
                const callId = newData.callId || (newData.result && newData.result.callId);

                if (settings.twilioSubaccountSid && callId) {
                    try {
                        const subClient = twilio(settings.twilioSubaccountSid, settings.twilioSubaccountAuthToken);
                        const call = await subClient.calls(callId).fetch();

                        // Twilio price is usually negative (e.g., -0.013)
                        const baseTwilioPrice = Math.abs(parseFloat(call.price || 0));
                        const multiplier = billing.common_multiplier || 3.0;

                        finalCost = baseTwilioPrice * multiplier;
                        logDescription = `Dedicated Call to ${newData.targetPhoneNumber} (Actual Twilio Fee x${multiplier})`;
                        console.log(`[onTaskCompleted] Dedicated Lookup: Base $${baseTwilioPrice} x ${multiplier} = $${finalCost}`);
                    } catch (twilioErr) {
                        console.warn(`[onTaskCompleted] Twilio API lookup failed for ${callId}:`, twilioErr.message);
                        // Fallback to calculation if API fails
                        const ratePerMin = 0.40;
                        finalCost = durationMin * ratePerMin;
                        logDescription = `Dedicated Call to ${newData.targetPhoneNumber} (Fallback Calc)`;
                    }
                } else {
                    console.log(`[onTaskCompleted] Missing subaccount or callId for dedicated call. Skipping cost adjustment.`);
                    return;
                }
            }

            // 4. Log Usage Record to Firestore
            if (finalCost > 0) {
                const usageRef = db.collection(`users/uid_${uid}/usage_history`);
                await usageRef.add({
                    category: newData.type || 'calls',
                    description: logDescription,
                    usage: durationMin,
                    unit: 'minutes',
                    user_price: finalCost,
                    currency: 'USD',
                    start_date: admin.firestore.FieldValue.serverTimestamp(),
                    taskId: event.params.taskId,
                    target: newData.targetPhoneNumber,
                    isShared: isUsingShared
                });

                // NOTE: Do NOT deduct credits here!
                // Credits were already deducted in mouthpiece.ts when user submitted the call.
                // The processTaskRefund function will handle refunding any overage.
                // This avoids double-charging the user.
                console.log(`[onTaskCompleted] Logged finalCost $${finalCost.toFixed(2)} for later refund processing`);
            }

        } catch (error) {
            console.error(`[onTaskCompleted] Critical error for task ${event.params.taskId}:`, error);
        }
    }
);

/**
 * Process refund when N8N updates task with call results
 * Triggers when task.state changes to "completed" with call_duration and call_result
 *
 * N8N updates task with:
 * {
 *   call_duration: 6.31,    // Actual call duration in seconds
 *   call_result: "true",    // String "true" or "false" from N8N
 *   state: "completed"
 * }
 *
 * Refund Logic:
 * - If call_duration exists: charge min 1 minute, refund difference
 * - If no call_duration + call_result=true: charge 50%
 * - If no call_duration + call_result=false: charge 0% (full refund)
 */
exports.processTaskRefund = onDocumentUpdated(
    {
        document: "tasks/{taskId}",
        database: "reservation"
    },
    async (event) => {
        const snapshot = event.data;
        if (!snapshot) return;

        const newData = snapshot.after.data();
        const oldData = snapshot.before.data();

        // Only process if state JUST changed to 'completed'
        if (oldData?.state === 'completed' || newData.state !== 'completed') {
            return;
        }

        // Skip if already processed
        if (newData.refundStatus === 'completed' || newData.refundStatus === 'failed') {
            console.log(`[processTaskRefund] Task ${event.params.taskId} already processed`);
            return;
        }

        try {
            const db = snapshot.after.ref.firestore;
            const taskId = event.params.taskId;
            const uid = newData.userId;

            if (!uid || newData.estimatedCost === undefined) {
                console.error(`[processTaskRefund] Missing userId or estimatedCost for task ${taskId}`);
                await snapshot.after.ref.update({
                    refundStatus: 'failed',
                    refundError: 'Missing userId or estimatedCost'
                });
                return;
            }

            // ===== READ FROM TASK (set at submission) =====
            const estimatedCost = newData.estimatedCost;        // e.g., $2.4
            const estimatedDuration = newData.estimatedDuration; // e.g., 300 seconds
            const rateApplied = newData.rateApplied || {
                baseRate: 0.05,
                multiplier: 3.0,
                final: 0.15
            };

            // ===== READ FROM N8N WEBHOOK =====
            const actualDuration = newData.call_duration;       // e.g., 30.9 seconds (from N8N)
            const callResult = newData.call_result;             // e.g., "true" or "false" (from N8N)
            // Note: call_result determines refund logic for no-duration cases
            // DO NOT use "success" field - it's unreliable. Only use call_duration and call_result

            console.log(`[processTaskRefund] Processing task ${taskId}:
                call_duration=${actualDuration}s,
                call_result=${newData.call_result},
                estimatedCost=$${estimatedCost.toFixed(2)}
            `);

            let refundAmount = 0;
            let actualCost = 0;
            let actualMinutes = 0;
            let errorReason = null;

            // Extract base call cost and retry fee from task
            const baseCost = newData.baseCost || estimatedCost; // Estimated base call cost
            const retryCost = newData.retryCost || 0;           // Retry fee (non-refundable)

            // ===== CASE 1: Has duration → Normal calculation (1-min minimum) =====
            if (actualDuration !== undefined && actualDuration !== null && actualDuration > 0) {
                actualMinutes = Math.max(1, Math.ceil(actualDuration / 60));
                actualCost = actualMinutes * rateApplied.final;
                // Refund ONLY the call cost difference, NOT the retry fee
                refundAmount = Math.max(0, baseCost - actualCost);
                errorReason = null;
                console.log(`[processTaskRefund] Case 1 (Normal): ${actualDuration}s → ${actualMinutes}m → $${actualCost.toFixed(2)}, Refund: $${refundAmount.toFixed(2)} (call only, retry fee non-refundable)`);
            }
            // ===== CASE 2: No duration + call_result=true → Refund call cost only =====
            else if (callResult === "true" || callResult === true) {
                // Call was attempted but no duration recorded
                // Refund 50% of call cost (not retry)
                actualCost = baseCost * 0.5;
                refundAmount = baseCost * 0.5;
                actualMinutes = 0;
                errorReason = "Call attempted but duration missing - 50% of call cost refunded (retry fee non-refundable)";
                console.log(`[processTaskRefund] Case 2 (Call attempted, no duration): 50% refund of call = $${refundAmount.toFixed(2)}`);
            }
            // ===== CASE 3: No duration + call_result=false → Full refund of call cost =====
            else {
                // No call data recorded, refund call cost only (retry still non-refundable)
                actualCost = 0;
                refundAmount = baseCost; // Refund only call cost, keep retry fee
                actualMinutes = 0;
                errorReason = `No call data recorded - refunding call cost only (retry fee: $${retryCost.toFixed(2)} retained). call_result=${callResult}`;
                console.log(`[processTaskRefund] Case 3 (No call data): Full refund of call cost = $${refundAmount.toFixed(2)} (retry fee $${retryCost.toFixed(2)} kept)`);
            }

            const refundSeconds = estimatedDuration - (actualDuration || 0);
            const formula = actualDuration
                ? `max(1, ceil(${actualDuration}/60)) * ${rateApplied.final} = $${actualCost.toFixed(2)}`
                : errorReason;

            console.log(`[processTaskRefund] Summary for ${taskId}:
                On Hold: $${estimatedCost.toFixed(2)} (Base: $${baseCost.toFixed(2)} + Retry: $${retryCost.toFixed(2)})
                Actual Call Cost: $${actualCost.toFixed(2)}
                Refund (call only): $${refundAmount.toFixed(2)}
                Final Charge: $${(estimatedCost - refundAmount).toFixed(2)} (includes non-refundable retry fee)
            `);

            // ===== UPDATE TASK & REFUND ATOMICALLY =====
            const userRef = db.doc(`users/uid_${uid}`);

            await db.runTransaction(async (t) => {
                const userDoc = await t.get(userRef);
                const currentCredits = userDoc.data()?.credits || 0;

                // Update user with refund
                t.update(userRef, {
                    credits: currentCredits + refundAmount,
                    lastRefundAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // Update task with all calculated fields
                t.update(snapshot.after.ref, {
                    actualMinutes: actualMinutes,
                    actualCost: parseFloat(actualCost.toFixed(2)),
                    refundAmount: parseFloat(refundAmount.toFixed(2)),
                    refundSeconds: Math.max(0, refundSeconds),
                    formula: formula,
                    refundStatus: 'completed',
                    errorReason: errorReason,
                    refundProcessedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });

            console.log(`[processTaskRefund] ✓ Refunded $${refundAmount.toFixed(2)} to uid_${uid}`);

            // ===== LOG TO USAGE_HISTORY =====
            const usageRef = db.collection(`users/uid_${uid}/usage_history`);

            // Log the actual call usage
            const usageData = {
                category: 'calls',
                description: errorReason
                    ? errorReason
                    : `Call to ${newData.targetPhoneNumber} (${actualMinutes}m, ${actualDuration}s actual)`,
                usage: actualMinutes,
                unit: 'minutes',
                user_price: actualCost,
                currency: 'USD',
                start_date: admin.firestore.FieldValue.serverTimestamp(),
                taskId: taskId,
                target: newData.targetPhoneNumber,
                source: 'task_completion'
            };

            // Only include defined fields to avoid Firestore errors
            if (rateApplied?.baseRate !== undefined) usageData.baseRate = rateApplied.baseRate;
            if (rateApplied?.multiplier !== undefined) usageData.multiplier = rateApplied.multiplier;
            if (formula !== undefined) usageData.formula = formula;
            if (callResult !== undefined) usageData.call_result = callResult;
            if (actualDuration !== undefined) usageData.call_duration = actualDuration;

            await usageRef.add(usageData);

            // Log refund record ONLY if refund occurred AND no error reason
            // (when errorReason is set in Case 2 or 3, the call entry already shows the final cost)
            if (refundAmount > 0 && !errorReason) {
                await usageRef.add({
                    category: 'refund',
                    description: `Refund: Est ${estimatedDuration}s vs Actual ${actualDuration}s`,
                    usage: refundSeconds,
                    unit: 'seconds',
                    user_price: refundAmount,
                    currency: 'USD',
                    start_date: admin.firestore.FieldValue.serverTimestamp(),
                    taskId: taskId,
                    source: 'task_completion',
                    reason: 'duration_variance'
                });
            }

            // Log retry fee if retries were configured
            if (newData.retry_count > 0 && newData.retryCostPerAttempt > 0) {
                const totalRetryCost = newData.retry_count * newData.retryCostPerAttempt;
                await usageRef.add({
                    category: 'retries',
                    description: `Retry fee: ${newData.retry_count} attempts`,
                    usage: newData.retry_count,
                    unit: 'attempts',
                    user_price: totalRetryCost,
                    retryPerAttempt: newData.retryCostPerAttempt,
                    currency: 'USD',
                    start_date: admin.firestore.FieldValue.serverTimestamp(),
                    taskId: taskId,
                    source: 'task_completion'
                });
                console.log(`[processTaskRefund] ✓ Logged retry fee: $${totalRetryCost.toFixed(2)}`);
            }

            // ===== DISCONNECT SHARED NUMBER AFTER CALL =====
            // If task used a shared number, disconnect it from user's settings
            const sharedNumberConfig = await getFirstSharedNumber();
            const sharedPoolId = sharedNumberConfig?.vapiPhoneNumberId || "76705f8f-8ece-4a0e-a757-9581097c9ace";
            const wasUsingShared = (newData.vapiPhoneNumberId === sharedPoolId || newData.useSharedNumber === true);

            console.log(`[processTaskRefund] Disconnect check: vapiId=${newData.vapiPhoneNumberId}, sharedPoolId=${sharedPoolId}, useSharedNumber=${newData.useSharedNumber}, wasUsingShared=${wasUsingShared}`);

            if (wasUsingShared) {
                try {
                    const settingsRef = db.doc(`users/uid_${uid}/settings/settings`);
                    const settingsSnap = await settingsRef.get();
                    const currentSettings = settingsSnap.data() || {};

                    console.log(`[processTaskRefund] Current settings before disconnect: phoneNumber=${currentSettings.phoneNumber}, phoneNumberType=${currentSettings.phoneNumberType}`);

                    await settingsRef.update({
                        phoneNumber: admin.firestore.FieldValue.delete(),
                        vapiPhoneNumberId: admin.firestore.FieldValue.delete(),
                        phoneNumberType: admin.firestore.FieldValue.delete(),
                        phoneNumberStatus: admin.firestore.FieldValue.delete(),
                        sharedNumberActivatedAt: admin.firestore.FieldValue.delete()
                    });
                    console.log(`[processTaskRefund] ✓ Disconnected shared number from user uid_${uid}`);
                } catch (disconnectError) {
                    console.warn(`[processTaskRefund] Failed to disconnect shared number:`, disconnectError.message);
                }
            } else {
                console.log(`[processTaskRefund] Task did not use shared number, skipping disconnect`);
            }

            console.log(`[processTaskRefund] ✓ All usage records logged`);

        } catch (error) {
            console.error(`[processTaskRefund] Error for task ${event.params.taskId}:`, error);
            try {
                await snapshot.after.ref.update({
                    refundStatus: 'failed',
                    refundError: error.message,
                    refundFailedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } catch (updateError) {
                console.error(`[processTaskRefund] Failed to mark error:`, updateError);
            }
        }
    }
);

/**
 * Search available phone numbers by area code
 */
exports.searchNumbers = onCall(
    { secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN] },
    async (request) => {
        const totalStart = Date.now();
        try {
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "User must be authenticated");
            }

            const { country = 'US', areaCode = '', voice = false, sms = false, mms = false, type = 'local' } = request.data;
            console.log(`[searchNumbers] Type-based Search: ${country}, Type: ${type}, Area: ${areaCode}`);

            const client = twilio(TWILIO_ACCOUNT_SID.value(), TWILIO_AUTH_TOKEN.value());

            const searchParams = { limit: 20 };
            if (areaCode) searchParams.areaCode = areaCode;
            if (voice) searchParams.voiceEnabled = true;
            // Relaxed Search: User requested "OR" logic / "Don't use AND".
            // We disable strict filtering for SMS/MMS so that numbers (e.g. NZ Local) 
            // valid for Voice but lacking SMS still appear.
            // if (sms) searchParams.smsEnabled = true;
            // if (mms) searchParams.mmsEnabled = true;

            try {
                const apiStart = Date.now();
                // Map frontend type to Twilio resource type
                const resourceType = ['local', 'mobile'].includes(type) ? type : 'local';

                const [numbersList, pricingData] = await Promise.all([
                    client.availablePhoneNumbers(country)[resourceType].list(searchParams),
                    client.pricing.v1.phoneNumbers.countries(country).fetch().catch(e => {
                        console.warn(`[searchNumbers] Pricing fetch failed: ${e.message}`);
                        return { phoneNumberPrices: [] };
                    })
                ]);

                console.log(`[searchNumbers] Twilio API calls took ${Date.now() - apiStart}ms`);

                const pricingType = resourceType === 'local' ? 'local' : 'mobile';
                const priceObj = (pricingData.phoneNumberPrices || []).find(p => p.number_type === pricingType);
                let numberPrice = parseFloat(priceObj?.current_price || priceObj?.base_price || "0");

                if (!numberPrice) {
                    if (country === 'US' && resourceType === 'local') numberPrice = 1.15;
                    else numberPrice = 3.00;
                }

                const results = numbersList
                    .map(num => {
                        // DEBUG: Log unusual requirements to help refine filter
                        if (num.addressRequirements !== 'none') {
                            console.log(`[searchNumbers] Found Number: ${num.phoneNumber}, Req: ${num.addressRequirements}`);
                        }
                        return {
                            phoneNumber: num.phoneNumber,
                            locality: num.locality,
                            region: num.region,
                            country: country,
                            capabilities: num.capabilities,
                            addressRequirements: num.addressRequirements, // usage: 'none', 'any', 'local', 'foreign', 'business'
                            isoCountry: num.isoCountry,
                            postalCode: num.postalCode,
                            cost: numberPrice
                        };
                    })
                    // BACKEND FILTER: STRICT MODE
                    // User Request (Revert): "can you back to previous version"
                    // Japan/NZ numbers are 'local' requirement, which implies strict regulatory bundles 
                    // (Business OR Individual) that this simple app cannot handle.
                    // To prevent purchase errors and confusion, we only allow 'none' or 'any'.
                    .filter(num => {
                        const req = String(num.addressRequirements).toLowerCase();
                        // Filter out 'local', 'foreign', 'business'
                        if (req.includes('business') || req === 'local' || req === 'foreign') {
                            return false;
                        }
                        return true;
                    });

                console.log(`[searchNumbers] Success. Found ${results.length} ${resourceType} numbers. Backend: ${Date.now() - totalStart}ms`);
                return { numbers: results };

            } catch (twilioError) {
                if (twilioError.code === 20404 || twilioError.status === 404) {
                    console.log(`[searchNumbers] Not supported or no numbers found for ${country} ${type}`);
                    return { numbers: [] };
                }
                console.error("[searchNumbers] Twilio API Error:", twilioError);
                return { numbers: [] };
            }
        } catch (error) {
            console.error("[searchNumbers] Fatal Error:", error);
            throw new HttpsError("internal", error.message);
        }
    }
);

/**
 * Purchase phone number with subaccount creation and Vapi integration
 */

// Helper to get billing config
async function getBillingConfig(db) {
    try {
        const settings = await db.doc("configuration/settings").get();
        const data = settings.data() || {};
        return data.billing || {
            number_multiplier: 2.0,
            common_multiplier: 3.0,
            sms_common_multiplier: 2.0,
            country_multipliers: {}
        };
    } catch (e) {
        console.error("Error fetching billing config:", e);
        return {
            number_multiplier: 2.0,
            common_multiplier: 3.0,
            sms_common_multiplier: 2.0,
            services: {},
            country_multipliers: {}
        };
    }
}

/**
 * Helper to retrieve current phone number base price from Twilio with Firestore fallback
 */
async function retrievePrice(countryCode, mainClient, db) {
    let basePrice = 1.15; // Default fallback for US Local
    try {
        // Priority 1: Reach Twilio API
        const pricing = await mainClient.pricing.v1.phoneNumbers.countries(countryCode).fetch();
        const localPriceObj = pricing.phoneNumberPrices.find(p => p.numberType === 'local');
        if (localPriceObj) {
            basePrice = parseFloat(localPriceObj.currentPrice || 1.15);
        } else if (pricing.phoneNumberPrices.length > 0) {
            basePrice = parseFloat(pricing.phoneNumberPrices[0].currentPrice || 1.15);
        }
        console.log(`[retrievePrice] Live API Success for ${countryCode}: $${basePrice}`);
    } catch (e) {
        console.warn(`[retrievePrice] Twilio API failed for ${countryCode}, checking Firestore fallback:`, e.message);
        // Priority 2: Firestore configuration/prices
        try {
            const priceDoc = await db.doc('configuration/prices').get();
            if (priceDoc.exists && priceDoc.data().us_local_original) {
                basePrice = priceDoc.data().us_local_original;
                console.log(`[retrievePrice] Firestore fallback Success: $${basePrice}`);
            }
        } catch (fsError) {
            console.error("[retrievePrice] Firestore fallback also failed:", fsError.message);
        }
    }
    return basePrice;
}

/**
 * Helper to retrieve outbound call rate for a country (Base Price from Twilio)
 */
async function retrieveOutboundCallRate(countryCode, mainClient, db) {
    const country = (countryCode || 'US').toUpperCase();

    return await withPricingCache(db, country, 'voice_outbound', async () => {
        try {
            const pricing = await mainClient.pricing.v1.voice.countries(country).fetch();
            // Prefix prices vary, but we take the first one (most common) or a default.
            // For US, it's usually $0.013. For others it varies.
            if (pricing.outboundPrefixPrices && pricing.outboundPrefixPrices.length > 0) {
                const base = parseFloat(pricing.outboundPrefixPrices[0].currentPrice || 0.05);
                console.log(`[retrieveOutboundCallRate] Live API for ${country}: $${base}`);
                return base;
            }
            return 0.05; // Fallback base
        } catch (e) {
            console.error(`[retrieveOutboundCallRate] Failed for ${country}:`, e.message);
            return 0.05;
        }
    });
}

const PRICING_CACHE_TTL = 86400000; // 24 hours

/**
 * Helper to cache Twilio pricing in Firestore to reduce API calls and costs
 */
async function withPricingCache(db, country, type, fetchFn) {
    const countryUpper = country.toUpperCase();
    const cacheRef = db.doc(`configuration/pricing_cache/countries/${countryUpper}_${type}`);

    try {
        const snap = await cacheRef.get();
        const now = Date.now();

        if (snap.exists) {
            const data = snap.data();
            // Use cache if within TTL (24 hours)
            if (data.lastUpdated && (now - data.lastUpdated < PRICING_CACHE_TTL)) {
                console.log(`[PricingCache] HIT for ${countryUpper}_${type}`);
                return data.payload;
            }
        }
    } catch (e) {
        console.error(`[PricingCache] Read error for ${countryUpper}_${type}:`, e);
    }

    console.log(`[PricingCache] MISS/STALE for ${countryUpper}_${type}. Fetching fresh data...`);
    const payload = await fetchFn();

    try {
        await cacheRef.set({
            payload,
            lastUpdated: Date.now(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        console.error(`[PricingCache] Write error for ${countryUpper}_${type}:`, e);
    }

    return payload;
}

/**
 * Get Call Rates (Rate Checker)
 */
exports.getCallRates = onCall(
    { secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN] },
    async (request) => {
        if (!request.auth) throw new HttpsError("unauthenticated", "Auth required");
        const { country = 'US' } = request.data;
        const db = getFirestore(admin.app(), "reservation");

        try {
            const billing = await getBillingConfig(db);
            const countryKey = Object.keys(billing.country_multipliers || {}).find(k => k.toUpperCase() === country.toUpperCase());
            const multiplier = countryKey ? billing.country_multipliers[countryKey] : (billing.common_multiplier || 3.0);

            const pricingData = await withPricingCache(db, country, 'voice', async () => {
                const client = twilio(TWILIO_ACCOUNT_SID.value(), TWILIO_AUTH_TOKEN.value());
                const pricing = await client.pricing.v1.voice.countries(country).fetch();
                return {
                    currency: pricing.priceUnit,
                    outbound: pricing.outboundPrefixPrices.map(p => ({
                        prefix: p.prefixes[0],
                        base_price: parseFloat(p.currentPrice || p.current_price || 0),
                        friendly_name: p.friendlyName
                    })).slice(0, 50),
                    inbound: pricing.inboundCallPrices.map(p => ({
                        type: p.numberType,
                        base_price: parseFloat(p.currentPrice || p.current_price || 0),
                        description: "Per minute cost to receive"
                    }))
                };
            });

            return {
                country,
                currency: pricingData.currency,
                multiplier,
                outbound: pricingData.outbound.map(p => ({
                    ...p,
                    user_price: p.base_price * multiplier
                })),
                inbound: pricingData.inbound.map(p => ({
                    ...p,
                    user_price: p.base_price * multiplier
                }))
            };
        } catch (e) {
            console.error("[getCallRates] Error:", e);
            throw new HttpsError("internal", e.message);
        }
    }
);

/**
 * Get SMS Rates
 */
exports.getSMSRates = onCall(
    { secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN] },
    async (request) => {
        if (!request.auth) throw new HttpsError("unauthenticated", "Auth required");
        const { country = 'US' } = request.data;
        const db = getFirestore(admin.app(), "reservation");

        try {
            const billing = await getBillingConfig(db);
            const smsMultiplier = billing.sms_common_multiplier || 2.0;

            const pricingData = await withPricingCache(db, country, 'messaging', async () => {
                const client = twilio(TWILIO_ACCOUNT_SID.value(), TWILIO_AUTH_TOKEN.value());
                const pricing = await client.pricing.v1.messaging.countries(country).fetch();
                return {
                    currency: pricing.priceUnit,
                    rates: (pricing.inboundSmsPrices || []).map(p => ({
                        type: p.numberType,
                        base_price: parseFloat(p.currentPrice || p.current_price || 0),
                        description: "Cost per inbound SMS"
                    }))
                };
            });

            return {
                country,
                currency: pricingData.currency,
                multiplier: smsMultiplier,
                rates: pricingData.rates.map(p => ({
                    ...p,
                    user_price: p.base_price * smsMultiplier
                }))
            };
        } catch (e) {
            console.error("[getSMSRates] Error:", e);
            throw new HttpsError("internal", e.message);
        }
    }
);

/**
 * Get Usage History (Transformed with Multiplier)
 */
exports.getTransformedUsageHistory = onCall(
    { secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN] },
    async (request) => {
        if (!request.auth) throw new HttpsError("unauthenticated", "Auth required");
        const uid = request.auth.uid;
        const reservationDb = getFirestore(admin.app(), "reservation");
        const defaultDb = admin.firestore();  // DEFAULT database for usage_history

        try {
            // Get user's subaccount credentials from reservation database
            const settingsRef = reservationDb.doc(`users/uid_${uid}/settings/settings`);
            const settingsDoc = await settingsRef.get();
            const settings = settingsDoc.data() || {};

            let records = [];

            // Only fetch Twilio records if user has a subaccount (dedicated number)
            if (settings.twilioSubaccountSid && settings.twilioSubaccountAuthToken) {
                const subClient = twilio(settings.twilioSubaccountSid, settings.twilioSubaccountAuthToken);

                // Calculate 30 days ago for explicit range
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const startDateStr = thirtyDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD

                // Fetch DAILY usage records provided explicit start date.
                // Limit 1000 (Twilio max) to ensure we get past "Today's" empty records for all categories.
                records = await subClient.usage.records.daily.list({
                    startDate: startDateStr,
                    limit: 1000
                });
                console.log("DEBUG: Daily Records Fetched:", records.length);

                // Fallback: If no daily records found (sometimes takes time to populate or API quirk),
                // fetch the "All Time" summary so the user at least sees their balance/charges.
                if (!records || records.length === 0) {
                    console.log("[Usage] Daily records empty, fetching summary fallback.");
                    records = await subClient.usage.records.list({ limit: 50 });
                }
            } else {
                console.log("[Usage] No subaccount found. Will show Firestore usage history only.");
            }

            const billing = await getBillingConfig(reservationDb);
            const multiplier = billing.common_multiplier || 3.0;

            // Define categories to display.
            // STRICT list to prevent duplicates (e.g. 'sms' covers 'sms-inbound' and 'sms-inbound-longcode')
            // Debugging confirmed that 'daily' records include these high-level aggregates.
            const ALLOWED_CATEGORIES = new Set([
                "calls",
                "sms",
                "sms-inbound",
                "sms-outbound",
                "sms-messages-carrierfees",
                "mms",
                "phonenumbers",
                "recordings",
                "voice-insights",
                "monitor-storage",
                "voice-minutes",
                "voice-minutes-inbound",
                "voice-minutes-outbound"
            ]);
            // Helper to transform records
            const transformRecords = (recs) => {
                return recs.map(r => ({
                    category: r.category,
                    description: r.description,
                    usage: parseFloat(r.usage || 0),
                    unit: r.usageUnit,
                    // base_price removed for user privacy
                    user_price: parseFloat(r.price || 0) * multiplier,
                    currency: r.priceUnit,
                    start_date: r.startDate ? new Date(r.startDate).toISOString() : null,
                    end_date: r.endDate ? new Date(r.endDate).toISOString() : null
                }))
                    .filter(r => r.user_price > 0 || r.usage > 0)
                    .filter(r => {
                        const BLOCKED_CATEGORIES = new Set([
                            "totalprice",       // Confusion: Looks like a separate charge
                            "voice-minutes",    // Confusion: Duplicates "voice-minutes-outbound/inbound"
                            // "sms",           // UNBLOCKING SMS to see if it fixes the missing log issue
                            "calls"             // Confusion: Duplicates specific call types
                        ]);
                        if (BLOCKED_CATEGORIES.has(r.category)) return false;
                        return true;
                    });
                // .filter(r => {
                //     // Strict Allow Check REMOVED to show all usage
                //     // if (ALLOWED_CATEGORIES.has(r.category)) return true;
                //     // return false;
                //     return true; 
                // });
            };

            let usage = transformRecords(records);

            // --- Unified Usage Strategy: Merge Firestore Usage History ---
            try {
                const firestoreUsageRef = defaultDb.collection(`users/uid_${uid}/usage_history`)
                    .orderBy('start_date', 'desc')
                    .limit(100);
                const firestoreSnap = await firestoreUsageRef.get();

                const firestoreUsage = firestoreSnap.docs.map(doc => {
                    const d = doc.data();
                    return {
                        category: d.category,
                        description: d.description,
                        usage: d.usage,
                        unit: d.unit,
                        user_price: d.user_price,
                        currency: d.currency || 'USD',
                        start_date: d.start_date ? d.start_date.toDate().toISOString() : null,
                        end_date: d.start_date ? d.start_date.toDate().toISOString() : null,
                        source: 'firestore'
                    };
                });

                if (firestoreUsage.length > 0) {
                    console.log(`[Usage] Merging ${firestoreUsage.length} Firestore records.`);
                    usage = [...usage, ...firestoreUsage];
                }
            } catch (fsErr) {
                console.warn("[Usage] Failed to fetch Firestore usage history:", fsErr.message);
                // Continue with Twilio-only results
            }

            // Capture raw categories for debugging
            const allRawCategories = records.map(r => r.category);

            // Sort consolidated usage by date desc
            usage.sort((a, b) => {
                const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
                const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
                return dateB - dateA;
            });

            return {
                usage,
                multiplier,
                _debug_categories: [...new Set(allRawCategories)],
            };
        } catch (e) {
            console.error("[getTransformedUsageHistory] Error:", e);
            throw new HttpsError("internal", e.message);
        }
    }
);

/**
 * Purchase phone number with subaccount creation and Vapi integration
 */
exports.purchasePhoneNumber = onCall(
    { secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VAPI_API_KEY] },
    async (request) => {
        try {
            // Verify authentication
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "User must be authenticated");
            }

            const { phoneNumber, countryCode = 'US' } = request.data;
            // FIXED: Relaxed validation for International Numbers (e.g. +81 for Japan, +64 for NZ)
            if (!phoneNumber || !/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
                throw new HttpsError("invalid-argument", "Valid E.164 phone number required (e.g., +18001234567 or +81...)");
            }

            const uid = request.auth.uid;
            console.log(`[purchasePhoneNumber] User ${uid} purchasing ${phoneNumber} (${countryCode})`);

            // Get Firestore instance (reservation DB)
            const reservationDb = getFirestore(admin.app(), "reservation");
            const settingsRef = reservationDb.doc(`users/uid_${uid}/settings/settings`);

            // 1. Calculate Dynamic Cost
            const billing = await getBillingConfig(reservationDb);
            const numberMultiplier = billing.number_multiplier || 2.0;

            // Initialize Main Twilio Client to fetch Base Price
            const baseTwilio = require('twilio');
            const mainClient = baseTwilio(TWILIO_ACCOUNT_SID.value(), TWILIO_AUTH_TOKEN.value());

            // [TASK 1] Call existing retrievePrice logic during purchase
            const basePrice = await retrievePrice(countryCode, mainClient, reservationDb);

            const PHONE_NUMBER_COST = basePrice * numberMultiplier;
            console.log(`[purchasePhoneNumber] Calculated Cost: $${PHONE_NUMBER_COST} (Base: $${basePrice} x ${numberMultiplier})`);

            // Get user credit balance from users collection
            const userRef = reservationDb.doc(`users/uid_${uid}`);

            // Start a transaction to ensure atomic credit deduction
            await reservationDb.runTransaction(async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists) {
                    throw new HttpsError("not-found", "User profile not found");
                }

                const userData = userDoc.data();
                const currentCredits = userData.credits || 0;

                console.log(`[purchasePhoneNumber] User credits: $${currentCredits}, Cost: $${PHONE_NUMBER_COST}`);

                if (currentCredits < PHONE_NUMBER_COST) {
                    throw new HttpsError("failed-precondition", `Insufficient credits. You need $${PHONE_NUMBER_COST.toFixed(2)} but have $${currentCredits.toFixed(2)}`);
                }

                // Check settings within transaction to prevent race conditions
                const settingsDoc = await transaction.get(settingsRef);
                if (settingsDoc.exists) {
                    const settings = settingsDoc.data();
                    if (settings.phoneNumberStatus === 'active') {
                        throw new HttpsError("failed-precondition", "You already have an active phone number. Please release it first.");
                    }
                }

                // Deduct credits
                const newBalance = currentCredits - PHONE_NUMBER_COST;
                transaction.update(userRef, { credits: newBalance });

                console.log(`[purchasePhoneNumber] Deducted $${PHONE_NUMBER_COST}. New balance: $${newBalance}`);
            });

            // Initialize Twilio client
            // const twilio = require('twilio'); // Moved up
            const client = mainClient; // Reuse main client

            let subaccountSid, subaccountAuthToken;

            // Step 1: Check for existing subaccount
            const settingsDoc = await settingsRef.get();
            const settings = settingsDoc.data() || {};

            if (settings.twilioSubaccountSid && settings.twilioSubaccountAuthToken) {
                // Use existing subaccount
                subaccountSid = settings.twilioSubaccountSid;
                subaccountAuthToken = settings.twilioSubaccountAuthToken;
                console.log(`[purchasePhoneNumber] Using existing subaccount: ${subaccountSid}`);
            } else {
                // Step 2: Create new subaccount
                console.log(`[purchasePhoneNumber] Creating new subaccount for user ${uid}`);
                const subaccount = await client.api.v2010.accounts.create({
                    friendlyName: `User_${uid.substring(0, 8)}`
                });

                subaccountSid = subaccount.sid;
                subaccountAuthToken = subaccount.authToken;

                // Save subaccount credentials
                await settingsRef.set({
                    twilioSubaccountSid: subaccountSid,
                    twilioSubaccountAuthToken: subaccountAuthToken
                }, { merge: true });

                console.log(`[purchasePhoneNumber] Subaccount created: ${subaccountSid}`);
            }

            // Step 3: Purchase phone number using subaccount
            console.log(`[purchasePhoneNumber] Purchasing number with subaccount`);
            const subaccountClient = baseTwilio(subaccountSid, subaccountAuthToken);

            // --- Enable Dialing Permissions (GLOBAL / ALL COUNTRIES) ---
            try {
                console.log(`[purchasePhoneNumber] Fetching list of all countries to enable global dialing permissions...`);
                // 1. Fetch all supported countries (auto-pagination handled by library usually, or we take first page which covers most if limit is high)
                const allCountries = await subaccountClient.voice.v1.dialingPermissions.countries.list({ limit: 300 });

                // 2. Filter out those that are already enabled (optional optimization) or just update all.
                // We'll just map all ISO codes to ensure everything is enabled.
                const updateRequest = allCountries.map(c => ({
                    iso_code: c.isoCode,
                    low_risk_numbers_enabled: true,
                    high_risk_special_numbers_enabled: false,
                    high_risk_tollfraud_numbers_enabled: false
                }));

                // 3. Apply Bulk Update (Batching)
                // Twilio limit is 100 per request. We'll use 50 to be safe.
                const BATCH_SIZE = 50;
                if (updateRequest.length > 0) {
                    for (let i = 0; i < updateRequest.length; i += BATCH_SIZE) {
                        const batch = updateRequest.slice(i, i + BATCH_SIZE);

                        if (batch.length > 0) {
                            await subaccountClient.voice.v1.dialingPermissions
                                .bulkCountryUpdates
                                .create({ updateRequest: JSON.stringify(batch) });
                            console.log(`[purchasePhoneNumber] Batch ${i / BATCH_SIZE + 1}: Enabled ${batch.length} countries.`);
                        }
                    }

                    console.log(`[purchasePhoneNumber] Successfully enabled global dialing permissions for all ${updateRequest.length} countries.`);
                } else {
                    console.warn(`[purchasePhoneNumber] No countries found to update.`);
                }
            } catch (permError) {
                console.warn(`[purchasePhoneNumber] Warning: Failed to update global dialing permissions: ${permError.message}`);
                // Don't block purchase, just warn
            }
            // -----------------------------------------------------------

            // Fetch dynamic SMS URL from configuration
            let smsUrl = 'https://us-central1-wisecat-8df8d.cloudfunctions.net/twilioInboundWebhook'; // Fallback
            try {
                const globalSettingsDoc = await reservationDb.doc('configuration/settings').get();
                if (globalSettingsDoc.exists) {
                    const data = globalSettingsDoc.data();
                    if (data.inboundSmsUrl) {
                        smsUrl = data.inboundSmsUrl;
                    }
                }
            } catch (e) {
                console.warn("[purchasePhoneNumber] Failed to fetch smsUrl config, using default", e);
            }

            const purchasedNumber = await subaccountClient.incomingPhoneNumbers.create({
                phoneNumber: phoneNumber,
                smsUrl: smsUrl,
                smsMethod: 'POST'
            });

            console.log(`[purchasePhoneNumber] Number purchased: ${purchasedNumber.sid}`);

            // Step 4: Import to Vapi
            console.log(`[purchasePhoneNumber] Importing to Vapi`);
            let vapiPhoneNumberId;

            try {
                const vapiResponse = await axios.post(
                    'https://api.vapi.ai/phone-number',
                    {
                        provider: 'twilio',
                        number: phoneNumber,
                        twilioAccountSid: subaccountSid,
                        twilioAuthToken: subaccountAuthToken
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${VAPI_API_KEY.value()}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                vapiPhoneNumberId = vapiResponse.data.id;
                console.log(`[purchasePhoneNumber] Vapi import successful: ${vapiPhoneNumberId}`);

            } catch (vapiError) {
                console.error(`[purchasePhoneNumber] Vapi import failed:`, vapiError.response?.data || vapiError.message);

                // Save error state
                await settingsRef.set({
                    phoneNumber: phoneNumber,
                    phoneNumberStatus: 'error',
                    phoneNumberPurchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                    vapiImportError: vapiError.message
                }, { merge: true });

                throw new HttpsError(
                    "internal",
                    "Number purchased but Vapi import failed. Contact support."
                );
            }

            // Step 5: Save complete state to Firestore
            // Save capabilities to enable feature flagging (e.g. SMS)
            await settingsRef.set({
                phoneNumber: phoneNumber,
                vapiPhoneNumberId: vapiPhoneNumberId,
                phoneNumberStatus: 'active',
                phoneNumberPurchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                original_price: basePrice, // [TASK 1] Store purchase price snapshot
                capabilities: purchasedNumber.capabilities || {}, // { voice: true, sms: true, mms: false }
                smsEnabled: purchasedNumber.capabilities?.sms || false // Explicit flag for easier querying
            }, { merge: true });

            console.log(`[purchasePhoneNumber] Success! Number ${phoneNumber} is active`);

            // Log to usage history (DEFAULT database, not reservation)
            try {
                const usageRef = db.collection(`users/uid_${uid}/usage_history`);
                await usageRef.add({
                    category: 'phone-number',
                    description: `Purchased dedicated number ${phoneNumber} (Monthly)`,
                    usage: 1,
                    unit: 'number',
                    user_price: PHONE_NUMBER_COST,
                    currency: 'USD',
                    start_date: admin.firestore.FieldValue.serverTimestamp(),
                    source: 'phone_purchase',
                    phoneNumber: phoneNumber,
                    basePrice: basePrice,
                    multiplier: billing.number_multiplier || 2.0
                });
                console.log(`[purchasePhoneNumber] ✓ Logged to usage_history: $${PHONE_NUMBER_COST.toFixed(2)}`);
            } catch (usageError) {
                console.warn(`[purchasePhoneNumber] Warning: Failed to log usage history:`, usageError.message);
                // Don't block purchase if logging fails
            }

            return {
                success: true,
                phoneNumber: phoneNumber,
                vapiPhoneNumberId: vapiPhoneNumberId,
                status: 'active',
                cost: PHONE_NUMBER_COST
            };

        } catch (error) {
            console.error("[purchasePhoneNumber] Error:", error);
            throw new HttpsError("internal", error.message);
        }
    }
);

/**
 * Manual release of phone number (user-initiated)
 */
exports.releasePhoneNumber = onCall(
    { secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VAPI_API_KEY] },
    async (request) => {
        try {
            // Verify authentication
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "User must be authenticated");
            }

            const uid = request.auth.uid;
            console.log(`[releasePhoneNumber] User ${uid} releasing phone number`);

            // Get user settings
            const reservationDb = getFirestore(admin.app(), "reservation");
            const settingsRef = reservationDb.doc(`users/uid_${uid}/settings`);
            const settingsDoc = await settingsRef.get();

            if (!settingsDoc.exists) {
                throw new HttpsError("not-found", "No settings found");
            }

            const settings = settingsDoc.data();

            if (settings.phoneNumberStatus !== 'active') {
                throw new HttpsError("failed-precondition", "No active phone number to release");
            }

            const phoneNumber = settings.phoneNumber;
            console.log(`[releasePhoneNumber] Releasing: ${phoneNumber}`);

            // 1. Delete from Vapi
            if (settings.vapiPhoneNumberId) {
                try {
                    await axios.delete(
                        `https://api.vapi.ai/phone-number/${settings.vapiPhoneNumberId}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${VAPI_API_KEY.value()}`
                            }
                        }
                    );
                    console.log(`[releasePhoneNumber] Deleted from Vapi`);
                } catch (vapiError) {
                    console.warn(`[releasePhoneNumber] Vapi deletion failed:`, vapiError.message);
                }
            }

            // 2. Release from Twilio subaccount
            if (settings.twilioSubaccountSid && settings.twilioSubaccountAuthToken) {
                const twilio = require('twilio');
                const subaccountClient = twilio(
                    settings.twilioSubaccountSid,
                    settings.twilioSubaccountAuthToken
                );

                const numbers = await subaccountClient.incomingPhoneNumbers.list({
                    phoneNumber: phoneNumber
                });

                if (numbers.length > 0) {
                    await numbers[0].remove();
                    console.log(`[releasePhoneNumber] Released from Twilio`);
                }
            }

            // 3. Update Firestore
            await settingsRef.update({
                phoneNumberStatus: 'released',
                phoneNumberReleasedAt: admin.firestore.FieldValue.serverTimestamp(),
                vapiPhoneNumberId: admin.firestore.FieldValue.delete(),
                phoneNumber: admin.firestore.FieldValue.delete()
            });

            console.log(`[releasePhoneNumber] Success`);

            return {
                success: true,
                message: "Phone number released successfully"
            };

        } catch (error) {
            console.error("[releasePhoneNumber] Error:", error);
            throw new HttpsError("internal", error.message);
        }
    }
);

/**
 * Scheduled function to auto-release when credits are low
 * Runs daily to prevent users from accumulating debt
 */
const { onSchedule } = require("firebase-functions/v2/scheduler");

exports.autoReleaseOnLowCredits = onSchedule(
    {
        schedule: "0 0 * * *", // Daily at midnight UTC
        timeZone: "UTC",
        secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VAPI_API_KEY]
    },
    async (event) => {
        console.log("[autoReleaseOnLowCredits] Starting daily credit check...");

        try {
            const reservationDb = getFirestore(admin.app(), "reservation");
            const usersRef = reservationDb.collection('users');

            const snapshot = await usersRef.get();
            const PHONE_NUMBER_MONTHLY_COST = 3.0; // USD (adjust based on actual costs)
            const CREDIT_THRESHOLD = PHONE_NUMBER_MONTHLY_COST * 2; // $6 threshold

            let releasedCount = 0;
            let errorCount = 0;

            for (const userDoc of snapshot.docs) {
                // Get user's credits from users document
                const userData = userDoc.data();
                const userCredits = userData.credits || 0;

                // Get user's phone number settings
                const settingsRef = userDoc.ref.collection('settings').doc('settings');
                const settingsSnap = await settingsRef.get();

                if (!settingsSnap.exists) continue;

                const settings = settingsSnap.data();

                // Only check active phone numbers
                if (settings.phoneNumberStatus === 'active') {
                    console.log(`[autoReleaseOnLowCredits] User ${userDoc.id}: Credits = $${userCredits}, Threshold = $${CREDIT_THRESHOLD}`);

                    const WARNING_THRESHOLD = 5.00; // Warning threshold (e.g. $5.00)
                    // Note: User mentioned "2 credit" expecting reminder. 
                    // If Threshold is 6 (3*2), then 2 credits -> release.
                    // Let's adjust logic:
                    // If < 6: Release (Critical)
                    // If < 10: Warning

                    const RELEASE_THRESHOLD = CREDIT_THRESHOLD; // $6.00
                    const WARN_THRESHOLD = 10.00;

                    // Message Helper
                    const sendInboxMessage = async (subject, body) => {
                        const inboxRef = userDoc.ref.collection("inbound_messages").doc(); // Auto ID
                        await inboxRef.set({
                            body: body,
                            sender: "WiseCat System",
                            receiver: settings.phoneNumber, // The user's number
                            receivedAt: admin.firestore.FieldValue.serverTimestamp(),
                            isRead: false,
                            sid: inboxRef.id,
                            type: 'system_alert' // Tag for UI if needed
                        });
                        console.log(`  -> Sent Inbox Alert: ${subject}`);
                    };

                    // 1. Critical Release
                    if (userCredits < RELEASE_THRESHOLD) {
                        console.log(`[autoReleaseOnLowCredits] ⚠️  Low credits! Releasing number for user: ${userDoc.id}`);
                        console.log(`  Number: ${settings.phoneNumber}, Credits: $${userCredits}`);

                        try {
                            // Delete from Vapi
                            if (settings.vapiPhoneNumberId) {
                                try {
                                    await axios.delete(
                                        `https://api.vapi.ai/phone-number/${settings.vapiPhoneNumberId}`,
                                        {
                                            headers: {
                                                'Authorization': `Bearer ${VAPI_API_KEY.value()}`
                                            }
                                        }
                                    );
                                    console.log(`  ✓ Deleted from Vapi`);
                                } catch (vapiError) {
                                    console.error(`  ✗ Vapi deletion failed:`, vapiError.message);
                                }
                            }

                            // Release from Twilio
                            if (settings.twilioSubaccountSid && settings.twilioSubaccountAuthToken) {
                                try {
                                    const twilio = require('twilio');
                                    const subaccountClient = twilio(
                                        settings.twilioSubaccountSid,
                                        settings.twilioSubaccountAuthToken
                                    );

                                    const numbers = await subaccountClient.incomingPhoneNumbers.list({
                                        phoneNumber: settings.phoneNumber
                                    });

                                    if (numbers.length > 0) {
                                        await numbers[0].remove();
                                        console.log(`  ✓ Released from Twilio`);
                                    }
                                } catch (twilioError) {
                                    console.error(`  ✗ Twilio release failed:`, twilioError.message);
                                }
                            }

                            // Update Firestore
                            await settingsRef.update({
                                phoneNumberStatus: 'auto_released',
                                phoneNumberReleasedAt: admin.firestore.FieldValue.serverTimestamp(),
                                releaseReason: 'low_credits',
                                releaseCreditsAtTime: userCredits,
                                vapiPhoneNumberId: admin.firestore.FieldValue.delete(),
                                phoneNumber: admin.firestore.FieldValue.delete()
                            });

                            // NOTIFY USER OF RELEASE
                            await sendInboxMessage(
                                "Number Released",
                                `Your phone number ${settings.phoneNumber} has been released due to insufficient credits ($${userCredits.toFixed(2)} < $${RELEASE_THRESHOLD.toFixed(2)}). Please top up to purchase a new number.`
                            );

                            console.log(`  ✓ Auto-released due to low credits`);
                            releasedCount++;

                        } catch (releaseError) {
                            console.error(`  ✗ Error releasing number:`, releaseError);
                            errorCount++;
                        }
                    }
                    // 2. Warning (Only if not released)
                    else if (userCredits < WARN_THRESHOLD) {
                        // Check if we already spammed them? 
                        // For now, daily warning is acceptable.
                        console.log(`[autoReleaseOnLowCredits] Sending Low Balance Warning`);
                        await sendInboxMessage(
                            "Low Balance Warning",
                            `Your credit balance is low ($${userCredits.toFixed(2)}). Your phone number will be released if balance drops below $${RELEASE_THRESHOLD.toFixed(2)}. Please top up soon.`
                        );
                    }
                }
            }

            console.log(`[autoReleaseOnLowCredits] Complete. Released: ${releasedCount}, Errors: ${errorCount}`);

        } catch (error) {
            console.error("[autoReleaseOnLowCredits] Critical error:", error);
        }
    }
);

/**
 * Scheduled function to release phone numbers after 30 days
 * Runs daily at midnight UTC
 */


exports.releaseExpiredPhoneNumbers = onSchedule(
    {
        schedule: "0 0 * * *", // Daily at midnight UTC
        timeZone: "UTC",
        secrets: [TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VAPI_API_KEY]
    },
    async (event) => {
        console.log("[releaseExpiredPhoneNumbers] Starting daily check...");

        try {
            const reservationDb = getFirestore(admin.app(), "reservation");
            const usersRef = reservationDb.collection('users');

            // Query all users with active phone numbers
            const snapshot = await usersRef.get();
            const now = Date.now();
            const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

            let releasedCount = 0;
            let errorCount = 0;

            for (const userDoc of snapshot.docs) {
                const settingsRef = userDoc.ref.collection('settings').doc('settings');
                const settingsSnap = await settingsRef.get();

                if (!settingsSnap.exists) continue;

                const settings = settingsSnap.data();

                // Check if number is active and older than 30 days
                if (settings.phoneNumberStatus === 'active' && settings.phoneNumberPurchasedAt) {
                    const purchasedAt = settings.phoneNumberPurchasedAt.toMillis();
                    const age = now - purchasedAt;

                    if (age >= THIRTY_DAYS_MS) {
                        console.log(`[releaseExpiredPhoneNumbers] Releasing number for user: ${userDoc.id}`);
                        console.log(`  Number: ${settings.phoneNumber}, Age: ${Math.floor(age / (24 * 60 * 60 * 1000))} days`);

                        try {
                            // 1. Delete from Vapi
                            if (settings.vapiPhoneNumberId) {
                                try {
                                    await axios.delete(
                                        `https://api.vapi.ai/phone-number/${settings.vapiPhoneNumberId}`,
                                        {
                                            headers: {
                                                'Authorization': `Bearer ${VAPI_API_KEY.value()}`
                                            }
                                        }
                                    );
                                    console.log(`  ✓ Deleted from Vapi: ${settings.vapiPhoneNumberId}`);
                                } catch (vapiError) {
                                    console.error(`  ✗ Vapi deletion failed:`, vapiError.message);
                                }
                            }

                            // 2. Release from Twilio subaccount
                            if (settings.twilioSubaccountSid && settings.twilioSubaccountAuthToken) {
                                try {
                                    const twilio = require('twilio');
                                    const subaccountClient = twilio(
                                        settings.twilioSubaccountSid,
                                        settings.twilioSubaccountAuthToken
                                    );

                                    // Find and delete the phone number
                                    const numbers = await subaccountClient.incomingPhoneNumbers.list({
                                        phoneNumber: settings.phoneNumber
                                    });

                                    if (numbers.length > 0) {
                                        await numbers[0].remove();
                                        console.log(`  ✓ Released from Twilio: ${settings.phoneNumber}`);
                                    }
                                } catch (twilioError) {
                                    console.error(`  ✗ Twilio release failed:`, twilioError.message);
                                }
                            }

                            // 3. Update Firestore status
                            await settingsRef.update({
                                phoneNumberStatus: 'expired',
                                phoneNumberExpiredAt: admin.firestore.FieldValue.serverTimestamp(),
                                vapiPhoneNumberId: admin.firestore.FieldValue.delete(),
                                phoneNumber: admin.firestore.FieldValue.delete()
                            });

                            console.log(`  ✓ Updated Firestore status to 'expired'`);
                            releasedCount++;

                        } catch (releaseError) {
                            console.error(`  ✗ Error releasing number:`, releaseError);
                            errorCount++;

                            // Mark as error but keep data for investigation
                            await settingsRef.update({
                                phoneNumberStatus: 'release_error',
                                releaseErrorMessage: releaseError.message
                            });
                        }
                    }
                }
            }

            console.log(`[releaseExpiredPhoneNumbers] Complete. Released: ${releasedCount}, Errors: ${errorCount}`);

        } catch (error) {
            console.error("[releaseExpiredPhoneNumbers] Critical error:", error);
        }
    }
);

// Define Gemini API key secret
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

/**
 * Validates if a user's description matches their selected mission using Gemini 2.5 Flash
 * 
 * Usage: Call from frontend with { missionId, missionName, description, language }
 * Returns: { valid: boolean }
 */
exports.validateMissionV2 = onCall(
    { secrets: [GEMINI_API_KEY, OPENAI_API_KEY] },
    async (request) => {
        const { missionId, missionName, description, language } = request.data;
        const auth = request.auth;

        // Validate inputs
        if (!missionId || !missionName || !description) {
            throw new HttpsError("invalid-argument", "Missing required parameters.");
        }

        console.log(`[validateMissionV2] Received: language=${language}, missionId=${missionId} [Version: v4.0-inline-fix]`);

        if (description.length < 10) {
            throw new HttpsError("invalid-argument", "Description too short.");
        }

        try {
            const { getFirestore } = require("firebase-admin/firestore");
            const adminApp = require("firebase-admin").app();
            const dbRes = getFirestore(adminApp, "reservation");

            // --- 1. Security & Scam Check ---
            let blacklist = [];
            try {
                const settings = await dbRes.doc("configuration/settings").get();
                const configData = settings.data() || {};
                const customKeywords = configData.custom_scam_keywords || "";
                blacklist = Array.isArray(customKeywords) ? customKeywords : String(customKeywords).split(/[\n,]+/).map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
            } catch (e) { console.error("Firestore Read Error:", e); }

            const lowerText = description.toLowerCase();
            const fallbackKeywords = ["crypto", "investment", "profit", "jackpot", "lottery", "giveaway", "投資獲利", "加賴", "加line", "兼職", "獲利", "高報酬", "博弈"];
            for (const word of [...blacklist, ...fallbackKeywords]) {
                if (lowerText.includes(word)) {
                    return { valid: false, explanation: `Security Block: Suspicious keyword "${word}".`, refinedText: null, suggestedMissionId: null };
                }
            }

            // --- 2. Fetch All Missions for AI Dispatching ---
            const missionsSnapshot = await dbRes.collection("missions").get();
            const availableMissions = missionsSnapshot.docs.map(doc => {
                const d = doc.data();
                const nameObj = d.name || { en: d.mission_name || doc.id };
                const primaryLang = language ? language.split('-')[0] : 'en';
                const localizedName = nameObj[language] || nameObj[primaryLang] || nameObj['en'] || doc.id;
                const keywords = d.keywords_pool || [];
                return `- ID: "${doc.id}", Name: "${localizedName}", Keywords: [${keywords.join(', ')}]`;
            }).join('\n');

            // --- 3. AI Analysis (Gemini) ---
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());

            // Retry logic for AI generation
            let aiResult = null;
            const MAX_RETRIES = 3;

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    console.log(`[validateMissionV2] AI Attempt ${attempt}/${MAX_RETRIES}`);

                    // User requested specific models. Using "gemini-2.5-flash" for advanced reasoning and stability.
                    // Increased maxTokens to 8192 to prevent truncation (Unterminated string JSON error).
                    const model = genAI.getGenerativeModel({
                        model: "gemini-2.5-flash",
                        generationConfig: { temperature: 0.1, maxOutputTokens: 8192, responseMimeType: "application/json" }
                    });

                    // --- Language Detection (Character-based) ---
                    // If user types in Chinese/Japanese, we MUST respond in that language, ignoring UI setting.
                    const detectLang = (text) => {
                        let zh = 0, jp = 0, ko = 0;
                        for (const char of text) {
                            const code = char.charCodeAt(0);
                            // Chinese (Unified Ideographs)
                            if ((code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF)) zh++;
                            // Japanese (Hiragana/Katakana) - Prioritize if found, as Kanji is shared
                            else if ((code >= 0x3040 && code <= 0x30FF)) jp++;
                            // Korean (Hangul)
                            else if ((code >= 0xAC00 && code <= 0xD7AF)) ko++;
                        }
                        if (jp > 0) return 'ja'; // Japanese check first (Kana)
                        if (zh > 0) return 'zh';
                        if (ko > 0) return 'ko';
                        return null;
                    };

                    const detectedCode = detectLang(description);
                    const primaryLang = detectedCode || (language ? language.split('-')[0] : 'en');

                    const langMap = {
                        zh: "Traditional Chinese (繁體中文)",
                        jp: "Japanese (日本語)", ja: "Japanese (日本語)",
                        kr: "Korean (한국어)", ko: "Korean (한국어)",
                        es: "Spanish", fr: "French", it: "Italian", de: "German"
                    };
                    const targetLangLabel = langMap[primaryLang] || "English";
                    if (attempt === 1) { // Only log this once to avoid clutter
                        console.log(`[validateMissionV2] Language mapping: language=${language}, detected=${detectedCode}, primaryLang=${primaryLang}, targetLangLabel=${targetLangLabel}`);
                    }

                    // ENHANCED FIRST-PERSON CALLER PROMPT
                    const prompt = `
**CRITICAL: ALL OUTPUT MUST BE IN ${targetLangLabel}.**

Role: You are the "WiseCat AI Agent". Your job is to take the User's raw intent and turn it into a professional script for a phone call that YOU will make on their behalf.

Task: 
1. **CLASSIFY**: Analyze the User's Input and select the ONE best matching Mission ID from the "Mission Database" list below.
2. **REFINE (The "Voice" of the Call)**: 
   - Rewrite the User's Input into a professional, polite script.
   - **MANDATORY PERSPECTIVE**: Use the FIRST-PERSON perspective ("I", "Me") - **第一人稱視角**.
   - **STRICT RESTRICTION**: You are the CALLER. You are NOT a customer service agent helping the user.
   - **DO NOT** talk to the user. 
   - **DO NOT** say "How can I help you?" or "I understand you lost a hat, how can I help?".
   - **DO** say things like "I am calling to..." or "I would like to...".
   - Example 1 (Lost Item): User says "Found hat", you say "Hello, I'm calling to inquire if you found a lost hat recently...".
   - Example 2 (Reservation): User says "Book for 2", you say "Hello, I would like to make a reservation for two people...".
3. **SAFETY**: Check for scams or high-risk content. 
   - **CRITICAL**: If the User Input implies a scam, fraud, investment scheme, or unsolicited promotion:
     - Set **suggestedMissionId** to `null`.
     - Set **explanation** to exactly `SCAM_ALERT`.
     - Set **refinedText** to `null`.

Current Context:
- **User's Input**: "${description}"
- **Output Language**: ${targetLangLabel} (Mandatory)

Mission Database:
${availableMissions}

Output Format (JSON Only):
{
  "explanation": "Brief explanation of why this mission was chosen OR 'SCAM_ALERT' (in ${targetLangLabel}).",
  "refinedText": "The exact script YOU will speak on the phone (First-Person, in ${targetLangLabel}) or null if scam.",
  "suggestedMissionId": "ID of the mission (or null if scam)",
  "suggestedMissionName": "The localized Name of the mission (or null if scam)"
}
`;

                    const result = await model.generateContent(prompt);
                    let responseText = result.response.text().trim();

                    // Clean up markdown code blocks if present (e.g. ```json ... ```)
                    responseText = responseText.replace(/^```[a-z]*\n/i, "").replace(/```$/, "").trim();

                    try {
                        aiResult = JSON.parse(responseText);
                    } catch (jsonErr) {
                        console.error(`[validateMissionV2] JSON Parse Error on attempt ${attempt}.
Raw Response: ${responseText.substring(0, 500)}... (truncated)`);
                        throw jsonErr; // Rethrow to trigger retry
                    }

                    // If we made it here, success!
                    break;

                } catch (e) {
                    console.error(`[validateMissionV2] Attempt ${attempt} failed: ${e.message}`);
                    if (attempt === MAX_RETRIES) {
                        console.error("All AI attempts failed. Falling back to default.");
                        aiResult = { valid: true, suggestedMissionId: null, explanation: "AI Error (System Busy)", refinedText: description };
                    } else {
                        // Wait a bit before retry (exponential backoff)
                        const delay = attempt * 1000;
                        await new Promise(r => setTimeout(r, delay));
                    }
                }
            }

            // --- 4. Logic Validation (Code-Side) ---
            const classifiedMissionId = aiResult.suggestedMissionId;
            const isMatch = classifiedMissionId === missionId;

            // If AI failed to classify (null), we'll give benefit of doubt (valid=true) usually, 
            // BUT if it classified something ELSE, it's definitely INVALID.
            const finalValid = classifiedMissionId ? isMatch : true;
            const finalSuggestedId = isMatch ? null : classifiedMissionId;

            let suggestedMissionName = null;
            if (finalSuggestedId) {
                try {
                    const suggDoc = await dbRes.collection("missions").doc(finalSuggestedId).get();
                    if (suggDoc.exists) {
                        const d = suggDoc.data();
                        const nameObj = d.name || {};
                        const pl = language ? language.split('-')[0] : 'en';
                        suggestedMissionName = nameObj[language] || nameObj[pl] || nameObj['en'] || finalSuggestedId;
                    }
                } catch (e) { console.error("Error fetching name:", e); }
            }

            console.log(`[Version: v4.0-inline-fix] User Mission: ${missionId}, AI Classified: ${classifiedMissionId}, Match: ${isMatch}`);

            console.log({
                missionId,
                valid: finalValid,
                suggestedId: finalSuggestedId,
                uid: auth?.uid || "anonymous"
            });

            return {
                valid: finalValid,
                explanation: aiResult.explanation,
                refinedText: aiResult.refinedText,
                suggestedMissionId: finalSuggestedId,
                suggestedMissionName: suggestedMissionName
            };

        } catch (error) {
            console.error("Critical Validation Error:", error);
            // Default to allowed if system crashes, to not block users
            return { valid: true, refinedText: description, explanation: "System recovered after error.", suggestedMissionId: null };
        }
    }
);



/**
 * Twilio Inbound Webhook
 * Handles incoming SMS and routes to user's inbox
 */
exports.twilioInboundWebhook = onRequest(async (req, res) => {
    try {
        // 1. Parse incoming request (Twilio format: application/x-www-form-urlencoded)
        const params = req.body;

        // Essential fields
        const to = params.To;             // Our User's Twilio Number (e.g. +1415...)
        const from = params.From;         // Sender's Number
        const body = params.Body || "";   // Message Text
        const messageSid = params.MessageSid; // Unique ID from Twilio

        console.log(`[twilioInboundWebhook] RX SMS from ${from} to ${to} (SID: ${messageSid})`);

        if (!to || !messageSid) {
            console.warn("[twilioInboundWebhook] Missing required fields");
            return res.status(400).send("Bad Request");
        }

        const db = getFirestore(admin.app(), "reservation");

        // 2. Identify the Tenant (User)
        // We need to find which user owns this phone number.
        // Searching all users/.../settings where phoneNumber == to
        const querySnapshot = await db.collectionGroup("settings")
            .where("phoneNumber", "==", to)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            console.warn(`[twilioInboundWebhook] Orphaned SMS: No user found for number ${to}`);
            // Return 200 OK to stop Twilio from retrying
            return res.status(200).send("Orphaned");
        }

        // 3. Save to User's Inbox
        const settingsDoc = querySnapshot.docs[0];
        const userRef = settingsDoc.ref.parent.parent; // settings/settings -> parent(settings col) -> parent(userDoc)

        if (!userRef) {
            console.error("[twilioInboundWebhook] Could not determine parent user ref");
            return res.status(500).send("Internal Error");
        }

        const uid = userRef.id;
        console.log(`[twilioInboundWebhook] Routed to User: ${uid}`);

        const inboxRef = userRef.collection("inbound_messages").doc(messageSid);

        await inboxRef.set({
            body: body,
            sender: from,
            receiver: to,
            receivedAt: admin.firestore.FieldValue.serverTimestamp(),
            isRead: false,
            sid: messageSid,
            // Optional: Raw dumping for debugging
            // raw: params 
        });

        res.status(200).send("<Response></Response>"); // TwiML success response

    } catch (error) {
        console.error("[twilioInboundWebhook] Fatal Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ============================================================================
// RAG Chatbot - Knowledge Query Function
// ============================================================================

/**
 * Query the knowledge base using RAG (Retrieval Augmented Generation)
 * Uses Gemini Flash for embeddings and LLM, Pinecone for vector search
 * Includes rate limiting (5 questions/hour) and smart filtering
 */
exports.queryKnowledge = onCall(
    {
        secrets: [GEMINI_API_KEY, PINECONE_API_KEY],
        cors: true
    },
    async (request) => {
        try {
            // Authentication check
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "Please sign in to use the chatbot");
            }

            const { question } = request.data;
            const userId = request.auth.uid;

            if (!question || question.trim().length === 0) {
                throw new HttpsError("invalid-argument", "Question is required");
            }

            console.log(`[queryKnowledge] User: ${userId}, Question: "${question}"`);

            // Correct way to access a named database in Firebase Admin SDK
            const reservationDb = getFirestore("reservation");

            // Rate limiting: 5 questions per hour
            const rateLimitRef = reservationDb.collection('chatbot_rate_limits').doc(userId);
            const rateLimitDoc = await rateLimitRef.get();
            const now = Date.now();
            const oneHour = 3600000; // 1 hour in ms

            let queryHistory = [];
            if (rateLimitDoc.exists) {
                queryHistory = rateLimitDoc.data().queries || [];
                // Filter queries in last hour
                queryHistory = queryHistory.filter(t => now - t < oneHour);
            }

            if (queryHistory.length >= 5) {
                throw new HttpsError(
                    'resource-exhausted',
                    'You have reached the limit of 5 questions per hour. Please try again later.'
                );
            }

            // Initialize clients
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const { Pinecone } = require('@pinecone-database/pinecone');

            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
            const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY.value() });
            const index = pinecone.index('wisecat-knowledge');

            // 1. Embed the question using Gemini (FREE!)
            const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
            const embeddingResult = await embeddingModel.embedContent(question);
            const questionEmbedding = embeddingResult.embedding.values;

            // 2. Search Pinecone for relevant chunks
            const searchResults = await index.query({
                vector: questionEmbedding,
                topK: 3,
                includeMetadata: true
            });

            console.log(`[queryKnowledge] Found ${searchResults.matches.length} matches`);

            // 3. LAYER 1: Check relevance threshold
            const topScore = searchResults.matches[0]?.score || 0;
            console.log(`[queryKnowledge] Top relevance score: ${topScore.toFixed(3)}`);

            if (topScore < 0.5) {
                console.log(`[queryKnowledge] ❌ Rejected: Low relevance (${topScore.toFixed(3)})`);
                return {
                    answer: "I'm sorry, but I can only help with questions about the **WiseCat platform**.\n\nI can assist you with:\n- 💰 Credits and billing\n- 📞 Making calls (Mouthpiece, Trial, Restaurant)\n- 📱 Phone number management\n- 🔐 Account and login issues\n- 📝 Writing AI scripts\n- 🔧 Troubleshooting\n\nPlease ask a question related to WiseCat!",
                    isOffTopic: true,
                    relevanceScore: topScore
                };
            }

            // 4. Build context from top results
            const context = searchResults.matches
                .map(match => match.metadata.content)
                .join('\n\n---\n\n');

            // 5. LAYER 2: System instruction with strict rules
            const systemInstruction = `You are a helpful assistant ONLY for the WiseCat platform.

STRICT RULES:
1. ONLY answer questions about WiseCat features, services, and usage
2. If asked about anything else (weather, news, general knowledge, jokes, etc.), respond with: "I can only help with WiseCat platform questions."
3. Be concise and helpful for WiseCat-related questions
4. Use markdown formatting for better readability
5. Include relevant links when helpful

WiseCat Topics You CAN Answer:
- Credits and billing
- Making calls (Mouthpiece, Trial, Restaurant)
- Phone number management
- Account and login issues
- AI script writing
- Features and services
- Troubleshooting
- N8N workflows
- Cloud Functions
- i18n and languages

Topics You MUST REFUSE:
- Weather, news, current events
- General knowledge questions
- Jokes, stories, entertainment
- Cooking, recipes
- Math problems (unless WiseCat pricing)
- Any non-WiseCat topics

If unsure, refuse politely.`;

            // 6. Generate answer with Gemini 2.5 Flash-Lite (with Retry Logic)
            const chatModel = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash-lite'
            });

            const prompt = `${systemInstruction}\n\nContext from WiseCat documentation:\n\n${context}\n\nUser Question: ${question}\n\nProvide a helpful answer based on the context above. If the question is not related to WiseCat, politely refuse.`;

            // Robust retry wrapper for 429s
            async function generateWithRetry(model, prompt, maxRetries = 3) {
                for (let i = 0; i < maxRetries; i++) {
                    try {
                        const result = await model.generateContent(prompt);
                        return result.response.text();
                    } catch (err) {
                        if (err.status === 429 && i < maxRetries - 1) {
                            const delay = (i + 1) * 2000; // 2s, 4s, 6s...
                            console.warn(`[queryKnowledge] Rate limit hit. Retrying in ${delay}ms...`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                            continue;
                        }
                        throw err;
                    }
                }
            }

            const answer = await generateWithRetry(chatModel, prompt);

            // 7. LAYER 3: Check if Gemini refused
            const refusalKeywords = [
                "I can only help with WiseCat",
                "not related to WiseCat",
                "outside my scope",
                "I cannot assist with"
            ];

            const isRefusal = refusalKeywords.some(keyword =>
                answer.toLowerCase().includes(keyword.toLowerCase())
            );

            if (isRefusal) {
                console.log(`[queryKnowledge] ❌ Rejected: Gemini detected off-topic`);
                return {
                    answer: "I'm sorry, but I can only help with questions about the **WiseCat platform**. Please ask about our features, services, or how to use WiseCat!",
                    isOffTopic: true,
                    relevanceScore: topScore
                };
            }

            // 8. Update rate limit
            await rateLimitRef.set({
                queries: [...queryHistory, now],
                lastQuery: now
            });

            console.log(`[queryKnowledge] ✅ Answer generated (${answer.length} chars)`);

            return {
                answer,
                sources: searchResults.matches.map(m => ({
                    path: m.metadata.path,
                    type: m.metadata.documentType,
                    relevance: m.score
                })),
                relevanceScore: topScore,
                isOffTopic: false,
                queriesRemaining: 5 - queryHistory.length - 1
            };

        } catch (error) {
            console.error("[queryKnowledge] Error:", error);

            if (error.code === 'resource-exhausted') {
                throw error; // Re-throw rate limit errors
            }

            throw new HttpsError("internal", "Failed to process your question. Please try again.");
        }
    }
);

/**
 * Validate if a shared number user can create a new task
 * Prevents concurrent shared number tasks for the same user
 * BACKEND VALIDATION - Cannot be bypassed by frontend
 */
exports.validateSharedNumberTaskLimit = onCall(
    async (request) => {
        try {
            // Verify authentication
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "User must be authenticated");
            }

            const uid = request.auth.uid;
            const useSharedNumber = request.data?.useSharedNumber || false;

            console.log(`[validateSharedNumberTaskLimit] User ${uid}, useSharedNumber=${useSharedNumber}`);

            // Only validate for shared number users
            if (!useSharedNumber) {
                return { allowed: true, reason: "Own number user - no limit" };
            }

            // Query for incomplete shared number tasks for this user
            const tasksRef = db.collection('tasks');
            const incompleteQuery = await tasksRef
                .where('uid', '==', uid)
                .where('useSharedNumber', '==', true)
                .where('state', '!=', 'completed')
                .get();

            console.log(`[validateSharedNumberTaskLimit] Found ${incompleteQuery.size} incomplete shared number tasks for user ${uid}`);

            if (incompleteQuery.size > 0) {
                const blockingTask = incompleteQuery.docs[0].data();
                const taskId = incompleteQuery.docs[0].id;

                const errorMsg = `You already have an active shared number task (${taskId}) in ${blockingTask.state} state. ` +
                    `Please wait for it to complete before starting a new one.`;

                console.log(`[validateSharedNumberTaskLimit] ❌ User blocked: ${errorMsg}`);

                return {
                    allowed: false,
                    reason: "Active shared number task exists",
                    blockingTaskId: taskId,
                    blockingTaskState: blockingTask.state,
                    blockingTaskRecipient: blockingTask.recipientName || blockingTask.Name || 'Unknown',
                    errorMessage: errorMsg
                };
            }

            console.log(`[validateSharedNumberTaskLimit] ✅ User ${uid} allowed to create shared number task`);
            return { allowed: true, reason: "No active shared number tasks" };

        } catch (error) {
            console.error("[validateSharedNumberTaskLimit] Error:", error);
            throw new HttpsError("internal", `Validation failed: ${error.message}`);
        }
    }
);
