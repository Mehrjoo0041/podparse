import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AudioPlayerProvider } from './components/AudioPlayerProvider';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LibraryPage } from './pages/LibraryPage';
import { EpisodePage } from './pages/EpisodePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyLibraryPage } from './pages/MyLibraryPage';
import { useAuth } from './contexts/AuthContext';

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes — only for unauthenticated users */}
        {!user && (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </>
        )}

        {/* Protected routes — require login */}
        {user && (
          <>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/browse" element={<LibraryPage />} />
            <Route path="/episode/:id" element={<EpisodePage />} />
            <Route path="/my-library" element={<MyLibraryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </>
        )}

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AudioPlayerProvider>
          <AppRoutes />
        </AudioPlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
