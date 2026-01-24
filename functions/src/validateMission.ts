import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ValidationRequest {
    missionId: string;
    missionName: string;
    description: string;
    language: string;
}

interface ValidationResponse {
    valid: boolean;
    confidence?: number;
    explanation?: string;
    refinedText?: string;
    suggestedMissionId?: string | null;
}

/**
 * Language Detection using Unicode Character Ranges
 * Detects the primary language based on character composition
 *
 * Note: Spanish/French/Italian all use Latin script, so we detect them as a group.
 * For more precise detection between Romance languages, would need NLP/dictionary approach.
 */
function detectLanguage(text: string): string {
    if (!text || text.trim().length === 0) {
        return 'unknown';
    }

    // Count characters by Unicode ranges
    let chineseCount = 0;
    let japaneseCount = 0;
    let koreanCount = 0;
    let latinCount = 0;

    for (const char of text) {
        const code = char.charCodeAt(0);

        // Chinese (CJK Unified Ideographs)
        if ((code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF)) {
            chineseCount++;
        }
        // Japanese (Hiragana + Katakana)
        else if ((code >= 0x3040 && code <= 0x309F) || (code >= 0x30A0 && code <= 0x30FF)) {
            japaneseCount++;
        }
        // Korean (Hangul)
        else if (code >= 0xAC00 && code <= 0xD7AF) {
            koreanCount++;
        }
        // Latin (Basic Latin + Latin-1 Supplement - covers English, Spanish, French, Italian, etc.)
        else if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A) ||
            (code >= 0x00C0 && code <= 0x00FF)) { // Extended Latin (accented characters)
            latinCount++;
        }
    }

    // Determine primary language (highest count)
    const counts = {
        zh: chineseCount,
        ja: japaneseCount,
        ko: koreanCount,
        en: latinCount  // Latin-based languages grouped as 'en' (English/Spanish/French/Italian)
    };

    const maxLang = Object.entries(counts).reduce((a, b) => (b[1] > a[1] ? b : a));

    // Return language code if it has significant characters (>3), otherwise unknown
    return maxLang[1] > 3 ? maxLang[0] : 'unknown';
}

/**
 * Validate if response language matches expected language
 * Returns true if languages match or if validation is inconclusive
 */
function validateResponseLanguage(responseText: string, expectedLang: string): boolean {
    const detectedLang = detectLanguage(responseText);

    // If we couldn't detect, assume it's okay (inconclusive)
    if (detectedLang === 'unknown') {
        return true;
    }

    // Normalize language codes (ja/jp, ko/kr)
    const normalizedExpected = expectedLang.split('-')[0];
    const langMap: { [key: string]: string } = {
        'jp': 'ja',
        'kr': 'ko'
    };
    const expectedNormalized = langMap[normalizedExpected] || normalizedExpected;

    return detectedLang === expectedNormalized;
}

/**
 * Validates if a user's description matches their selected mission using Gemini 2.5 Flash Lite
 * 
 * @param missionId - The ID of the selected mission
 * @param missionName - The name of the mission in the current language
 * @param description - User's description of what they want to accomplish
 * @param language - Current UI language (en, zh, jp, kr, es, fr, it)
 * @returns {valid: boolean} - Whether the description matches the mission
 */
