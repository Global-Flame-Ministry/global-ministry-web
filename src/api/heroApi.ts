import api from './axios';
import type { ApiResponse, CreateHeroSlideDto, HeroSlide, UpdateHeroSlideDto } from '../types';

export const heroApi = {
  getActiveSlides: () =>
    api.get<ApiResponse<HeroSlide[]>>('/api/media/hero'),

  getClips: () =>
    api.get<ApiResponse<HeroSlide[]>>('/api/media/clips'),

  getFeaturedClips: () =>
    api.get<ApiResponse<HeroSlide[]>>('/api/media/clips/featured'),

  getClipBySlug: (slug: string) =>
    api.get<ApiResponse<HeroSlide>>(`/api/media/clips/${slug}`),

  getAllSlides: () =>
    api.get<ApiResponse<HeroSlide[]>>('/api/ministry/hero-slides'),

  getSlideById: (id: number) =>
    api.get<ApiResponse<HeroSlide>>(`/api/ministry/hero-slides/${id}`),

  createSlide: (dto: CreateHeroSlideDto) =>
    api.post<ApiResponse<HeroSlide>>('/api/ministry/hero-slides', dto),

  updateSlide: (id: number, dto: UpdateHeroSlideDto) =>
    api.put<ApiResponse<HeroSlide>>(`/api/ministry/hero-slides/${id}`, dto),

  deleteSlide: (id: number) =>
    api.delete<ApiResponse<null>>(`/api/ministry/hero-slides/${id}`),
};