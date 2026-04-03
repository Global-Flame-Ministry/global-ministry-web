import api from './axios';
import type {ApiResponse, PagedResult, MinistryResponseDto, CreateMinistryDto, UpdateMinistryDto, EventDto,
} from '../types';

export const ministryApi = {
  
    // PUBLIC 
  getAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    sortBy?: string;
    isDescending?: boolean;
  }) =>
    api.get<ApiResponse<PagedResult<MinistryResponseDto>>>(
      '/api/ministry/ministries', { params }),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<MinistryResponseDto>>(
      `/api/ministry/ministries/${slug}`),

  getMinistryEvents: (slug: string, params?: {
    pageNumber?: number;
    pageSize?: number;
    upcomingOnly?: boolean;
    ongoingOnly?: boolean;
    pastOnly?: boolean;
    isCancelled?: boolean;
  }) =>
    api.get<ApiResponse<PagedResult<EventDto>>>(
      `/api/ministry/ministries/${slug}/events`, { params }),

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  adminGetAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    isPublished?: boolean;
    sortBy?: string;
    isDescending?: boolean;
  }) =>
    api.get<ApiResponse<PagedResult<MinistryResponseDto>>>(
      '/api/admin/ministries', { params }),

  adminGetById: (id: number) =>
    api.get<ApiResponse<MinistryResponseDto>>(
      `/api/admin/ministries/${id}`),

  create: (dto: CreateMinistryDto) =>
    api.post<ApiResponse<MinistryResponseDto>>(
      '/api/admin/ministries', dto),

  update: (id: number, dto: UpdateMinistryDto) =>
    api.put<ApiResponse<MinistryResponseDto>>(
      `/api/admin/ministries/${id}`, dto),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(
      `/api/admin/ministries/${id}`),
};