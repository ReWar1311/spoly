import { useState, useRef } from 'react';
import { Search, Loader2, X, Link as LinkIcon } from 'lucide-react';

export default function SearchBar({ onSearch, onSpotifyParse, isLoading }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('search'); // 'search' | 'spotify'
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    if (mode === 'spotify') {
      onSpotifyParse(query.trim());
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
          onClick={() => setMode('spotify')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            mode === 'spotify'
              ? 'bg-spotify/20 text-spotify border border-spotify/30'
              : 'text-gray-400 hover:text-white glass glass-hover'
          }`}
        >
          <span className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            Spotify Link
          </span>
        </button>
      </div>

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
                : 'Paste a Spotify track URL (e.g. https://open.spotify.com/track/...)'
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
          : 'Extracts track info from Spotify links, then searches lyrics'}
      </p>
    </div>
  );
}
