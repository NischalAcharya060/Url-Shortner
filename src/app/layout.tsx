import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Shortly — Shorten, Share & Track Your Links',
    description: 'The fastest way to shorten URLs, generate QR codes, and track your links with powerful analytics.',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning>
        <AuthProvider>
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-1">
                    {children}
                </div>
                <Footer />
            </div>
        </AuthProvider>
        </body>
        </html>
    );
}