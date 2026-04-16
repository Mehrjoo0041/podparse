import { useEffect, useState } from 'react';
import { fetchDashboard, type DashboardData } from '../../api/client';

export function UsersPage() {
  const [d, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetchDashboard().then(setDashboard).catch(console.error);
  }, []);

  if (!d) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">کاربران</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm">
          <p className="text-2xl font-bold text-stone-900">{d.users.total}</p>
          <p className="text-sm text-stone-500">کل کاربران</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{d.users.new_week}</p>
          <p className="text-sm text-stone-500">جدید این هفته</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{d.users.active_week}</p>
          <p className="text-sm text-stone-500">فعال این هفته</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm">
          <p className="text-2xl font-bold text-purple-600">{d.users.with_saves}</p>
          <p className="text-sm text-stone-500">با ذخیره فعال</p>
        </div>
      </div>

      {/* Recent users list */}
      <div className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
          <h2 className="font-semibold text-stone-900">آخرین کاربران ثبت‌نام‌شده</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {d.recent_users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-700">{u.display_name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stone-900">{u.display_name}</p>
                <p className="text-xs text-stone-400 ltr" dir="ltr">{u.email}</p>
              </div>
              <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
                {u.created_at ? new Date(u.created_at).toLocaleDateString('fa-IR') : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
