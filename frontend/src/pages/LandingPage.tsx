import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-[90vh] flex flex-col overflow-hidden">
      {/* Hero */}
      <div className="flex-1 relative flex items-center justify-center px-4">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-3xl text-center relative z-10">
          {/* Logo */}
          <div className="animate-fade-in-down">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg animate-pulse-glow">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-stone-900 mb-6 leading-tight animate-fade-in-up">
            پادکست‌ها رو
            <br />
            <span className="bg-gradient-to-l from-primary-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent animate-gradient">
              فارسی گوش کن
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-500 mb-10 max-w-lg mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            پادپارس پادکست‌های انگلیسی رو به فارسی روان ترجمه می‌کنه.
            <br className="hidden sm:block" />
            گوش بده، ذخیره کن و لذت ببر.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <Link
              to="/register"
              className="group px-8 py-4 bg-gradient-to-l from-primary-600 to-primary-500 text-white rounded-2xl text-sm font-bold hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
            >
              ثبت‌نام رایگان
              <svg className="w-4 h-4 inline-block mr-2 transition-transform group-hover:-translate-x-1 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-stone-700 rounded-2xl text-sm font-bold hover:bg-white transition-all border border-stone-200/80 hover:-translate-y-0.5"
            >
              ورود به حساب
            </Link>
          </div>

          {/* Floating badges */}
          <div className="mt-16 flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '800ms' }}>
            <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-stone-500 border border-stone-100 shadow-sm">
              ترجمه هوشمند
            </span>
            <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-stone-500 border border-stone-100 shadow-sm">
              صدای طبیعی
            </span>
            <span className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-stone-500 border border-stone-100 shadow-sm">
              رایگان
            </span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 pb-20 stagger-children">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="card-hover bg-white rounded-3xl p-8 border border-stone-100 shadow-sm text-center group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="font-bold text-stone-900 mb-2 text-lg">ترجمه حرفه‌ای</h3>
            <p className="text-sm text-stone-500 leading-relaxed">پادکست‌های انگلیسی با ترجمه طبیعی و روان فارسی</p>
          </div>

          <div className="card-hover bg-white rounded-3xl p-8 border border-stone-100 shadow-sm text-center group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <h3 className="font-bold text-stone-900 mb-2 text-lg">پخش‌کننده هوشمند</h3>
            <p className="text-sm text-stone-500 leading-relaxed">گوش بده با کنترل سرعت، بوکمارک و پخش‌کننده زیبا</p>
          </div>

          <div className="card-hover bg-white rounded-3xl p-8 border border-stone-100 shadow-sm text-center group">
            <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="font-bold text-stone-900 mb-2 text-lg">کتابخونه شخصی</h3>
            <p className="text-sm text-stone-500 leading-relaxed">ذخیره و لایک کن، مجموعه مورد علاقه‌ات رو بساز</p>
          </div>
        </div>
      </div>
    </div>
  );
}
