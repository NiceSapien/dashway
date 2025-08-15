import api from './api';

export interface Payment {
    id: number;
    type: 'card' | 'bankAccount';
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentData {
    // Card fields
    cardholderName?: string;
    cardNumber?: string;
    expirationDate?: string;
    cvv?: string;
    cardType?: string;

    // Bank account fields
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    accountType?: string;
}


export const getPayments = async (): Promise<Payment[]> => {
    const response = await api.get('/api/payments');
    return response.data;
};

export const createPayment = async (type: 'card' | 'bankAccount', name: string, data: PaymentData, masterPassword: string): Promise<Payment> => {
    const response = await api.post('/api/payments', { type, name, data }, {
        headers: { 'x-master-password': masterPassword },
    });
    return response.data;
};

export const updatePayment = async (id: number, type: 'card' | 'bankAccount', name: string, data: PaymentData, masterPassword: string): Promise<Payment> => {
    const response = await api.put(`/api/payments/${id}`, { type, name, data }, {
        headers: { 'x-master-password': masterPassword },
    });
    return response.data;
};

export const deletePayment = async (id: number): Promise<void> => {
    await api.delete(`/api/payments/${id}`);
};

export const decryptPayment = async (id: number, masterPassword: string): Promise<PaymentData> => {
    const response = await api.post(`/api/payments/decrypt/${id}`, {}, {
        headers: { 'x-master-password': masterPassword },
    });
    return response.data;
};
