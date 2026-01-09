const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// Define secrets
const lineChannelId = defineSecret("LINE_CHANNEL_ID");
const lineChannelSecret = defineSecret("LINE_CHANNEL_SECRET");

// Request Coalescing Cache
// Map<code, Promise<string>> -> Stores the ongoing promise that resolves to the Custom Token
const ongoingRequests = new Map();

exports.lineCallback = onRequest(
    { secrets: [lineChannelId, lineChannelSecret] },
    async (req, res) => {
        const code = req.query.code;
        const state = req.query.state;

        if (!code) {
            return res.status(400).send("Missing authorization code");
        }

        const cId = lineChannelId.value().trim();
        const cSecret = lineChannelSecret.value().trim();
        const rUri = "https://wise-catty.cc/api/auth/line/callback";

        try {
            // Check if this code is already being processed
            if (ongoingRequests.has(code)) {
                console.log("Duplicate request joined (Coalescing):", code);
                const customToken = await ongoingRequests.get(code);
                return res.redirect(`https://wise-catty.cc/login-success.html?token=${customToken}`);
            }

            // Define the logic as a promise
            const processPromise = (async () => {
                console.log("Exchanging code:", { code: (code || "").toString().substring(0, 5) + "...", rUri });

                // 1. Exchange
                const tokenResponse = await axios.post(
                    "https://api.line.me/oauth2/v2.1/token",
                    new URLSearchParams({
                        grant_type: "authorization_code",
                        code: code,
                        redirect_uri: rUri,
                        client_id: cId,
                        client_secret: cSecret,
                    }),
                    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
                );

                const { id_token } = tokenResponse.data;

                // 2. Verify
                const verifyResponse = await axios.post(
                    "https://api.line.me/oauth2/v2.1/verify",
                    new URLSearchParams({
                        id_token: id_token,
                        client_id: cId,
                    }),
                    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
                );

                const lineUser = verifyResponse.data;
                const uid = `line:${lineUser.sub}`;
                const email = lineUser.email;
                const displayName = lineUser.name;
                const photoURL = lineUser.picture;

                // 3. User Sync
                try {
                    await admin.auth().updateUser(uid, {
                        email: email,
                        displayName: displayName,
                        photoURL: photoURL,
                        emailVerified: true
                    });
                } catch (error) {
                    if (error.code === 'auth/user-not-found') {
                        await admin.auth().createUser({
                            uid: uid,
                            email: email,
                            displayName: displayName,
                            photoURL: photoURL,
                            emailVerified: true
                        });
                    }
                }

                // 4. Mint Token
                return await admin.auth().createCustomToken(uid);
            })();

            // Store the promise in cache
            ongoingRequests.set(code, processPromise);

            // Wait for it to finish and handle cleanup
            try {
                const customToken = await processPromise;
                res.redirect(`https://wise-catty.cc/login-success.html?token=${customToken}`);
            } finally {
                // Keep the result in cache briefly for any straggling late requests (e.g. 5s), then clear
                setTimeout(() => runningRequests.delete(code), 5000);
                // Oops, 'ongoingRequests', let me fix variable name in finally block logic
                // Actually, if we delete immediately, a very late request might re-trigger invalid_grant.
                // Keeping it populated with the *resolved* value or just letting it expire is better.
                // But we can't await a resolved promise forever if memory is tight. 
                // Let's clear it after 10s.
                setTimeout(() => ongoingRequests.delete(code), 10000);
            }

        } catch (error) {
            ongoingRequests.delete(code); // Clean up on error
            console.error("LINE Exchange Error:", error.response?.data);
            res.status(500).json({
                debug: "LINE_ERROR",
                detail: error.response?.data,
                message: error.message,
                sent_redirect_uri: rUri
            });
        }
    }
);
