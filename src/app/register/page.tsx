'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
    const { register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const getPasswordStrength = (pass: string) => {
        if (pass.length === 0) return null;
        if (pass.length < 6) return { label: 'Too short', color: '#ef4444', width: '25%' };
        if (pass.length < 8) return { label: 'Weak', color: '#f97316', width: '50%' };
        if (pass.length < 12 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) return { label: 'Fair', color: '#eab308', width: '75%' };
        return { label: 'Strong', color: '#00c896', width: '100%' };
    };

    const strength = getPasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            await register(email, password);
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email is already registered. Try logging in instead.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password is too weak. Use at least 6 characters.');
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
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #ff6b35, #e85520)', boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)' }}>
                            ✨
                        </div>
                        <h1 className="text-2xl font-black" style={{ fontFamily: 'Syne, sans-serif', color: '#0f0e1a' }}>
                            Create your account
                        </h1>
                        <p className="text-sm mt-1" style={{ color: '#9691b0' }}>
                            Free forever. No credit card required.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        {['Save links', 'Track clicks', 'QR codes'].map((benefit) => (
                            <div key={benefit} className="text-center py-2 px-1 rounded-lg text-xs font-semibold" style={{ background: 'rgba(108, 71, 255, 0.06)', color: '#6c47ff', fontFamily: 'Syne, sans-serif' }}>
                                ✓ {benefit}
                            </div>
                        ))}
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
                                    placeholder="Min. 6 characters"
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

                            {/* Password Strength */}
                            {strength && (
                                <div className="mt-2">
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#e8e6f0' }}>
                                        <div
                                            className="h-full rounded-full transition-all duration-300"
                                            style={{ width: strength.width, background: strength.color }}
                                        />
                                    </div>
                                    <p className="text-xs mt-1 font-medium" style={{ color: strength.color }}>
                                        {strength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#0f0e1a', fontFamily: 'Syne, sans-serif' }}>
                                Confirm password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your password"
                                className="input-field w-full px-4 py-3.5 rounded-xl text-sm"
                                style={{
                                    borderColor: confirmPassword && confirmPassword !== password ? '#fca5a5' : undefined,
                                }}
                                required
                            />
                            {confirmPassword && confirmPassword !== password && (
                                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>Passwords don't match</p>
                            )}
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
                  Creating account...
                </span>
                            ) : (
                                'Create account →'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px" style={{ background: '#e8e6f0' }} />
                        <span className="text-xs" style={{ color: '#9691b0' }}>or</span>
                        <div className="flex-1 h-px" style={{ background: '#e8e6f0' }} />
                    </div>

                    {/* Login link */}
                    <p className="text-center text-sm" style={{ color: '#6b6880' }}>
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold hover:underline" style={{ color: '#6c47ff', fontFamily: 'Syne, sans-serif' }}>
                            Login →
                        </Link>
                    </p>
                </div>

                {/* Back */}
                <p className="text-center mt-6 text-sm" style={{ color: '#9691b0' }}>
                    <Link href="/" className="hover:underline">← Back to home</Link>
                </p>
            </div>
        </main>
    );
}