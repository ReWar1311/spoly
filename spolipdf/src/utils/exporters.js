import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

// ── Default settings ──

export const DEFAULT_PDF_SETTINGS = {
  theme: 'light',
  lyricsType: 'auto',
  includeThumbnail: true,
  fontSize: 'medium',
  fontFamily: 'sans',
};

// ── Theme definitions ──

const THEMES = {
  dark: {
    bg: '#0f0f0f',
    accent: '#1DB954',
    title: '#ffffff',
    artist: '#1DB954',
    album: '#969696',
    lyrics: '#dcdcdc',
    divider: '#333333',
    footer: '#505050',
    accentBar: '#1DB954',
  },
  light: {
    bg: '#ffffff',
    accent: '#1DB954',
    title: '#111111',
    artist: '#1DB954',
    album: '#666666',
    lyrics: '#222222',
    divider: '#e0e0e0',
    footer: '#999999',
    accentBar: '#1DB954',
  },
  spotify: {
    bg: '#121212',
    accent: '#1DB954',
    title: '#1DB954',
    artist: '#ffffff',
    album: '#b3b3b3',
    lyrics: '#b3b3b3',
    divider: '#282828',
    footer: '#535353',
    accentBar: '#1DB954',
  },
};

const FONT_SIZES = {
  small: { title: '20px', artist: '13px', album: '10px', lyrics: '11px', lineHeight: '1.7' },
  medium: { title: '24px', artist: '15px', album: '12px', lyrics: '13px', lineHeight: '1.8' },
  large: { title: '28px', artist: '17px', album: '14px', lyrics: '15px', lineHeight: '1.9' },
};

export const FONT_FAMILIES = {
  sans: {
    label: 'Sans Serif',
    value: "'Inter', 'Noto Sans', 'Noto Sans Devanagari', 'Noto Sans SC', 'Noto Sans JP', system-ui, sans-serif",
    preview: 'Inter',
  },
  serif: {
    label: 'Serif',
    value: "'Playfair Display', 'Noto Serif', Georgia, 'Times New Roman', serif",
    preview: 'Playfair Display',
  },
  mono: {
    label: 'Monospace',
    value: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    preview: 'JetBrains Mono',
  },
  rounded: {
    label: 'Rounded',
    value: "'Nunito', 'Noto Sans', system-ui, sans-serif",
    preview: 'Nunito',
  },
  handwritten: {
    label: 'Handwritten',
    value: "'Caveat', 'Segoe Script', cursive",
    preview: 'Caveat',
  },
};

/**
 * Get the lyrics content based on settings
 */
function getLyricsContent(song, settings) {
  const type = settings?.lyricsType || 'auto';
  if (type === 'synced' && song.syncedLyrics) return song.syncedLyrics;
  if (type === 'plain') return song.plainLyrics || stripLRCTimestamps(song.syncedLyrics);
  // auto: prefer plain, fall back to stripped synced
  return song.plainLyrics || stripLRCTimestamps(song.syncedLyrics);
}

/**
 * Convert image URL to data URL (for PDF embedding)
 */
