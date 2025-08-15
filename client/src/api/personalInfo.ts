import api from './api';

export interface PersonalInfo {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface PersonalInfoData {
    // Identity
    firstName?: string;
    middleName?: string;
    lastName?: string;
    username?: string;
    identityNumber?: string; // e.g., SSN
    passportNumber?: string;
    driverLicenseNumber?: string;
    
    // Contact
    email?: string;
    phone?: string;
    website?: string;

    // Address
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
}


export const getPersonalInfos = async (): Promise<PersonalInfo[]> => {
    const response = await api.get('/api/personal-info');
    return response.data;
};

export const createPersonalInfo = async (name: string, data: PersonalInfoData, masterPassword: string): Promise<PersonalInfo> => {
    const response = await api.post('/api/personal-info', { name, data }, {
        headers: { 'x-master-password': masterPassword }
    });
    return response.data;
};

export const updatePersonalInfo = async (id: number, name: string, data: PersonalInfoData, masterPassword: string): Promise<PersonalInfo> => {
    const response = await api.put(`/api/personal-info/${id}`, { name, data }, {
        headers: { 'x-master-password': masterPassword }
    });
    return response.data;
};

export const deletePersonalInfo = async (id: number): Promise<void> => {
    await api.delete(`/api/personal-info/${id}`);
};

export const decryptPersonalInfo = async (id: number, masterPassword: string): Promise<PersonalInfoData> => {
    const response = await api.post(`/api/personal-info/decrypt/${id}`, {}, {
        headers: { 'x-master-password': masterPassword }
    });
    return response.data;
};
