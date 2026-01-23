/**
 * Target Number Validator
 * Google Places API integration for blocking government locations
 * Used in call/reservation forms
 * Blocklist fetched from Firestore settings/location_blocklist
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase-config';

interface PlaceResult {
    name: string;
    phone?: string;
    types: string[];
    formatted_address: string;
    place_id: string;
}

// Default blocklists (fallback if Firestore unavailable)
const DEFAULT_BLOCKED_TYPES = [
    'police', 'hospital', 'government_office', 'courthouse',
    'fire_station', 'military_base', 'prison', 'detention_center',
    'city_hall', 'parliament', 'senate', 'embassy', 'consulate'
];

const DEFAULT_BLOCKED_KEYWORDS = [
    'police', 'hospital', 'government', 'courthouse', 'jail',
    'prison', 'military', 'fbi', 'cia', 'dea', 'embassy'
];

// Cache for blocklist
let cachedBlocklist: {
    types: string[];
    keywords: string[];
    lastFetched: number;
} | null = null;

let googleMapsLoaded = false;

/**
 * Fetch blocklist from Firestore settings/location_blocklist
 * Falls back to hardcoded defaults if unavailable
 */
async function fetchBlocklist(): Promise<{
    types: string[];
    keywords: string[];
}> {
    // Use cache if fresh (within 5 minutes)
    if (cachedBlocklist && Date.now() - cachedBlocklist.lastFetched < 5 * 60 * 1000) {
        return {
            types: cachedBlocklist.types,
            keywords: cachedBlocklist.keywords
        };
    }

    try {
        const docRef = doc(db, 'settings', 'location_blocklist');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const blocklist = {
                types: data.types || DEFAULT_BLOCKED_TYPES,
                keywords: data.keywords || DEFAULT_BLOCKED_KEYWORDS
            };

            // Cache it
            cachedBlocklist = {
                ...blocklist,
                lastFetched: Date.now()
            };

            console.log('[TargetValidator] Blocklist loaded from Firestore:', blocklist);
            return blocklist;
        } else {
            console.warn('[TargetValidator] Blocklist document not found, using defaults');
        }
    } catch (error) {
        console.warn('[TargetValidator] Failed to fetch blocklist from Firestore:', error);
    }

    // Return defaults if Firestore fails
    return {
        types: DEFAULT_BLOCKED_TYPES,
        keywords: DEFAULT_BLOCKED_KEYWORDS
    };
}

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
            // Pre-fetch blocklist on initialization
            fetchBlocklist().catch(err => console.error('[TargetValidator] Failed to pre-fetch blocklist:', err));
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
 * Search for places/businesses and filter blocked locations
 */
export async function searchPlaces(query: string): Promise<Array<{
    place_id: string;
    name: string;
    description: string;
}>> {
    if (!window.google?.maps?.places) {
        return [];
    }

    const blocklist = await fetchBlocklist();

    return new Promise((resolve) => {
        const service = new window.google!.maps.places.AutocompleteService();
        service.getPlacePredictions(
            {
                input: query,
                types: ['establishment', 'geocode']
            },
            (predictions: any[]) => {
                if (predictions) {
                    // Filter out blocked locations based on keywords
                    const filtered = predictions.filter(p => {
                        const text = `${p.main_text} ${p.description}`.toLowerCase();
                        const isBlocked = blocklist.keywords.some(keyword =>
                            text.includes(keyword.toLowerCase())
                        );
                        if (isBlocked) {
                            console.log(`[TargetValidator] Filtered out: ${p.main_text}`);
                        }
                        return !isBlocked;
                    });

                    resolve(filtered.map(p => ({
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
            async (result: any, status: any) => {
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
                const isBlocked = await isLocationBlocked(place);
                if (isBlocked) {
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
 * Check if location is in blocklist (fetched from Firestore)
 */
async function isLocationBlocked(place: PlaceResult): Promise<boolean> {
    const blocklist = await fetchBlocklist();
    const text = `${place.name} ${place.formatted_address}`.toLowerCase();

    // Check type (most reliable - uses Google's classification)
    for (const type of place.types) {
        if (blocklist.types.some(blocked =>
            type.toLowerCase().includes(blocked.toLowerCase())
        )) {
            console.log(`[TargetValidator] Blocked by type: ${type}`);
            return true;
        }
    }

    // Check keywords (backup validation)
    for (const keyword of blocklist.keywords) {
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
