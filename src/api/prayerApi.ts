import api from './axios';
import type {
  ApiResponse,
  CreatePrayerRequestDto,
  PrayerRequestDto,
  PagedResult,
} from '../types';

export const prayerApi = {
  // ── PUBLIC ────────────────────────────────────────────────────────────────

  // Submit a prayer request — works for both anonymous and logged-in users
  create: (dto: CreatePrayerRequestDto) =>
    api.post<ApiResponse<PrayerRequestDto>>('/api/PrayerRequest', dto),

  // Track your own prayer request by anonymous token
  trackByToken: (token: string) =>
    api.get<ApiResponse<PrayerRequestDto>>(
      `/api/PrayerRequest/track/${token}`
    ),

  // ── ADMIN ─────────────────────────────────────────────────────────────────

  getAll: (params?: {
    name?: string;
    isAttendedTo?: boolean;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    isDescending?: boolean;
    pageNumber?: number;
    pageSize?: number;
  }) =>
    api.get<ApiResponse<PagedResult<PrayerRequestDto>>>(
      '/api/admin/prayer-requests', { params }
    ),

  getById: (id: number) =>
    api.get<ApiResponse<PrayerRequestDto>>(
      `/api/admin/prayer-requests/${id}`
    ),

  markAsAttended: (id: number, isAttendedTo: boolean) =>
    api.patch<ApiResponse<PrayerRequestDto>>(
      `/api/admin/prayer-requests/${id}/attend`, { isAttendedTo }
    ),

  hardDelete: (id: number) =>
    api.delete<ApiResponse<null>>(
      `/api/admin/prayer-requests/${id}/permanent`
    ),
};