export const validateMissionDescription = functions.https.onCall(
    async (request): Promise<ValidationResponse> => {
        // Verify authentication
        if (!request.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated to validate missions.'
            );
        }

        const { missionId, missionName, description, language } = request.data as ValidationRequest;

        // Validate inputs
        if (!missionId || !missionName || !description) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing required parameters: missionId, missionName, or description'
            );
        }

        if (description.length < 10) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Description is too short. Please provide at least 10 characters.'
            );
        }

        if (description.length > 1000) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Description is too long. Please keep it under 1000 characters.'
            );
        }

        try {
            // Initialize Gemini API
            const apiKey = functions.config().gemini?.api_key;
            if (!apiKey) {
                console.error('Gemini API key not configured');
                throw new functions.https.HttpsError(
                    'failed-precondition',
                    'AI service is not properly configured'
                );
            }

            const genAI = new GoogleGenerativeAI(apiKey);

            // Use gemini-2.5-flash for better reasoning than lite
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    temperature: 0.1, // Low temperature for consistent validation
                    maxOutputTokens: 512,
                }
            });

            // Detect input language from user's description
            const detectedInputLang = detectLanguage(description);
            console.log('Detected input language:', detectedInputLang, 'UI language:', language);

            // Determine service type from missionId
            const serviceType = (missionId === 'restaurant_booking' || missionId.startsWith('reservation_')) ? 'restaurant' : 'mouthpiece';

            // Retry logic with language validation (max 3 attempts)
            const MAX_RETRIES = 3;
            let parsedResponse: any = null;
            let lastError: Error | null = null;

            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    console.log(`Attempt ${attempt}/${MAX_RETRIES} - Calling Gemini...`);

                    // Build prompt with increasing language enforcement
                    const prompt = await buildValidationPrompt(
                        missionId,
                        missionName,
                        description,
                        language,
                        serviceType,
                        detectedInputLang,
                        attempt // Pass attempt number for stronger enforcement
                    );

                    const result = await model.generateContent({
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: "application/json",
                        }
                    });

                    const responseText = result.response.text();

                    // Parse JSON
                    try {
                        parsedResponse = JSON.parse(responseText);
                    } catch (e) {
                        console.error(`Attempt ${attempt}: Failed to parse JSON:`, responseText);
                        lastError = e as Error;
                        continue; // Retry
                    }

                    // Validate response language
                    const explanationLangValid = validateResponseLanguage(parsedResponse.explanation || '', language);
                    const refinedTextLangValid = parsedResponse.refinedText
                        ? validateResponseLanguage(parsedResponse.refinedText, language)
                        : true;

                    if (explanationLangValid && refinedTextLangValid) {
                        console.log(`Attempt ${attempt}: Language validation PASSED ✅`);
                        break; // Success!
                    } else {
                        console.warn(`Attempt ${attempt}: Language validation FAILED ❌`, {
                            explanationValid: explanationLangValid,
                            refinedTextValid: refinedTextLangValid,
                            expected: language,
                            detectedExplanation: detectLanguage(parsedResponse.explanation || ''),
                            detectedRefined: parsedResponse.refinedText ? detectLanguage(parsedResponse.refinedText) : 'N/A'
                        });

                        // If last attempt, we'll use it anyway (fail-open)
                        if (attempt === MAX_RETRIES) {
                            console.warn('Max retries reached, using response anyway');
                        }
                        // Otherwise continue to next retry
                    }

                } catch (apiError) {
                    console.error(`Attempt ${attempt}: Gemini API error:`, apiError);
                    lastError = apiError as Error;
                    // Continue to next retry
                }
            }

            // If all retries failed
            if (!parsedResponse) {
                console.error('All retry attempts failed');
                throw lastError || new Error('Failed to get valid response from Gemini');
            }

            // Log for monitoring
            console.log({
                missionId,
                missionName,
                descriptionLength: description.length,
                result: parsedResponse.valid ? 'MATCH' : 'NOT_MATCH',
                uiLanguage: language,
                detectedInputLang,
                userId: request.auth.uid,
                suggested: parsedResponse.suggestedMissionId
            });

            // Enforce consistency: If a different mission is suggested, valid MUST be false
            const isMissionMismatch = parsedResponse.suggestedMissionId && parsedResponse.suggestedMissionId !== missionId;
            const finalValid = isMissionMismatch ? false : parsedResponse.valid;

            return {
                valid: finalValid,
                explanation: parsedResponse.explanation,
                refinedText: parsedResponse.refinedText,
                suggestedMissionId: parsedResponse.suggestedMissionId
            };

        } catch (error) {
            console.error('Gemini API Error:', error);

            // If AI fails, be permissive (don't block users)
            console.warn('Validation failed, allowing request to proceed');
            return {
                valid: true // Fail-open for better UX
            };
        }
    }
);

import { getFirestore } from 'firebase-admin/firestore';

// Cache for missions to reduce Firestore reads
let missionsCache: { [key: string]: any[] } = {};
let cacheTimestamp: { [key: string]: number } = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch missions from Firestore with caching
 */
async function getMissions(): Promise<any[]> {
    const collectionName = 'missions';
    const now = Date.now();

    // Return cached if valid for the centralized missions collection
    if (missionsCache[collectionName] && cacheTimestamp[collectionName] && (now - cacheTimestamp[collectionName] < CACHE_TTL)) {
        return missionsCache[collectionName];
    }

    // Fetch from Firestore named database "reservation"
    const db = getFirestore('reservation');
    const snapshot = await db.collection(collectionName).get();

    const missions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            // Pass the whole name object if available for localized matching
            nameObj: data.name || { en: data.mission_name || doc.id },
            keywords: data.keywords_pool || []
        };
    });

    // Update cache
    missionsCache[collectionName] = missions;
    cacheTimestamp[collectionName] = now;

    return missions;
}

/**
 * Build the validation prompt for Gemini
 */
