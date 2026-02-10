import { useState } from 'react';
import {
  X,
  Music2,
  Clock,
  Mic2,
  Download,
  FileText,
  FileDown,
  Subtitles,
  Copy,
  Check,
} from 'lucide-react';
import { formatDuration } from '../utils/lyricsApi';
import {
  downloadAsLRC,
  downloadAsTXT,
  downloadAsPDF,
  downloadAsSRT,
} from '../utils/exporters';

export default function LyricsViewer({ song, onClose }) {
  const [showSynced, setShowSynced] = useState(!!song.syncedLyrics);
  const [copied, setCopied] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  if (!song) return null;

  const lyrics = showSynced
    ? song.syncedLyrics
    : song.plainLyrics || stripTimestamps(song.syncedLyrics);

  const handleCopy = async () => {
    const text = song.plainLyrics || stripTimestamps(song.syncedLyrics);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (format) => {
    setDownloadingFormat(format);
    try {
      switch (format) {
        case 'lrc':
          downloadAsLRC(song);
          break;
        case 'txt':
          downloadAsTXT(song);
          break;
        case 'pdf':
          downloadAsPDF(song);
          break;
        case 'srt':
          downloadAsSRT(song);
          break;
      }
    } catch (err) {
      console.error('Download failed:', err);
    }
    setTimeout(() => setDownloadingFormat(null), 1000);
  };

  const downloadFormats = [
    {
      id: 'lrc',
      label: 'LRC',
      desc: 'Synced lyrics',
      icon: Mic2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10 hover:bg-emerald-400/20 border-emerald-400/20',
    },
    {
      id: 'pdf',
      label: 'PDF',
      desc: 'Formatted document',
      icon: FileDown,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10 hover:bg-red-400/20 border-red-400/20',
    },
    {
      id: 'txt',
      label: 'TXT',
      desc: 'Plain text',
      icon: FileText,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10 hover:bg-blue-400/20 border-blue-400/20',
    },
    {
      id: 'srt',
      label: 'SRT',
      desc: 'Subtitles',
      icon: Subtitles,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10 hover:bg-purple-400/20 border-purple-400/20',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] glass rounded-3xl overflow-hidden animate-fade-in-up border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-spotify/20 to-accent/20 flex items-center justify-center shrink-0">
                <Music2 className="w-7 h-7 text-spotify" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{song.title}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{song.artist}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  {song.album && (
                    <span className="text-xs text-gray-500">{song.album}</span>
                  )}
                  {song.duration > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDuration(song.duration)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs + Copy */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              {song.plainLyrics && (
                <button
                  onClick={() => setShowSynced(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    !showSynced
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Plain
                </button>
              )}
              {song.syncedLyrics && (
                <button
                  onClick={() => setShowSynced(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    showSynced
                      ? 'bg-spotify/20 text-spotify'
                      : 'text-gray-500 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Mic2 className="w-3 h-3" />
                    Synced
                  </span>
                </button>
              )}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-spotify" />
                  <span className="text-spotify">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lyrics body */}
        <div className="p-6 max-h-80 overflow-y-auto">
          {lyrics ? (
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-7">
              {lyrics}
            </pre>
          ) : (
            <p className="text-center text-gray-500 py-10">
              No lyrics available for this track.
            </p>
          )}
        </div>

        {/* Download bar */}
        <div className="p-5 border-t border-white/5 bg-white/1">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">
              Download As
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {downloadFormats.map((fmt) => {
              const Icon = fmt.icon;
              return (
                <button
                  key={fmt.id}
                  onClick={() => handleDownload(fmt.id)}
                  disabled={downloadingFormat === fmt.id}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${fmt.bgColor} ${fmt.color}`}
                >
                  {downloadingFormat === fmt.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  {fmt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function stripTimestamps(lrc) {
  if (!lrc) return '';
  return lrc.replace(/\[\d+:\d+\.?\d*\]\s*/g, '');
}
