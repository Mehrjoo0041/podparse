import { useAuth } from '../contexts/AuthContext';
import { LandingPage } from './LandingPage';
import { LibraryPage } from './LibraryPage';

export function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <LibraryPage /> : <LandingPage />;
}
