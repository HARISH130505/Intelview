import axios from "axios";
import { API_URL } from "@/lib/utils";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    // Token managed by Clerk - attach from session
    try {
      const { Clerk } = window as any;
      if (Clerk?.session) {
        const token = await Clerk.session.getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
  }
  return config;
});

// ============================================================
// API Service Functions
// ============================================================

// Analytics
export const analyticsAPI = {
  getOverview: () => api.get("/analytics/overview").then((r) => r.data),
  getTrending: () => api.get("/analytics/trending").then((r) => r.data),
  getTopics: () => api.get("/analytics/topics").then((r) => r.data),
};

// Companies
export const companiesAPI = {
  getAll: (params?: any) => api.get("/companies", { params }).then((r) => r.data),
  getTrending: () => api.get("/companies/trending").then((r) => r.data),
  getBySlug: (slug: string) => api.get(`/companies/${slug}`).then((r) => r.data),
  getAnalytics: (slug: string) => api.get(`/companies/${slug}/analytics`).then((r) => r.data),
  getReports: (slug: string, params?: any) => api.get(`/companies/${slug}/reports`, { params }).then((r) => r.data),
};

// Questions
export const questionsAPI = {
  getAll: (params?: any) => api.get("/questions", { params }).then((r) => r.data),
  getTrending: (limit?: number) => api.get("/questions/trending", { params: { limit } }).then((r) => r.data),
  getById: (id: string) => api.get(`/questions/${id}`).then((r) => r.data),
};

// Reports
export const reportsAPI = {
  getAll: (params?: any) => api.get("/reports", { params }).then((r) => r.data),
  getById: (id: string) => api.get(`/reports/${id}`).then((r) => r.data),
  submit: (data: any) => api.post("/reports", data).then((r) => r.data),
  markHelpful: (id: string) => api.post(`/reports/${id}/helpful`).then((r) => r.data),
};

// Resume
export const resumeAPI = {
  upload: (formData: FormData) =>
    api.post("/resume/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  getHistory: () => api.get("/resume/history").then((r) => r.data),
  getAnalysis: (id: string) => api.get(`/resume/analysis/${id}`).then((r) => r.data),
};

// Planner
export const plannerAPI = {
  generate: (data: any) => api.post("/planner/generate", data).then((r) => r.data),
  getAll: () => api.get("/planner").then((r) => r.data),
  getById: (id: string) => api.get(`/planner/${id}`).then((r) => r.data),
  updateProgress: (id: string, progress: number) =>
    api.patch(`/planner/${id}/progress`, { progress }).then((r) => r.data),
};

// Mock Interview
export const mockAPI = {
  start: (data: any) => api.post("/mock/start", data).then((r) => r.data),
  submitAnswer: (sessionId: string, data: any) =>
    api.post(`/mock/${sessionId}/answer`, data).then((r) => r.data),
  complete: (sessionId: string) => api.post(`/mock/${sessionId}/complete`).then((r) => r.data),
  getReport: (sessionId: string) => api.get(`/mock/${sessionId}/report`).then((r) => r.data),
  getSessions: () => api.get("/mock").then((r) => r.data),
};

// Bookmarks
export const bookmarksAPI = {
  getAll: () => api.get("/bookmarks").then((r) => r.data),
  add: (data: any) => api.post("/bookmarks", data).then((r) => r.data),
  remove: (id: string) => api.delete(`/bookmarks/${id}`).then((r) => r.data),
};

// Search
export const searchAPI = {
  search: (q: string, type?: string) =>
    api.get("/search", { params: { q, type } }).then((r) => r.data),
};

// Profile
export const profileAPI = {
  get: () => api.get("/profile").then((r) => r.data),
  sync: (data: any) => api.post("/profile/sync", data).then((r) => r.data),
  update: (data: any) => api.put("/profile", data).then((r) => r.data),
  getStats: () => api.get("/profile/stats").then((r) => r.data),
};

// Admin
export const adminAPI = {
  getStats: () => api.get("/admin/stats").then((r) => r.data),
  getPendingReports: (page?: number) =>
    api.get("/admin/reports/pending", { params: { page } }).then((r) => r.data),
  approveReport: (id: string) => api.put(`/admin/reports/${id}/approve`).then((r) => r.data),
  rejectReport: (id: string) => api.put(`/admin/reports/${id}/reject`).then((r) => r.data),
  getUsers: (page?: number) => api.get("/admin/users", { params: { page } }).then((r) => r.data),
  createCompany: (data: any) => api.post("/admin/companies", data).then((r) => r.data),
};

export default api;
