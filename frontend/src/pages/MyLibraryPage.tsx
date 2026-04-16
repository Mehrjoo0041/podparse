import { useEffect, useState } from 'react';
import { fetchSavedEpisodes, fetchLikedEpisodes, type Episode } from '../api/client';
import { EpisodeCard } from '../components/EpisodeCard';

type Tab = 'saved' | 'liked';

export function MyLibraryPage() {
  const [tab, setTab] = useState<Tab>('saved');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = tab === 'saved' ? fetchSavedEpisodes : fetchLikedEpisodes;
    fetcher(1)
      .then((data) => setEpisodes(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">کتابخونه من</h1>
        <p className="text-stone-500">پادکست‌های ذخیره‌شده و پسندیده شما</p>
      </div>

      <div className="flex gap-1 mb-6 bg-stone-100 rounded-xl p-1 max-w-xs">
        <button
          onClick={() => setTab('saved')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'saved'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <svg className="w-4 h-4 inline-block ml-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          ذخیره‌شده
        </button>
        <button
          onClick={() => setTab('liked')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'liked'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <svg className="w-4 h-4 inline-block ml-1.5 -mt-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          پسندیده
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-stone-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            {tab === 'saved' ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            )}
          </svg>
          <h3 className="text-lg font-medium text-stone-600 mb-1">
            {tab === 'saved' ? 'هنوز اپیزودی ذخیره نکردید' : 'هنوز اپیزودی نپسندیدید'}
          </h3>
          <p className="text-sm text-stone-400">
            {tab === 'saved'
              ? 'از بخش کاوش اپیزودها رو ذخیره کنید تا اینجا نشون داده بشن'
              : 'اپیزودها رو لایک کنید تا مجموعه‌تون رو بسازید'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 stagger-children">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      )}
    </div>
  );
}