async function buildValidationPrompt(
    missionId: string,
    missionName: string,
    description: string,
    language: string,
    serviceType: string = 'mouthpiece',
    detectedInputLang: string = 'unknown',
    attempt: number = 1
): Promise<string> {
    const allMissions = await getMissions();
    // Build a detailed list for the AI
    const availableMissionsList = allMissions.map(m => {
        const primaryLang = language.split('-')[0];
        const localizedName = m.nameObj[language] || m.nameObj[primaryLang] || m.nameObj['en'] || m.id;
        const keywords = m.keywords.length > 0 ? ` Keywords: [${m.keywords.join(', ')}]` : '';
        return `- ID: "${m.id}", Name: "${localizedName}"${keywords}`;
    }).join('\n');

    // Determine response language based on detected input language (priority) or UI language
    let responseLanguage = language;
    let langInstruction = "";

    // If we detected a specific language in the user's input, use that
    if (detectedInputLang && detectedInputLang !== 'unknown') {
        const detectedLangMap: { [key: string]: string } = {
            'zh': 'zh',
            'ja': 'jp',
            'ko': 'kr',
            'en': 'en'
        };
        responseLanguage = detectedLangMap[detectedInputLang] || language;
    }

    const primaryLang = responseLanguage.split('-')[0]; // Handle zh-TW, en-US, etc.

    // Build language instruction with increasing strictness based on attempt
    const retryEmphasis = attempt > 1 ? `\n\n🚨 CRITICAL RETRY #${attempt}: Your previous response was in the WRONG language. This is attempt ${attempt}/${3}. ` : '';

    // Emphasize matching user's input language
    const inputLanguageEmphasis = detectedInputLang !== 'unknown'
        ? `\n\n⚠️ IMPORTANT: The user wrote their description in ${detectedInputLang.toUpperCase()} language. You MUST respond in the SAME language the user used in their input. `
        : '';

    switch (primaryLang) {
        case 'zh':
            langInstruction = `${retryEmphasis}${inputLanguageEmphasis}**MANDATORY**: You MUST respond ONLY in Traditional Chinese (繁體中文). Use Chinese characters for ALL fields: "explanation" and "refinedText". DO NOT use English, Japanese, or Korean characters.`;
            break;
        case 'jp':
        case 'ja':
            langInstruction = `${retryEmphasis}${inputLanguageEmphasis}**MANDATORY**: You MUST respond ONLY in Japanese (日本語). Use Japanese Hiragana, Katakana, and Kanji for ALL fields. DO NOT use English, Chinese, or Korean.`;
            break;
        case 'kr':
        case 'ko':
            langInstruction = `${retryEmphasis}${inputLanguageEmphasis}**MANDATORY**: You MUST respond ONLY in Korean (한국어). Use Hangul for ALL fields. DO NOT use English, Chinese, or Japanese.`;
            break;
        case 'es':
            langInstruction = `${retryEmphasis}${inputLanguageEmphasis}**MANDATORY**: You MUST respond ONLY in Spanish (Español). Use Spanish for ALL fields.`;
            break;
        case 'fr':
            langInstruction = `${retryEmphasis}${inputLanguageEmphasis}**MANDATORY**: You MUST respond ONLY in French (Français). Use French for ALL fields.`;
            break;
        case 'it':
            langInstruction = `${retryEmphasis}${inputLanguageEmphasis}**MANDATORY**: You MUST respond ONLY in Italian (Italiano). Use Italian for ALL fields.`;
            break;
        default:
            langInstruction = `${retryEmphasis}${inputLanguageEmphasis}**MANDATORY**: Respond in English only.`;
    }

    // Add input language context
    const inputLangContext = detectedInputLang !== 'unknown'
        ? `\n- **Detected Input Language**: ${detectedInputLang} (The user wrote their description in this language)`
        : '';

    const systemContext = `
Role: You are the Lead Dispatcher & Security Officer for "WiseCat AI".
Current UI Language: ${language} ${inputLangContext}
${langInstruction} // LANGUAGE INSTRUCTION IS PARAMOUNT.

Task:
1. **CLASSIFY**: Analyze the "User Task Description" and select the ONE best matching ID from the "Mission Database".
2. **COMPARE**: Compare your selected ID with the "Current Target Mission".
   - If they are the same: Result is VALID.
   - If they are different: Result is INVALID (Mismatch).
3. **REFINE**: Create a professional version of the user's text in ${language}.

Current Context:
- **Current Target Mission**: "${missionName}" (ID: ${missionId})
- **User Task Description**: "${description}"

Mission Database:
${availableMissionsList}

Output Logic:
- If User Description implies a scam/fraud: valid=false, suggestedMissionId=null, explanation="SCAM_ALERT".
- If Best Match ID == Current Target Mission ID: valid=true, suggestedMissionId=null.
- If Best Match ID != Current Target Mission ID: valid=false, suggestedMissionId=[Best Match ID].

Output Format (Strict JSON):
{
  "valid": boolean,
  "explanation": "Brief reasoning in ${language}.",
  "refinedText": "Professional version of the task in ${language}.",
  "suggestedMissionId": "The ID of the mission you classified in Step 1 (or null if no match)"
}
`;

    return systemContext;
}
