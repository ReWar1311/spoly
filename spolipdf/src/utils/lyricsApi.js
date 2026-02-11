const LRCLIB_BASE = 'https://lrclib.net/api';

// ── Language Detection ──

const SCRIPT_RANGES = [
  { pattern: /[\u0900-\u097F]/, code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { pattern: /[\u0980-\u09FF]/, code: 'bn', name: 'Bengali', flag: '🇧🇩' },
  { pattern: /[\u0A00-\u0A7F]/, code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { pattern: /[\u0B80-\u0BFF]/, code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { pattern: /[\u0C00-\u0C7F]/, code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { pattern: /[\u0C80-\u0CFF]/, code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { pattern: /[\u0D00-\u0D7F]/, code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { pattern: /[\u4E00-\u9FFF\u3400-\u4DBF]/, code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { pattern: /[\u3040-\u309F\u30A0-\u30FF]/, code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { pattern: /[\uAC00-\uD7AF\u1100-\u11FF]/, code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { pattern: /[\u0600-\u06FF\u0750-\u077F]/, code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { pattern: /[\u0E00-\u0E7F]/, code: 'th', name: 'Thai', flag: '🇹🇭' },
  { pattern: /[\u0400-\u04FF]/, code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { pattern: /[\u1000-\u109F]/, code: 'my', name: 'Burmese', flag: '🇲🇲' },
  { pattern: /[àâçéèêëïîôùûüÿœæ]/i, code: 'fr', name: 'French', flag: '🇫🇷' },
  { pattern: /[äöüß]/i, code: 'de', name: 'German', flag: '🇩🇪' },
  { pattern: /[ñ¿¡áéíóú]/i, code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { pattern: /[ãõâêç]/i, code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
];

/**
 * Detect language from lyrics text
 */
export function detectLanguage(text) {
  if (!text) return { code: 'en', name: 'English', flag: '🇬🇧' };
  // Strip LRC timestamps if present
  const clean = text.replace(/\[\d+:\d+\.?\d*\]\s*/g, '');
  for (const range of SCRIPT_RANGES) {
    if (range.pattern.test(clean)) return { code: range.code, name: range.name, flag: range.flag };
  }
  return { code: 'en', name: 'English', flag: '🇬🇧' };
}

// ── Thumbnail / Cover Art via iTunes ──

const iTunesCache = new Map();

/**
 * Fetch album art thumbnail from iTunes Search API
 */
export async function fetchThumbnail(artist, title) {
  const key = `${artist}-${title}`.toLowerCase();
  if (iTunesCache.has(key)) return iTunesCache.get(key);

  try {
    const query = `${artist} ${title}`.replace(/[^\w\s]/g, ' ').trim();
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=1&entity=song&media=music`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      // Get higher res version (300x300 instead of default 100x100)
      const url = data.results[0].artworkUrl100?.replace('100x100', '300x300') || null;
      iTunesCache.set(key, url);
      return url;
    }
  } catch {
    // silently fail
  }
  iTunesCache.set(key, null);
  return null;
}

/**
 * Search for songs by query string
 */
export async function searchSongs(query) {
  if (!query.trim()) return [];
  
  const res = await fetch(`${LRCLIB_BASE}/search?q=${encodeURIComponent(query)}`, {
    headers: { 'User-Agent': 'SpoLy v1.0.0' },
  });
  
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  
  const data = await res.json();
  const songs = data.map(item => ({
    id: item.id,
    title: item.trackName,
    artist: item.artistName,
    album: item.albumName || 'Unknown Album',
    duration: item.duration,
    plainLyrics: item.plainLyrics || null,
    syncedLyrics: item.syncedLyrics || null,
    hasLyrics: !!(item.plainLyrics || item.syncedLyrics),
    language: detectLanguage(item.plainLyrics || item.syncedLyrics),
    thumbnail: null, // filled async below
  }));

  // Fetch thumbnails in background (don't block results)
  enrichThumbnails(songs);

  return songs;
}

/**
 * Asynchronously fill in thumbnails for a list of songs.
 * We mutate in-place — React will see the update on next render triggered by the caller.
 */
async function enrichThumbnails(songs) {
  // Fetch first 9 in parallel (avoid flooding)
  const batch = songs.slice(0, 9);
  await Promise.allSettled(
    batch.map(async (song) => {
      song.thumbnail = await fetchThumbnail(song.artist, song.title);
    })
  );
}

/**
 * Get lyrics for a specific track
 */
export async function getLyrics(artistName, trackName) {
  const res = await fetch(
    `${LRCLIB_BASE}/get?artist_name=${encodeURIComponent(artistName)}&track_name=${encodeURIComponent(trackName)}`,
    { headers: { 'User-Agent': 'SpoLy v1.0.0' } }
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
    language: detectLanguage(data.plainLyrics || data.syncedLyrics),
    thumbnail: null,
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
    
    return {
      title: data.title,
      thumbnailUrl: data.thumbnail_url,
      providerName: data.provider_name,
    };
  } catch {
    return null;
  }
}

// ── YouTube Support ──

/**
 * Parse a YouTube URL and return the video ID
 */
export function parseYouTubeUrl(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Get video info via noembed.com (CORS-safe oEmbed proxy)
 */
export async function getYouTubeTrackInfo(url) {
  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('Failed to get YouTube info');
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const rawTitle = data.title || '';
    const channelName = data.author_name || '';

    // Clean common YouTube-specific suffixes
    let title = rawTitle
      .replace(/\s*\(official\s*(music\s*)?video\)/gi, '')
      .replace(/\s*\[official\s*(music\s*)?video\]/gi, '')
      .replace(/\s*\(official\s*audio\)/gi, '')
      .replace(/\s*\[official\s*audio\]/gi, '')
      .replace(/\s*\(official\s*lyric[s]?\s*video\)/gi, '')
      .replace(/\s*\[official\s*lyric[s]?\s*video\]/gi, '')
      .replace(/\s*\(lyric[s]?\s*(video)?\)/gi, '')
      .replace(/\s*\[lyric[s]?\s*(video)?\]/gi, '')
      .replace(/\s*\(visuali[sz]er\)/gi, '')
      .replace(/\s*\[visuali[sz]er\]/gi, '')
      .replace(/\s*\(audio\)/gi, '')
      .replace(/\s*\[audio\]/gi, '')
      .replace(/\s*\(video\)/gi, '')
      .replace(/\s*\[video\]/gi, '')
      .replace(/\s*\(hd\)/gi, '')
      .replace(/\s*\[hd\]/gi, '')
      .replace(/\s*\|\s*.*$/, '')
      .replace(/\s*\/\/\s*.*$/, '')
      .trim();

    // Try to extract artist and song from "Artist - Song" format
    let extractedArtist = null;
    let songTitle = title;

    const dashMatch = title.match(/^(.+?)\s*[-\u2013\u2014]\s+(.+)$/);
    if (dashMatch) {
      extractedArtist = dashMatch[1].trim();
      songTitle = dashMatch[2]
        .replace(/\s*\(?\s*feat\.?\s+[^)]*\)?\s*/gi, '')
        .replace(/\s*\(?\s*ft\.?\s+[^)]*\)?\s*/gi, '')
        .trim();
    }

    // Clean channel name (remove VEVO, Topic, etc.)
    const cleanChannel = channelName
      .replace(/VEVO$/i, '')
      .replace(/\s*-\s*Topic$/i, '')
      .trim();

    const videoId = parseYouTubeUrl(url);
    const thumbnailUrl = videoId
      ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      : data.thumbnail_url;

    return {
      title: songTitle,
      rawTitle: title,
      extractedArtist: extractedArtist || cleanChannel || null,
      author: cleanChannel,
      thumbnailUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Detect if a URL is Spotify, YouTube, or neither
 */
export function detectLinkType(url) {
  if (/spotify\.com|spotify:/i.test(url)) return 'spotify';
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube';
  return null;
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
