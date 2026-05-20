import api from './axios';
import type { ApiResponse, PagedResult, AnnouncementDto } from '../types';

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  module: string;
  category: string;
  isPublished: boolean;
}

export interface UpdateAnnouncementDto {
  title: string;
  content: string;
  category: string;
  isPublished: boolean;
}

export const announcementApi = {
  // ── PUBLIC MINISTRY ───────────────────────────────────────────────────────
  getAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    title?: string;
    category?: string;
    module?: string;
  }) =>
    api.get<ApiResponse<PagedResult<AnnouncementDto>>>(
      '/api/ministry/announcements', { params }
    ),

  getById: (id: number) =>
    api.get<ApiResponse<AnnouncementDto>>(
      `/api/ministry/announcements/${id}`
    ),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<AnnouncementDto>>(
      `/api/ministry/announcements/${slug}`
    ),

  // ── PUBLIC YOUTH ──────────────────────────────────────────────────────────
  getYouthAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    title?: string;
    category?: string;
  }) =>
    api.get<ApiResponse<PagedResult<AnnouncementDto>>>(
      '/api/youth/announcements', { params }
    ),

  getYouthById: (id: number) =>
    api.get<ApiResponse<AnnouncementDto>>(
      `/api/youth/announcements/${id}`
    ),

  // ── ADMIN ─────────────────────────────────────────────────────────────────
  adminGetAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    title?: string;
    module?: string;
    category?: string;
    isPublished?: boolean;
  }) =>
    api.get<ApiResponse<PagedResult<AnnouncementDto>>>(
      '/api/admin/announcements', { params }
    ),

  create: (dto: CreateAnnouncementDto) =>
    api.post<ApiResponse<AnnouncementDto>>('/api/admin/announcements', dto),

  update: (id: number, dto: UpdateAnnouncementDto) =>
    api.put<ApiResponse<AnnouncementDto>>(
      `/api/admin/announcements/${id}`, dto
    ),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/api/admin/announcements/${id}`),
};