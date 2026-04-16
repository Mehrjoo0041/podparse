import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitUrl } from '../../api/client';

export function AddContentPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [voice, setVoice] = useState('dilara');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSubmitting(true);
    try {
      await submitUrl({ url: url.trim(), title: title.trim() || undefined, voice });
      navigate('/panel/episodes');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ارسال ناموفق بود');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">افزودن محتوای جدید</h1>

      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">لینک پادکست *</label>
            <input
              type="text" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="RSS، یوتیوب یا لینک مستقیم صوتی"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ltr" dir="ltr"
              required
            />
            <p className="text-xs text-stone-400 mt-1.5">فرمت‌های پشتیبانی‌شده: RSS Feed، YouTube، لینک مستقیم MP3</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">عنوان (اختیاری)</label>
            <input
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="برای RSS خودکار از فید خوانده میشه"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">صدای روایت</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setVoice('dilara')}
                className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${voice === 'dilara' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                <span className="text-lg block mb-1">👩</span>
                دیلارا (زن)
              </button>
              <button type="button" onClick={() => setVoice('farid')}
                className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${voice === 'farid' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}>
                <span className="text-lg block mb-1">👨</span>
                فرید (مرد)
              </button>
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-l from-primary-600 to-primary-500 text-white rounded-xl text-sm font-bold hover:from-primary-700 hover:to-primary-600 transition-all disabled:opacity-50 shadow-sm shadow-primary-500/20">
            {submitting ? 'در حال پردازش...' : 'شروع پردازش خودکار'}
          </button>
          <p className="text-xs text-stone-400 text-center">
            دانلود → رونویسی → تحلیل و ترجمه با هوش مصنوعی → روایت صوتی
          </p>
        </form>
      </div>
    </div>
  );
}
