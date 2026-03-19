export const PBKDF2_ITERATIONS = 100000;
export const SALT_LENGTH = 16;
export const IV_LENGTH = 12;

export function generateSalt(): string {
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    return Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function deriveEncryptionKey(password: string, salt: string): Promise<CryptoKey> {
    if (!window.crypto.subtle) {
        throw new Error("SECURE_CONTEXT_REQUIRED: Cryptography is only available over HTTPS or localhost. Please ensure you are using a secure connection.");
    }
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

export async function deriveVerifierHash(password: string, salt: string): Promise<string> {
    if (!window.crypto.subtle) {
        throw new Error("SECURE_CONTEXT_REQUIRED: Cryptography is only available over HTTPS or localhost. Please ensure you are using a secure connection.");
    }
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const key = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "HMAC", hash: "SHA-256", length: 256 },
        true,
        ["sign"]
    );

    const exported = await window.crypto.subtle.exportKey("raw", key);
    return Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');
}


function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function encryptData(data: string, key: CryptoKey): Promise<{ cipherText: string; iv: string }> {
    if (!window.crypto?.subtle) {
        throw new Error("SECURE_CONTEXT_REQUIRED: Cryptography is only available over HTTPS or localhost. Please ensure you are using a secure connection.");
    }
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        enc.encode(data)
    );

    return {
        cipherText: arrayBufferToBase64(encrypted),
        iv: arrayBufferToBase64(iv.buffer),
    };
}

export async function decryptData(cipherText: string, iv: string, key: CryptoKey): Promise<string> {
    if (!window.crypto?.subtle) {
        throw new Error("SECURE_CONTEXT_REQUIRED: Cryptography is only available over HTTPS or localhost. Please ensure you are using a secure connection.");
    }
    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: base64ToArrayBuffer(iv),
        },
        key,
        base64ToArrayBuffer(cipherText)
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
}
