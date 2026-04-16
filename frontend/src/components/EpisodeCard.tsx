import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Episode } from '../api/client';
import { saveEpisode, unsaveEpisode, likeEpisode, unlikeEpisode } from '../api/client';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAuth } from '../contexts/AuthContext';
import { getAudioUrl } from '../utils/audio';

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '';
  const m = Math.round(seconds / 60);
  return `${m} دقیقه`;
}

export function EpisodeCard({ episode }: { episode: Episode }) {
  const { play, currentEpisode, isPlaying, pause } = useAudioPlayer();
  const { user } = useAuth();
  const isCurrentlyPlaying = currentEpisode?.id === episode.id && isPlaying;

  const [saved, setSaved] = useState(episode.is_saved ?? false);
  const [liked, setLiked] = useState(episode.is_liked ?? false);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrentlyPlaying) {
      pause();
    } else if (episode.narrated_audio_path) {
      play({ id: episode.id, title: episode.title, audioUrl: getAudioUrl(episode.narrated_audio_path) });
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const newState = !saved;
    setSaved(newState);
    try {
      if (newState) await saveEpisode(episode.id);
      else await unsaveEpisode(episode.id);
    } catch { setSaved(!newState); }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const newState = !liked;
    setLiked(newState);
    try {
      if (newState) await likeEpisode(episode.id);
      else await unlikeEpisode(episode.id);
    } catch { setLiked(!newState); }
  };

  return (
    <Link
      to={`/episode/${episode.id}`}
      className="group block bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-stone-100 card-hover"
    >
      {/* Color header with gradient overlay */}
      <div className="h-36 relative overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${episode.cover_color}, ${episode.cover_color}dd, ${episode.cover_color}99)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Actions overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          {user && (
            <>
              <button
                onClick={handleLike}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 ${
                  liked ? 'bg-red-500 text-white' : 'bg-white/90 backdrop-blur-sm text-stone-500'
                }`}
                title={liked ? 'نپسندیدن' : 'پسندیدن'}
              >
                <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button
                onClick={handleSave}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 ${
                  saved ? 'bg-primary-500 text-white' : 'bg-white/90 backdrop-blur-sm text-stone-500'
                }`}
                title={saved ? 'حذف از ذخیره' : 'ذخیره'}
              >
                <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Play button - center */}
        <button
          onClick={handlePlay}
          className={`absolute bottom-3 left-3 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            isCurrentlyPlaying
              ? 'bg-primary-600 text-white scale-100'
              : 'bg-white/95 backdrop-blur-sm text-primary-600 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
          }`}
        >
          {isCurrentlyPlaying ? (
            <div className="flex items-center gap-[3px] h-4">
              <span className="wave-bar text-white" />
              <span className="wave-bar text-white" />
              <span className="wave-bar text-white" />
              <span className="wave-bar text-white" />
            </div>
          ) : (
            <svg className="w-5 h-5 mr-[-2px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Duration badge */}
        {episode.duration_seconds && (
          <span className="absolute top-3 right-3 text-[11px] font-semibold text-white/90 bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {formatDuration(episode.duration_seconds)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-sm font-bold text-stone-900 line-clamp-2 leading-relaxed mb-1.5 ltr" dir="ltr">
          {episode.title}
        </h3>
        {episode.podcast_name && (
          <p className="text-xs text-stone-400 truncate ltr" dir="ltr">{episode.podcast_name}</p>
        )}
      </div>
    </Link>
  );
}
