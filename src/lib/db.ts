import { getPool } from './mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface UrlData {
    shortCode: string;
    originalUrl: string;
    createdAt: string;
    clicks: number;
    clickHistory: Array<{
        timestamp: string;
        userAgent?: string;
        referer?: string;
    }>;
}

interface UrlRow extends RowDataPacket {
    id: number;
    short_code: string;
    original_url: string;
    clicks: number;
    click_history: string;
    created_at: Date;
}

export const db = {
    // Create a new short URL
    create: async (shortCode: string, originalUrl: string): Promise<UrlData> => {
        const pool = getPool();

        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO urls (short_code, original_url, clicks, click_history) VALUES (?, ?, 0, ?)',
            [shortCode, originalUrl, JSON.stringify([])]
        );

        return {
            shortCode,
            originalUrl,
            createdAt: new Date().toISOString(),
            clicks: 0,
            clickHistory: [],
        };
    },

    // Get URL data by short code
    get: async (shortCode: string): Promise<UrlData | null> => {
        const pool = getPool();

        const [rows] = await pool.execute<UrlRow[]>(
            'SELECT * FROM urls WHERE short_code = ?',
            [shortCode]
        );

        if (rows.length === 0) return null;

        const row = rows[0];
        let clickHistory = [];

        try {
            clickHistory = JSON.parse(row.click_history || '[]');
        } catch (e) {
            clickHistory = [];
        }

        return {
            shortCode: row.short_code,
            originalUrl: row.original_url,
            createdAt: row.created_at.toISOString(),
            clicks: row.clicks,
            clickHistory,
        };
    },

    // Increment click count and add to history
    incrementClicks: async (
        shortCode: string,
        userAgent?: string,
        referer?: string
    ): Promise<void> => {
        const pool = getPool();

        // Get current data
        const urlData = await db.get(shortCode);
        if (!urlData) return;

        // Add new click to history
        const clickHistory = urlData.clickHistory || [];
        clickHistory.push({
            timestamp: new Date().toISOString(),
            userAgent,
            referer,
        });

        // Update database
        await pool.execute(
            'UPDATE urls SET clicks = clicks + 1, click_history = ? WHERE short_code = ?',
            [JSON.stringify(clickHistory), shortCode]
        );
    },

    // Get all URLs (for admin/dashboard)
    getAll: async (): Promise<UrlData[]> => {
        const pool = getPool();

        const [rows] = await pool.execute<UrlRow[]>(
            'SELECT * FROM urls ORDER BY created_at DESC'
        );

        return rows.map((row) => {
            let clickHistory = [];
            try {
                clickHistory = JSON.parse(row.click_history || '[]');
            } catch (e) {
                clickHistory = [];
            }

            return {
                shortCode: row.short_code,
                originalUrl: row.original_url,
                createdAt: row.created_at.toISOString(),
                clicks: row.clicks,
                clickHistory,
            };
        });
    },

    // Check if short code exists
    exists: async (shortCode: string): Promise<boolean> => {
        const pool = getPool();

        const [rows] = await pool.execute<UrlRow[]>(
            'SELECT id FROM urls WHERE short_code = ?',
            [shortCode]
        );

        return rows.length > 0;
    },
};