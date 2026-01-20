const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
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

// checkMessageSafety logic merged into validateMissionDescription to reduce cloud invocation costs.

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

// --- Phone Number Management Functions ---

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
            services: { mouthpiece: 4.0, restaurant: 4.0 },
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
        const db = getFirestore(admin.app(), "reservation");

        try {
            // Get user's subaccount credentials
            const settingsRef = db.doc(`users/uid_${uid}/settings/settings`);
            const settingsDoc = await settingsRef.get();
            const settings = settingsDoc.data() || {};

            if (!settings.twilioSubaccountSid || !settings.twilioSubaccountAuthToken) {
                return { usage: [] };
            }

            const subClient = twilio(settings.twilioSubaccountSid, settings.twilioSubaccountAuthToken);

            // Calculate 30 days ago for explicit range
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const startDateStr = thirtyDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD

            // Fetch DAILY usage records provided explicit start date.
            // Limit 1000 (Twilio max) to ensure we get past "Today's" empty records for all categories.
            let records = await subClient.usage.records.daily.list({
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

            const billing = await getBillingConfig(db);
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
                    base_price: parseFloat(r.price || 0),
                    user_price: parseFloat(r.price || 0) * multiplier,
                    currency: r.priceUnit,
                    start_date: r.startDate ? new Date(r.startDate).toISOString() : null,
                    end_date: r.endDate ? new Date(r.endDate).toISOString() : null
                }))
                    .filter(r => r.user_price > 0.0000001)
                    .filter(r => {
                        const BLOCKED_CATEGORIES = new Set([
                            "totalprice",       // Confusion: Looks like a separate charge
                            "voice-minutes",    // Confusion: Duplicates "voice-minutes-outbound/inbound"
                            "sms",              // Confusion: Duplicates "sms-outbound/inbound"
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

            // Fallback: If no VALID daily usage found (after filter), fetch Summary.
            if (usage.length === 0) {
                console.log("[Usage] Daily records empty/filtered, fetching summary fallback.");
                const summaryRecords = await subClient.usage.records.list({ limit: 50 });
                usage = transformRecords(summaryRecords);
            }

            // Sort by date desc (if dates exist)
            usage.sort((a, b) => {
                if (!a.start_date) return 1;
                if (!b.start_date) return -1;
                return new Date(b.start_date) - new Date(a.start_date);
            });

            return { usage, multiplier };
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

            let basePrice = 1.15; // Default fallback for US Local
            try {
                // Try to find generic price for this country/type
                // Note: We don't know the exact type (Mobile/Local) unless passed. 
                // We'll optimistically fetch 'Local' pricing for the country.
                const pricing = await mainClient.pricing.v1.phoneNumbers.countries(countryCode).fetch();
                // Find 'local' price
                const localPriceObj = pricing.phoneNumberPrices.find(p => p.numberType === 'local');
                if (localPriceObj) {
                    basePrice = parseFloat(localPriceObj.currentPrice || 1.15);
                } else if (pricing.phoneNumberPrices.length > 0) {
                    // Fallback to first available type if local not found (e.g. some countries only have mobile)
                    basePrice = parseFloat(pricing.phoneNumberPrices[0].currentPrice || 1.15);
                }
            } catch (e) {
                console.warn("[purchasePhoneNumber] Could not fetch dynamic price, using default:", e.message);
            }

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
                capabilities: purchasedNumber.capabilities || {}, // { voice: true, sms: true, mms: false }
                smsEnabled: purchasedNumber.capabilities?.sms || false // Explicit flag for easier querying
            }, { merge: true });

            console.log(`[purchasePhoneNumber] Success! Number ${phoneNumber} is active`);

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
 * Validates if a user's description matches their selected mission using Gemini 2.5 Flash Lite
 * 
 * Usage: Call from frontend with { missionId, missionName, description, language }
 * Returns: { valid: boolean }
 */
exports.validateMissionDescription = onCall(
    { secrets: [GEMINI_API_KEY] },
    async (request) => {
        const { missionId, missionName, description, language } = request.data;

        // Validate inputs
        if (!missionId || !missionName || !description) {
            throw new HttpsError(
                "invalid-argument",
                "Missing required parameters: missionId, missionName, or description"
            );
        }

        if (description.length < 10) {
            throw new HttpsError(
                "invalid-argument",
                "Description is too short. Please provide at least 10 characters."
            );
        }

        if (description.length > 1000) {
            throw new HttpsError(
                "invalid-argument",
                "Description is too long. Please keep it under 1000 characters."
            );
        }

        try {
            // --- 1. Combined Security Check (Keywords + OpenAI) ---
            const { getFirestore } = require("firebase-admin/firestore");
            const OpenAI = require("openai");

            // Keyword Check
            let blacklist = [];
            try {
                const adminApp = require("firebase-admin").app();
                const dbRes = getFirestore(adminApp, "reservation");
                const settings = await dbRes.doc("configuration/settings").get();
                const configData = settings.data() || {};
                const customKeywords = configData.custom_scam_keywords || "";

                if (Array.isArray(customKeywords)) {
                    blacklist = customKeywords.map(k => String(k).trim().toLowerCase());
                } else {
                    blacklist = String(customKeywords).split(/[\n,]+/).map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
                }
            } catch (e) {
                console.error("[Backend Validation] Firestore Policy Read Error:", e);
            }

            const fallbackKeywords = ["crypto", "investment", "profit", "jackpot", "lottery", "giveaway", "投資獲利", "加賴", "加line", "兼職", "獲利", "高報酬", "博弈"];
            const combinedKeywords = new Set([...blacklist, ...fallbackKeywords]);
            const lowerText = description.toLowerCase();

            for (const word of combinedKeywords) {
                if (lowerText.includes(word)) {
                    console.warn(`[Backend Validation] BLOCKED: Found keyword "${word}"`);
                    return { valid: false, explanation: `Security Block: Found suspicious keyword "${word}".` };
                }
            }

            // OpenAI Moderation
            try {
                const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
                const moderation = await openai.moderations.create({
                    model: "omni-moderation-latest",
                    input: description,
                });
                const modResult = moderation.results[0];
                if (modResult.flagged || modResult.categories.illicit || modResult.categories['illicit/violent']) {
                    console.warn("[Backend Validation] BLOCKED: OpenAI Flagged");
                    return { valid: false, explanation: "Security Block: Content violated safety policies." };
                }
            } catch (aiError) {
                console.error("[Backend Validation] OpenAI API Fail:", aiError);
            }

            // --- 2. AI Refinement (Gemini) ---
            const { GoogleGenerativeAI } = require("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());

            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-lite",
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 800,
                    responseMimeType: "application/json"
                }
            });

            const systemInstructions = {
                en: "You are a professional task assistant. Validate the description and provide a more professional version.",
                zh: "你是專業任務助手。請驗證描述內容，並提供一個更專業的版本。",
                jp: "あなたはプロのタスクアシスタントです。説明を検証し、よりプロフェッショナルな版本を提供してください。",
                kr: "당신은 전문 작업 조수입니다. 설명을 검증하고 더專業적인 버전을 제공하세요.",
                es: "Eres un asistente de tareas profesional. Valida la descripción y proporciona una versión más profesional.",
                fr: "Vous êtes un assistant de tâche professionnel. Validez la description et fournissez une version plus professionnelle.",
                it: "Sei un assistente di compiti professionale. Valida la descrizione e fornisci una versione più professionale."
            };

            const instruction = systemInstructions[language] || systemInstructions.en;

            const prompt = `${instruction}

Mission Category: ${missionName}
User's Description: ${description}

Instructions:
1. Determine if the description matches the mission category (be lenient but ensure relevance).
2. If it matches, provide a "refinedText" that is a professional, grammatically correct version optimized for a phone call (spoken style).
   - **CRITICAL**: Remove filler words, stuttering, and informal interjections (e.g., "uh", "um", "俄", "呃", "欸").
   - Fix all grammar errors, typos, and spelling mistakes (e.g., "我得" -> "我的", "ㄋ" -> "你").
   - Elevate the tone to be polite and professional, but keep it natural for a phone conversation.
   - If the original text is already perfect, "refinedText" can be identical.
3. Provide a brief "explanation" of the improvements made or confirm why it's already professional.
4. Response MUST be in the same language as the User's Description.

Return ONLY a JSON object:
{
  "valid": boolean,
  "refinedText": "string",
  "explanation": "string"
}
`;

            const result = await model.generateContent(prompt);
            let responseText = result.response.text().trim();

            if (responseText.startsWith("```json")) {
                responseText = responseText.replace(/```json|```/g, "").trim();
            }

            let aiResult;
            try {
                aiResult = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse Gemini JSON:", responseText);
                aiResult = {
                    valid: responseText.toUpperCase().includes("TRUE"),
                    refinedText: description,
                    explanation: "AI feedback malformed."
                };
            }

            console.log({
                missionId,
                missionName,
                description,
                refinedText: aiResult.refinedText,
                valid: aiResult.valid,
                userId: request.auth?.uid || "anonymous"
            });

            return aiResult;

        } catch (error) {
            console.error("Validation Logic Error:", error);
            return { valid: true, refinedText: description, explanation: "System error occurred." };
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
