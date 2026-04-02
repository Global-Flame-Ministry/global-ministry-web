import api from './axios';
import type { ApiResponse, PagedResult, EventDto } from '../types';

export interface CreateEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
  module: string;
  ministryId?: number | null;
  acceptsRegistrations: boolean;
  acceptsDonations: boolean;
  donationLabel?: string;
}

export interface UpdateEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
  isCancelled: boolean;
  ministryId?: number | null;
  acceptsRegistrations: boolean;
  acceptsDonations: boolean;
  donationLabel?: string;
}

export const eventApi = {
  getUpcoming: (params?: { pageNumber?: number; pageSize?: number }) =>
    api.get<ApiResponse<PagedResult<EventDto>>>('/api/ministry/events', {
      params: { ...params, upcomingOnly: true, isCancelled: false }
    }),

  getOngoing: (params?: { pageNumber?: number; pageSize?: number }) =>
    api.get<ApiResponse<PagedResult<EventDto>>>('/api/ministry/events', {
      params: { ...params, ongoingOnly: true, isCancelled: false }
    }),

  getPast: (params?: { pageNumber?: number; pageSize?: number }) =>
    api.get<ApiResponse<PagedResult<EventDto>>>('/api/ministry/events', {
      params: { ...params, pastOnly: true, sortBy: 'startdate', isDescending: true }
    }),

  getAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    module?: string;
    upcomingOnly?: boolean;
    isCancelled?: boolean;
  }) =>
    api.get<ApiResponse<PagedResult<EventDto>>>('/api/ministry/events', { params }),

  getById: (id: number) =>
    api.get<ApiResponse<EventDto>>(`/api/ministry/events/${id}`),

  adminGetAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    title?: string;
    module?: string;
    location?: string;
    isCancelled?: boolean;
  }) =>
    api.get<ApiResponse<PagedResult<EventDto>>>('/api/admin/events', { params }),

  create: (dto: CreateEventDto) =>
    api.post<ApiResponse<EventDto>>('/api/admin/events', dto),

  update: (id: number, dto: UpdateEventDto) =>
    api.put<ApiResponse<EventDto>>(`/api/admin/events/${id}`, dto),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/api/admin/events/${id}`),
};