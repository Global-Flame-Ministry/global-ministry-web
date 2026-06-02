import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError
} from 'axios';
import { storage } from '../utils/storage';
import { getAccessToken, setAccessToken } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
        const res = await axios.post<{ isSuccess: boolean; data: { accessToken: string } | null }>(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (res.data.isSuccess && res.data.data?.accessToken) {
          setAccessToken(res.data.data.accessToken);
          original.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
          return api(original);
        }
      } catch {
        setAccessToken(null);
        storage.removeUser();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
