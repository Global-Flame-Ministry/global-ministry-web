import api from './axios';
import type { ApiResponse, PagedResult, CounsellingResponseDto } from '../types';

export interface CreateCounsellingDto {
  fullName: string;
  email: string;
  phoneNumber?: string;
  topic: string;
  message: string;
  preferredContact: 'Email' | 'Phone';
}

export const counsellingApi = {
  submit: (dto: CreateCounsellingDto) =>
    api.post<ApiResponse<CounsellingResponseDto>>(
      '/api/ministry/counselling', dto
    ),

  adminGetAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    fullName?: string;
    email?: string;
    status?: number;
  }) =>
    api.get<ApiResponse<PagedResult<CounsellingResponseDto>>>(
      '/api/admin/counselling', { params }
    ),

  adminGetById: (id: number) =>
    api.get<ApiResponse<CounsellingResponseDto>>(
      `/api/admin/counselling/${id}`
    ),

  assign: (id: number, dto: { assignedTo: string; assignedToEmail: string }) =>
    api.put<ApiResponse<CounsellingResponseDto>>(
      `/api/admin/counselling/${id}/assign`, dto
    ),

  updateStatus: (id: number, status: number) =>
    api.put<ApiResponse<CounsellingResponseDto>>(
      `/api/admin/counselling/${id}/status`, { status }
    ),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(
      `/api/admin/counselling/${id}`
    ),
};