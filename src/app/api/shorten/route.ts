import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateShortCode, isValidUrl } from '@/lib/utils';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
    try {
        const { url, customCode } = await request.json();

        // Validate URL
        if (!url || !isValidUrl(url)) {
            return NextResponse.json(
                { error: 'Invalid URL. Please provide a valid HTTP or HTTPS URL.' },
                { status: 400 }
            );
        }

        // Generate or use custom short code
        let shortCode = customCode || generateShortCode();

        // Check if custom code is already taken
        if (customCode && await db.exists(customCode)) {
            return NextResponse.json(
                { error: 'This custom code is already taken. Please choose another.' },
                { status: 409 }
            );
        }

        // Ensure uniqueness for generated codes
        while (await db.exists(shortCode)) {
            shortCode = generateShortCode();
        }

        // Save to database
        const urlData = await db.create(shortCode, url);

        // Generate QR code
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
        const shortUrl = `${baseUrl}/${shortCode}`;
        const qrCode = await QRCode.toDataURL(shortUrl, {
            width: 300,
            margin: 2,
            color: {
                dark: '#1f2937',
                light: '#ffffff',
            },
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