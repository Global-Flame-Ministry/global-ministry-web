import api from './axios';
import type {
  ApiResponse,
  MyProfileDto,
  MyPrayerRequestDto,
  MyRegistrationDto,
  MyDonationDto,
} from '../types';

export const accountApi = {
  getProfile: () =>
    api.get<ApiResponse<MyProfileDto>>('/api/account/me'),

  updateProfile: (dto: {
    firstName: string;
    lastName: string;
    userName?: string;
  }) =>
    api.put<ApiResponse<MyProfileDto>>('/api/account/me', dto),

  updateProfilePicture: (profilePictureUrl: string) =>
    api.post<ApiResponse<{ profilePictureUrl: string }>>(
      '/api/account/me/profile-picture',
      { profilePictureUrl }
    ),

  getMyPrayerRequests: () =>
    api.get<ApiResponse<MyPrayerRequestDto[]>>(
      '/api/account/me/prayer-requests'
    ),

  getMyRegistrations: () =>
    api.get<ApiResponse<MyRegistrationDto[]>>(
      '/api/account/me/registrations'
    ),

  getMyDonations: () =>
    api.get<ApiResponse<MyDonationDto[]>>(
      '/api/account/me/donations'
    ),

  // Step 1 — request email change, sends confirmation to new email
  requestEmailChange: (newEmail: string) =>
    api.post<ApiResponse<{ message: string }>>(
      '/api/account/me/request-email-change',
      { newEmail }
    ),

  // Step 2 — confirm with token from email link
  confirmEmailChange: (newEmail: string, token: string) =>
    api.post<ApiResponse<{ message: string }>>(
      '/api/account/me/confirm-email-change',
      { newEmail, token }
    ),
};