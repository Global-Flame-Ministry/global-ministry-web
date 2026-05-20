import api from './axios';
import type { ApiResponse, PagedResult, BookDto, CreateBookDto, UpdateBookDto } from '../types';

export const bookApi = {
  // ── PUBLIC ─────────────────────────────────────────────────────────────────
  // Used by BookStore.tsx — only returns published books
  getPublished: (params?: { pageNumber?: number; pageSize?: number }) =>
    api.get<ApiResponse<PagedResult<BookDto>>>('/api/ministry/books', {
      params: { ...params, isPublished: true },
    }),

  getFeatured: (params?: { pageNumber?: number; pageSize?: number }) =>
    api.get<ApiResponse<PagedResult<BookDto>>>('/api/ministry/books', {
      params: { ...params, isFeatured: true, isPublished: true },
    }),

  getById: (id: number) =>
    api.get<ApiResponse<BookDto>>(`/api/ministry/books/${id}`),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<BookDto>>(`/api/ministry/books/${slug}`),

  // ── ADMIN ──────────────────────────────────────────────────────────────────
  adminGetAll: (params?: {
    pageNumber?: number;
    pageSize?: number;
    title?: string;
    author?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    sortBy?: string;
    isDescending?: boolean;
  }) =>
    api.get<ApiResponse<PagedResult<BookDto>>>('/api/admin/books', { params }),

  adminGetById: (id: number) =>
    api.get<ApiResponse<BookDto>>(`/api/admin/books/${id}`),

  create: (dto: CreateBookDto) =>
    api.post<ApiResponse<BookDto>>('/api/admin/books', sanitizeBookDto(dto)),

  update: (id: number, dto: UpdateBookDto) =>
    api.put<ApiResponse<BookDto>>(`/api/admin/books/${id}`, sanitizeBookDto(dto)),

  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/api/admin/books/${id}`),
};

// ─── HELPER ────────────────────────────────────────────────────────────────────
const sanitizeBookDto = <T extends CreateBookDto | UpdateBookDto>(dto: T): T => ({
  ...dto,
  amazonUrl:     dto.amazonUrl?.trim()     || null,
  selarUrl:      dto.selarUrl?.trim()      || null,
  coverImageUrl: dto.coverImageUrl?.trim() || null,
  description:   dto.description?.trim()   || null,
});