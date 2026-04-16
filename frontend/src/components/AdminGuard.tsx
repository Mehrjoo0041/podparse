import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-stone-700 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return <Navigate to="/panel/login" replace />;
  }

  return <>{children}</>;
}
