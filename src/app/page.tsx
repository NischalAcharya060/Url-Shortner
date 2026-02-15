'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ShortenedUrl {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  qrCode: string;
  createdAt: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ShortenedUrl | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customCode: customCode || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      setResult(data);
      setUrl('');
      setCustomCode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🔗 URL Shortener
            </h1>
            <p className="text-lg text-gray-600">
              Create short links, generate QR codes, and track your clicks
            </p>
          </div>

          {/* Error from redirect */}
          {searchParams.get('error') === 'notfound' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                ⚠️ Short URL not found. Please check the link and try again.
              </div>
          )}

          {/* Main Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your long URL
                </label>
                <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/very/long/url"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    required
                />
              </div>

              <div>
                <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom short code (optional)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">/</span>
                  <input
                      type="text"
                      id="customCode"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                      placeholder="my-custom-link"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      pattern="[a-zA-Z0-9-_]+"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Leave empty for auto-generated code</p>
              </div>

              {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
              )}

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 transform hover:scale-[1.02]"
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </form>
          </div>

          {/* Result */}
          {result && (
              <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">✅ Your Short URL is Ready!</h2>
                  <div className="inline-flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-lg">
                    <a
                        href={result.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-mono text-indigo-600 hover:underline"
                    >
                      {result.shortUrl}
                    </a>
                    <button
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                    >
                      {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* QR Code */}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-3">QR Code</h3>
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                      <img src={result.qrCode} alt="QR Code" className="w-48 h-48" />
                    </div>
                    <button
                        onClick={downloadQR}
                        className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                    >
                      Download QR Code
                    </button>
                  </div>

                  {/* Info */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Original URL</h3>
                      <p className="text-sm text-gray-600 break-all bg-gray-50 p-3 rounded-lg">
                        {result.originalUrl}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Short Code</h3>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg font-mono">
                        {result.shortCode}
                      </p>
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      📊 View Analytics
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* Analytics */}
          {showAnalytics && analytics && (
              <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Analytics Dashboard</h2>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-indigo-50 p-6 rounded-lg text-center">
                    <div className="text-4xl font-bold text-indigo-600">{analytics.totalClicks || 0}</div>
                    <div className="text-gray-600 mt-2">Total Clicks</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <div className="text-4xl font-bold text-green-600">
                      {analytics.clicksByDay ? Object.keys(analytics.clicksByDay).length : 0}
                    </div>
                    <div className="text-gray-600 mt-2">Active Days</div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg text-center">
                    <div className="text-4xl font-bold text-purple-600">
                      {analytics.browserStats ? Object.keys(analytics.browserStats).length : 0}
                    </div>
                    <div className="text-gray-600 mt-2">Different Browsers</div>
                  </div>
                </div>

                {/* Browser Stats */}
                {analytics.browserStats && Object.keys(analytics.browserStats).length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-semibold text-gray-900 mb-4">Browser Distribution</h3>
                      <div className="space-y-3">
                        {Object.entries(analytics.browserStats).map(([browser, count]: [string, any]) => (
                            <div key={browser} className="flex items-center gap-3">
                              <div className="w-24 text-sm text-gray-600">{browser}</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                <div
                                    className="bg-indigo-600 h-full flex items-center justify-end px-2 text-white text-xs font-medium"
                                    style={{ width: `${(count / analytics.totalClicks) * 100}%` }}
                                >
                                  {count}
                                </div>
                              </div>
                              <div className="w-16 text-sm text-gray-600 text-right">
                                {Math.round((count / analytics.totalClicks) * 100)}%
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                {/* Recent Clicks */}
                {analytics.recentClicks && analytics.recentClicks.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Recent Clicks</h3>
                      <div className="space-y-2">
                        {analytics.recentClicks.map((click: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-4 text-sm p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">
                        {new Date(click.timestamp).toLocaleString()}
                      </span>
                              {click.userAgent && (
                                  <span className="text-gray-500 text-xs truncate flex-1">
                          {click.userAgent}
                        </span>
                              )}
                            </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>
          )}

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Instant Shortening</h3>
              <p className="text-gray-600 text-sm">Create short links in seconds with auto-generated or custom codes</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">QR Code Generation</h3>
              <p className="text-gray-600 text-sm">Automatically generate QR codes for easy mobile sharing</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Click Analytics</h3>
              <p className="text-gray-600 text-sm">Track clicks, browsers, and get detailed insights</p>
            </div>
          </div>
        </div>
      </main>
  );
}
