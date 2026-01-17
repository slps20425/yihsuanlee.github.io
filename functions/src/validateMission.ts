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
    async (data: ValidationRequest, context): Promise<ValidationResponse> => {
        // Verify authentication
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated to validate missions.'
            );
        }

        const { missionId, missionName, description, language } = data;

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
                    maxOutputTokens: 10, // We only need "MATCH" or "NOT_MATCH"
                }
            });

            // Construct validation prompt
            const prompt = buildValidationPrompt(missionName, description, language);

            // Call Gemini AI
            const result = await model.generateContent(prompt);
            const response = result.response.text().trim().toUpperCase();

            // Parse response
            const isMatch = response.includes('MATCH') && !response.includes('NOT_MATCH');

            // Log for monitoring
            console.log({
                missionId,
                missionName,
                descriptionLength: description.length,
                result: isMatch ? 'MATCH' : 'NOT_MATCH',
                userId: context.auth.uid
            });

            return {
                valid: isMatch
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

/**
 * Build the validation prompt for Gemini
 */
function buildValidationPrompt(missionName: string, description: string, language: string): string {
    // Language-specific system instructions
    const systemInstructions = {
        en: 'You are a task validator. Determine if the description matches the mission category.',
        zh: '你是任務審核員。判斷描述內容是否屬於該任務類別。',
        jp: 'あなたはタスク検証者です。説明が任務カテゴリーと一致するかどうかを判断してください。',
        kr: '당신은 작업 검증자입니다. 설명이 임무 카테고리와 일치하는지 판단하세요.',
        es: 'Eres un validador de tareas. Determina si la descripción coincide con la categoría de misión.',
        fr: 'Vous êtes un validateur de tâches. Déterminez si la description correspond à la catégorie de mission.',
        it: 'Sei un validatore di compiti. Determina se la descrizione corrisponde alla categoria della missione.'
    };

    const instruction = systemInstructions[language as keyof typeof systemInstructions] || systemInstructions.en;

    return `${instruction}

Mission: ${missionName}
Description: ${description}

Instructions:
- If the description clearly relates to the mission, respond: MATCH
- If the description does NOT relate to the mission, respond: NOT_MATCH
- Be somewhat lenient - if there's reasonable connection, say MATCH

Respond with ONLY the word "MATCH" or "NOT_MATCH". Nothing else.`;
}
