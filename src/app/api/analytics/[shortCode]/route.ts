import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ shortCode: string }> }
) {
    try {
        const { shortCode } = await params;
        const urlData = await db.get(shortCode);

        if (!urlData) {
            return NextResponse.json(
                { error: 'Short URL not found' },
                { status: 404 }
            );
        }

        // Calculate analytics
        const clicksByDay = urlData.clickHistory.reduce((acc, click) => {
            const date = new Date(click.timestamp).toLocaleDateString();
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const browserStats = urlData.clickHistory.reduce((acc, click) => {
            if (click.userAgent) {
                // Simple browser detection
                let browser = 'Other';
                if (click.userAgent.includes('Chrome')) browser = 'Chrome';
                else if (click.userAgent.includes('Firefox')) browser = 'Firefox';
                else if (click.userAgent.includes('Safari')) browser = 'Safari';
                else if (click.userAgent.includes('Edge')) browser = 'Edge';

                acc[browser] = (acc[browser] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return NextResponse.json({
            shortCode: urlData.shortCode,
            originalUrl: urlData.originalUrl,
            createdAt: urlData.createdAt,
            totalClicks: urlData.clicks,
            clicksByDay,
            browserStats,
            recentClicks: urlData.clickHistory.slice(-10).reverse(),
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}