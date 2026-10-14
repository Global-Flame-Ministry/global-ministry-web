import axios from 'axios';
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

interface UploadConfig {
  cloudName: string;
  uploadPreset: string;
}

interface CloudinaryUploadResponse {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  format?: string;
  duration?: number;
  bytes?: number;
  width?: number;
  height?: number;
  pages?: number;
}

let configPromise: Promise<UploadConfig> | null = null;

const getUploadConfig = (): Promise<UploadConfig> => {
  if (!configPromise) {
    configPromise = api
      .get<ApiResponse<UploadConfig>>('/api/media/config')
      .then((res) => {
        const config = res.data?.data;
        if (!config?.cloudName || !config?.uploadPreset) {
          throw new Error('Cloudinary is not configured.');
        }
        return config;
      })
      .catch((error) => {
        configPromise = null;
        throw error;
      });
  }
  return configPromise;
};

// Uploads go straight from the browser to Cloudinary. Relaying large files
// through the API trips Heroku's 30s request timeout, which the browser reports
// as a CORS error. The unsigned upload preset can only be applied by Cloudinary.
export const mediaApi = {
  uploadFile: async (
    file: File,
    _folder?: string,
    onProgress?: (percent: number) => void
  ): Promise<{ data: ApiResponse<MediaUploadResult> }> => {
    const config = await getUploadConfig();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);

    const { data } = await axios.post<CloudinaryUploadResponse>(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`,
      formData,
      {
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      }
    );

    return {
      data: {
        isSuccess: true,
        message: 'Upload successful',
        data: {
          url: data.secure_url ?? '',
          publicId: data.public_id ?? '',
          resourceType: data.resource_type,
          format: data.format,
          duration: data.duration ?? null,
          bytes: data.bytes ?? null,
          width: data.width ?? null,
          height: data.height ?? null,
          pageCount: data.pages ?? null,
        },
        errors: null,
      },
    };
  },
};
