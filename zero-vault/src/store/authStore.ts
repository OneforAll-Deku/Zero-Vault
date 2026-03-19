import { create } from 'zustand';

interface AuthState {
    isUnlocked: boolean;
    encryptionKey: CryptoKey | null;
    masterSalt: string | null;
    verifierHash: string | null;

    setUnlocked: (key: CryptoKey) => void;
    lock: () => void;
    setAuthData: (salt: string, hash: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isUnlocked: false,
    encryptionKey: null,
    masterSalt: null,
    verifierHash: null,

    setUnlocked: (key) => set({ isUnlocked: true, encryptionKey: key }),

    lock: () => {
        set({ isUnlocked: false, encryptionKey: null });
    },

    setAuthData: (salt, hash) => set({ masterSalt: salt, verifierHash: hash }),
}));
