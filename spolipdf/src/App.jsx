import { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import SongQueue from './components/SongQueue';
import LyricsViewer from './components/LyricsViewer';
import BatchDownload from './components/BatchDownload';
import Settings from './components/Settings';
import Footer from './components/Footer';
import Toast from './components/Toast';
import {
  searchSongs,
  getSpotifyTrackInfo,
  parseSpotifyUrl,
  getYouTubeTrackInfo,
  detectLinkType,
} from './utils/lyricsApi';
import { DEFAULT_PDF_SETTINGS } from './utils/exporters';

function App() {
  const [results, setResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState(null);
  const [pdfSettings, setPdfSettings] = useState(DEFAULT_PDF_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const searchRef = useRef(null);

  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleSearch = useCallback(async (query) => {
    setIsSearching(true);
    try {
      const data = await searchSongs(query);
      setResults(data);
      if (data.length === 0) {
        showToast('No songs found. Try a different search term.', 'info');
      }
    } catch (err) {
      showToast('Search failed. Please try again.', 'error');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, [showToast]);

  const handleLinkParse = useCallback(async (url) => {
    setIsSearching(true);
    try {
      const linkType = detectLinkType(url);

      if (linkType === 'spotify') {
        const parsed = parseSpotifyUrl(url);
        if (!parsed) {
          showToast('Invalid Spotify URL. Please paste a valid track link.', 'error');
          setIsSearching(false);
          return;
        }
        const info = await getSpotifyTrackInfo(url);
        if (info && info.title) {
          const data = await searchSongs(info.title);
          setResults(data);
          if (data.length === 0) {
            showToast('No lyrics found for this track.', 'info');
          } else {
            showToast(`Found results for "${info.title}"`, 'success');
          }
        } else {
          showToast('Could not extract track info from Spotify URL.', 'error');
        }
      } else if (linkType === 'youtube') {
        const info = await getYouTubeTrackInfo(url);
        if (info && (info.title || info.rawTitle)) {
          let data = [];

          // Strategy 1: extracted artist + song title
          if (info.extractedArtist && info.title) {
            data = await searchSongs(`${info.extractedArtist} ${info.title}`);
          }

          // Strategy 2: full cleaned title (e.g. "Artist - Song")
          if (data.length === 0 && info.rawTitle) {
            data = await searchSongs(info.rawTitle);
          }

          // Strategy 3: channel name + song title
          if (data.length === 0 && info.author && info.title) {
            data = await searchSongs(`${info.author} ${info.title}`);
          }

          // Strategy 4: just the song part
          if (data.length === 0 && info.title && info.title !== info.rawTitle) {
            data = await searchSongs(info.title);
          }

          setResults(data);
          if (data.length === 0) {
            showToast('No lyrics found for this video.', 'info');
          } else {
            showToast(`Found results for "${info.title}"`, 'success');
          }
        } else {
          showToast('Could not extract info from YouTube URL.', 'error');
        }
      } else {
        showToast('Unsupported link. Paste a Spotify or YouTube URL.', 'error');
      }
    } catch (err) {
      showToast('Failed to parse link.', 'error');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }, [showToast]);

  const handleAddToQueue = useCallback((song) => {
    setQueue((prev) => {
      if (prev.some((s) => s.id === song.id)) return prev;
      return [...prev, song];
    });
    showToast(`Added "${song.title}" to queue`, 'success');
  }, [showToast]);

  const handleRemoveFromQueue = useCallback((id) => {
    setQueue((prev) => prev.filter((s) => s.id !== id));
    if (selectedSong?.id === id) setSelectedSong(null);
  }, [selectedSong]);

  const scrollToSearch = useCallback(() => {
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        songCount={queue.length}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1">
        <Hero onScrollToSearch={scrollToSearch} />

        {/* Search Section */}
        <section
          ref={searchRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          id="search"
        >
          <SearchBar
            onSearch={handleSearch}
            onLinkParse={handleLinkParse}
            isLoading={isSearching}
          />

          <SearchResults
            results={results}
            queue={queue}
            onAddToQueue={handleAddToQueue}
            isLoading={isSearching}
          />

          <SongQueue
            queue={queue}
            onRemove={handleRemoveFromQueue}
            onSelect={setSelectedSong}
            selectedId={selectedSong?.id}
          />

          <BatchDownload queue={queue} pdfSettings={pdfSettings} />
        </section>
      </main>

      <Footer />

      {/* Lyrics Modal */}
      {selectedSong && (
        <LyricsViewer
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
          pdfSettings={pdfSettings}
        />
      )}

      {/* Settings Modal */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={pdfSettings}
        onUpdate={setPdfSettings}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
