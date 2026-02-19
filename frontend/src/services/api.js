import axios from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Token 过期，尝试刷新
      if (status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const response = await axios.post('/api/users/token/refresh/', {
              refresh: refreshToken,
            });
            const { access } = response.data;
            localStorage.setItem('access_token', access);

            // 重试原请求
            error.config.headers.Authorization = `Bearer ${access}`;
            return axios(error.config);
          } catch (refreshError) {
            // 刷新失败，清除 Token 并跳转登录
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        } else {
          window.location.href = '/login';
        }
      }

      // 显示错误信息
      const errorMsg = data?.error || data?.detail || '请求失败';
      message.error(errorMsg);
    } else {
      message.error('网络错误，请检查连接');
    }

    return Promise.reject(error);
  }
);

// API 方法
export const authAPI = {
  login: (data) => api.post('/users/login/', data),
  register: (data) => api.post('/users/register/', data),
  logout: (refreshToken) => api.post('/users/logout/', { refresh: refreshToken }),
  getCurrentUser: () => api.get('/users/me/'),
  updateProfile: (data) => api.put('/users/profile/', data),
  changePassword: (data) => api.post('/users/change-password/', data),
};

export const newsAPI = {
  getArticles: (params) => api.get('/news/', { params }),
  getArticle: (id) => api.get(`/news/${id}/`),
  getCategories: () => api.get('/news/categories/'),
};

export const contestsAPI = {
  getContests: () => api.get('/contests/'),
  getContest: (id) => api.get(`/contests/${id}/`),
  getCategories: (contestId) => api.get(`/contests/${contestId}/categories/`),
  submitWork: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return api.post('/contests/submissions/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMySubmissions: () => api.get('/contests/my-submissions/'),
  getSubmission: (id) => api.get(`/contests/submissions/${id}/`),
  downloadFile: (id) => {
    return axios.get(`/api/contests/submissions/${id}/download/`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
  },
};

export const reviewsAPI = {
  getMyAssignments: () => api.get('/reviews/my-assignments/'),
  getAssignment: (id) => api.get(`/reviews/assignments/${id}/`),
  getScoreDimensions: (contestId) => api.get(`/reviews/contests/${contestId}/dimensions/`),
  submitReview: (data) => api.post('/reviews/submit/', data),
  getMyReview: (assignmentId) => api.get(`/reviews/assignments/${assignmentId}/review/`),
  updateReview: (assignmentId, data) => api.put(`/reviews/assignments/${assignmentId}/review/update/`, data),
};

export default api;
