import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchEpisode, saveEpisode, unsaveEpisode, likeEpisode, unlikeEpisode, type Episode } from '../api/client';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useAuth } from '../contexts/AuthContext';

function formatDuration(seconds?: number | null): string {
  if (!seconds) return '';
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

export function EpisodePage() {
  const { id } = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'persian' | 'english'>('persian');
  const { play, currentEpisode, isPlaying, pause } = useAudioPlayer();
  const { user } = useAuth();

  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchEpisode(Number(id))
      .then((ep) => {
        setEpisode(ep);
        setSaved(ep.is_saved ?? false);
        setLiked(ep.is_liked ?? false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-medium text-stone-600">Episode not found</h2>
      </div>
    );
  }

  const isCurrentlyPlaying = currentEpisode?.id === episode.id && isPlaying;

  const handlePlay = () => {
    if (isCurrentlyPlaying) {
      pause();
    } else if (episode.narrated_audio_path) {
      play({ id: episode.id, title: episode.title, audioUrl: `/${episode.narrated_audio_path}` });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const newState = !saved;
    setSaved(newState);
    try {
      if (newState) await saveEpisode(episode.id);
      else await unsaveEpisode(episode.id);
    } catch { setSaved(!newState); }
  };

  const handleLike = async () => {
    if (!user) return;
    const newState = !liked;
    setLiked(newState);
    try {
      if (newState) await likeEpisode(episode.id);
      else await unlikeEpisode(episode.id);
    } catch { setLiked(!newState); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Library
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden mb-8">
        <div className="h-40 relative" style={{ backgroundColor: episode.cover_color }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <h1 className="text-2xl font-bold text-white leading-tight">{episode.title}</h1>
            {episode.podcast_name && (
              <p className="text-sm text-white/80 mt-1">{episode.podcast_name}</p>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Play button */}
            <button
              onClick={handlePlay}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              {isCurrentlyPlaying ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play in Persian
                </>
              )}
            </button>

            {/* Save button */}
            {user && (
              <button
                onClick={handleSave}
                className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                  saved
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {saved ? 'Saved' : 'Save'}
              </button>
            )}

            {/* Like button */}
            {user && (
              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${
                  liked
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {liked ? 'Liked' : 'Like'}
              </button>
            )}

            {/* Meta */}
            {episode.duration_seconds && (
              <span className="text-sm text-stone-500">{formatDuration(episode.duration_seconds)}</span>
            )}
            {episode.published_date && (
              <span className="text-sm text-stone-400">{episode.published_date}</span>
            )}
          </div>

          {episode.summary && (
            <p className="mt-4 text-sm text-stone-600 leading-relaxed">{episode.summary}</p>
          )}
        </div>
      </div>

      {/* Transcript Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="flex border-b border-stone-100">
          <button
            onClick={() => setActiveTab('persian')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'persian'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Persian Translation
          </button>
          <button
            onClick={() => setActiveTab('english')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'english'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            English Transcript
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'persian' ? (
            episode.persian_text ? (
              <div dir="rtl" className="font-persian text-base leading-loose text-stone-800 whitespace-pre-wrap">
                {episode.persian_text}
              </div>
            ) : (
              <p className="text-stone-400 text-center py-8">No Persian translation available yet</p>
            )
          ) : (
            episode.transcript_text ? (
              <div className="text-base leading-relaxed text-stone-800 whitespace-pre-wrap">
                {episode.transcript_text}
              </div>
            ) : (
              <p className="text-stone-400 text-center py-8">No transcript available yet</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
