import { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Palette,
  FileText,
  Image,
  Type,
  PenLine,
  Sun,
  Moon,
  Music,
} from 'lucide-react';

const THEME_OPTIONS = [
  {
    id: 'dark',
    label: 'Dark',
    icon: Moon,
    preview: 'bg-[#0f0f0f] border-gray-700',
    desc: 'Dark background with light text',
  },
  {
    id: 'light',
    label: 'Light',
    icon: Sun,
    preview: 'bg-white border-gray-300',
    desc: 'White background with dark text',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    icon: Music,
    preview: 'bg-[#121212] border-spotify',
    desc: 'Spotify-inspired green accent theme',
  },
];

const LYRICS_OPTIONS = [
  { id: 'auto', label: 'Auto', desc: 'Plain lyrics (fallback to synced)' },
  { id: 'plain', label: 'Plain', desc: 'Lyrics without timestamps' },
  { id: 'synced', label: 'Synced', desc: 'Lyrics with [mm:ss] timestamps' },
];

const FONT_SIZE_OPTIONS = [
  { id: 'small', label: 'S', desc: 'Small' },
  { id: 'medium', label: 'M', desc: 'Medium' },
  { id: 'large', label: 'L', desc: 'Large' },
];

const FONT_FAMILY_OPTIONS = [
  { id: 'sans', label: 'Sans', preview: 'Inter' },
  { id: 'serif', label: 'Serif', preview: 'Playfair Display' },
  { id: 'mono', label: 'Mono', preview: 'JetBrains Mono' },
  { id: 'rounded', label: 'Rounded', preview: 'Nunito' },
  { id: 'handwritten', label: 'Script', preview: 'Caveat' },
];

export default function Settings({ settings, onUpdate, isOpen, onClose }) {
  if (!isOpen) return null;

  const update = (key, value) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass rounded-3xl overflow-hidden animate-fade-in-up border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-accent-light" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">PDF Settings</h2>
              <p className="text-xs text-gray-500">Customize your PDF exports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Theme */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <Palette className="w-4 h-4 text-accent-light" />
              PDF Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map((theme) => {
                const Icon = theme.icon;
                const isActive = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => update('theme', theme.id)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isActive
                        ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div
                      className={`w-full h-8 rounded-lg mb-2 border ${theme.preview}`}
                    />
                    <div className="flex items-center justify-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent-light' : 'text-gray-400'}`} />
                      <span className={`text-xs font-medium ${isActive ? 'text-accent-light' : 'text-gray-300'}`}>
                        {theme.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lyrics Type */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <FileText className="w-4 h-4 text-accent-light" />
              Lyrics Type in PDF
            </label>
            <div className="space-y-2">
              {LYRICS_OPTIONS.map((opt) => {
                const isActive = settings.lyricsType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => update('lyricsType', opt.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'border-accent bg-accent/10'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="text-left">
                      <span className={`text-sm font-medium ${isActive ? 'text-accent-light' : 'text-white'}`}>
                        {opt.label}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isActive
                          ? 'border-accent bg-accent'
                          : 'border-gray-600'
                      }`}
                    >
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <Type className="w-4 h-4 text-accent-light" />
              Font Size
            </label>
            <div className="flex gap-2">
              {FONT_SIZE_OPTIONS.map((opt) => {
                const isActive = settings.fontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => update('fontSize', opt.id)}
                    className={`flex-1 py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isActive
                        ? 'border-accent bg-accent/10 text-accent-light'
                        : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg font-bold">{opt.label}</span>
                    <p className="text-[10px] mt-0.5">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Style */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <PenLine className="w-4 h-4 text-accent-light" />
              Font Style
            </label>
            <div className="grid grid-cols-5 gap-2">
              {FONT_FAMILY_OPTIONS.map((font) => {
                const isActive = (settings.fontFamily || 'sans') === font.id;
                return (
                  <button
                    key={font.id}
                    onClick={() => update('fontFamily', font.id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isActive
                        ? 'border-accent bg-accent/10 ring-1 ring-accent/30'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div
                      style={{ fontFamily: font.preview }}
                      className={`text-lg font-semibold leading-none mb-1 ${
                        isActive ? 'text-accent-light' : 'text-white'
                      }`}
                    >
                      Aa
                    </div>
                    <div className={`text-[9px] leading-tight ${isActive ? 'text-accent-light' : 'text-gray-400'}`}>
                      {font.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Include Thumbnail */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
              <Image className="w-4 h-4 text-accent-light" />
              Album Art in PDF
            </label>
            <button
              onClick={() => update('includeThumbnail', !settings.includeThumbnail)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                settings.includeThumbnail
                  ? 'border-accent bg-accent/10'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="text-left">
                <span className={`text-sm font-medium ${settings.includeThumbnail ? 'text-accent-light' : 'text-white'}`}>
                  Include thumbnail
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Show album art in the PDF header (when available)
                </p>
              </div>
              {/* Toggle */}
              <div
                className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                  settings.includeThumbnail ? 'bg-accent' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings.includeThumbnail ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-light transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
