import { useAudioPlayer } from '../hooks/useAudioPlayer';

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '۰:۰۰';
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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-lg">
      {/* Progress bar */}
      <div
        className="h-1 bg-stone-100 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          seek(pct * duration);
        }}
      >
        <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={() => isPlaying ? pause() : resume()}
          className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors flex-shrink-0"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Time */}
        <span className="text-xs text-stone-500 w-20 flex-shrink-0 ltr" dir="ltr">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-900 truncate">{currentEpisode.title}</p>
        </div>

        {/* Speed */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {RATES.map((rate) => (
            <button
              key={rate}
              onClick={() => setRate(rate)}
              className={`px-2 py-1 text-xs rounded ${
                playbackRate === rate
                  ? 'bg-primary-100 text-primary-700 font-semibold'
                  : 'text-stone-500 hover:bg-stone-100'
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
