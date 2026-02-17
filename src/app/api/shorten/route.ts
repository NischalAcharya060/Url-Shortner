import { NextRequest, NextResponse } from 'next/server';
import { firestoreDb } from '@/lib/firestore';
import { generateShortCode, isValidUrl } from '@/lib/utils';
import { adminAuth } from '@/lib/firebase-admin';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
    try {
        // Verify auth token
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await adminAuth.verifyIdToken(token);
        const userId = decoded.uid;

        const { url, customCode } = await request.json();

        if (!url || !isValidUrl(url)) {
            return NextResponse.json(
                { error: 'Invalid URL. Please provide a valid HTTP or HTTPS URL.' },
                { status: 400 }
            );
        }

        let shortCode = customCode || generateShortCode();

        if (customCode && await firestoreDb.exists(customCode)) {
            return NextResponse.json(
                { error: 'This custom code is already taken. Please choose another.' },
                { status: 409 }
            );
        }

        let attempts = 0;
        while (await firestoreDb.exists(shortCode)) {
            shortCode = generateShortCode();
            attempts++;
            if (attempts > 10) throw new Error('Failed to generate unique short code');
        }

        const urlData = await firestoreDb.create(shortCode, url, userId);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
        const shortUrl = `${baseUrl}/${shortCode}`;

        const qrCode = await QRCode.toDataURL(shortUrl, {
            width: 300,
            margin: 2,
            color: { dark: '#1f2937', light: '#ffffff' },
        });

        return NextResponse.json({
            success: true,
            shortCode,
            shortUrl,
            originalUrl: url,
            qrCode,
            createdAt: urlData.createdAt,
        });
    } catch (error) {
        console.error('Error creating short URL:', error);
        return NextResponse.json(
            { error: 'Failed to create short URL. Please try again.' },
            { status: 500 }
        );
    }
}