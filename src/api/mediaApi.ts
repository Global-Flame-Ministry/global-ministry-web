import api from './axios';
import type { ApiResponse } from '../types';

export interface MediaUploadResult {
  url: string;
  publicId: string;
  resourceType?: string;
  format?: string;
  duration?: number | null;
  bytes?: number | null;
  width?: number | null;
  height?: number | null;
  pageCount?: number | null;
}

export const mediaApi = {
  uploadFile: (
    file: File,
    folder?: string,
    onProgress?: (percent: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    return api.post<ApiResponse<MediaUploadResult>>(
      '/api/media/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      }
    );
  },
};