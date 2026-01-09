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
        const code = (req.query.code || "").toString().trim();
        const state = req.query.state;

        if (!code) {
            return res.status(400).send("Missing authorization code");
        }

        const cId = lineChannelId.value().trim();
        const cSecret = lineChannelSecret.value().trim();
        const rUri = "https://wise-catty.cc/api/auth/line/callback";

        try {
            console.log("Exchanging code:", { code: code.substring(0, 5) + "...", rUri });

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

            // ... (rest of logic) ...

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

            // ... (rest of user logic as before) ...
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
            console.error("LINE Login Error Full:", error.response ? JSON.stringify(error.response.data) : error.message);
            const errorData = error.response ? error.response.data : {};
            res.status(500).send(`Login failed details: ${JSON.stringify(errorData)} | Message: ${error.message}`);
        }
    }
);
