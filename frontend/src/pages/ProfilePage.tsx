import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../api/client';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const data: { display_name?: string; password?: string } = {};
      if (displayName.trim() && displayName.trim() !== user.display_name) {
        data.display_name = displayName.trim();
      }
      if (password) {
        data.password = password;
      }
      if (Object.keys(data).length === 0) {
        setMessage('تغییری برای ذخیره وجود نداره');
        setSaving(false);
        return;
      }
      await updateProfile(data);
      setPassword('');
      setMessage('پروفایل با موفقیت به‌روزرسانی شد');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'به‌روزرسانی ناموفق بود');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-stone-900 mb-1">پروفایل</h1>
      <p className="text-stone-500 mb-8">تنظیمات حساب کاربری</p>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">
              {user.display_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">{user.display_name}</h2>
            <p className="text-sm text-stone-500 ltr" dir="ltr">{user.email}</p>
            <p className="text-xs text-stone-400 mt-1">
              عضو از {new Date(user.created_at).toLocaleDateString('fa-IR')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {message && (
            <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl">{message}</div>
          )}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">نام نمایشی</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">رمز عبور جدید</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="خالی بذارید تا تغییر نکنه"
              minLength={6}
              className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </form>
      </div>

      <button
        onClick={logout}
        className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
      >
        خروج از حساب
      </button>
    </div>
  );
}
