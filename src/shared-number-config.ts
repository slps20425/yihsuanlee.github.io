import { collection, query, orderBy, limit, getDocs, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firebase-config';

// Cache for shared numbers (collection)
let cachedSharedNumbers: Array<{
    id: string;
    phoneNumber: string;
    vapiPhoneNumberId: string;
    [key: string]: any;
}> = [];

let configListener: Unsubscribe | null = null;

/**
 * Initialize real-time listener for shared numbers collection
 * Call this once on app startup to keep cache updated
 */
export function initSharedNumberConfig(): void {
    const sharedNumbersRef = collection(db, 'shared_numbers');
    const q = query(sharedNumbersRef, orderBy('createdAt', 'desc'));

    configListener = onSnapshot(q, (snap) => {
        cachedSharedNumbers = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];

        console.log('Shared numbers config updated:', cachedSharedNumbers.length, 'numbers available');
        cachedSharedNumbers.forEach(num => {
            console.log(`  - ${num.id}: ${num.phoneNumber}`);
        });
    }, (error) => {
        console.warn('Error listening to shared numbers config:', error);
    });
}

/**
 * Get the first active shared number from cache
 * Returns the first one in the list (ordered by createdAt desc)
 */
export function getSharedNumberConfig(): {
    id: string;
    phoneNumber: string;
    vapiPhoneNumberId: string;
    originalPrice?: number;
} | null {
    if (cachedSharedNumbers.length > 0) {
        const first = cachedSharedNumbers[0];
        return {
            id: first.id,
            phoneNumber: first.phoneNumber,
            vapiPhoneNumberId: first.vapiPhoneNumberId,
            originalPrice: first.originalPrice
        };
    }
    return null;
}

/**
 * Get all shared numbers
 */
export function getAllSharedNumbers(): Array<{
    id: string;
    phoneNumber: string;
    vapiPhoneNumberId: string;
    originalPrice?: number;
}> {
    return cachedSharedNumbers.map(num => ({
        id: num.id,
        phoneNumber: num.phoneNumber,
        vapiPhoneNumberId: num.vapiPhoneNumberId,
        originalPrice: num.originalPrice
    }));
}

/**
 * Fetch shared numbers once (used if listener not initialized)
 * Returns the first one in the collection
 */
export async function fetchSharedNumberConfigOnce(): Promise<{
    id: string;
    phoneNumber: string;
    vapiPhoneNumberId: string;
    originalPrice?: number;
} | null> {
    try {
        if (cachedSharedNumbers.length > 0) {
            const first = cachedSharedNumbers[0];
            return {
                id: first.id,
                phoneNumber: first.phoneNumber,
                vapiPhoneNumberId: first.vapiPhoneNumberId,
                originalPrice: first.originalPrice
            };
        }

        const sharedNumbersRef = collection(db, 'shared_numbers');
        const q = query(sharedNumbersRef, orderBy('createdAt', 'desc'), limit(1));
        const snap = await getDocs(q);

        if (snap.size > 0) {
            const doc = snap.docs[0];
            return {
                id: doc.id,
                phoneNumber: doc.data().phoneNumber,
                vapiPhoneNumberId: doc.data().vapiPhoneNumberId,
                originalPrice: doc.data().originalPrice
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching shared number config:', error);
        return null;
    }
}

/**
 * Cleanup listener
 */
export function cleanupSharedNumberConfig(): void {
    if (configListener) {
        configListener();
        configListener = null;
    }
}
