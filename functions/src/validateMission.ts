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

            // Use the newer gemini-2.5-flash-lite model (not the deprecated gemini-1.5-flash)
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash-lite",
                generationConfig: {
                    temperature: 0.1, // Low temperature for consistent validation
                    maxOutputTokens: 256, // Increased for JSON response
                }
            });

            // Call Gemini AI
            // Request JSON response
            const responseSchema = {
                type: "object",
                properties: {
                    valid: { type: "boolean" },
                    explanation: { type: "string" },
                    refinedText: { type: "string" },
                    suggestedMissionId: { type: "string", nullable: true }
                }
            };

            // Determine service type from missionId or default to mouthpiece
            const serviceType = missionId === 'restaurant_booking' ? 'restaurant' : 'mouthpiece';
            const prompt = await buildValidationPrompt(missionId, missionName, description, language, serviceType);

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const responseText = result.response.text();
            let parsedResponse: any;

            try {
                parsedResponse = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse JSON response:", responseText);
                // Fallback
                return { valid: true };
            }

            // Log for monitoring
            console.log({
                missionId,
                missionName,
                descriptionLength: description.length,
                result: parsedResponse.valid ? 'MATCH' : 'NOT_MATCH',
                language,
                userId: request.auth.uid,
                suggested: parsedResponse.suggestedMissionId
            });

            return {
                valid: parsedResponse.valid,
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
async function buildValidationPrompt(missionId: string, missionName: string, description: string, language: string, serviceType: string = 'mouthpiece'): Promise<string> {
    const allMissions = await getMissions();
    // Build a detailed list for the AI
    const availableMissionsList = allMissions.map(m => {
        const localizedName = m.nameObj[language] || m.nameObj['en'] || m.id;
        const keywords = m.keywords.length > 0 ? ` Keywords: [${m.keywords.join(', ')}]` : '';
        return `- ID: "${m.id}", Name: "${localizedName}"${keywords}`;
    }).join('\n');

    // Language-specific instructions
    let langInstruction = "";
    const primaryLang = language.split('-')[0]; // Handle zh-TW, en-US, etc.

    switch (primaryLang) {
        case 'zh':
            langInstruction = "You MUST answer in Traditional Chinese (繁體中文).";
            break;
        case 'jp':
        case 'ja':
            langInstruction = "You MUST answer in Japanese (日本語).";
            break;
        case 'kr':
        case 'ko':
            langInstruction = "You MUST answer in Korean (한국어).";
            break;
        case 'es':
            langInstruction = "You MUST answer in Spanish.";
            break;
        case 'fr':
            langInstruction = "You MUST answer in French.";
            break;
        case 'it':
            langInstruction = "You MUST answer in Italian.";
            break;
        default:
            langInstruction = "Answer in English.";
    }

    return `
Role: You are a helpful AI assistant for "WiseCat", a human-in-the-loop task service.
Goal: Validate if the User Description matches the selected Mission.

Current Context:
- Target Mission: "${missionName}" (ID: ${missionId})
- User Input: "${description}"
- Language: ${language}

Available Mission Categories:
${availableMissionsList}

Validation Steps:
1. MATCH CHECK: Does the intent in "User Input" generally align with "Target Mission"?
   - If YES: Set "valid": true.
   - If NO: Set "valid": false and PROCEED TO STEP 2.

2. SEARCH & SUGGEST: If invalid, find the SINGLE BEST MATCH in "Available Mission Categories".
   - Look at Name and Keywords (e.g., "美髮" matches "salon_reservation").
   - If a strong match is found:
     - Set "suggestedMissionId" to that Mission ID.
     - Set "refinedText" to a professional, polite version of the user request optimized for THAT suggested mission.
   - If NO match found: Set "suggestedMissionId": null.

Output Requirements:
- Format: JSON
- Keys: 
  - "valid": boolean
  - "explanation": Short reason (1 sentence) for your decision in ${language}.
  - "refinedText": Professional version of user request in ${language}. If "suggestedMissionId" is set, optimize for that mission.
  - "suggestedMissionId": The ID of the suggested mission, or null.

${langInstruction}
`;
}
