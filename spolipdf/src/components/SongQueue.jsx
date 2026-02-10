import { X, Eye, Music2, GripVertical } from 'lucide-react';
import { formatDuration } from '../utils/lyricsApi';

export default function SongQueue({ queue, onRemove, onSelect, selectedId }) {
  if (queue.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-5 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Music2 className="w-5 h-5 text-spotify" />
          Your Queue
          <span className="text-sm font-normal text-gray-400">
            ({queue.length} song{queue.length !== 1 ? 's' : ''})
          </span>
        </h3>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {queue.map((song, index) => (
          <div
            key={song.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all group cursor-pointer ${
              selectedId === song.id
                ? 'bg-spotify/10 border border-spotify/30'
                : 'hover:bg-white/5 border border-transparent'
            }`}
            onClick={() => onSelect(song)}
          >
            {/* Index */}
            <div className="w-6 text-center">
              <span className="text-xs text-gray-500 group-hover:hidden">
                {index + 1}
              </span>
              <GripVertical className="w-4 h-4 text-gray-600 hidden group-hover:block mx-auto" />
            </div>

            {/* Art */}
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-spotify/20 to-accent/20 flex items-center justify-center shrink-0">
              <Music2 className="w-5 h-5 text-spotify/60" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {song.title}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {song.artist}
                {song.duration > 0 && ` • ${formatDuration(song.duration)}`}
              </p>
            </div>

            {/* Synced badge */}
            {song.syncedLyrics && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                SYNCED
              </span>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(song);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-spotify hover:bg-spotify/10 transition-colors cursor-pointer"
                title="View lyrics"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(song.id);
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
