import { useEffect, useState, useCallback } from 'react';
import { fetchAdminEpisodes, submitUrl, submitTranslation, retryEpisode, type Episode } from '../api/client';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-stone-100 text-stone-700',
  downloading: 'bg-blue-100 text-blue-700',
  transcribing: 'bg-indigo-100 text-indigo-700',
  awaiting_translation: 'bg-yellow-100 text-yellow-700',
  narrating: 'bg-purple-100 text-purple-700',
  done: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  downloading: 'در حال دانلود...',
  transcribing: 'در حال رونویسی...',
  awaiting_translation: 'در انتظار ترجمه',
  narrating: 'در حال روایت...',
  done: 'تکمیل شده',
  error: 'خطا',
};

export function AdminPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [voice, setVoice] = useState('dilara');
  const [submitting, setSubmitting] = useState(false);
  const [translationModal, setTranslationModal] = useState<Episode | null>(null);
  const [persianText, setPersianText] = useState('');
  const [submittingTranslation, setSubmittingTranslation] = useState(false);

  const loadEpisodes = useCallback(() => {
    fetchAdminEpisodes()
      .then((data) => setEpisodes(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadEpisodes();
    const interval = setInterval(loadEpisodes, 5000);
    return () => clearInterval(interval);
  }, [loadEpisodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSubmitting(true);
    try {
      await submitUrl({ url: url.trim(), title: title.trim() || undefined, voice });
      setUrl('');
      setTitle('');
      loadEpisodes();
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
    try {
      await retryEpisode(id);
      loadEpisodes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'تلاش مجدد ناموفق بود');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-1">مدیریت</h1>
      <p className="text-stone-500 mb-8">پادکست جدید اضافه کنید و ترجمه‌ها رو مدیریت کنید</p>

      {/* Submit Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-8">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">افزودن پادکست جدید</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">لینک پادکست *</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="RSS، یوتیوب یا لینک مستقیم صوتی"
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ltr"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">عنوان (اختیاری)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان اپیزود (برای RSS خودکار تشخیص داده میشه)"
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">صدا</label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="dilara">دیلارا (زن)</option>
                <option value="farid">فرید (مرد)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'در حال ارسال...' : 'پردازش پادکست'}
            </button>
          </div>
        </form>
      </div>

      {/* Episodes Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900">همه اپیزودها</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            هنوز اپیزودی نیست. از فرم بالا لینک پادکست رو وارد کنید.
          </div>
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
                  <tr key={ep.id} className="hover:bg-stone-50">
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
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[ep.status] || 'bg-stone-100 text-stone-700'}`}>
                        {STATUS_LABELS[ep.status] || ep.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">{ep.voice === 'dilara' ? 'دیلارا' : 'فرید'}</td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {new Date(ep.created_at).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {ep.status === 'awaiting_translation' && (
                          <button
                            onClick={() => { setTranslationModal(ep); setPersianText(''); }}
                            className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 font-medium"
                          >
                            افزودن ترجمه
                          </button>
                        )}
                        {ep.status === 'error' && (
                          <button
                            onClick={() => handleRetry(ep.id)}
                            className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium"
                          >
                            تلاش مجدد
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Translation Modal */}
      {translationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-stone-900">افزودن ترجمه فارسی</h3>
              <button onClick={() => setTranslationModal(null)} className="text-stone-400 hover:text-stone-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto">
              <p className="text-sm text-stone-600 mb-2">
                اپیزود: <strong>{translationModal.title}</strong>
              </p>
              {translationModal.transcript_text && (
                <details className="mb-4">
                  <summary className="text-sm text-primary-600 cursor-pointer hover:underline">
                    مشاهده متن انگلیسی
                  </summary>
                  <div className="mt-2 p-4 bg-stone-50 rounded-xl text-sm text-stone-700 max-h-40 overflow-auto whitespace-pre-wrap ltr" dir="ltr">
                    {translationModal.transcript_text}
                  </div>
                </details>
              )}
              <textarea
                value={persianText}
                onChange={(e) => setPersianText(e.target.value)}
                placeholder="ترجمه فارسی رو اینجا بذارید..."
                className="w-full h-60 px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
              />
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-start gap-3">
              <button
                onClick={handleTranslation}
                disabled={submittingTranslation || !persianText.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {submittingTranslation ? 'در حال ذخیره...' : 'ذخیره و روایت'}
              </button>
              <button
                onClick={() => setTranslationModal(null)}
                className="px-4 py-2 text-sm text-stone-600 hover:text-stone-800"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
