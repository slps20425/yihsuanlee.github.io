const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// Define secrets
const lineChannelId = defineSecret("LINE_CHANNEL_ID");
const lineChannelSecret = defineSecret("LINE_CHANNEL_SECRET");

// Simple in-memory cache to prevent double-invocation (debounce)
const processedCodes = new Map();

exports.lineCallback = onRequest(
    { secrets: [lineChannelId, lineChannelSecret] },
    async (req, res) => {
        const code = req.query.code;
        const state = req.query.state;

        if (!code) {
            return res.status(400).send("Missing authorization code");
        }

        // Debounce check: If code seen in last 5 seconds, ignore this request
        const now = Date.now();
        if (processedCodes.has(code)) {
            const lastTime = processedCodes.get(code);
            if (now - lastTime < 5000) {
                console.log("Duplicate request detected (Debounced):", code);
                return res.status(200).send("Request already processed.");
            }
        }
        processedCodes.set(code, now);

        // Clean up old cache entries occasionally (simple approach)
        if (processedCodes.size > 100) {
            processedCodes.clear();
        }

        const cId = lineChannelId.value().trim();
        const cSecret = lineChannelSecret.value().trim();
        const rUri = "https://wise-catty.cc/api/auth/line/callback";

        try {
            // Log for debugging
            console.log("Exchanging code:", { code: (code || "").toString().substring(0, 5) + "...", rUri });

            // 1. Exchange code for access token
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

            // 2. Verify ID Token
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

            const customToken = await admin.auth().createCustomToken(uid);
            res.redirect(`https://wise-catty.cc/login-success.html?token=${customToken}`);

        } catch (error) {
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
