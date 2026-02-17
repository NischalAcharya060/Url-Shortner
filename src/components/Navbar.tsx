'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50" style={{ background: 'rgba(247, 246, 255, 0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(232, 230, 240, 0.8)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/public" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #6c47ff, #4f2ee8)' }}>
                            🔗
                        </div>
                        <span className="font-display font-800 text-lg" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
              short<span style={{ color: '#6c47ff' }}>ly</span>
            </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/public" className="text-sm font-medium transition-colors hover:text-indigo-600" style={{ color: '#6b6880' }}>
                            Home
                        </Link>
                        {user && (
                            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-indigo-600" style={{ color: '#6b6880' }}>
                                Dashboard
                            </Link>
                        )}
                        <Link href="#features" className="text-sm font-medium transition-colors hover:text-indigo-600" style={{ color: '#6b6880' }}>
                            Features
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {loading ? (
                            <div className="w-20 h-8 rounded-lg animate-pulse" style={{ background: '#e8e6f0' }} />
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(108, 71, 255, 0.08)' }}>
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #6c47ff, #ff6b35)' }}>
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: '#6c47ff', fontFamily: 'Syne, sans-serif' }}>
                    {user.email?.split('@')[0]}
                  </span>
                                </div>
                                <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 btn-brand" style={{ fontFamily: 'Syne, sans-serif' }}>
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-50"
                                    style={{ color: '#ef4444', border: '1.5px solid #fecaca' }}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                                    style={{ color: '#6c47ff', border: '1.5px solid rgba(108, 71, 255, 0.3)', fontFamily: 'Syne, sans-serif' }}
                                >
                                    Login
                                </Link>
                                <Link href="/register" className="px-4 py-2 rounded-lg text-sm font-semibold btn-brand" style={{ fontFamily: 'Syne, sans-serif' }}>
                                    Sign up free →
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg"
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{ color: '#6b6880' }}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden py-4 border-t space-y-2" style={{ borderColor: '#e8e6f0' }}>
                        <Link href="/public" className="block px-3 py-2 rounded-lg text-sm font-medium" style={{ color: '#6b6880' }} onClick={() => setMenuOpen(false)}>
                            Home
                        </Link>
                        {user && (
                            <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-sm font-medium" style={{ color: '#6b6880' }} onClick={() => setMenuOpen(false)}>
                                Dashboard
                            </Link>
                        )}
                        {user ? (
                            <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium" style={{ color: '#ef4444' }}>
                                Logout
                            </button>
                        ) : (
                            <div className="flex gap-2 pt-2">
                                <Link href="/login" className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold" style={{ color: '#6c47ff', border: '1.5px solid rgba(108,71,255,0.3)' }} onClick={() => setMenuOpen(false)}>
                                    Login
                                </Link>
                                <Link href="/register" className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold btn-brand" onClick={() => setMenuOpen(false)}>
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}