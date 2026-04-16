import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AudioPlayerProvider } from './components/AudioPlayerProvider';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { AdminGuard } from './components/AdminGuard';
import { AuthGuard } from './components/AuthGuard';
import { GuestGuard } from './components/AuthGuard';
import { HomePage } from './pages/HomePage';
import { EpisodePage } from './pages/EpisodePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyLibraryPage } from './pages/MyLibraryPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { EpisodesPage } from './pages/admin/EpisodesPage';
import { AddContentPage } from './pages/admin/AddContentPage';
import { UsersPage } from './pages/admin/UsersPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AudioPlayerProvider>
          <Routes>
            {/* Admin panel — separate layout */}
            <Route path="/panel" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index element={<DashboardPage />} />
              <Route path="episodes" element={<EpisodesPage />} />
              <Route path="add" element={<AddContentPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>

            {/* Main app */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
              <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
              <Route path="/episode/:id" element={<AuthGuard><EpisodePage /></AuthGuard>} />
              <Route path="/my-library" element={<AuthGuard><MyLibraryPage /></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AudioPlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
