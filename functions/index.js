const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

// Define secrets
const lineChannelId = defineSecret("LINE_CHANNEL_ID");
const lineChannelSecret = defineSecret("LINE_CHANNEL_SECRET");
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

// ... (Existing code remains the same until exports.checkMessageSafety)

// ... Imports
const { getFirestore } = require("firebase-admin/firestore"); // Import getFirestore

// ...

exports.checkMessageSafety = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
    try {
        const { text } = request.data;
        if (!text) throw new HttpsError("invalid-argument", "Text is required.");

        console.log(`[Security Check] Analyzing text: "${text.substring(0, 50)}..."`);

        // 1. FIREBASE KEYWORD CHECK (Local/Fast)
        // Use the named database "reservation" where "configuration/settings" lives
        let blacklist = [];
        try {
            const db = getFirestore(admin.app(), "reservation");
            const settings = await db.doc("configuration/settings").get();
            const data = settings.data() || {};
            const customKeywords = data.custom_scam_keywords || "";

            // Handle both String (comma sep) and Array types from Firestore
            if (Array.isArray(customKeywords)) {
                blacklist = customKeywords.map(k => String(k).trim().toLowerCase());
            } else {
                blacklist = String(customKeywords).split(/[\n,]+/).map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
            }
            console.log(`[Security Check] Loaded ${blacklist.length} rules from Firestore.`);
        } catch (e) {
            console.error("[Security Check] Firestore Policy Read Error (Falling back to default list):", e);
        }

        // Hardcoded Fallback (Golden List) - Merge unique
        const fallbackKeywords = [
            "crypto", "investment", "profit", "jackpot", "lottery", "giveaway",
            "投資獲利", "加賴", "加line", "兼職", "獲利", "高報酬", "博弈"
        ];

        const combined = new Set([...blacklist, ...fallbackKeywords]);
        // console.log(`[Security Check] Active Keywords: ${Array.from(combined).join(", ")}`); // Too verbose for prod

        const lowerText = text.toLowerCase();
        for (const word of combined) {
            if (lowerText.includes(word)) {
                console.warn(`[Security Check] BLOCKED: Found keyword "${word}"`);
                return { status: "blocked", reason: `Keyword Match: ${word}` };
            }
        }

        // 2. OPENAI MODERATION API
        // ... call openai ...
    } catch (criticalError) {
        console.error("[Security Check] CRITICAL FUNC ERROR:", criticalError);
        return { status: "safe", warning: "System Error - Failed Open" };
    }

    // (This part needs to be inside the big try block or handled. 
    // The previous replace ended before OpenAI. I need to be careful with replace range.)
    // Let's rewrite the top part and connect it to OpenAI part.

    // ... Re-implement OpenAI part to be inside try/catch or just return early.

    try {
        const { text } = request.data;
        // ... (Logic from above) ...
        // ... (Keyword check returns) ...

        // 2. OPENAI
        const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
        const moderation = await openai.moderations.create({
            model: "omni-moderation-latest",
            input: text,
        });
        const result = moderation.results[0];
        if (result.flagged || result.categories.illicit || result.categories['illicit/violent']) {
            return { status: "blocked", reason: "AI Security Block" };
        }
        return { status: "safe" };

    } catch (e) {
        console.error("OpenAI/System Error:", e);
        return { status: "safe" };
    }
});

const result = moderation.results[0];
// Flags for safety or the 'illicit' category which covers many scam behaviors
if (result.flagged || result.categories.illicit || result.categories['illicit/violent']) {
    return {
        status: "blocked",
        reason: "AI Security Block (Suspected Scam/Phishing)"
    };
}

return { status: "safe" };
    } catch (error) {
    console.error("OpenAI Error:", error);
    // Fail open or closed? If AI fails, maybe standard keywords are enough? 
    // Or fail safe to 'safe' but log error.
    // Let's assume safe to avoid blocking legit users if API hiccups.
    return { status: "safe", warning: "AI Check Failed" };
}
});


// Global set for debouncing duplicate requests
const processedCodes = new Set();

exports.lineCallback = onRequest(
    { secrets: [lineChannelId, lineChannelSecret] },
    async (req, res) => {
        // ... (Existing Line Callback Logic - Unchanged)
        const rawCode = req.query.code;
        if (!rawCode) return res.status(400).send("No code");

        // --- 1: Anti-Duplicate (Race Condition) ---
        if (processedCodes.has(rawCode)) {
            console.log("Skipping duplicate request for code:", rawCode.substring(0, 5));
            return res.end();
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

            // 2. Lock it (Set to WIP)
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