async function imageToDataUrl(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ── PDF Page Constants ──
const PAGE_W = 595;   // A4 width in CSS px
const PAGE_H = 842;   // A4 height in CSS px
const PAD_SIDE = 40;
const PAD_TOP_FIRST = 44;
const PAD_TOP_REST = 32;
const PAD_BOTTOM = 56;
const CONTENT_W = PAGE_W - PAD_SIDE * 2; // 515px

/**
 * Build HTML for a single PDF page (fixed A4 dimensions — no slicing needed)
 */
function buildPDFPageHtml(song, lyricsChunk, settings, { isFirstPage, pageNum, totalPages }) {
  const theme = THEMES[settings?.theme] || THEMES.dark;
  const fs = FONT_SIZES[settings?.fontSize] || FONT_SIZES.medium;
  const fontFamily = FONT_FAMILIES[settings?.fontFamily] || FONT_FAMILIES.sans;
  const showThumb = settings?.includeThumbnail !== false && song.thumbnail && isFirstPage;

  const metaParts = [];
  if (song.album) metaParts.push(`Album: ${escapeHtml(song.album)}`);
  if (song.language) metaParts.push(`<span style="font-weight:600;letter-spacing:0.5px;font-size:9px;text-transform:uppercase;">${song.language.name}</span>`);
  const metaLine = metaParts.join(' &nbsp;&middot;&nbsp; ');

const headerHtml = isFirstPage ? `
    <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${theme.accentBar};"></div>
    <div style="display:flex;align-items:flex-end;gap:16px;margin-bottom:10px;">
        ${showThumb ? `<img src="${song.thumbnail}" crossorigin="anonymous" style="width:72px;height:72px;border-radius:10px;object-fit:cover;flex-shrink:0;" />` : ''}
        <div style="min-width:0;flex:1;padding-bottom:2px;">
            <div style="font-size:${fs.title};font-weight:800;color:${theme.title};margin-bottom:4px;overflow-wrap:break-word;line-height:1.15;">
                ${escapeHtml(song.title)}
            </div>
            <div style="font-size:${fs.artist};color:${theme.artist};margin-bottom:3px;">${escapeHtml(song.artist)}</div>
            ${metaLine ? `<div style="font-size:${fs.album};color:${theme.album};line-height:1.3;">${metaLine}</div>` : ''}
        </div>
    </div>
    <div style="border-top:1px solid ${theme.divider};margin:8px 0 14px;"></div>
` : '';

  return `
    <div style="
      width:${PAGE_W}px;
      height:${PAGE_H}px;
      padding:${isFirstPage ? PAD_TOP_FIRST : PAD_TOP_REST}px ${PAD_SIDE}px ${PAD_BOTTOM}px;
      background:${theme.bg};
      font-family:${fontFamily.value};
      box-sizing:border-box;
      position:relative;
      overflow:hidden;
    ">
      ${headerHtml}
      <div style="font-size:${fs.lyrics};color:${theme.lyrics};line-height:${fs.lineHeight};white-space:pre-wrap;overflow-wrap:break-word;">${escapeHtml(lyricsChunk)}</div>
      <div style="position:absolute;bottom:20px;left:${PAD_SIDE}px;right:${PAD_SIDE}px;display:flex;justify-content:space-between;font-size:8px;color:${theme.footer};border-top:1px solid ${theme.divider};padding-top:0px;">
        <span>Made with ❤️ by ReWar</span>
        ${totalPages > 1 ? `<span>${pageNum} / ${totalPages}</span>` : ''}
      </div>
    </div>
  `;
}

/**
 * Measure header height using an off-screen DOM element
 */
function measureHeaderHeight(song, settings) {
  const fs = FONT_SIZES[settings?.fontSize] || FONT_SIZES.medium;
  const fontFamily = FONT_FAMILIES[settings?.fontFamily] || FONT_FAMILIES.sans;
  const showThumb = settings?.includeThumbnail !== false && song.thumbnail;

  const metaParts = [];
  if (song.album) metaParts.push(song.album);
  if (song.language) metaParts.push(`${song.language.name}`);

  const el = document.createElement('div');
  el.style.cssText = `position:fixed;left:-9999px;top:0;z-index:-1;visibility:hidden;width:${CONTENT_W}px;font-family:${fontFamily.value};`;
  el.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:16px;margin-bottom:10px;">
      ${showThumb ? '<div style="width:72px;height:72px;flex-shrink:0;"></div>' : ''}
      <div style="min-width:0;flex:1;padding-bottom:2px;">
        <div style="font-size:${fs.title};font-weight:800;margin-bottom:4px;line-height:1.15;">${escapeHtml(song.title)}</div>
        <div style="font-size:${fs.artist};margin-bottom:3px;">${escapeHtml(song.artist)}</div>
        ${metaParts.length ? `<div style="font-size:${fs.album};line-height:1.3;">${metaParts.join(' &middot; ')}</div>` : ''}
      </div>
    </div>
    <div style="border-top:1px solid #333;margin:8px 0 14px;"></div>
  `;
  document.body.appendChild(el);
  const h = el.offsetHeight;
  document.body.removeChild(el);
  return h;
}

/**
 * Split lyrics into page-sized chunks using actual DOM measurement.
 * Each chunk will fit on its page without clipping text.
 */
function splitLyricsIntoPages(lyrics, settings, firstPageMaxH, otherPageMaxH) {
  const fs = FONT_SIZES[settings?.fontSize] || FONT_SIZES.medium;
  const fontFamily = FONT_FAMILIES[settings?.fontFamily] || FONT_FAMILIES.sans;

  const measurer = document.createElement('div');
  measurer.style.cssText = `
    position:fixed;left:-9999px;top:0;z-index:-1;visibility:hidden;
    width:${CONTENT_W}px;
    font-family:${fontFamily.value};
    font-size:${fs.lyrics};
    line-height:${fs.lineHeight};
    white-space:pre-wrap;
    overflow-wrap:break-word;
  `;
  document.body.appendChild(measurer);

  const allLines = lyrics.split('\n');
  const chunks = [];
  let idx = 0;
  let pageIndex = 0;

  while (idx < allLines.length) {
    const maxH = pageIndex === 0 ? firstPageMaxH : otherPageMaxH;
    const pageLines = [];

    while (idx < allLines.length) {
      pageLines.push(allLines[idx]);
      measurer.textContent = pageLines.join('\n');

      if (measurer.offsetHeight > maxH) {
        pageLines.pop(); // that line overflows
        if (pageLines.length === 0) {
          // single line taller than page — force include it
          pageLines.push(allLines[idx]);
          idx++;
        }
        break;
      }
      idx++;
    }

    chunks.push(pageLines.join('\n'));
    pageIndex++;
  }

  document.body.removeChild(measurer);
  return chunks;
}

/**
 * Generate all PDF pages for a single song
 */
function buildSongPages(song, lyrics, settings) {
  const headerH = measureHeaderHeight(song, settings);
  const firstMaxH = PAGE_H - PAD_TOP_FIRST - headerH - PAD_BOTTOM;
  const restMaxH  = PAGE_H - PAD_TOP_REST - PAD_BOTTOM;

  const chunks = splitLyricsIntoPages(lyrics, settings, firstMaxH, restMaxH);
  const totalPages = chunks.length;

  return chunks.map((chunk, i) =>
    buildPDFPageHtml(song, chunk, settings, {
      isFirstPage: i === 0,
      pageNum: i + 1,
      totalPages,
    })
  );
}

/**
 * Render an array of page HTML strings into a single PDF file
 */
async function renderPagesToPdf(htmlPages, filename, bgColor) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
  document.body.appendChild(container);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const [r, g, b] = hexToRgb(bgColor);

  try {
    for (let i = 0; i < htmlPages.length; i++) {
      if (i > 0) doc.addPage();

      container.innerHTML = htmlPages[i];
      const element = container.firstElementChild;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.setFillColor(r, g, b);
      doc.rect(0, 0, 210, 297, 'F');
      doc.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    }

    doc.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Download lyrics as PDF (supports ALL languages, proper pagination)
 */
export async function downloadAsPDF(song, settings = DEFAULT_PDF_SETTINGS) {
  const lyrics = getLyricsContent(song, settings);
  if (!lyrics) throw new Error('No lyrics available');

  const theme = THEMES[settings?.theme] || THEMES.dark;
  const pages = buildSongPages(song, lyrics, settings);
  await renderPagesToPdf(pages, `${sanitizeFilename(song.artist)} - ${sanitizeFilename(song.title)}.pdf`, theme.bg);
}

/**
 * Download all songs' lyrics as a single PDF
 */
export async function downloadAllAsPDF(songs, settings = DEFAULT_PDF_SETTINGS) {
  const validSongs = songs.filter(s => s.plainLyrics || s.syncedLyrics);
  if (validSongs.length === 0) throw new Error('No lyrics available');

  const theme = THEMES[settings?.theme] || THEMES.dark;

  // Build all pages for all songs
  const allPages = [];
  for (const song of validSongs) {
    const lyrics = getLyricsContent(song, settings);
    const songPages = buildSongPages(song, lyrics, settings);
    allPages.push(...songPages);
  }

  await renderPagesToPdf(allPages, 'SpoLy_Lyrics_Collection.pdf', theme.bg);
}

/**
 * Download lyrics as LRC file (synced lyrics format)
 */
export function downloadAsLRC(song) {
  const lyrics = song.syncedLyrics || convertPlainToLRC(song.plainLyrics);
  if (!lyrics) throw new Error('No lyrics available');

  const header = [
    `[ti:${song.title}]`,
    `[ar:${song.artist}]`,
    `[al:${song.album || 'Unknown'}]`,
    song.duration ? `[length:${formatTime(song.duration)}]` : '',
    `[by:SpoLy v1.0.0]`,
    '',
  ].filter(Boolean).join('\n');

  const content = header + '\n' + lyrics;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${sanitizeFilename(song.artist)} - ${sanitizeFilename(song.title)}.lrc`);
}

