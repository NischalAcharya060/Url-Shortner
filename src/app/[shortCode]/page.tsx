import { redirect } from 'next/navigation';
import { firestoreDb } from '@/lib/firestore';
import { headers } from 'next/headers';

// Pages that should NOT be treated as short codes
const RESERVED_PATHS = [
    'login',
    'register',
    'dashboard',
    'api',
    'favicon.ico',
    '_next',
    '',
];

export default async function ShortUrlRedirect({
                                                   params,
                                               }: {
    params: Promise<{ shortCode: string }>;
}) {
    const { shortCode } = await params;

    // If it's a reserved path, redirect to home
    if (RESERVED_PATHS.includes(shortCode.toLowerCase())) {
        redirect('/');
    }

    try {
        const urlData = await firestoreDb.get(shortCode);

        if (!urlData) {
            redirect('/?error=notfound');
        }

        const headersList = await headers();
        const userAgent = headersList.get('user-agent') || undefined;
        const referer = headersList.get('referer') || undefined;

        await firestoreDb.incrementClicks(shortCode, userAgent, referer);

        redirect(urlData.originalUrl);
    } catch (error) {
        console.error('Error in redirect:', error);
        redirect('/?error=notfound');
    }
}