import api from './axios';
import type {
  ApiResponse,
  PagedResult,
  SendBulkEmailDto,
  BulkEmailResponseDto,
  BulkEmailStatsDto,
} from '../types';

export const bulkEmailApi = {
  // POST /api/admin/bulk-email/send
  sendNow: (dto: SendBulkEmailDto) =>
    api.post<ApiResponse<BulkEmailResponseDto>>(
      '/api/admin/bulk-email/send', dto),

  // POST /api/admin/bulk-email/schedule
  schedule: (dto: SendBulkEmailDto) =>
    api.post<ApiResponse<BulkEmailResponseDto>>(
      '/api/admin/bulk-email/schedule', dto),

  // GET /api/admin/bulk-email/history
  getHistory: (params?: {
    pageNumber?: number;
    pageSize?: number;
    subject?: string;
    status?: string;
    targetGroup?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    isDescending?: boolean;
  }) =>
    api.get<ApiResponse<PagedResult<BulkEmailResponseDto>>>(
      '/api/admin/bulk-email/history', { params }),

  // GET /api/admin/bulk-email/stats
  getStats: () =>
    api.get<ApiResponse<BulkEmailStatsDto>>(
      '/api/admin/bulk-email/stats'),

  // DELETE /api/admin/bulk-email/{id}
  cancel: (id: number) =>
    api.delete<ApiResponse<null>>(
      `/api/admin/bulk-email/${id}`),
};