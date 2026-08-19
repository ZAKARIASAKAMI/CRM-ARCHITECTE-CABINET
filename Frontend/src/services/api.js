import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add Bearer Token to request headers if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("crm_access_token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("crm_access_token");
      localStorage.removeItem("crm_user");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/auth/sign-in") {
        window.location.href = "/auth/sign-in";
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/login", { email, password });
    const token = response.data.token || response.data.access_token;
    if (token) {
      localStorage.setItem("crm_access_token", token);
      localStorage.setItem("crm_user", JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: async () => {
    try {
      await api.post("/logout");
    } catch (e) {
      console.warn("Logout error", e);
    } finally {
      localStorage.removeItem("crm_access_token");
      localStorage.removeItem("crm_user");
      window.location.href = "/auth/sign-in";
    }
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem("crm_user");
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },
};

export const dashboardService = {
  getStats: () => api.get("/dashboard/stats"),
};

export const prospectsService = {
  getAll: () => api.get("/prospects"),
  getOne: (id) => api.get(`/prospects/${id}`),
  create: (data) => api.post("/prospects", data),
  update: (id, data) => api.put(`/prospects/${id}`, data),
  delete: (id) => api.delete(`/prospects/${id}`),
  convert: (id, data) => api.post(`/prospects/${id}/convert`, data),
  getStatuses: () => api.get("/prospects-statuses"),
  getSources: () => api.get("/prospect-sources"),
};

export const clientsService = {
  getAll: (params) => api.get("/clients", { params }),
  getOne: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post("/clients", data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

export const projectsService = {
  getAll: (params) => api.get("/projects", { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStatuses: () => api.get("/project-statuses"),
  getTypes: () => api.get("/project-types"),
};

export const tasksService = {
  getAll: (params) => api.get("/tasks", { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  getStatuses: () => api.get("/task-statuses"),
};

export const documentsService = {
  getAll: (params) => api.get("/documents", { params }),
  create: (data) => api.post("/documents", data),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const eventsService = {
  getAll: () => api.get("/events"),
  create: (data) => api.post("/events", data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export const usersService = {
  getList: () => api.get("/users-list"),
  getAll: () => api.get("/users"),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const rolesService = {
  getAll: () => api.get("/roles"),
  getOne: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post("/roles", data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  delete: (id) => api.delete(`/roles/${id}`),
  getPermissions: () => api.get("/permissions"),
};

export default api;
