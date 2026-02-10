import { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import SongQueue from './components/SongQueue';
import LyricsViewer from './components/LyricsViewer';
import BatchDownload from './components/BatchDownload';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { searchSongs, getSpotifyTrackInfo, parseSpotifyUrl } from './utils/lyricsApi';

function App() {
  const [results, setResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [toast, setToast] = useState(null);
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

  const handleSpotifyParse = useCallback(async (url) => {
    setIsSearching(true);
    try {
      const parsed = parseSpotifyUrl(url);
      if (!parsed) {
        showToast('Invalid Spotify URL. Please paste a valid track link.', 'error');
        setIsSearching(false);
        return;
      }

      // Use oEmbed to get track info
      const info = await getSpotifyTrackInfo(url);
      if (info && info.title) {
        // Search using the track title
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
    } catch (err) {
      showToast('Failed to parse Spotify link.', 'error');
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
      <Header songCount={queue.length} />

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
            onSpotifyParse={handleSpotifyParse}
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

          <BatchDownload queue={queue} />
        </section>
      </main>

      <Footer />

      {/* Lyrics Modal */}
      {selectedSong && (
        <LyricsViewer
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
        />
      )}

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
