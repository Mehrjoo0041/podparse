import { useEffect, useState, useCallback } from 'react';
import {
  fetchAdminEpisodes, submitUrl, submitTranslation, retryEpisode,
  fetchDashboard, type Episode, type DashboardData,
} from '../api/client';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-stone-100 text-stone-700',
  downloading: 'bg-blue-100 text-blue-700',
  transcribing: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-cyan-100 text-cyan-700',
  awaiting_translation: 'bg-yellow-100 text-yellow-700',
  narrating: 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  downloading: 'در حال دانلود...',
  transcribing: 'در حال رونویسی...',
  processing: 'در حال تحلیل و ترجمه...',
  awaiting_translation: 'در انتظار ترجمه',
  narrating: 'در حال روایت...',
  done: 'تکمیل شده',
  error: 'خطا',
};

type Tab = 'dashboard' | 'episodes' | 'add';

function StatCard({ label, value, sub, icon, color }: {
  label: string; value: number | string; sub?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      <p className="text-sm text-stone-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
      <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [voice, setVoice] = useState('dilara');
  const [submitting, setSubmitting] = useState(false);
  const [translationModal, setTranslationModal] = useState<Episode | null>(null);
  const [persianText, setPersianText] = useState('');
  const [submittingTranslation, setSubmittingTranslation] = useState(false);

  const loadDashboard = useCallback(() => {
    fetchDashboard().then(setDashboard).catch(console.error);
  }, []);

  const loadEpisodes = useCallback(() => {
    fetchAdminEpisodes()
      .then((data) => setEpisodes(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDashboard();
    loadEpisodes();
    const interval = setInterval(() => {
      loadDashboard();
      loadEpisodes();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadDashboard, loadEpisodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSubmitting(true);
    try {
      await submitUrl({ url: url.trim(), title: title.trim() || undefined, voice });
      setUrl('');
      setTitle('');
      loadEpisodes();
      setTab('episodes');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ارسال ناموفق بود');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTranslation = async () => {
    if (!translationModal || !persianText.trim()) return;
    setSubmittingTranslation(true);
    try {
      await submitTranslation(translationModal.id, persianText.trim());
      setTranslationModal(null);
      setPersianText('');
      loadEpisodes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ارسال ترجمه ناموفق بود');
    } finally {
      setSubmittingTranslation(false);
    }
  };

  const handleRetry = async (id: number) => {
    try { await retryEpisode(id); loadEpisodes(); } catch {}
  };

  const d = dashboard;
  const maxDaily = d ? Math.max(...d.daily_listens.map(x => x.count), 1) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">پنل مدیریت</h1>
          <p className="text-stone-500">آمار، محتوا و مدیریت پادکست‌ها</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-stone-100 rounded-xl p-1 max-w-md">
        {([
          ['dashboard', 'داشبورد'],
          ['episodes', 'اپیزودها'],
          ['add', 'افزودن محتوا'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === key
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && d && (
        <div className="space-y-6 stagger-children">
          {/* Top Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="کل کاربران"
              value={d.users.total}
              sub={`${d.users.new_week} نفر این هفته`}
              color="bg-blue-50"
              icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
            <StatCard
              label="کل اپیزودها"
              value={d.episodes.done}
              sub={`از ${d.episodes.total} اپیزود`}
              color="bg-green-50"
              icon={<svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
            />
            <StatCard
              label="کل شنیده‌شده"
              value={d.engagement.total_listens}
              sub={`${d.engagement.listens_week} این هفته`}
              color="bg-purple-50"
              icon={<svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
            />
            <StatCard
              label="نرخ تکمیل"
              value={`${d.engagement.completion_rate}%`}
              sub={`${d.engagement.completed_listens} بار تا آخر`}
              color="bg-amber-50"
              icon={<svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
          </div>

          {/* Second row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="لایک‌ها" value={d.engagement.total_likes} color="bg-red-50"
              icon={<svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>}
            />
            <StatCard label="ذخیره‌شده‌ها" value={d.engagement.total_saves} color="bg-primary-50"
              icon={<svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>}
            />
            <StatCard label="کاربران فعال (هفته)" value={d.users.active_week} color="bg-indigo-50"
              icon={<svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            />
            <StatCard label="کاربران فعال (ماه)" value={d.users.active_month} color="bg-teal-50"
              icon={<svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily listens chart */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h3 className="font-bold text-stone-900 mb-4">شنیده‌شده ۷ روز اخیر</h3>
              <div className="flex items-end gap-2 h-32">
                {d.daily_listens.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-stone-500 font-medium">{day.count}</span>
                    <div className="w-full rounded-t-lg bg-primary-100 relative overflow-hidden" style={{ height: `${Math.max((day.count / maxDaily) * 100, 4)}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg" />
                    </div>
                    <span className="text-[10px] text-stone-400 ltr" dir="ltr">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top episodes */}
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h3 className="font-bold text-stone-900 mb-4">پرشنیده‌ترین اپیزودها</h3>
              {d.top_episodes.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-8">هنوز داده‌ای نیست</p>
              ) : (
                <div className="space-y-3">
                  {d.top_episodes.map((ep, i) => (
                    <div key={ep.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-stone-400 w-5">{i + 1}</span>
                      <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: ep.cover_color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate ltr" dir="ltr">{ep.title}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-stone-400">{ep.listens} پخش</span>
                          <span className="text-xs text-green-600">{ep.completed} تکمیل</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent users */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <h3 className="font-bold text-stone-900 mb-4">آخرین کاربران</h3>
            {d.recent_users.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-4">هنوز کاربری نیست</p>
            ) : (
              <div className="divide-y divide-stone-50">
                {d.recent_users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 py-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-700">{u.display_name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-800">{u.display_name}</p>
                      <p className="text-xs text-stone-400 ltr" dir="ltr">{u.email}</p>
                    </div>
                    <span className="text-xs text-stone-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('fa-IR') : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'dashboard' && !d && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Episodes Tab */}
      {tab === 'episodes' && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden animate-fade-in-up">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">همه اپیزودها</h2>
            <button
              onClick={() => setTab('add')}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              + افزودن
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-12 text-stone-400">هنوز اپیزودی نیست</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-right text-xs font-medium text-stone-500 uppercase tracking-wide">
                    <th className="px-6 py-3">عنوان</th>
                    <th className="px-6 py-3">وضعیت</th>
                    <th className="px-6 py-3">صدا</th>
                    <th className="px-6 py-3">تاریخ</th>
                    <th className="px-6 py-3">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {episodes.map((ep) => (
                    <tr key={ep.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ backgroundColor: ep.cover_color }} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-900 truncate max-w-xs">{ep.title}</p>
                            <p className="text-xs text-stone-400 truncate max-w-xs ltr" dir="ltr">{ep.source_url}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[ep.status] || ''}`}>
                          {STATUS_LABELS[ep.status] || ep.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">{ep.voice === 'dilara' ? 'دیلارا' : 'فرید'}</td>
                      <td className="px-6 py-4 text-sm text-stone-500">{new Date(ep.created_at).toLocaleDateString('fa-IR')}</td>
                      <td className="px-6 py-4">
                        {ep.status === 'awaiting_translation' && (
                          <button onClick={() => { setTranslationModal(ep); setPersianText(''); }}
                            className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 font-medium">
                            افزودن ترجمه
                          </button>
                        )}
                        {ep.status === 'error' && (
                          <button onClick={() => handleRetry(ep.id)}
                            className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium">
                            تلاش مجدد
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Content Tab */}
      {tab === 'add' && (
        <div className="max-w-2xl animate-fade-in-up">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">افزودن پادکست جدید</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">لینک پادکست *</label>
                <input
                  type="text" value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="RSS، یوتیوب یا لینک مستقیم صوتی"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ltr" dir="ltr"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">عنوان (اختیاری)</label>
                <input
                  type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان اپیزود (برای RSS خودکار تشخیص داده میشه)"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">صدای روایت</label>
                <select value={voice} onChange={(e) => setVoice(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="dilara">دیلارا (زن)</option>
                  <option value="farid">فرید (مرد)</option>
                </select>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-gradient-to-l from-primary-600 to-primary-500 text-white rounded-xl text-sm font-bold hover:from-primary-700 hover:to-primary-600 transition-all disabled:opacity-50 shadow-sm shadow-primary-500/20">
                {submitting ? 'در حال ارسال...' : 'شروع پردازش'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Translation Modal */}
      {translationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col animate-scale-in">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">افزودن ترجمه فارسی</h3>
              <button onClick={() => setTranslationModal(null)} className="text-stone-400 hover:text-stone-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto">
              <p className="text-sm text-stone-600 mb-2">اپیزود: <strong>{translationModal.title}</strong></p>
              {translationModal.transcript_text && (
                <details className="mb-4">
                  <summary className="text-sm text-primary-600 cursor-pointer hover:underline">مشاهده متن انگلیسی</summary>
                  <div className="mt-2 p-4 bg-stone-50 rounded-xl text-sm text-stone-700 max-h-40 overflow-auto whitespace-pre-wrap ltr" dir="ltr">
                    {translationModal.transcript_text}
                  </div>
                </details>
              )}
              <textarea value={persianText} onChange={(e) => setPersianText(e.target.value)}
                placeholder="ترجمه فارسی رو اینجا بذارید..."
                className="w-full h-60 px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y" />
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-start gap-3">
              <button onClick={handleTranslation} disabled={submittingTranslation || !persianText.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                {submittingTranslation ? 'در حال ذخیره...' : 'ذخیره و روایت'}
              </button>
              <button onClick={() => setTranslationModal(null)} className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
