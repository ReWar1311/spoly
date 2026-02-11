import { useState, useRef } from 'react';
import { Search, Loader2, X, Link as LinkIcon, Youtube } from 'lucide-react';

export default function SearchBar({ onSearch, onLinkParse, isLoading }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('search'); // 'search' | 'link'
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    if (mode === 'link') {
      onLinkParse(query.trim());
    } else {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Mode toggle */}
      <div className="flex gap-2 mb-4 justify-center">
        <button
          onClick={() => setMode('search')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            mode === 'search'
              ? 'bg-spotify/20 text-spotify border border-spotify/30'
              : 'text-gray-400 hover:text-white glass glass-hover'
          }`}
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Songs
          </span>
        </button>
        <button
          onClick={() => setMode('link')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            mode === 'link'
              ? 'bg-spotify/20 text-spotify border border-spotify/30'
              : 'text-gray-400 hover:text-white glass glass-hover'
          }`}
        >
          <span className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Paste Link
          </span>
        </button>
      </div>

      {/* Platform badges when in link mode */}
      {mode === 'link' && (
        <div className="flex justify-center gap-3 mb-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-spotify/10 text-spotify border border-spotify/20">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.7 1.32.42.18.48.66.24 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-.99-.12-1.11-.6-.12-.48.12-.99.6-1.11 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.21 1.17zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-.96 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z"/></svg>
            Spotify
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <Youtube className="w-3.5 h-3.5" />
            YouTube
          </span>
        </div>
      )}

      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-500">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-spotify" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === 'search'
                ? 'Search by song name, artist, or album...'
                : 'Paste a Spotify or YouTube link...'
            }
            className="w-full pl-12 pr-24 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-base focus:outline-none focus:border-spotify/50 focus:ring-2 focus:ring-spotify/20 transition-all"
            disabled={isLoading}
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-20 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-spotify text-white font-medium text-sm hover:bg-spotify-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {mode === 'search' ? 'Search' : 'Fetch'}
          </button>
        </div>
      </form>

      <p className="text-center text-xs text-gray-600 mt-3">
        {mode === 'search'
          ? 'Powered by LRCLIB — a free, open-source lyrics database'
          : 'Supports Spotify track links and YouTube video links'}
      </p>
    </div>
  );
}
