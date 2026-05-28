import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError
} from 'axios';
import { storage } from '../utils/storage';

// Change this one URL and everything updates automatically
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Attach JWT to every request automatically
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh token on 401
api.interceptors.response.use(
  (res: AxiosResponse) => {
    if (res.status === 204) return res;
    return res;
  },
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const user = storage.getUser();
        const refreshToken = storage.getRefreshToken();

        if (user && refreshToken) {
          const res = await axios.post<{ data: string }>(
            `${BASE_URL}/api/auth/refresh-token`,  // ✅ uses constant
            { email: user.email, refreshToken }
          );

          const newToken = res.data.data;
          storage.setToken(newToken);
          original.headers.Authorization = `Bearer ${newToken}`;

          return api(original);
        }
      } catch {
        storage.clearAll();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;