import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AudioPlayerBar } from './AudioPlayerBar';

export function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLink = (to: string, label: string, icon: React.ReactNode) => {
    const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
          active
            ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/20'
            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-stone-200/50 animate-fade-in-down" style={{ animationDuration: '0.3s' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="text-lg font-black text-stone-900">پادپارس</span>
          </Link>

          <nav className="flex items-center gap-1">
            {user ? (
              <>
                {navLink('/', 'کاوش',
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                {navLink('/my-library', 'کتابخونه',
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                )}
                {user.is_admin && navLink('/admin', 'مدیریت',
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}

                <div className="flex items-center gap-1 mr-2 pr-2 border-r border-stone-200/50">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center ring-2 ring-white shadow-sm">
                      <span className="text-xs font-bold text-primary-700">
                        {user.display_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:inline font-medium">{user.display_name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">خروج</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors rounded-xl hover:bg-stone-100"
                >
                  ورود
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-l from-primary-600 to-primary-500 text-white rounded-xl text-sm font-bold hover:from-primary-700 hover:to-primary-600 transition-all shadow-sm shadow-primary-500/20"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 page-enter">
        <Outlet />
      </main>

      {user && <AudioPlayerBar />}
    </div>
  );
}
