import api from './axios';
import type { ApiResponse } from '../types';

export interface JoinYouthDto {
  firstName: string;
  lastName:  string;
  email:     string;
  phoneNumber?: string;
}

export interface JoinYouthResultDto {
  autoJoined:           boolean;
  requiresVerification: boolean;
  message:              string;
}

export const youthApi = {
  join: (dto: JoinYouthDto) =>
    api.post<ApiResponse<JoinYouthResultDto>>('/api/youth/join', dto),
};