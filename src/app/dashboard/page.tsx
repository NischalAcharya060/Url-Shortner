'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UrlData {
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
    qrCode: string;
    createdAt: string;
    clicks: number;
}

interface ShortenResult {
    shortCode: string;
    shortUrl: string;
    originalUrl: string;
    qrCode: string;
    createdAt: string;
}

export default function DashboardPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<ShortenResult | null>(null);
    const [urls, setUrls] = useState<UrlData[]>([]);
    const [loadingUrls, setLoadingUrls] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);
    const [showAnalytics, setShowAnalytics] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            fetchUrls();
        }
    }, [user]);

    const fetchUrls = async () => {
        try {
            const token = await user!.getIdToken();
            const response = await fetch('/api/urls', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setUrls(data.urls || []);
        } catch (err) {
            console.error('Failed to fetch URLs:', err);
        } finally {
            setLoadingUrls(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setResult(null);

        try {
            const token = await user!.getIdToken();
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ url, customCode: customCode || undefined }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to shorten URL');
            }

            setResult(data);
            setUrl('');
            setCustomCode('');
            fetchUrls();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string, code: string) => {
        navigator.clipboard.writeText(text);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleDelete = async (shortCode: string) => {
        if (!confirm('Are you sure you want to delete this URL?')) return;
        try {
            const token = await user!.getIdToken();
            await fetch(`/api/urls/${shortCode}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUrls();
        } catch (err) {
            console.error('Failed to delete URL:', err);
        }
    };

    const fetchAnalytics = async (shortCode: string) => {
        if (showAnalytics === shortCode) {
            setShowAnalytics(null);
            return;
        }
        try {
            const response = await fetch(`/api/analytics/${shortCode}`);
            const data = await response.json();
            setAnalytics(data);
            setShowAnalytics(shortCode);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        }
    };

    const filteredUrls = urls.filter(
        (u) =>
            u.shortUrl.toLowerCase().includes(search.toLowerCase()) ||
            u.originalUrl.toLowerCase().includes(search.toLowerCase())
    );

    const totalClicks = urls.reduce((sum, u) => sum + (u.clicks || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 animate-pulse" style={{ background: 'linear-gradient(135deg, #6c47ff, #4f2ee8)' }}>
                        🔗
                    </div>
                    <p style={{ color: '#9691b0', fontFamily: 'Syne, sans-serif' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen px-4 py-10">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 animate-fade-in-up">
                    <div>
                        <h1 className="text-3xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#0f0e1a' }}>
                            My Dashboard
                        </h1>
                        <p className="text-sm mt-1 flex items-center gap-2" style={{ color: '#9691b0' }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #6c47ff, #ff6b35)' }}>
                {user.email?.[0].toUpperCase()}
              </span>
                            {user.email}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="self-start sm:self-auto px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{ color: '#ef4444', border: '1.5px solid #fecaca', background: 'rgba(239, 68, 68, 0.04)', fontFamily: 'Syne, sans-serif' }}
                    >
                        Logout
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up animate-delay-1">
                    {[
                        { label: 'Total Links', value: urls.length, color: '#6c47ff', bg: 'rgba(108, 71, 255, 0.08)' },
                        { label: 'Total Clicks', value: totalClicks, color: '#ff6b35', bg: 'rgba(255, 107, 53, 0.08)' },
                        { label: 'This Month', value: urls.filter(u => new Date(u.createdAt).getMonth() === new Date().getMonth()).length, color: '#00c896', bg: 'rgba(0, 200, 150, 0.08)' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl sm:text-3xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: stat.color }}>
                                {stat.value}
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#9691b0' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Shorten Form */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 mb-8 animate-fade-in-up animate-delay-2">
                    <h2 className="text-lg font-black mb-5" style={{ fontFamily: 'Syne, sans-serif', color: '#0f0e1a' }}>
                        ✂️ Shorten a New URL
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#0f0e1a', fontFamily: 'Syne, sans-serif' }}>
                                Long URL
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://your-long-url.com/goes/here"
                                className="input-field w-full px-4 py-3.5 rounded-xl text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#0f0e1a', fontFamily: 'Syne, sans-serif' }}>
                                Custom alias <span style={{ color: '#9691b0', fontWeight: 400 }}>(optional)</span>
                            </label>
                            <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1.5px solid #e8e6f0' }}>
                <span className="px-4 py-3.5 text-sm shrink-0" style={{ background: '#f3f1ff', color: '#9691b0', borderRight: '1.5px solid #e8e6f0', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                  shortly/
                </span>
                                <input
                                    type="text"
                                    value={customCode}
                                    onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                                    placeholder="my-link"
                                    className="flex-1 px-4 py-3.5 text-sm bg-white outline-none"
                                    style={{ color: '#0f0e1a' }}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#dc2626' }}>
                                ❌ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-brand w-full py-3.5 rounded-xl text-base"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Shortening...
                </span>
                            ) : (
                                'Shorten URL →'
                            )}
                        </button>
                    </form>

                    {/* Result */}
                    {result && (
                        <div className="mt-5 p-4 rounded-xl animate-fade-in-up" style={{ background: 'rgba(0, 200, 150, 0.08)', border: '1px solid rgba(0, 200, 150, 0.3)' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: '#00c896' }}>✓</div>
                                <span className="font-bold text-sm" style={{ color: '#00c896', fontFamily: 'Syne, sans-serif' }}>Link created!</span>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <a
                                    href={result.shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono font-bold text-sm hover:underline"
                                    style={{ color: '#6c47ff' }}
                                >
                                    {result.shortUrl}
                                </a>
                                <button
                                    onClick={() => copyToClipboard(result.shortUrl, result.shortCode)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                    style={{ background: copied === result.shortCode ? '#00c896' : '#6c47ff', color: 'white', fontFamily: 'Syne, sans-serif' }}
                                >
                                    {copied === result.shortCode ? '✓ Copied!' : 'Copy'}
                                </button>
                            </div>
                            {result.qrCode && (
                                <div className="mt-3 flex items-center gap-3">
                                    <img src={result.qrCode} alt="QR Code" className="w-20 h-20 rounded-lg bg-white p-1" />
                                    <p className="text-xs" style={{ color: '#6b6880' }}>QR code ready to download from your links list below</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Links List */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in-up animate-delay-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-lg font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#0f0e1a' }}>
                            🔗 Your Links <span className="text-sm font-normal" style={{ color: '#9691b0' }}>({urls.length})</span>
                        </h2>
                        {urls.length > 0 && (
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search links..."
                                className="input-field px-4 py-2.5 rounded-xl text-sm w-full sm:w-64"
                            />
                        )}
                    </div>

                    {loadingUrls ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#f3f1ff' }} />
                            ))}
                        </div>
                    ) : filteredUrls.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#0f0e1a' }}>
                                {search ? 'No links match your search' : 'No links yet'}
                            </p>
                            <p className="text-sm mt-1" style={{ color: '#9691b0' }}>
                                {search ? 'Try a different search term' : 'Create your first short URL above!'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredUrls.map((urlItem) => (
                                <div key={urlItem.shortCode} className="url-card rounded-xl p-4" style={{ border: '1.5px solid #e8e6f0', background: '#faf9ff' }}>

                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <a
                                                    href={urlItem.shortUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono font-bold text-sm hover:underline"
                                                    style={{ color: '#6c47ff' }}
                                                >
                                                    {urlItem.shortUrl}
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(urlItem.shortUrl, urlItem.shortCode)}
                                                    className="px-2 py-0.5 rounded-md text-xs font-bold transition-all"
                                                    style={{
                                                        background: copied === urlItem.shortCode ? 'rgba(0,200,150,0.15)' : 'rgba(108,71,255,0.1)',
                                                        color: copied === urlItem.shortCode ? '#00c896' : '#6c47ff',
                                                        fontFamily: 'Syne, sans-serif',
                                                    }}
                                                >
                                                    {copied === urlItem.shortCode ? '✓ Copied' : 'Copy'}
                                                </button>
                                                <span className="tag" style={{ background: 'rgba(108, 71, 255, 0.1)', color: '#6c47ff' }}>
                          {urlItem.clicks || 0} clicks
                        </span>
                                            </div>
                                            <p className="text-xs truncate" style={{ color: '#9691b0' }}>{urlItem.originalUrl}</p>
                                            <p className="text-xs mt-1" style={{ color: '#c4bfdf' }}>
                                                {new Date(urlItem.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => fetchAnalytics(urlItem.shortCode)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                style={{
                                                    background: showAnalytics === urlItem.shortCode ? 'rgba(108, 71, 255, 0.15)' : 'rgba(108, 71, 255, 0.08)',
                                                    color: '#6c47ff',
                                                    fontFamily: 'Syne, sans-serif',
                                                }}
                                            >
                                                📊 Stats
                                            </button>
                                            <button
                                                onClick={() => handleDelete(urlItem.shortCode)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-red-50"
                                                style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.06)' }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    {/* Analytics Expanded */}
                                    {showAnalytics === urlItem.shortCode && analytics && (
                                        <div className="mt-4 pt-4" style={{ borderTop: '1px dashed #e8e6f0' }}>
                                            <div className="grid grid-cols-3 gap-3 mb-3">
                                                <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(108, 71, 255, 0.08)' }}>
                                                    <div className="text-xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#6c47ff' }}>
                                                        {analytics.totalClicks || 0}
                                                    </div>
                                                    <div className="text-xs" style={{ color: '#9691b0' }}>Clicks</div>
                                                </div>
                                                <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(0, 200, 150, 0.08)' }}>
                                                    <div className="text-xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#00c896' }}>
                                                        {analytics.clicksByDay ? Object.keys(analytics.clicksByDay).length : 0}
                                                    </div>
                                                    <div className="text-xs" style={{ color: '#9691b0' }}>Days</div>
                                                </div>
                                                <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255, 107, 53, 0.08)' }}>
                                                    <div className="text-xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#ff6b35' }}>
                                                        {analytics.browserStats ? Object.keys(analytics.browserStats).length : 0}
                                                    </div>
                                                    <div className="text-xs" style={{ color: '#9691b0' }}>Browsers</div>
                                                </div>
                                            </div>

                                            {analytics.browserStats && Object.keys(analytics.browserStats).length > 0 && (
                                                <div className="space-y-1.5">
                                                    {Object.entries(analytics.browserStats).map(([browser, count]: [string, any]) => (
                                                        <div key={browser} className="flex items-center gap-2">
                                                            <span className="text-xs w-16 shrink-0" style={{ color: '#6b6880' }}>{browser}</span>
                                                            <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ background: '#e8e6f0' }}>
                                                                <div
                                                                    className="h-full rounded-full progress-fill"
                                                                    style={{ width: `${(count / analytics.totalClicks) * 100}%`, background: 'linear-gradient(90deg, #6c47ff, #8b6dff)' }}
                                                                />
                                                            </div>
                                                            <span className="text-xs w-8 text-right shrink-0" style={{ color: '#9691b0' }}>{count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}