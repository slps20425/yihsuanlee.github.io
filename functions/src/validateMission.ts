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

            const prompt = buildValidationPrompt(missionName, description, language);

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

// Simplified list of missions for AI context (English only is enough for context matching)
const ALL_MISSIONS = [
    { id: 'lost_item', name: 'Lost Item Inquiry', desc: 'Call location about lost item' },
    { id: 'business_hours', name: 'Business Hours Confirmation', desc: 'Check operating status' },
    { id: 'restaurant_booking', name: 'Restaurant Reservation', desc: 'Book a table' },
    { id: 'package_tracking', name: 'Package Tracking', desc: 'Check delivery status' },
    { id: 'event_rsvp', name: 'Event RSVP', desc: 'Confirm attendance' },
    { id: 'repair_appointment', name: 'Repair Appointment', desc: 'Schedule repair service' },
    { id: 'order_modification', name: 'Order Modification', desc: 'Change product/quantity' },
    { id: 'emergency_notification', name: 'Emergency Notification', desc: 'Relay urgent message' },
    { id: 'schedule_verification', name: 'Schedule Verification', desc: 'Confirm meeting time/loc' },
    { id: 'stock_inquiry', name: 'Stock Inquiry', desc: 'Check product availability' },
    { id: 'medical_appointment', name: 'Medical/Dental Appointment', desc: 'Schedule doctor/dentist visit' }
];

/**
 * Build the validation prompt for Gemini
 */
function buildValidationPrompt(missionName: string, description: string, language: string): string {
    // Language-specific instructions
    // CRITICAL: Explicitly handle Traditional Chinese (zh-TW) vs Simplified Chinese (zh-CN)
    let langInstruction = "";

    switch (language) {
        case 'zh':
        case 'zh-TW':
            langInstruction = "You MUST answer in Traditional Chinese (繁體中文). Do NOT use Simplified Chinese.";
            break;
        case 'zh-CN':
            langInstruction = "You MUST answer in Simplified Chinese (简体中文).";
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
        default:
            langInstruction = "Answer in English.";
    }

    const availableMissionsList = ALL_MISSIONS.map(m => `- ID: "${m.id}", Name: "${m.name}" (${m.desc})`).join('\n');

    return `
Role: You are a helpful AI assistant validating user tasks for a service called "WiseCat".
Your Goal: Determine if the User's Description matches the chosen Mission Category. If not, suggest the correct one.

Current Mission: "${missionName}"
User Description: "${description}"

Available Missions:
${availableMissionsList}

Verification Rules:
1. If the Description is RELEVANT to the Current Mission, set "valid": true.
2. If the Description is completely unrelated, set "valid": false.
3. **AUTO-DETECTION**: If "valid" is false, check if the description matches ANY other mission in "Available Missions".
   - If a better match exists, set "suggestedMissionId" to that mission's ID.

Output Requirements:
1. Return JSON with keys: "valid" (boolean), "explanation" (string), "refinedText" (string), "suggestedMissionId" (string or null).
2. "explanation": 
   - If invalid, explain WHY in 1 short sentence. 
   - If valid, give a short confirming compliment.
3. "refinedText": 
   - Rewrite the User Description to be more polite, professional, and clear.
   - Keep the original intent.
4. "suggestedMissionId":
   - The ID of the better matching mission (e.g. "event_rsvp") if applicable. Otherwise null.
5. **LANGUAGE CONSTRAINT**: ${langInstruction}
   - "explanation" and "refinedText" MUST be in the requested language.
`;
}
