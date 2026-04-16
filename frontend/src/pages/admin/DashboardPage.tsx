import { useEffect, useState, useCallback } from 'react';
import { fetchDashboard, type DashboardData } from '../../api/client';

function StatCard({ label, value, sub, icon, color }: {
  label: string; value: number | string; sub?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/60 p-5 card-hover shadow-sm">
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

export function DashboardPage() {
  const [d, setDashboard] = useState<DashboardData | null>(null);

  const load = useCallback(() => {
    fetchDashboard().then(setDashboard).catch(console.error);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (!d) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const maxDaily = Math.max(...d.daily_listens.map(x => x.count), 1);

  return (
    <div className="space-y-6 stagger-children">
      <h1 className="text-2xl font-bold text-stone-900">داشبورد</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="کل کاربران" value={d.users.total} sub={`${d.users.new_week} نفر این هفته`} color="bg-blue-50"
          icon={<svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard label="اپیزودهای آماده" value={d.episodes.done} sub={`از ${d.episodes.total} اپیزود`} color="bg-green-50"
          icon={<svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
        />
        <StatCard label="کل شنیده‌شده" value={d.engagement.total_listens} sub={`${d.engagement.listens_week} این هفته`} color="bg-purple-50"
          icon={<svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
        />
        <StatCard label="نرخ تکمیل" value={`${d.engagement.completion_rate}%`} sub={`${d.engagement.completed_listens} بار تا آخر`} color="bg-amber-50"
          icon={<svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily listens */}
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
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
        <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
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
      <div className="bg-white rounded-2xl border border-stone-200/60 p-6 shadow-sm">
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
  );
}
