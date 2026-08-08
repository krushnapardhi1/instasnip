import DownloaderForm from '@/components/DownloaderForm';
import { Shield, Zap, Sparkles, Smartphone } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full py-6 md:py-12 flex flex-col items-center justify-center relative">
      
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/5 text-xs font-semibold text-rose-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Super Fast & Unlimited Downloads</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
          Download Instagram <br />
          <span className="text-gradient">Videos & Reels</span>
        </h1>
        
        <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          The easiest way to download Instagram media directly to your device in high-definition MP4 format. Ad-free, fast, and completely free.
        </p>
      </section>

      {/* Downloader Widget */}
      <section className="w-full mb-20">
        <DownloaderForm />
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="glass-panel p-5 rounded-2xl border-zinc-800/80 hover:border-zinc-700/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Instant Speed</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Fast servers process links in seconds and output direct download streams.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-zinc-800/80 hover:border-zinc-700/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition-transform">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">100% Secure</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Downloads are fetched securely. No login credentials or personal info required.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-zinc-800/80 hover:border-zinc-700/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">HD Quality</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Saves media at the highest original resolution available from Instagram.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-zinc-800/80 hover:border-zinc-700/60 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <Smartphone className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-100 mb-1">Cross Platform</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Works smoothly on mobile devices, tablets, and desktop browsers.
          </p>
        </div>

      </section>

    </div>
  );
}
