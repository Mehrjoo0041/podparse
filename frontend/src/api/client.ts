const API_URL = import.meta.env.VITE_API_URL || '';
const BASE = `${API_URL}/api`;

// ---- Types ----

export interface Episode {
  id: number;
  title: string;
  source_url: string;
  source_type: string;
  status: string;
  error_message?: string | null;
  original_audio_path?: string | null;
  transcript_text?: string | null;
  persian_text?: string | null;
  narrated_audio_path?: string | null;
  podcast_name?: string | null;
  published_date?: string | null;
  summary?: string | null;
  duration_seconds?: number | null;
  voice: string;
  whisper_model: string;
  cover_color: string;
  created_at: string;
  updated_at: string;
  is_saved?: boolean | null;
  is_liked?: boolean | null;
}

export interface PaginatedEpisodes {
  items: Episode[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface SubmitRequest {
  url: string;
  title?: string;
  voice?: string;
  whisper_model?: string;
  category?: string;
}

export interface Category {
  name: string;
  count: number;
}

export interface UserProfile {
  id: number;
  email: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ---- Token management ----

const TOKEN_KEY = 'podparse_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---- Request helper ----

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { headers, ...options });

  if (res.status === 401) {
    clearToken();
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

// ---- Auth ----

export function register(email: string, display_name: string, password: string): Promise<TokenResponse> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, display_name, password }),
  });
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function fetchMe(): Promise<UserProfile> {
  return request('/auth/me');
}

export function updateProfile(data: { display_name?: string; password?: string }): Promise<UserProfile> {
  return request('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ---- Episodes ----

export function fetchEpisodes(page = 1, search = '', category = ''): Promise<PaginatedEpisodes> {
  const params = new URLSearchParams({ page: String(page), per_page: '12' });
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  return request(`/episodes?${params}`);
}

export function fetchRecentEpisodes(): Promise<PaginatedEpisodes> {
  return request('/episodes/recent?per_page=12');
}

export function fetchCategories(): Promise<Category[]> {
  return request('/episodes/categories');
}

export function fetchEpisode(id: number): Promise<Episode> {
  return request(`/episodes/${id}`);
}

// ---- Admin ----

export function fetchAdminEpisodes(page = 1): Promise<PaginatedEpisodes> {
  return request(`/admin/episodes?page=${page}&per_page=20`);
}

export function submitUrl(data: SubmitRequest): Promise<Episode> {
  return request('/admin/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function submitTranslation(id: number, persian_text: string): Promise<Episode> {
  return request(`/admin/episodes/${id}/translation`, {
    method: 'PATCH',
    body: JSON.stringify({ persian_text }),
  });
}

export function retryEpisode(id: number): Promise<Episode> {
  return request(`/admin/episodes/${id}/retry`, { method: 'POST' });
}

// ---- Library (saved/liked) ----

export function fetchSavedEpisodes(page = 1): Promise<PaginatedEpisodes> {
  return request(`/library/saved?page=${page}&per_page=12`);
}

export function fetchLikedEpisodes(page = 1): Promise<PaginatedEpisodes> {
  return request(`/library/liked?page=${page}&per_page=12`);
}

export function saveEpisode(id: number): Promise<void> {
  return request(`/library/saved/${id}`, { method: 'POST' });
}

export function unsaveEpisode(id: number): Promise<void> {
  return request(`/library/saved/${id}`, { method: 'DELETE' });
}

export function likeEpisode(id: number): Promise<void> {
  return request(`/library/liked/${id}`, { method: 'POST' });
}

export function unlikeEpisode(id: number): Promise<void> {
  return request(`/library/liked/${id}`, { method: 'DELETE' });
}

// ---- Analytics ----

export function recordListen(episodeId: number, completed: boolean, listenedSeconds: number): Promise<void> {
  return request(`/analytics/listen?episode_id=${episodeId}&completed=${completed}&listened_seconds=${listenedSeconds}`, {
    method: 'POST',
  });
}

export interface DashboardData {
  users: {
    total: number;
    new_week: number;
    new_month: number;
    admins: number;
    active_week: number;
    active_month: number;
    with_saves: number;
    with_likes: number;
  };
  episodes: {
    total: number;
    done: number;
    processing: number;
    error: number;
  };
  engagement: {
    total_listens: number;
    listens_week: number;
    completed_listens: number;
    completion_rate: number;
    total_saves: number;
    total_likes: number;
  };
  top_episodes: Array<{
    id: number;
    title: string;
    cover_color: string;
    listens: number;
    completed: number;
  }>;
  recent_users: Array<{
    id: number;
    display_name: string;
    email: string;
    created_at: string;
  }>;
  daily_listens: Array<{
    date: string;
    count: number;
  }>;
}

export function fetchDashboard(): Promise<DashboardData> {
  return request('/analytics/dashboard');
}
