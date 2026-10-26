import api from './client'

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; country?: string }) =>
    api.post('/auth/register', data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

// ── Jobs ─────────────────────────────────────────────────────────────────────
export const jobsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/jobs', { params }),
  show: (id: number) =>
    api.get(`/jobs/${id}`),
  save: (id: number) =>
    api.post(`/jobs/${id}/save`),
  unsave: (id: number) =>
    api.delete(`/jobs/${id}/save`),
  match: (id: number) =>
    api.get(`/jobs/${id}/match`),
}

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileApi = {
  show: () => api.get('/profile'),
  update: (data: Record<string, unknown>) => api.patch('/profile', data),
  updatePreferences: (data: Record<string, unknown>) => api.patch('/profile/preferences', data),
}

// ── Applications ──────────────────────────────────────────────────────────────
export const applicationsApi = {
  list: () => api.get('/applications'),
  show: (id: number) => api.get(`/applications/${id}`),
  store: (data: Record<string, unknown>) => api.post('/applications', data),
}

// ── Alerts ────────────────────────────────────────────────────────────────────
export const alertsApi = {
  list: () => api.get('/alerts'),
  store: (data: Record<string, unknown>) => api.post('/alerts', data),
  destroy: (id: number) => api.delete(`/alerts/${id}`),
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
}

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionsApi = {
  plans: () => api.get('/subscriptions/plans'),
  current: () => api.get('/subscriptions/current'),
  subscribe: (data: { plan_id: number; billing_period: string }) =>
    api.post('/subscriptions', data),
  cancel: () => api.post('/subscriptions/cancel'),
}

// ── Videos ───────────────────────────────────────────────────────────────────
export const videosApi = {
  list: (params?: Record<string, unknown>) => api.get('/videos', { params }),
  show: (id: number) => api.get(`/videos/${id}`),
  categories: () => api.get('/videos/categories'),
}

// ── Interview ─────────────────────────────────────────────────────────────────
export const interviewApi = {
  categories: () => api.get('/interview/categories'),
  questions: (params?: Record<string, unknown>) => api.get('/interview/questions', { params }),
  sessions: () => api.get('/interview/sessions'),
  startSession: (data: Record<string, unknown>) => api.post('/interview/sessions', data),
}

// ── Devices (push) ────────────────────────────────────────────────────────────
export const deviceApi = {
  register: (token: string, platform: string) =>
    api.post('/devices/register', { token, platform }),
}
