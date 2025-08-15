import api from './api';

export interface PasswordAnalysis {
  _id: string;
  name: string;
  isWeak: boolean;
  isReused: boolean;
  isOld: boolean;
  password?: string;
}

export interface SecurityAnalysis {
  overallScore: number;
  totalPasswords: number;
  weakCount: number;
  reusedCount: number;
  oldPasswordCount: number;
  passwords: PasswordAnalysis[];
}

// Description: Get security analysis
// Endpoint: GET /api/security/analyze
// Request: { masterPassword: string }
// Response: { analysis: SecurityAnalysis }
export const getSecurityAnalysis = async (masterPassword: string): Promise<SecurityAnalysis> => {
  const response = await api.get('/api/security/analyze', {
    headers: { 'x-master-password': masterPassword },
  });
  return response.data;
};
