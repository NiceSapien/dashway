import api from './api';

export interface Password {
    id: number;
  website: string;
  username: string;
  password?: string; // This will be the encrypted password from the server
  isFavorite?: boolean;
  updatedAt: string;
}

export const getPasswords = async (): Promise<Password[]> => {
  try {
        const response = await api.get('/api/passwords');
    return response.data;
    } catch (error: unknown) {
        const message =
            typeof error === 'object' && error && 'message' in error
                ? String((error as any).message)
                : 'Failed to fetch passwords';
        throw new Error(message);
  }
};

export const createPassword = async (passwordData: Omit<Password, 'id'>, masterPassword: string): Promise<Password> => {
        const response = await api.post('/api/passwords', passwordData, {
                headers: { 'x-master-password': masterPassword },
        });
        return response.data;
};

export const updatePassword = async (id: string | number, passwordData: Partial<Omit<Password, 'id'>>, masterPassword: string): Promise<Password> => {
        const response = await api.put(`/api/passwords/${id}`, passwordData, {
                headers: { 'x-master-password': masterPassword },
        });
        return response.data;
};

export const deletePassword = async (id: string | number): Promise<void> => {
        await api.delete(`/api/passwords/${id}`);
};

export const decryptPassword = async (id: string | number, masterPassword: string): Promise<{ password: string }> => {
    try {
        const response = await api.post(`/api/passwords/decrypt/${id}`, undefined, {
            headers: { 'x-master-password': masterPassword },
        });
        return response.data;
    } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Decryption failed';
        throw new Error(message);
    }
};

// Local password generator for the PasswordGenerator component
export type GeneratePasswordOptions = {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
    excludeAmbiguous: boolean;
};

export type GeneratePasswordResult = { password: string; strength: 'weak' | 'medium' | 'strong' };

export function generatePassword(opts: GeneratePasswordOptions): GeneratePasswordResult {
    const ambiguous = "O0oIl1|`\"'";
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const syms = '!@#$%^&*()-_=+[]{};:,.<>/?';

    let pool = '';
    if (opts.includeUppercase) pool += upper;
    if (opts.includeLowercase) pool += lower;
    if (opts.includeNumbers) pool += nums;
    if (opts.includeSymbols) pool += syms;

    if (!pool) {
        return { password: '', strength: 'weak' };
    }

    if (opts.excludeAmbiguous) {
        pool = pool.split('').filter(c => !ambiguous.includes(c)).join('');
    }

    // Ensure inclusion of at least one from each selected set
    const required: string[] = [];
    if (opts.includeUppercase) required.push(randomChar(upper, opts.excludeAmbiguous ? ambiguous : ''));
    if (opts.includeLowercase) required.push(randomChar(lower, opts.excludeAmbiguous ? ambiguous : ''));
    if (opts.includeNumbers) required.push(randomChar(nums, opts.excludeAmbiguous ? ambiguous : ''));
    if (opts.includeSymbols) required.push(randomChar(syms, opts.excludeAmbiguous ? ambiguous : ''));

    const remaining = Math.max(0, opts.length - required.length);
    const chars = [...required];
    for (let i = 0; i < remaining; i++) {
        chars.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    // Shuffle
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    const password = chars.join('');
    const strength = scoreStrength(password, opts);
    return { password, strength };
}

function randomChar(set: string, exclude: string): string {
    const filtered = exclude ? set.split('').filter(c => !exclude.includes(c)) : set.split('');
    return filtered[Math.floor(Math.random() * filtered.length)] || '';
}

function scoreStrength(pw: string, opts: GeneratePasswordOptions): 'weak' | 'medium' | 'strong' {
    let score = 0;
    if (pw.length >= 12) score += 2; else if (pw.length >= 10) score += 1;
    const variety = [opts.includeUppercase, opts.includeLowercase, opts.includeNumbers, opts.includeSymbols].filter(Boolean).length;
    score += Math.max(0, variety - 1);
    if (!opts.excludeAmbiguous) score += 0; // no penalty
    return score >= 3 ? 'strong' : score >= 2 ? 'medium' : 'weak';
}