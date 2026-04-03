import api from './axios';
import type { ApiResponse, CreatePrayerRequestDto, PrayerRequestDto } from '../types';

export const prayerApi = {
  // Public — submit a prayer request (works anonymous or logged in)
  create: (dto: CreatePrayerRequestDto) =>
    api.post<ApiResponse<PrayerRequestDto>>('/api/PrayerRequest', dto),

  // Public — track your own prayer request by anonymous token
  trackByToken: (token: string) =>
    api.get<ApiResponse<PrayerRequestDto>>(`/api/PrayerRequest/track/${token}`),

  // Admin only
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
    api.get<ApiResponse<{ items: PrayerRequestDto[]; totalCount: number }>>(
      '/api/admin/prayer-requests', { params }
    ),

  getById: (id: number) =>
    api.get<ApiResponse<PrayerRequestDto>>(`/api/admin/prayer-requests/${id}`),

  markAsAttended: (id: number, isAttendedTo: boolean) =>
    api.patch<ApiResponse<PrayerRequestDto>>(
      `/api/admin/prayer-requests/${id}/attend`, { isAttendedTo }
    ),

  hardDelete: (id: number) =>
  api.delete<ApiResponse<null>>(`/api/admin/prayer-requests/${id}/permanent`),
};