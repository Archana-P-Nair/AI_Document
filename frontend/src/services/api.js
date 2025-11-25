import axios from 'axios';

const API_BASE_URL = 'https://ai-document-backend-ten.vercel.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getCurrentUser: () => api.get('/api/auth/me'),
};

// Project APIs
export const projectAPI = {
  create: (data) => api.post('/api/projects/', data),
  getAll: () => api.get('/api/projects/'),
  getById: (id) => api.get(`/api/projects/${id}`),
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  delete: (id) => api.delete(`/api/projects/${id}`),
};

// Document APIs
export const documentAPI = {
  generateSectionContent: (section_id) => 
    api.post('/api/documents/generate-section-content', { section_id }),
  
  generateAllContent: (project_id) => 
    api.post(`/api/documents/generate-all-content/${project_id}`),
  
  refineSectionContent: (section_id, prompt) => 
    api.post('/api/documents/refine-section-content', { section_id, prompt }),
  
  addFeedback: (section_id, feedback_type, comment = null) => 
    api.post('/api/documents/feedback', { section_id, feedback_type, comment }),
  
  exportDocument: (project_id) => 
    api.get(`/api/documents/export/${project_id}`, { responseType: 'blob' }),
};

// Export API_BASE_URL as named export if needed
export { API_BASE_URL };

// Export axios instance as named export
export { api };
