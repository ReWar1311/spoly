import { Music, Github, Settings } from 'lucide-react';

export default function Header({ songCount, onOpenSettings }) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-spotify to-emerald-400 flex items-center justify-center shadow-lg shadow-spotify/20">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Spo<span className="text-spotify">Ly</span>
              </h1>
            </div>
          </div>

          {/* Status + Links */}
          <div className="flex items-center gap-4">
            {songCount > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-spotify/10 border border-spotify/20">
                <div className="w-2 h-2 rounded-full bg-spotify animate-pulse" />
                <span className="text-sm text-spotify font-medium">
                  {songCount} song{songCount !== 1 ? 's' : ''} queued
                </span>
              </div>
            )}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              title="PDF Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <a
              href="https://github.com/ReWar1311/spoly"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
