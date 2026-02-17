import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const getFirebaseAdminApp = () => {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!privateKey) {
        throw new Error('FIREBASE_PRIVATE_KEY is not set in environment variables');
    }

    // Handle different formats of the private key
    const formattedKey = privateKey.includes('\\n')
        ? privateKey.replace(/\\n/g, '\n')
        : privateKey;

    return initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: formattedKey,
        }),
    });
};

getFirebaseAdminApp();

export const adminAuth = getAuth();
export const adminDb = getFirestore();