/**
 * Download lyrics as plain TXT file
 */
export function downloadAsTXT(song) {
  const lyrics = song.plainLyrics || stripLRCTimestamps(song.syncedLyrics);
  if (!lyrics) throw new Error('No lyrics available');

  const header = `${song.title}\nby ${song.artist}\n${song.album ? `Album: ${song.album}` : ''}\n${'─'.repeat(40)}\n\n`;
  const content = header + lyrics;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${sanitizeFilename(song.artist)} - ${sanitizeFilename(song.title)}.txt`);
}

/**
 * Download lyrics as SRT subtitle format
 */
export function downloadAsSRT(song) {
  const synced = song.syncedLyrics;
  if (!synced) {
    const plain = song.plainLyrics;
    if (!plain) throw new Error('No lyrics available');
    
    const lines = plain.split('\n').filter(l => l.trim());
    const duration = song.duration || lines.length * 3;
    const interval = duration / lines.length;
    
    let srt = '';
    lines.forEach((line, i) => {
      const start = formatSRTTime(i * interval);
      const end = formatSRTTime((i + 1) * interval);
      srt += `${i + 1}\n${start} --> ${end}\n${line}\n\n`;
    });
    
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${sanitizeFilename(song.artist)} - ${sanitizeFilename(song.title)}.srt`);
    return;
  }

  const lrcLines = synced.split('\n').filter(l => l.trim());
  let srt = '';
  let counter = 1;

  for (let i = 0; i < lrcLines.length; i++) {
    const match = lrcLines[i].match(/\[(\d+):(\d+\.?\d*)\]\s*(.*)/);
    if (!match) continue;

    const startSecs = parseInt(match[1]) * 60 + parseFloat(match[2]);
    let endSecs;

    if (i + 1 < lrcLines.length) {
      const nextMatch = lrcLines[i + 1].match(/\[(\d+):(\d+\.?\d*)\]/);
      if (nextMatch) {
        endSecs = parseInt(nextMatch[1]) * 60 + parseFloat(nextMatch[2]);
      }
    }
    if (!endSecs) endSecs = startSecs + 3;

    const text = match[3].trim();
    if (!text) continue;

    srt += `${counter}\n${formatSRTTime(startSecs)} --> ${formatSRTTime(endSecs)}\n${text}\n\n`;
    counter++;
  }

  const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${sanitizeFilename(song.artist)} - ${sanitizeFilename(song.title)}.srt`);
}

// ── Helpers ──

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

function escapeHtml(text) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeFilename(name) {
  return (name || 'unknown').replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatSRTTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds % 1) * 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function stripLRCTimestamps(lrc) {
  if (!lrc) return '';
  return lrc.replace(/\[\d+:\d+\.?\d*\]\s*/g, '');
}

function convertPlainToLRC(plain) {
  if (!plain) return null;
  return plain.split('\n').map(line => `[00:00.00] ${line}`).join('\n');
}
