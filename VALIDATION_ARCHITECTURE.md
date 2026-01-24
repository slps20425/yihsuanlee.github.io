# Mission Validation System Architecture (v4.0)

## Overview
The mission validation system ensures that a user's typed script matches their selected mission category (e.g., "Lost Item" vs "Dental Appointment"). If a mismatch is detected, it suggests the correct mission and provides a refined, professional script.

## Core Logic: "Blind Classification"
To prevent AI bias, we moved from valid/invalid verification to pure classification.

1.  **Input**: User Text (e.g., "I want to see a dentist").
2.  **AI Task**: "Here is a list of ALL missions. Pick the one ID that best matches this text." (AI is NOT told what the user *selected*).
3.  **Code Check**: 
    ```typescript
    if (AI_Selected_ID !== User_Selected_ID) {
        Status = MISMATCH
    } else {
        Status = MATCH
    }
    ```
    This guarantees 100% logical consistency.

## Language Handling
To support multi-lingual users (e.g., Chinese speakers using an English UI):
*   **Detection**: The backend scans the input text for CJK (Chinese/Japanese/Korean) characters.
*   **Enforcement**: If CJK is detected, the AI is forcibly instructed to output the `explanation` and `refinedText` in that language, overriding the UI language setting.

## Cloud Architecture
*   **Function**: `validateMissionV2` (2nd Gen Cloud Function / Cloud Run).
*   **Model**: `gemini-2.5-flash` (Low temperature for deterministic output).
*   **Security**: Publicly invokable (`roles/run.invoker`) but protected by Firebase App Check / Auth (at the SDK level).

## UI / UX
*   **Mismatch Detected**: Shows a yellow warning box.
*   **Refinement Preview**: Displays the proposed professional script.
*   **Dual Actions**:
    1.  **Switch & Fix**: Updates Mission Category AND Replaces Text with Refinement.
    2.  **Switch Only**: Updates Mission Category ONLY (keeps original text).
