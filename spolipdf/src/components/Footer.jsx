import { Heart, Music } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-spotify to-emerald-400 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              Spo<span className="text-spotify">Ly</span>
            </span>
          </div>

          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> by <a href="https://github.com/ReWar1311" target="_blank" rel="noopener noreferrer" className="underline">Prashant ReWar</a>
          </p>

          <p className="text-xs text-gray-600">
            Lyrics provided by lrclib.net
          </p>
        </div>
      </div>
    </footer>
  );
}
