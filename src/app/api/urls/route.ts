import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { firestoreDb } from '@/lib/firestore';

export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await adminAuth.verifyIdToken(token);
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const urls = await firestoreDb.getByUser(decoded.uid);

        return NextResponse.json({
            urls: urls.map((url) => ({
                ...url,
                shortUrl: `${baseUrl}/${url.shortCode}`,
            })),
        });
    } catch (error) {
        console.error('Error fetching URLs:', error);
        return NextResponse.json({ error: 'Failed to fetch URLs' }, { status: 500 });
    }
}