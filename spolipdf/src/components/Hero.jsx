import { Search, Sparkles, ArrowDown } from 'lucide-react';

export default function Hero({ onScrollToSearch }) {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-spotify/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-spotify/3 to-transparent rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gray-300 mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-spotify" />
          <span>Free & Open Source Lyrics Downloader</span>
        </div>

        {/* Main heading */}
        <h1
          className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-6 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          Your Spotify Lyrics,{' '}
          <span className="bg-linear-to-r from-spotify via-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Any Format
          </span>
        </h1>

        {/* Description */}
        <p
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          Search any song, fetch synced lyrics instantly, and download in
          <span className="text-white font-medium"> LRC</span>,
          <span className="text-white font-medium"> PDF</span>,
          <span className="text-white font-medium"> TXT</span>, or
          <span className="text-white font-medium"> SRT</span> format.
        </p>

        {/* CTA button */}
        <button
          onClick={onScrollToSearch}
          className="animate-fade-in-up inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-spotify to-emerald-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-spotify/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          style={{ animationDelay: '0.3s' }}
        >
          <Search className="w-5 h-5" />
          Start Searching
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </button>

        {/* Feature pills */}
        <div
          className="flex flex-wrap justify-center gap-3 mt-12 animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          {['Synced Lyrics', 'Batch Download', 'PDF Export', 'No Login Required'].map((feat) => (
            <span
              key={feat}
              className="px-4 py-2 rounded-full glass text-sm text-gray-300 hover:text-white hover:border-spotify/30 transition-colors"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
