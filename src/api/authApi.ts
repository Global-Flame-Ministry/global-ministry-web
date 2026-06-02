import api from './axios';
import type {
  ApiResponse,
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ResendConfirmationDto,
  NewUserDto
} from '../types';

export const authApi = {
  register: (dto: RegisterDto) =>
    api.post<ApiResponse<string>>('/api/auth/register', dto),

  login: (dto: LoginDto) =>
    api.post<ApiResponse<NewUserDto>>('/api/auth/login', dto),

  forgotPassword: (dto: ForgotPasswordDto) =>
    api.post<ApiResponse<string>>('/api/auth/forgot-password', dto),

  resetPassword: (dto: ResetPasswordDto) =>
    api.post<ApiResponse<string>>('/api/auth/reset-password', dto),

  resendConfirmation: (dto: ResendConfirmationDto) =>
    api.post<ApiResponse<string>>('/api/auth/resend-confirmation', dto),

  logout: () =>
    api.post('/api/auth/logout'),
};