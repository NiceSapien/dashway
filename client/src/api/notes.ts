import api from './api';

export interface SecureNote {
  id: number;
  title: string;
  content?: string;
  updatedAt: string;
}

export const getNotes = async (): Promise<SecureNote[]> => {
  try {
    const response = await api.get('/api/notes');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const createNote = async (
  note: Omit<SecureNote, 'id' | 'updatedAt'>,
  masterPassword: string
): Promise<SecureNote> => {
  try {
    const response = await api.post('/api/notes', note, {
      headers: { 'x-master-password': masterPassword },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const updateNote = async (
  id: number,
  note: Partial<Omit<SecureNote, 'id' | 'updatedAt'>>,
  masterPassword: string
): Promise<SecureNote> => {
  try {
    const response = await api.put(`/api/notes/${id}`, note, {
      headers: { 'x-master-password': masterPassword },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const deleteNote = async (id: number): Promise<void> => {
  try {
    await api.delete(`/api/notes/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const decryptNote = async (
  id: number,
  masterPassword: string
): Promise<{ content: string }> => {
  try {
    const response = await api.post(`/api/notes/decrypt/${id}`, {}, {
      headers: { 'x-master-password': masterPassword },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};