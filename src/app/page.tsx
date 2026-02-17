'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface ShortenedUrl {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  qrCode: string;
  createdAt: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ShortenedUrl | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url, customCode: customCode || undefined }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to shorten URL');

      setResult(data);
      setUrl('');
      setCustomCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    if (result) {
      const link = document.createElement('a');
      link.download = `qr-${result.shortCode}.png`;
      link.href = result.qrCode;
      link.click();
    }
  };

  const fetchAnalytics = async () => {
    if (!result) return;
    try {
      const response = await fetch(`/api/analytics/${result.shortCode}`);
      const data = await response.json();
      setAnalytics(data);
      setShowAnalytics(true);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  return (
      <>
        {/* Login Prompt Modal */}
        {showLoginPrompt && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                style={{ background: 'rgba(15, 14, 26, 0.7)', backdropFilter: 'blur(8px)' }}
                onClick={() => setShowLoginPrompt(false)}
            >
              <div
                  className="glass-card rounded-3xl p-8 w-full max-w-md animate-fade-in-up relative"
                  onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all hover:bg-gray-100"
                    style={{ color: '#9691b0' }}
                >
                  ✕
                </button>

                {/* Icon */}
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
                    style={{ background: 'linear-gradient(135deg, #6c47ff, #4f2ee8)', boxShadow: '0 8px 24px rgba(108,71,255,0.3)' }}
                >
                  🔐
                </div>

                <h2
                    className="text-2xl font-black text-center mb-2"
                    style={{ fontFamily: 'Syne, sans-serif', color: '#0f0e1a' }}
                >
                  Login to shorten links
                </h2>
                <p className="text-sm text-center mb-8" style={{ color: '#9691b0' }}>
                  Create a free account to start shortening URLs, generating QR codes, and tracking your clicks.
                </p>

                {/* Benefits */}
                <div className="space-y-2 mb-8">
                  {[
                    { icon: '⚡', text: 'Instantly shorten any URL' },
                    { icon: '📱', text: 'Auto-generate QR codes' },
                    { icon: '📊', text: 'Track clicks & analytics' },
                    { icon: '📋', text: 'Manage all your links' },
                  ].map((item) => (
                      <div
                          key={item.text}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                          style={{ background: 'rgba(108, 71, 255, 0.05)' }}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-sm font-medium" style={{ color: '#0f0e1a' }}>{item.text}</span>
                        <span className="ml-auto text-xs font-bold" style={{ color: '#00c896' }}>✓ Free</span>
                      </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <Link
                      href="/register"
                      className="btn-brand w-full py-4 rounded-xl text-base text-center block"
                      style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    Create free account →
                  </Link>
                  <Link
                      href="/login"
                      className="w-full py-4 rounded-xl text-base text-center block font-bold transition-all"
                      style={{ color: '#6c47ff', border: '1.5px solid rgba(108,71,255,0.3)', fontFamily: 'Syne, sans-serif' }}
                  >
                    I already have an account
                  </Link>
                </div>
              </div>
            </div>
        )}

        {/* Hero Section */}
        <section className="relative pt-16 pb-12 px-4 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center">

            {/* Badge */}
            <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-in-up"
                style={{ background: 'rgba(108, 71, 255, 0.08)', border: '1px solid rgba(108, 71, 255, 0.2)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: '#6c47ff' }} />
              <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: '#6c47ff', fontFamily: 'Syne, sans-serif' }}
              >
              Free URL Shortener
            </span>
            </div>

            {/* Heading */}
            <h1
                className="text-5xl sm:text-6xl md:text-7xl font-black leading-none mb-6 animate-fade-in-up animate-delay-1"
                style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}
            >
              Shorten.<br />
              <span className="shimmer-text">Share.</span>{' '}
              <span style={{ color: '#ff6b35' }}>Track.</span>
            </h1>

            <p
                className="text-lg max-w-xl mx-auto mb-10 animate-fade-in-up animate-delay-2"
                style={{ color: '#6b6880', lineHeight: '1.7' }}
            >
              Transform long URLs into powerful short links with QR codes and real-time analytics. Free forever.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-12 animate-fade-in-up animate-delay-3">
              {[
                { value: '100%', label: 'Free' },
                { value: 'Instant', label: 'QR codes' },
                { value: 'Real-time', label: 'Analytics' },
              ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#0f0e1a' }}>
                      {stat.value}
                    </div>
                    <div className="text-xs" style={{ color: '#9691b0' }}>{stat.label}</div>
                  </div>
              ))}
            </div>

            {/* Error from redirect */}
            {searchParams.get('error') === 'notfound' && (
                <div
                    className="mb-6 p-4 rounded-xl text-sm animate-fade-in-up"
                    style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#dc2626' }}
                >
                  ⚠️ Short URL not found. Please check the link and try again.
                </div>
            )}

            {/* Main Form Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in-up animate-delay-4 text-left">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: '#0f0e1a', fontFamily: 'Syne, sans-serif' }}
                  >
                    Paste your long URL
                  </label>
                  <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://your-very-long-url.com/goes/here"
                      className="input-field w-full px-4 py-3.5 rounded-xl text-sm"
                      required
                  />
                </div>

                <div>
                  <label
                      className="block text-sm font-semibold mb-2"
                      style={{ color: '#0f0e1a', fontFamily: 'Syne, sans-serif' }}
                  >
                    Custom alias{' '}
                    <span style={{ color: '#9691b0', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div
                      className="flex items-center gap-0 rounded-xl overflow-hidden"
                      style={{ border: '1.5px solid #e8e6f0' }}
                  >
                  <span
                      className="px-4 py-3.5 text-sm shrink-0"
                      style={{ background: '#f3f1ff', color: '#9691b0', borderRight: '1.5px solid #e8e6f0', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}
                  >
                    shortly/
                  </span>
                    <input
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                        placeholder="my-custom-link"
                        className="flex-1 px-4 py-3.5 text-sm bg-white outline-none"
                        style={{ color: '#0f0e1a' }}
                    />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: '#9691b0' }}>
                    Letters, numbers, hyphens and underscores only
                  </p>
                </div>

                {error && (
                    <div
                        className="p-4 rounded-xl text-sm"
                        style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#dc2626' }}
                    >
                      ❌ {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-brand w-full py-4 rounded-xl text-base"
                >
                  {isLoading ? (
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

              {!user && (
                  <p className="text-xs text-center mt-4" style={{ color: '#9691b0' }}>
                    <button
                        onClick={() => setShowLoginPrompt(true)}
                        className="font-semibold hover:underline"
                        style={{ color: '#6c47ff' }}
                    >
                      Sign up free
                    </button>{' '}
                    to save links & view analytics
                  </p>
              )}
            </div>
          </div>
        </section>

        {/* Result Section */}
        {result && (
            <section className="px-4 pb-12">
              <div className="max-w-4xl mx-auto">
                <div
                    className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in-up"
                    style={{ border: '1px solid rgba(0, 200, 150, 0.3)' }}
                >
                  <div className="flex items-center gap-2 mb-6">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ background: '#00c896' }}
                    >
                      ✓
                    </div>
                    <h2 className="text-xl font-black" style={{ fontFamily: 'Syne, sans-serif' }}>
                      Your link is ready!
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Short URL display */}
                    <div>
                      <p
                          className="text-xs font-bold uppercase tracking-widest mb-2"
                          style={{ color: '#9691b0', fontFamily: 'Syne, sans-serif' }}
                      >
                        Short Link
                      </p>
                      <div
                          className="flex items-center gap-2 p-4 rounded-xl"
                          style={{ background: '#f7f6ff', border: '1.5px solid rgba(108, 71, 255, 0.2)' }}
                      >
                        <a
                            href={result.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 font-mono text-base font-bold hover:underline truncate"
                            style={{ color: '#6c47ff' }}
                        >
                          {result.shortUrl}
                        </a>
                        <button
                            onClick={copyToClipboard}
                            className="shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                            style={{
                              background: copied ? '#00c896' : '#6c47ff',
                              color: 'white',
                              fontFamily: 'Syne, sans-serif',
                              transform: copied ? 'scale(0.96)' : 'scale(1)',
                            }}
                        >
                          {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                      </div>

                      <div className="mt-4">
                        <p
                            className="text-xs font-bold uppercase tracking-widest mb-2"
                            style={{ color: '#9691b0', fontFamily: 'Syne, sans-serif' }}
                        >
                          Original URL
                        </p>
                        <p
                            className="text-sm truncate p-3 rounded-lg"
                            style={{ background: '#f7f6ff', color: '#6b6880' }}
                        >
                          {result.originalUrl}
                        </p>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <button
                            onClick={fetchAnalytics}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                            style={{ background: 'rgba(108, 71, 255, 0.1)', color: '#6c47ff', fontFamily: 'Syne, sans-serif' }}
                        >
                          📊 Analytics
                        </button>
                        <button
                            onClick={downloadQR}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5"
                            style={{ background: 'rgba(255, 107, 53, 0.1)', color: '#ff6b35', fontFamily: 'Syne, sans-serif' }}
                        >
                          ⬇ Download QR
                        </button>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div
                        className="flex flex-col items-center justify-center p-6 rounded-xl"
                        style={{ background: '#f7f6ff', border: '1.5px solid #e8e6f0' }}
                    >
                      <p
                          className="text-xs font-bold uppercase tracking-widest mb-4"
                          style={{ color: '#9691b0', fontFamily: 'Syne, sans-serif' }}
                      >
                        QR Code
                      </p>
                      <div className="p-3 rounded-xl bg-white shadow-sm">
                        <img src={result.qrCode} alt="QR Code" className="w-40 h-40" />
                      </div>
                      <p className="text-xs mt-3" style={{ color: '#9691b0' }}>Scan to visit the link</p>
                    </div>
                  </div>

                  {/* Analytics panel */}
                  {showAnalytics && analytics && (
                      <div className="mt-6 pt-6" style={{ borderTop: '1px solid #e8e6f0' }}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-black text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                            📊 Analytics
                          </h3>
                          <button
                              onClick={() => setShowAnalytics(false)}
                              className="text-xs"
                              style={{ color: '#9691b0' }}
                          >
                            Close ×
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(108, 71, 255, 0.08)' }}>
                            <div className="text-2xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#6c47ff' }}>
                              {analytics.totalClicks || 0}
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#9691b0' }}>Total Clicks</div>
                          </div>
                          <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(0, 200, 150, 0.08)' }}>
                            <div className="text-2xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#00c896' }}>
                              {analytics.clicksByDay ? Object.keys(analytics.clicksByDay).length : 0}
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#9691b0' }}>Active Days</div>
                          </div>
                          <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255, 107, 53, 0.08)' }}>
                            <div className="text-2xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#ff6b35' }}>
                              {analytics.browserStats ? Object.keys(analytics.browserStats).length : 0}
                            </div>
                            <div className="text-xs mt-1" style={{ color: '#9691b0' }}>Browsers</div>
                          </div>
                        </div>

                        {analytics.browserStats && Object.keys(analytics.browserStats).length > 0 && (
                            <div className="mt-4 space-y-2">
                              {Object.entries(analytics.browserStats).map(([browser, count]: [string, any]) => (
                                  <div key={browser} className="flex items-center gap-3">
                                    <span className="text-sm w-20 shrink-0" style={{ color: '#6b6880' }}>{browser}</span>
                                    <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: '#e8e6f0' }}>
                                      <div
                                          className="h-full rounded-full flex items-center justify-end px-2 progress-fill"
                                          style={{ width: `${(count / analytics.totalClicks) * 100}%`, background: 'linear-gradient(90deg, #6c47ff, #8b6dff)' }}
                                      >
                                        <span className="text-white text-xs font-bold">{count}</span>
                                      </div>
                                    </div>
                                    <span className="text-xs w-10 text-right shrink-0" style={{ color: '#9691b0' }}>
                            {Math.round((count / analytics.totalClicks) * 100)}%
                          </span>
                                  </div>
                              ))}
                            </div>
                        )}
                      </div>
                  )}
                </div>
              </div>
            </section>
        )}

        {/* Features Section */}
        <section id="features" className="px-4 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
            <span className="tag" style={{ background: 'rgba(255, 107, 53, 0.1)', color: '#ff6b35' }}>
              Why Shortly
            </span>
              <h2
                  className="text-4xl font-black mt-4"
                  style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.02em' }}
              >
                Everything you need,<br />nothing you don't
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '⚡', title: 'Instant Shortening', desc: 'Create short links in milliseconds. Auto-generated or pick your own custom alias.', color: '#6c47ff', bg: 'rgba(108, 71, 255, 0.08)' },
                { icon: '📱', title: 'QR Code Generator', desc: 'Every link automatically gets a high-quality QR code, ready to download and share.', color: '#ff6b35', bg: 'rgba(255, 107, 53, 0.08)' },
                { icon: '📊', title: 'Click Analytics', desc: 'Track every click in real-time. See browsers, active days, and click history.', color: '#00c896', bg: 'rgba(0, 200, 150, 0.08)' },
                { icon: '🎯', title: 'Custom Aliases', desc: 'Make your links memorable with custom short codes that match your brand.', color: '#6c47ff', bg: 'rgba(108, 71, 255, 0.08)' },
                { icon: '🔐', title: 'Secure & Reliable', desc: 'Your links are stored safely in Firebase and always available when you need them.', color: '#ff6b35', bg: 'rgba(255, 107, 53, 0.08)' },
                { icon: '📋', title: 'Link Dashboard', desc: 'Manage all your links in one place. View, copy, analyze and delete with ease.', color: '#00c896', bg: 'rgba(0, 200, 150, 0.08)' },
              ].map((feature) => (
                  <div key={feature.title} className="glass-card rounded-2xl p-6 url-card">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                        style={{ background: feature.bg }}
                    >
                      {feature.icon}
                    </div>
                    <h3
                        className="font-black text-base mb-2"
                        style={{ fontFamily: 'Syne, sans-serif', color: '#0f0e1a' }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#6b6880' }}>
                      {feature.desc}
                    </p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
            <section className="px-4 pb-20">
              <div className="max-w-3xl mx-auto">
                <div
                    className="rounded-3xl p-10 text-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #6c47ff 0%, #4f2ee8 100%)' }}
                >
                  <div
                      className="absolute inset-0"
                      style={{ background: 'radial-gradient(circle at 70% 50%, rgba(255,107,53,0.3) 0%, transparent 60%)' }}
                  />
                  <div className="relative z-10">
                    <h2
                        className="text-3xl font-black text-white mb-3"
                        style={{ fontFamily: 'Syne, sans-serif' }}
                    >
                      Start tracking your links today
                    </h2>
                    <p className="text-white/70 mb-8 text-base">
                      Create a free account and never lose track of your links again.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <Link
                          href="/register"
                          className="px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:-translate-y-1 hover:shadow-xl"
                          style={{ background: 'white', color: '#6c47ff', fontFamily: 'Syne, sans-serif' }}
                      >
                        Sign up free →
                      </Link>
                      <Link
                          href="/login"
                          className="px-8 py-3.5 rounded-xl font-bold text-base transition-all"
                          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', fontFamily: 'Syne, sans-serif' }}
                      >
                        Login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
        )}
      </>
  );
}