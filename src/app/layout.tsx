import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Overwrites the theme's sans font
});

export const metadata: Metadata = {
  title: 'InstaSnap | Premium Instagram Video & Reel Downloader',
  description: 'Download Instagram reels, videos, and photos in high-quality MP4 format. Fast, free, secure, and mobile-friendly with no registration required.',
  keywords: ['instagram downloader', 'instagram video downloader', 'download instagram reels', 'ig video download', 'reels downloader', 'instasnap'],
  authors: [{ name: 'InstaSnap Team' }],
  openGraph: {
    title: 'InstaSnap | Premium Instagram Video & Reel Downloader',
    description: 'Download Instagram reels, videos, and photos in high-quality MP4 format.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col justify-between text-zinc-100 selection:bg-rose-500 selection:text-white">
        
        {/* Decorative Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-20%] w-[60%] aspect-square rounded-full bg-purple-600/10 blur-[120px] animate-pulse-slow"></div>
          <div className="absolute top-[20%] right-[-10%] w-[50%] aspect-square rounded-full bg-rose-600/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '-4s' }}></div>
        </div>

        {/* Header/Navbar */}
        <header className="sticky top-0 z-50 w-full glass-panel border-x-0 border-t-0 border-b border-zinc-800/60 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" id="nav-logo-link" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-instagram flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform duration-200">
                IS
              </span>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-instagram bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                InstaSnap
              </span>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link 
                href="/" 
                id="nav-home-link"
                className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors duration-200"
              >
                Downloader
              </Link>
              <Link 
                href="/admin/dashboard" 
                id="nav-admin-link"
                className="px-4 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white transition-all duration-200"
              >
                Admin Control
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 z-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-zinc-900 bg-zinc-950/80 py-8 z-10">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <p className="text-sm font-bold text-zinc-400">InstaSnap Downloader</p>
              <p className="text-xs text-zinc-500 mt-1">High-speed Instagram media processing. For personal archives only.</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-zinc-400">
              <p>InstaSnap &copy; 2026. Made with ❤️ for the open web.</p>
              <div className="flex gap-4">
                <Link href="/" className="hover:text-zinc-200">Terms</Link>
                <Link href="/" className="hover:text-zinc-200">Privacy</Link>
                <Link href="/admin/dashboard" className="hover:text-zinc-200 font-semibold text-rose-400 hover:text-rose-300">Admin Login</Link>
              </div>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
