import api from './axios';
import type { ApiResponse, PagedResult, SermonDto } from '../types';

export interface CreateSermonDto {
  title: string;
  speaker: string;
  series: string;
  theme?: string; 
  description: string;
  speakerImageUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  sermonDate: string;
  isPublished: boolean;
  isFeatured: boolean;
  category: 'Conference' | 'PowerService' | 'MorningGlory';
}

export interface UpdateSermonDto {
  title: string;
  speaker: string;
  series: string;
   theme?: string; 
  description: string;
  speakerImageUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  sermonDate: string;
  isPublished: boolean;
  isFeatured: boolean;
  category: 'Conference' | 'PowerService' | 'MorningGlory';
}

export const sermonApi = {
  // ── Public ────────────────────────────────────────────────────────────────
  getAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    title?: string;
    speaker?: string;
    series?: string;
    isFeatured?: boolean;
    category?: 'Conference' | 'PowerService' | 'MorningGlory';
  }) =>
    api.get<ApiResponse<PagedResult<SermonDto>>>('/api/ministry/sermons', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<SermonDto>>(`/api/ministry/sermons/${id}`),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<SermonDto>>(`/api/ministry/sermons/${slug}`),

  // ── Admin ─────────────────────────────────────────────────────────────────
  adminGetAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    title?: string;
    series?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    category?: 'Conference' | 'PowerService' | 'MorningGlory';
  }) =>
    api.get<ApiResponse<PagedResult<SermonDto>>>('/api/admin/sermons', { params }),

  create: (dto: CreateSermonDto) =>
    api.post<ApiResponse<SermonDto>>('/api/admin/sermons', dto),

  update: (id: number, dto: UpdateSermonDto) =>
    api.put<ApiResponse<SermonDto>>(`/api/admin/sermons/${id}`, dto),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/api/admin/sermons/${id}`),

  toggleFeatured: (id: number) =>
    api.put<ApiResponse<SermonDto>>(`/api/admin/sermons/${id}/toggle-featured`),
};