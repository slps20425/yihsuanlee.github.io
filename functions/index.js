const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// Define secrets
const lineChannelId = defineSecret("LINE_CHANNEL_ID");
const lineChannelSecret = defineSecret("LINE_CHANNEL_SECRET");

exports.lineCallback = onRequest(
    { secrets: [lineChannelId, lineChannelSecret] },
    async (req, res) => {
        const code = req.query.code;
        const state = req.query.state; // Not currently verified but good practice

        if (!code) {
            return res.status(400).send("Missing authorization code");
        }

        try {
            // 1. Exchange code for access token
            const tokenResponse = await axios.post(
                "https://api.line.me/oauth2/v2.1/token",
                new URLSearchParams({
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: "https://wise-catty.cc/api/auth/line/callback",
                    client_id: lineChannelId.value(),
                    client_secret: lineChannelSecret.value(),
                }),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            const { id_token } = tokenResponse.data;

            // 2. Verify ID Token and get user profile
            const verifyResponse = await axios.post(
                "https://api.line.me/oauth2/v2.1/verify",
                new URLSearchParams({
                    id_token: id_token,
                    client_id: lineChannelId.value(),
                }),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            const lineUser = verifyResponse.data;
            const uid = `line:${lineUser.sub}`;
            const email = lineUser.email; // Requires 'email' scope in LINE Console
            const displayName = lineUser.name;
            const photoURL = lineUser.picture;

            // 3. Create or update user in Firebase Auth?
            // Actually, createCustomToken will work even if user doesn't exist (it creates them)
            // But we might want to update their profile.
            try {
                await admin.auth().updateUser(uid, {
                    email: email,
                    displayName: displayName,
                    photoURL: photoURL,
                    emailVerified: true // Trust LINE verified emails
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

            // 4. Create Custom Token
            const customToken = await admin.auth().createCustomToken(uid);

            // 5. Redirect back to frontend
            res.redirect(`https://wise-catty.cc/login-success.html?token=${customToken}`);

        } catch (error) {
            console.error("LINE Login Error:", error.response?.data || error.message);
            res.status(500).send("Login failed: " + (error.response?.data?.error_description || error.message));
        }
    }
);
