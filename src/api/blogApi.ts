import api from './axios';
import type {
  ApiResponse,
  BlogPostResponseDto,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  PagedResult,
  BlogQueryObject,
} from '../types';

const sanitizeParams = <T extends object>(params?: T): Partial<T> | undefined => {
  if (!params) return undefined;
  const sanitized = { ...params } as Partial<T>;
  (Object.keys(sanitized) as Array<keyof T>).forEach(key => {
    const value = sanitized[key];
    if (value === undefined || value === null || value === '') {
      delete sanitized[key];
    }
  });
  return sanitized;
};

export const blogApi = {
  createBlogPost: (dto: CreateBlogPostDto) =>
    api.post<ApiResponse<BlogPostResponseDto>>('/api/admin/blog', dto),

  getAllBlogPosts: (query?: BlogQueryObject) =>
    api.get<ApiResponse<PagedResult<BlogPostResponseDto>>>('/api/admin/blog', {
      params: sanitizeParams(query),
    }),

  getBlogPostById: (id: number) =>
    api.get<ApiResponse<BlogPostResponseDto>>(`/api/admin/blog/${id}`),

  updateBlogPost: (id: number, dto: UpdateBlogPostDto) =>
    api.put<ApiResponse<BlogPostResponseDto>>(`/api/admin/blog/${id}`, dto),

  deleteBlogPost: (id: number) =>
    api.delete<ApiResponse<null>>(`/api/admin/blog/${id}`),

  togglePublish: (id: number) =>
    api.patch<ApiResponse<BlogPostResponseDto>>(`/api/admin/blog/${id}/publish`),

  getPublishedPosts: (query?: BlogQueryObject) =>
    api.get<ApiResponse<PagedResult<BlogPostResponseDto>>>('/api/blog', {
      params: sanitizeParams(query),
    }),

  getBlogPostBySlug: (slug: string) =>
    api.get<ApiResponse<BlogPostResponseDto>>(`/api/blog/${slug}`),
};
