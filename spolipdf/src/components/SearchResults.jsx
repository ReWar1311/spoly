import { Music2, Plus, Check, Clock, Mic2 } from 'lucide-react';
import { formatDuration } from '../utils/lyricsApi';

export default function SearchResults({ results, queue, onAddToQueue, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4 shimmer-loading h-32" />
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) return null;

  const queueIds = new Set(queue.map((s) => s.id));

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Search Results
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({results.length} found)
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((song, index) => {
          const inQueue = queueIds.has(song.id);
          return (
            <div
              key={song.id}
              className="group glass glass-hover rounded-2xl p-4 transition-all duration-200 animate-fade-in-up hover:scale-[1.02]"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                {/* Album art placeholder */}
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-spotify/20 to-accent/20 flex items-center justify-center shrink-0">
                  <Music2 className="w-6 h-6 text-spotify/60" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {song.title}
                  </h4>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {song.artist}
                  </p>
                  <p className="text-xs text-gray-600 truncate mt-0.5">
                    {song.album}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 mt-3">
                {song.duration > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDuration(song.duration)}
                  </span>
                )}
                {song.syncedLyrics && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400/70">
                    <Mic2 className="w-3 h-3" />
                    Synced
                  </span>
                )}
                {!song.hasLyrics && (
                  <span className="text-xs text-red-400/70">No lyrics</span>
                )}
              </div>

              {/* Add button */}
              <button
                onClick={() => !inQueue && song.hasLyrics && onAddToQueue(song)}
                disabled={inQueue || !song.hasLyrics}
                className={`mt-3 w-full py-2 rounded-xl text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  inQueue
                    ? 'bg-spotify/10 text-spotify border border-spotify/20'
                    : !song.hasLyrics
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                    : 'bg-white/5 text-white hover:bg-spotify/20 hover:text-spotify border border-transparent hover:border-spotify/30'
                }`}
              >
                {inQueue ? (
                  <>
                    <Check className="w-4 h-4" /> Added
                  </>
                ) : !song.hasLyrics ? (
                  'No lyrics available'
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add to Queue
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
