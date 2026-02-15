import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'URL Shortener - Create Short Links & QR Codes',
    description: 'Shorten your URLs, generate QR codes, and track clicks with detailed analytics.',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
    <html lang="en" suppressHydrationWarning>
    <body suppressHydrationWarning>{children}</body>
    </html>
    );
}