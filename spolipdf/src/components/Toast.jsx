import { AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'error', onClose }) {
  if (!message) return null;

  const styles = {
    error: 'border-red-500/30 bg-red-500/10 text-red-300',
    success: 'border-spotify/30 bg-spotify/10 text-spotify',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg ${styles[type]}`}
      >
        <AlertCircle className="w-4 h-4 shrink-0" />
        <p className="text-sm">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
