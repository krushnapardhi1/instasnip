'use client';

import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, Loader2, Video, ExternalLink, CheckCircle } from 'lucide-react';
import { validateInstagramUrl } from '@/lib/utils';

const Instagram = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface DownloadResult {
  success: boolean;
  thumbnail: string;
  caption: string;
  downloadUrl: string;
  filename: string;
  isMock: boolean;
}

export default function DownloaderForm() {
  const [url, setUrl] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DownloadResult | null>(null);

  // Validate URL in real-time
  useEffect(() => {
    if (url.trim() === '') {
      setIsValid(null);
      return;
    }
    setIsValid(validateInstagramUrl(url.trim()));
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (!validateInstagramUrl(url.trim())) {
      setError('Please paste a valid Instagram Reel or Video URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to download video. Please verify the URL is correct and public.');
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setResult(null);
    setError(null);
    setIsValid(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      
      {/* Downloader Form Card */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-xl shadow-purple-900/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="url-input" className="block text-sm font-semibold text-zinc-300">
            Paste Instagram Reel or Video Link
          </label>
          <div className="relative flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Instagram className="h-5 w-5" />
              </div>
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/C8..."
                disabled={loading}
                className={`w-full pl-10 pr-4 py-3.5 bg-zinc-950/60 border rounded-xl text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 text-sm md:text-base ${
                  isValid === true
                    ? 'border-emerald-500/70 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
                    : isValid === false
                    ? 'border-rose-500/70 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
                    : 'border-zinc-800 focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/20'
                }`}
              />
            </div>
            <button
              id="download-submit-btn"
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3.5 rounded-xl bg-gradient-instagram text-white font-semibold text-sm md:text-base shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>

          {/* Validation Feedback */}
          {isValid === false && (
            <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              This does not look like a standard Instagram Reels or Video URL.
            </p>
          )}
          {isValid === true && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              Valid Instagram URL format. Ready to fetch!
            </p>
          )}
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-panel border-rose-500/25 bg-rose-950/10 rounded-xl p-4 flex items-start gap-3 shadow-md">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-rose-200">Unable to download video</h4>
            <p className="text-xs text-rose-300/80 leading-relaxed">{error}</p>
            <div className="pt-1 text-[10px] text-rose-400/60 font-medium">
              Tip: Ensure the post is public, and the account is not private.
            </div>
          </div>
        </div>
      )}

      {/* Skeleton Loading State */}
      {loading && (
        <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-lg shimmer-effect relative overflow-hidden">
          <div className="w-full md:w-48 aspect-video md:aspect-[3/4] bg-zinc-800/60 rounded-xl shrink-0"></div>
          <div className="flex-1 space-y-4 py-2">
            <div className="h-4 bg-zinc-800/60 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-zinc-800/50 rounded w-full"></div>
              <div className="h-3 bg-zinc-800/50 rounded w-5/6"></div>
              <div className="h-3 bg-zinc-800/50 rounded w-2/3"></div>
            </div>
            <div className="pt-4 flex gap-3">
              <div className="h-10 bg-zinc-800/80 rounded-lg w-32"></div>
              <div className="h-10 bg-zinc-800/40 rounded-lg w-24"></div>
            </div>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-xl shadow-rose-950/5 flex flex-col md:flex-row gap-6 border-zinc-700/60 animate-fadeIn">
          {/* Thumbnail preview */}
          <div className="w-full md:w-48 aspect-video md:aspect-[3/4] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shrink-0 relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.thumbnail}
              alt="Video Thumbnail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Video className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Video Metadata & CTA */}
          <div className="flex-grow flex flex-col justify-between py-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready to download
                </span>
                {result.isMock && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Mock Mode Active
                  </span>
                )}
              </div>
              
              <h3 className="text-sm font-semibold text-zinc-400">Post Description:</h3>
              <p className="text-zinc-200 text-sm leading-relaxed max-h-24 overflow-y-auto pr-2 bg-zinc-950/20 p-2.5 rounded-lg border border-zinc-900/40">
                {result.caption || 'No caption available.'}
              </p>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              {/* Force download using a direct anchor with noreferrer */}
              <a
                id="result-download-btn"
                href={result.downloadUrl}
                target="_blank"
                rel="noreferrer"
                download={result.filename}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/15 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <Download className="h-4.5 w-4.5" />
                <span>Download Video (MP4)</span>
              </a>
              
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-all duration-150"
              >
                Download Another
              </button>
            </div>
            
            <p className="text-[10px] text-zinc-500 mt-3 flex items-center gap-1">
              <span>Notice: If the video opens in a new tab, right-click (or tap & hold) and select &quot;Save Video As...&quot;</span>
            </p>
          </div>
        </div>
      )}

      {/* Quick Guide */}
      {!result && !loading && (
        <div className="max-w-md mx-auto text-center space-y-3 pt-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">How to Download</h3>
          <ol className="text-xs text-zinc-500 space-y-1.5 text-left max-w-xs mx-auto list-decimal list-inside">
            <li>Open Instagram and copy the Reel or Video URL.</li>
            <li>Paste the URL in the box above.</li>
            <li>Click the <span className="font-semibold text-zinc-400">Download</span> button.</li>
            <li>Press the green button to save the MP4 to your device.</li>
          </ol>
        </div>
      )}

    </div>
  );
}
