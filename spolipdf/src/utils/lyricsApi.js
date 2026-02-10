const LRCLIB_BASE = 'https://lrclib.net/api';

/**
 * Search for songs by query string
 */
export async function searchSongs(query) {
  if (!query.trim()) return [];
  
  const res = await fetch(`${LRCLIB_BASE}/search?q=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': 'SpoLyPDF v1.0.0' },
  });
  
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  
  const data = await res.json();
  return data.map(item => ({
    id: item.id,
    title: item.trackName,
    artist: item.artistName,
    album: item.albumName || 'Unknown Album',
    duration: item.duration,
    plainLyrics: item.plainLyrics || null,
    syncedLyrics: item.syncedLyrics || null,
    hasLyrics: !!(item.plainLyrics || item.syncedLyrics),
  }));
}

/**
 * Get lyrics for a specific track
 */
export async function getLyrics(artistName, trackName) {
  const res = await fetch(
    `${LRCLIB_BASE}/get?artist_name=${encodeURIComponent(artistName)}&track_name=${encodeURIComponent(trackName)}`,
    { headers: { 'User-Agent': 'SpoLyPDF v1.0.0' } }
  );
  
  if (!res.ok) {
    // Try search as fallback
    const results = await searchSongs(`${artistName} ${trackName}`);
    if (results.length > 0 && results[0].hasLyrics) {
      return results[0];
    }
    throw new Error('Lyrics not found');
  }
  
  const data = await res.json();
  return {
    id: data.id,
    title: data.trackName,
    artist: data.artistName,
    album: data.albumName || 'Unknown Album',
    duration: data.duration,
    plainLyrics: data.plainLyrics || null,
    syncedLyrics: data.syncedLyrics || null,
    hasLyrics: !!(data.plainLyrics || data.syncedLyrics),
  };
}

/**
 * Parse a Spotify URL to extract track/playlist info
 * Returns { type: 'track'|'playlist'|'album', id: string }
 */
export function parseSpotifyUrl(url) {
  const patterns = [
    /spotify\.com\/track\/([a-zA-Z0-9]+)/,
    /spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
    /spotify\.com\/album\/([a-zA-Z0-9]+)/,
    /spotify:track:([a-zA-Z0-9]+)/,
    /spotify:playlist:([a-zA-Z0-9]+)/,
    /spotify:album:([a-zA-Z0-9]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const type = url.includes('track') ? 'track' : url.includes('playlist') ? 'playlist' : 'album';
      return { type, id: match[1] };
    }
  }
  return null;
}

/**
 * Try to get track info from Spotify oEmbed (no auth needed)
 */
export async function getSpotifyTrackInfo(url) {
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('Failed to get Spotify info');
    const data = await res.json();
    
    // oEmbed returns title in format "Song Name" by "Artist"
    // The title field contains the track name
    const titleMatch = data.title;
    // The HTML contains an iframe we can parse for more info
    
    return {
      title: titleMatch,
      thumbnailUrl: data.thumbnail_url,
      providerName: data.provider_name,
    };
  } catch {
    return null;
  }
}

/**
 * Format duration from seconds to mm:ss
 */
export function formatDuration(seconds) {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
