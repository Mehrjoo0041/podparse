import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCategories, fetchEpisodes, type Category, type Episode } from '../api/client';
import { EpisodeCard } from '../components/EpisodeCard';

const CATEGORY_ICONS: Record<string, { icon: string; color: string }> = {
  'تکنولوژی': { icon: '💻', color: 'from-blue-400 to-blue-600' },
  'کسب‌وکار': { icon: '💼', color: 'from-amber-400 to-amber-600' },
  'علمی': { icon: '🔬', color: 'from-purple-400 to-purple-600' },
  'سلامت': { icon: '🏥', color: 'from-green-400 to-green-600' },
  'آموزشی': { icon: '📚', color: 'from-indigo-400 to-indigo-600' },
  'روانشناسی': { icon: '🧠', color: 'from-pink-400 to-pink-600' },
  'تاریخ': { icon: '🏛️', color: 'from-stone-400 to-stone-600' },
  'هنر': { icon: '🎨', color: 'from-rose-400 to-rose-600' },
  'ورزش': { icon: '⚽', color: 'from-emerald-400 to-emerald-600' },
  'سیاست': { icon: '🏛️', color: 'from-red-400 to-red-600' },
  'اقتصاد': { icon: '📈', color: 'from-teal-400 to-teal-600' },
  'فرهنگ': { icon: '🎭', color: 'from-violet-400 to-violet-600' },
};

const DEFAULT_ICON = { icon: '🎙️', color: 'from-stone-400 to-stone-600' };

export function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('cat') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setEpisodes([]);
      return;
    }
    setLoadingEpisodes(true);
    fetchEpisodes(1, '', selectedCategory)
      .then((data) => setEpisodes(data.items))
      .catch(console.error)
      .finally(() => setLoadingEpisodes(false));
  }, [selectedCategory]);

  const selectCategory = (cat: string) => {
    if (cat === selectedCategory) {
      setSearchParams({});
    } else {
      setSearchParams({ cat });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">دسته‌بندی</h1>
        <p className="text-stone-500">پادکست‌ها رو بر اساس موضوع پیدا کنید</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-stone-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-stone-600 mb-1">هنوز دسته‌بندی وجود نداره</h3>
          <p className="text-sm text-stone-400">با اضافه شدن محتوا، دسته‌بندی‌ها نمایش داده میشن</p>
        </div>
      ) : (
        <>
          {/* Category grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 stagger-children">
            {categories.map((cat) => {
              const meta = CATEGORY_ICONS[cat.name] || DEFAULT_ICON;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => selectCategory(cat.name)}
                  className={`relative overflow-hidden rounded-2xl p-5 text-right transition-all duration-300 card-hover ${
                    isSelected
                      ? 'ring-2 ring-primary-500 shadow-lg'
                      : 'shadow-sm'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-10`} />
                  <div className="relative">
                    <span className="text-3xl block mb-3">{meta.icon}</span>
                    <h3 className="font-bold text-stone-900 text-base">{cat.name}</h3>
                    <p className="text-xs text-stone-500 mt-1">{cat.count} اپیزود</p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 left-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Episodes for selected category */}
          {selectedCategory && (
            <div>
              <h2 className="text-lg font-bold text-stone-900 mb-4">
                اپیزودهای «{selectedCategory}»
              </h2>
              {loadingEpisodes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 stagger-children">
                  {episodes.map((ep) => (
                    <EpisodeCard key={ep.id} episode={ep} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
