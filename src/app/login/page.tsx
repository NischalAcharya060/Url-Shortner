'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-fade-in-up">

                {/* Card */}
                <div className="glass-card rounded-3xl p-8 sm:p-10">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #6c47ff, #4f2ee8)', boxShadow: '0 8px 24px rgba(108, 71, 255, 0.3)' }}>
                            🔗
                        </div>
                        <h1 className="text-2xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#0f0e1a' }}>
                            Welcome back
                        </h1>
                        <p className="text-sm mt-1" style={{ color: '#9691b0' }}>
                            Login to manage your short links
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#0f0e1a', fontFamily: 'Syne, sans-serif' }}>
                                Email address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="input-field w-full px-4 py-3.5 rounded-xl text-sm"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#0f0e1a', fontFamily: 'Syne, sans-serif' }}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Your password"
                                    className="input-field w-full px-4 py-3.5 rounded-xl text-sm pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
                                    style={{ color: '#9691b0' }}
                                >
                                    {showPassword ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#dc2626' }}>
                                ❌ {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-brand w-full py-4 rounded-xl text-base mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </span>
                            ) : (
                                'Login →'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px" style={{ background: '#e8e6f0' }} />
                        <span className="text-xs" style={{ color: '#9691b0' }}>or</span>
                        <div className="flex-1 h-px" style={{ background: '#e8e6f0' }} />
                    </div>

                    {/* Register link */}
                    <p className="text-center text-sm" style={{ color: '#6b6880' }}>
                        Don't have an account?{' '}
                        <Link href="/register" className="font-bold hover:underline" style={{ color: '#6c47ff', fontFamily: 'Syne, sans-serif' }}>
                            Sign up free →
                        </Link>
                    </p>
                </div>

                {/* Back to home */}
                <p className="text-center mt-6 text-sm" style={{ color: '#9691b0' }}>
                    <Link href="/" className="hover:underline">← Back to home</Link>
                </p>
            </div>
        </main>
    );
}