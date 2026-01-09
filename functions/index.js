const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// Define secrets
const lineChannelId = defineSecret("LINE_CHANNEL_ID");
const lineChannelSecret = defineSecret("LINE_CHANNEL_SECRET");

// Global set for debouncing duplicate requests
const processedCodes = new Set();

exports.lineCallback = onRequest(
    { secrets: [lineChannelId, lineChannelSecret] },
    async (req, res) => {
        const rawCode = req.query.code;
        if (!rawCode) return res.status(400).send("No code");

        // --- 核心修復 1: 防止重複請求 (Race Condition) ---
        if (processedCodes.has(rawCode)) {
            console.log("Skipping duplicate request for code:", rawCode.substring(0, 5));
            return res.end(); // Prevent timeout by ending response
        }
        processedCodes.add(rawCode);
        setTimeout(() => processedCodes.delete(rawCode), 10000); // Clear after 10s

        const cId = String(lineChannelId.value()).trim();
        const cSecret = String(lineChannelSecret.value()).trim();
        const rUri = "https://wise-catty.cc/api/auth/line/callback";

        try {
            // --- 核心修復 2: 使用 URLSearchParams 確保編碼正確 ---
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

            // 解析 id_token (這裡最穩，不需再打 verify API)
            const decoded = require("jsonwebtoken").decode(response.data.id_token);
            const uid = `line:${decoded.sub}`;

            // Firebase 同步與產生 Token
            await admin.auth().updateUser(uid, {
                displayName: decoded.name,
                photoURL: decoded.picture,
                email: decoded.email
            }).catch(async (e) => {
                if (e.code === 'auth/user-not-found') {
                    await admin.auth().createUser({
                        uid,
                        displayName: decoded.name,
                        photoURL: decoded.picture,
                        email: decoded.email
                    });
                }
            });

            const customToken = await admin.auth().createCustomToken(uid);
            res.redirect(`https://wise-catty.cc/login-success.html?token=${customToken}`);

        } catch (error) {
            // Clean up code from set on error so user can retry if needed? 
            // Actually, if it's invalid_grant, retrying won't help. 
            // If it's network error, maybe. But for safety let's leave it in Set to prevent spam.
            console.error("EXCHANGE_ERROR:", error.response?.data || error.message);
            res.status(500).json({ detail: error.response?.data || error.message });
        }
    }
);
