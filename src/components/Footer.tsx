import Link from 'next/link';

export default function Footer() {
    return (
        <footer style={{ background: '#0f0e1a', color: '#9691b0' }} className="mt-24">
            <div className="footer-line" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                <div className="grid md:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/public" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #6c47ff, #4f2ee8)' }}>
                                🔗
                            </div>
                            <span className="font-display text-xl text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
                short<span style={{ color: '#8b6dff' }}>ly</span>
              </span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs" style={{ color: '#6b6880' }}>
                            The fastest way to shorten URLs, generate QR codes, and track your links with powerful analytics.
                        </p>
                        <div className="flex items-center gap-2 mt-6">
                            <div className="w-2 h-2 rounded-full pulse-dot" style={{ background: '#00c896' }} />
                            <span className="text-xs" style={{ color: '#00c896', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                All systems operational
              </span>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#6c47ff', fontFamily: 'Syne, sans-serif' }}>
                            Product
                        </p>
                        <ul className="space-y-3">
                            {[
                                { label: 'Home', href: '/' },
                                { label: 'Dashboard', href: '/dashboard' },
                                { label: 'Register', href: '/register' },
                                { label: 'Login', href: '/login' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm transition-colors hover:text-white"
                                        style={{ color: '#6b6880' }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Features */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#ff6b35', fontFamily: 'Syne, sans-serif' }}>
                            Features
                        </p>
                        <ul className="space-y-3">
                            {[
                                'URL Shortening',
                                'QR Code Generator',
                                'Click Analytics',
                                'Custom Short Codes',
                                'Link Management',
                            ].map((feature) => (
                                <li key={feature} className="text-sm" style={{ color: '#6b6880' }}>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs" style={{ color: '#4a4660' }}>
                        © {new Date().getFullYear()} Shortly. Built with Next.js & ❤️
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs" style={{ color: '#4a4660' }}>Privacy Policy</span>
                        <span className="text-xs" style={{ color: '#4a4660' }}>Terms of Service</span>
                        <span className="text-xs" style={{ color: '#4a4660' }}>Contact</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}