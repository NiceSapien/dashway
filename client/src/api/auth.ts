import api from './api';

// Description: Login user functionality
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string }
export const login = async (email: string, password: string) => {
  try {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
  } catch (error: unknown) {
    console.error('Login error:', error);
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as any).message)
        : 'Login failed';
    throw new Error(message);
  }
};

// Description: Register user functionality
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string }
// Response: { email: string }
export const register = async (email: string, password: string) => {
  try {
  const response = await api.post('/api/auth/register', {email, password});
    return response.data;
  } catch (error: unknown) {
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as any).message)
        : 'Registration failed';
    throw new Error(message);
  }
};

// Description: Logout
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    return await api.post('/api/auth/logout');
  } catch (error: unknown) {
    const message =
      typeof error === 'object' && error && 'message' in error
        ? String((error as any).message)
        : 'Logout failed';
    throw new Error(message);
  }
};
