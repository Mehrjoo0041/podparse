import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEpisodes, fetchRecentEpisodes, fetchCategories, type Episode, type Category } from '../api/client';
import { EpisodeCard } from '../components/EpisodeCard';
import { useAuth } from '../contexts/AuthContext';

const CATEGORY_EMOJIS: Record<string, string> = {
  'تکنولوژی': '💻', 'کسب‌وکار': '💼', 'علمی': '🔬', 'سلامت': '🏥',
  'آموزشی': '📚', 'روانشناسی': '🧠', 'تاریخ': '🏛️', 'هنر': '🎨',
  'ورزش': '⚽', 'سیاست': '🏛️', 'اقتصاد': '📈', 'فرهنگ': '🎭',
};

export function LibraryPage() {
  const { user } = useAuth();
  const [recentEpisodes, setRecentEpisodes] = useState<Episode[]>([]);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Episode[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchRecentEpisodes(),
      fetchEpisodes(1),
      fetchCategories(),
    ])
      .then(([recent, all, cats]) => {
        setRecentEpisodes(recent.items);
        setAllEpisodes(all.items);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(() => {
      fetchEpisodes(1, search)
        .then((data) => setSearchResults(data.items))
        .catch(console.error)
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const hasContent = allEpisodes.length > 0;
  const isSearching = search.trim().length > 0;

  return (
    <div className="page-enter">
      {/* Hero welcome */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary-600 via-primary-700 to-emerald-800" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-white/3 rounded-full blur-xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="animate-fade-in-up">
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                سلام {user?.display_name} 👋
              </h1>
              <p className="text-sm sm:text-base text-white/70">
                امروز چی می‌خوای گوش بدی؟
              </p>
            </div>

            {/* Search */}
            <div className="w-full sm:w-96 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="relative">
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="جستجو در پادکست‌ها..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pr-12 pl-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/categories?cat=${encodeURIComponent(cat.name)}`}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-xs font-medium text-white/80 hover:bg-white/20 hover:text-white transition-all"
                >
                  {CATEGORY_EMOJIS[cat.name] || '🎙️'} {cat.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search results */}
        {isSearching && (
          <div className="mb-10 animate-fade-in">
            <h2 className="text-lg font-bold text-stone-900 mb-4">
              نتایج جستجو برای «{search}»
            </h2>
            {searching ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
                <p className="text-stone-500">نتیجه‌ای پیدا نشد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 stagger-children">
                {searchResults.map((ep) => (
                  <EpisodeCard key={ep.id} episode={ep} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main content */}
        {!isSearching && (
          <>
            {hasContent ? (
              <div className="space-y-10">
                {/* Recent */}
                {recentEpisodes.length > 0 && (
                  <section className="animate-fade-in-up">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-xl font-bold text-stone-900">تازه‌ها 🆕</h2>
                        <p className="text-sm text-stone-500 mt-0.5">آخرین اپیزودهای اضافه‌شده</p>
                      </div>
                      <Link to="/recent" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                        مشاهده همه ←
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 stagger-children">
                      {recentEpisodes.slice(0, 4).map((ep) => (
                        <EpisodeCard key={ep.id} episode={ep} />
                      ))}
                    </div>
                  </section>
                )}

                {/* All episodes */}
                <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-bold text-stone-900">همه اپیزودها 🎙️</h2>
                      <p className="text-sm text-stone-500 mt-0.5">مرور کامل محتوای ترجمه‌شده</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 stagger-children">
                    {allEpisodes.map((ep) => (
                      <EpisodeCard key={ep.id} episode={ep} />
                    ))}
                  </div>
                </section>

                {/* Categories quick access */}
                {categories.length > 0 && (
                  <section className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-xl font-bold text-stone-900">دسته‌بندی‌ها 📂</h2>
                        <p className="text-sm text-stone-500 mt-0.5">بر اساس موضوع جستجو کنید</p>
                      </div>
                      <Link to="/categories" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                        مشاهده همه ←
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
                      {categories.slice(0, 6).map((cat) => (
                        <Link
                          key={cat.name}
                          to={`/categories?cat=${encodeURIComponent(cat.name)}`}
                          className="bg-white rounded-2xl border border-stone-100 p-4 text-center card-hover group"
                        >
                          <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform inline-block">
                            {CATEGORY_EMOJIS[cat.name] || '🎙️'}
                          </span>
                          <h3 className="text-sm font-semibold text-stone-900">{cat.name}</h3>
                          <p className="text-xs text-stone-400 mt-0.5">{cat.count} اپیزود</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              /* Empty state — no content yet */
              <div className="py-10">
                {/* Quick stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10 stagger-children">
                  <div className="bg-white rounded-2xl border border-stone-100 p-6 text-center card-hover">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-stone-900 mb-1">ترجمه هوشمند</h3>
                    <p className="text-sm text-stone-500">محتوا با هوش مصنوعی تحلیل و ترجمه میشه</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-100 p-6 text-center card-hover">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-stone-900 mb-1">روایت صوتی</h3>
                    <p className="text-sm text-stone-500">متن ترجمه‌شده با صدای طبیعی خوانده میشه</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-100 p-6 text-center card-hover">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-stone-900 mb-1">به‌زودی</h3>
                    <p className="text-sm text-stone-500">محتوای جدید در حال آماده‌سازیه</p>
                  </div>
                </div>

                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <svg className="w-10 h-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-stone-700 mb-2">هنوز اپیزودی منتشر نشده</h3>
                  <p className="text-sm text-stone-400 max-w-md mx-auto">
                    تیم ما در حال آماده‌سازی محتوای جذاب فارسی از بهترین پادکست‌های دنیاست.
                    به زودی اپیزودهای جدید اضافه خواهند شد!
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
