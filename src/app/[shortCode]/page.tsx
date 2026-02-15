import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export default async function ShortUrlRedirect({
                                                   params,
                                               }: {
    params: Promise<{ shortCode: string }>;
}) {
    const { shortCode } = await params;
    const urlData = await db.get(shortCode);

    if (!urlData) {
        redirect('/?error=notfound');
    }

    // Track the click
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || undefined;
    const referer = headersList.get('referer') || undefined;

    await db.incrementClicks(shortCode, userAgent, referer);

    // Redirect to the original URL
    redirect(urlData.originalUrl);
}