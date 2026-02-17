import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('firebase-token')?.value;

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifyIdToken(token);

        return NextResponse.json({
            authenticated: true,
            user: {
                uid: decodedToken.uid,
                email: decodedToken.email,
            },
        });
    } catch (error) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}