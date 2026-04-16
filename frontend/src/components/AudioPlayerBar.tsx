import { useAudioPlayer } from '../hooks/useAudioPlayer';

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const RATES = [0.75, 1, 1.25, 1.5, 2];

export function AudioPlayerBar() {
  const { currentEpisode, isPlaying, currentTime, duration, playbackRate, pause, resume, seek, setRate } = useAudioPlayer();

  if (!currentEpisode) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-stone-200/50 shadow-2xl animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
      {/* Progress bar */}
      <div
        className="h-1.5 bg-stone-100 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          seek(pct * duration);
        }}
      >
        <div
          className="h-full bg-gradient-to-l from-primary-500 to-primary-400 transition-all duration-150 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary-600 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={() => isPlaying ? pause() : resume()}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 flex-shrink-0 active:scale-95"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-[-2px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Wave animation when playing */}
        {isPlaying && (
          <div className="flex items-center gap-[3px] h-5 flex-shrink-0 text-primary-500">
            <span className="wave-bar" />
            <span className="wave-bar" />
            <span className="wave-bar" />
            <span className="wave-bar" />
            <span className="wave-bar" />
          </div>
        )}

        {/* Title + time */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-900 truncate">{currentEpisode.title}</p>
          <p className="text-xs text-stone-400 ltr" dir="ltr">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-0.5 flex-shrink-0 bg-stone-100 rounded-xl p-1">
          {RATES.map((rate) => (
            <button
              key={rate}
              onClick={() => setRate(rate)}
              className={`px-2 py-1.5 text-xs rounded-lg transition-all ${
                playbackRate === rate
                  ? 'bg-white text-primary-700 font-bold shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
