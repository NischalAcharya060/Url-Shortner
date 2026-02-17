import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { firestoreDb } from '@/lib/firestore';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ shortCode: string }> }
) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await adminAuth.verifyIdToken(token);
        const { shortCode } = await params;

        const deleted = await firestoreDb.delete(shortCode, decoded.uid);

        if (!deleted) {
            return NextResponse.json(
                { error: 'URL not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting URL:', error);
        return NextResponse.json({ error: 'Failed to delete URL' }, { status: 500 });
    }
}