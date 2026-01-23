/**
 * Target Number Validator
 * Google Places API integration for blocking government locations
 * Used in call/reservation forms
 */

interface PlaceResult {
    name: string;
    phone?: string;
    types: string[];
    formatted_address: string;
    place_id: string;
}

const BLOCKED_TYPES = [
    'police', 'hospital', 'government_office', 'courthouse',
    'fire_station', 'military_base', 'prison', 'detention_center',
    'city_hall', 'parliament', 'senate', 'embassy', 'consulate'
];

const BLOCKED_KEYWORDS = [
    'police', 'hospital', 'government', 'courthouse', 'jail',
    'prison', 'military', 'fbi', 'cia', 'dea', 'embassy'
];

let googleMapsLoaded = false;

/**
 * Load Google Maps API
 */
export async function initGoogleMapsAPI(): Promise<boolean> {
    if (googleMapsLoaded && window.google?.maps?.places) {
        return true;
    }

    return new Promise((resolve) => {
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!key) {
            console.warn('[TargetValidator] Google Maps API key not configured');
            resolve(false);
            return;
        }

        if (document.getElementById('google-maps-api')) {
            resolve(window.google?.maps?.places ? true : false);
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-api';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
        script.async = true;

        script.onload = () => {
            googleMapsLoaded = true;
            resolve(true);
        };

        script.onerror = () => {
            console.error('[TargetValidator] Failed to load Google Maps API');
            resolve(false);
        };

        document.head.appendChild(script);
    });
}

/**
 * Search for places/businesses
 */
export async function searchPlaces(query: string): Promise<Array<{
    place_id: string;
    name: string;
    description: string;
}>> {
    if (!window.google?.maps?.places) {
        return [];
    }

    return new Promise((resolve) => {
        const service = new window.google!.maps.places.AutocompleteService();
        service.getPlacePredictions(
            {
                input: query,
                types: ['establishment', 'geocode']
            },
            (predictions: any[]) => {
                if (predictions) {
                    resolve(predictions.map(p => ({
                        place_id: p.place_id,
                        name: p.main_text,
                        description: p.description
                    })));
                } else {
                    resolve([]);
                }
            }
        );
    });
}

/**
 * Get place details and validate
 */
export async function validatePlace(placeId: string): Promise<{
    valid: boolean;
    place?: PlaceResult;
    error?: string;
}> {
    if (!window.google?.maps?.places) {
        return { valid: false, error: 'Google Maps not loaded' };
    }

    return new Promise((resolve) => {
        const tempDiv = document.createElement('div');
        const map = new window.google!.maps.Map(tempDiv);
        const service = new window.google!.maps.places.PlacesService(map);

        service.getDetails(
            {
                placeId,
                fields: ['name', 'formatted_phone_number', 'types', 'formatted_address']
            },
            (result: any, status: any) => {
                tempDiv.remove();

                if (status !== 'OK' || !result) {
                    resolve({
                        valid: false,
                        error: 'Failed to load location details'
                    });
                    return;
                }

                const place: PlaceResult = {
                    name: result.name,
                    phone: result.formatted_phone_number,
                    types: result.types || [],
                    formatted_address: result.formatted_address,
                    place_id: placeId
                };

                // Check if blocked
                if (isLocationBlocked(place)) {
                    resolve({
                        valid: false,
                        error: '❌ Government locations cannot be contacted. Please select a different business.'
                    });
                    return;
                }

                resolve({ valid: true, place });
            }
        );
    });
}

/**
 * Check if location is in blacklist
 */
function isLocationBlocked(place: PlaceResult): boolean {
    const text = `${place.name} ${place.formatted_address}`.toLowerCase();

    // Check type
    for (const type of place.types) {
        if (BLOCKED_TYPES.some(blocked =>
            type.toLowerCase().includes(blocked.toLowerCase())
        )) {
            console.log(`[TargetValidator] Blocked by type: ${type}`);
            return true;
        }
    }

    // Check keywords
    for (const keyword of BLOCKED_KEYWORDS) {
        if (text.includes(keyword.toLowerCase())) {
            console.log(`[TargetValidator] Blocked by keyword: ${keyword}`);
            return true;
        }
    }

    return false;
}

/**
 * Log blocked attempt
 */
export function logBlockedAttempt(place: PlaceResult, uid: string): void {
    console.log(`[TargetValidator] BLOCKED: ${place.name} | User: ${uid} | Time: ${new Date().toISOString()}`);
    // In production, send to backend for monitoring
}
