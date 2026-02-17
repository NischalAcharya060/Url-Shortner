import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export interface UrlData {
    shortCode: string;
    originalUrl: string;
    createdAt: string;
    clicks: number;
    userId: string;
    clickHistory: Array<{
        timestamp: string;
        userAgent?: string;
        referer?: string;
    }>;
}

const urlsCollection = () => adminDb.collection('urls');

export const firestoreDb = {
    // Create a new short URL
    create: async (shortCode: string, originalUrl: string, userId: string): Promise<UrlData> => {
        const urlData: UrlData = {
            shortCode,
            originalUrl,
            createdAt: new Date().toISOString(),
            clicks: 0,
            userId,
            clickHistory: [],
        };

        await urlsCollection().doc(shortCode).set(urlData);
        return urlData;
    },

    // Get URL by short code
    get: async (shortCode: string): Promise<UrlData | null> => {
        const doc = await urlsCollection().doc(shortCode).get();
        if (!doc.exists) return null;
        return doc.data() as UrlData;
    },

    // Get all URLs by user
    getByUser: async (userId: string): Promise<UrlData[]> => {
        const snapshot = await urlsCollection()
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map((doc) => doc.data() as UrlData);
    },

    // Increment clicks and add to history
    incrementClicks: async (
        shortCode: string,
        userAgent?: string,
        referer?: string
    ): Promise<void> => {
        const clickEntry = {
            timestamp: new Date().toISOString(),
            userAgent: userAgent || null,
            referer: referer || null,
        };

        await urlsCollection().doc(shortCode).update({
            clicks: FieldValue.increment(1),
            clickHistory: FieldValue.arrayUnion(clickEntry),
        });
    },

    // Delete a URL
    delete: async (shortCode: string, userId: string): Promise<boolean> => {
        const doc = await urlsCollection().doc(shortCode).get();
        if (!doc.exists) return false;

        const data = doc.data() as UrlData;
        if (data.userId !== userId) return false;

        await urlsCollection().doc(shortCode).delete();
        return true;
    },

    // Check if short code exists
    exists: async (shortCode: string): Promise<boolean> => {
        const doc = await urlsCollection().doc(shortCode).get();
        return doc.exists;
    },
};