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

            // Determine service type from missionId
            // restaurant_booking is the legacy ID, reservation_* are the new ones
            const serviceType = (missionId === 'restaurant_booking' || missionId.startsWith('reservation_')) ? 'restaurant' : 'mouthpiece';
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
        const primaryLang = language.split('-')[0];
        const localizedName = m.nameObj[language] || m.nameObj[primaryLang] || m.nameObj['en'] || m.id;
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
Role: You are the Lead Dispatcher & Security Officer for "WiseCat AI".
Goal: Analyze a user's request against a selected mission. You must verify validity, safety (scam detection), and suggest the correct mission if the current one is wrong.

Current Context:
- **Selected Mission**: "${missionName}" (ID: ${missionId})
- **User Task Description**: "${description}"
- **Language**: ${language}

Mission Database (ID, Name, Keywords):
${availableMissionsList}

Your Decision Logic:
1. **Security Check (CRITICAL)**:
   - Does this request content seem like a scam, fraud, or phishing attempt?
   - Examples: "You won a prize, call this number", "Your bank account is locked", "Grandson in trouble".
   - If it feels like a scam (SCAM_LIKELY): Set valid=false, suggestedMissionId=null, and explanation="SCAM_ALERT: This request violates our safety policy."

2. **Semantic Match Check**:
   - If not a scam, does the "User Task Description" align with the "Selected Mission"?
   - If it matches: Set valid=true, suggestedMissionId=null.
   - If it DOES NOT match (e.g., user wants to find lost glasses but selected Dental): Set valid=false and PROCEED to step 3.

3. **Intelligent Dispatch**:
   - Scan the "Mission Database" for the best possible match based on keywords and context.
   - If a strong match is found (e.g., "lost my glasses" matches "lost_item"):
     - Set "suggestedMissionId" to the exact ID from the list (e.g., "lost_item").
     - Set "refinedText" to a professional, polite version of the request optimized for THAT mission in ${language}.
   - If no reasonable mission matches: Set "suggestedMissionId" to null.

Output Format (Strict JSON):
{
  "valid": boolean,
  "explanation": "Brief explanation in ${language}.",
  "refinedText": "Professional version of the task in ${language}. If valid=false and suggestedMissionId is not null, optimize for the suggested mission instead.",
  "suggestedMissionId": "The mission ID string" or null
}

${langInstruction}
`;
}
