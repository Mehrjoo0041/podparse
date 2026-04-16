import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-[90vh] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4 leading-tight">
            Listen to podcasts<br />
            <span className="text-primary-600">in Persian</span>
          </h1>

          <p className="text-lg text-stone-500 mb-8 max-w-lg mx-auto leading-relaxed">
            PodParse translates English podcasts into natural Persian audio.
            Browse, listen, save your favorites, and build your personal library.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white text-stone-700 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-colors border border-stone-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-900 mb-1">Translated</h3>
            <p className="text-sm text-stone-500">English podcasts translated to natural Persian</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-900 mb-1">Audio Player</h3>
            <p className="text-sm text-stone-500">Listen with a built-in player and speed controls</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-stone-900 mb-1">Your Library</h3>
            <p className="text-sm text-stone-500">Save and like episodes to build your collection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
