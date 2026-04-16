import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Episode } from '../api/client';
import { saveEpisode, unsaveEpisode, likeEpisode, unlikeEpisode } from '../api/client';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAuth } from '../contexts/AuthContext';

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '';
  const m = Math.round(seconds / 60);
  return `${m} min`;
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
      play({ id: episode.id, title: episode.title, audioUrl: `/${episode.narrated_audio_path}` });
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
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-stone-100"
    >
      {/* Color header */}
      <div className="h-32 relative flex items-end p-4" style={{ backgroundColor: episode.cover_color }}>
        {/* Top-right actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {user && (
            <>
              <button
                onClick={handleSave}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                title={saved ? 'Unsave' : 'Save'}
              >
                <svg className={`w-4 h-4 ${saved ? 'text-primary-600' : 'text-stone-400'}`} fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                onClick={handleLike}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                title={liked ? 'Unlike' : 'Like'}
              >
                <svg className={`w-4 h-4 ${liked ? 'text-red-500' : 'text-stone-400'}`} fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </>
          )}
          {/* Play button */}
          <button
            onClick={handlePlay}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            {isCurrentlyPlaying ? (
              <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-primary-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Duration badge */}
        {episode.duration_seconds && (
          <span className="text-xs font-medium text-white/90 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
            {formatDuration(episode.duration_seconds)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-stone-900 line-clamp-2 leading-snug mb-1">{episode.title}</h3>
        {episode.podcast_name && (
          <p className="text-xs text-stone-500 truncate">{episode.podcast_name}</p>
        )}
      </div>
    </Link>
  );
}
