import { useState } from 'react';
import {
  Download,
  FileDown,
  FileText,
  Mic2,
  Subtitles,
  PackageOpen,
  Loader2,
  Check,
} from 'lucide-react';
import {
  downloadAsLRC,
  downloadAsTXT,
  downloadAsPDF,
  downloadAsSRT,
  downloadAllAsPDF,
} from '../utils/exporters';

export default function BatchDownload({ queue }) {
  const [status, setStatus] = useState(null); // null | 'downloading' | 'done'
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  if (queue.length === 0) return null;

  const songsWithLyrics = queue.filter(
    (s) => s.plainLyrics || s.syncedLyrics
  );

  if (songsWithLyrics.length === 0) return null;

  const formats = [
    { id: 'pdf', label: 'PDF', icon: FileDown, color: 'text-red-400' },
    { id: 'lrc', label: 'LRC', icon: Mic2, color: 'text-emerald-400' },
    { id: 'txt', label: 'TXT', icon: FileText, color: 'text-blue-400' },
    { id: 'srt', label: 'SRT', icon: Subtitles, color: 'text-purple-400' },
  ];

  const downloadFn = {
    pdf: downloadAsPDF,
    lrc: downloadAsLRC,
    txt: downloadAsTXT,
    srt: downloadAsSRT,
  };

  const handleBatchDownload = async () => {
    setStatus('downloading');
    try {
      if (selectedFormat === 'pdf' && songsWithLyrics.length > 1) {
        // Batch PDF: single file with all songs
        downloadAllAsPDF(songsWithLyrics);
      } else {
        // Individual files
        for (const song of songsWithLyrics) {
          try {
            downloadFn[selectedFormat](song);
            // Small delay between downloads
            await new Promise((r) => setTimeout(r, 300));
          } catch (err) {
            console.warn(`Failed to download ${song.title}:`, err);
          }
        }
      }
      setStatus('done');
      setTimeout(() => setStatus(null), 2000);
    } catch (err) {
      console.error('Batch download failed:', err);
      setStatus(null);
    }
  };

  return (
    <div className="glass rounded-2xl p-5 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <PackageOpen className="w-5 h-5 text-spotify" />
        <h3 className="text-lg font-semibold text-white">Batch Download</h3>
        <span className="text-sm text-gray-400">
          ({songsWithLyrics.length} song{songsWithLyrics.length !== 1 ? 's' : ''} with lyrics)
        </span>
      </div>

      {/* Format selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {formats.map((fmt) => {
          const Icon = fmt.icon;
          return (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
                selectedFormat === fmt.id
                  ? `${fmt.color} bg-white/10 border-current`
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {fmt.label}
            </button>
          );
        })}
      </div>

      {selectedFormat === 'pdf' && songsWithLyrics.length > 1 && (
        <p className="text-xs text-gray-500 mb-3">
          All lyrics will be combined into a single PDF document.
        </p>
      )}

      {/* Download button */}
      <button
        onClick={handleBatchDownload}
        disabled={status === 'downloading'}
        className="w-full py-3 rounded-xl bg-linear-to-r from-spotify to-emerald-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-spotify/20 disabled:opacity-70 transition-all cursor-pointer"
      >
        {status === 'downloading' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Downloading...
          </>
        ) : status === 'done' ? (
          <>
            <Check className="w-5 h-5" />
            Downloaded!
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Download All as {selectedFormat.toUpperCase()}
          </>
        )}
      </button>
    </div>
  );
}
