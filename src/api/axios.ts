import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError
} from 'axios';
import { storage } from '../utils/storage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
});

api.interceptors.response.use(
  (res: AxiosResponse) => {
    if (res.status === 204) return res;
    return res;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const isAuthEndpoint =
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/refresh') ||
      original.url?.includes('/auth/logout');
    if (isAuthEndpoint) return Promise.reject(error);

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.post<{ success: boolean }>(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (res.data.success) {
          return api(original);
        }
      } catch {
        storage.removeUser();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
