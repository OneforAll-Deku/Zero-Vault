declare global {
    interface Window {
        chrome: any;
    }
}

const EXTENSION_ID = 'cccinblgohldiknfcfghmmjjhkcgcblc';

export async function syncToExtension(items: any[], encryptionKey?: CryptoKey) {
    if (typeof window === 'undefined' || !window.chrome || !window.chrome.runtime) return;
    if (EXTENSION_ID.toString() === 'PLACEHOLDER_ID' || !EXTENSION_ID) return;

    try {
        const syncItems = items
            .filter(i => !i.is_deleted)
            .map(i => ({
                site: i.site,
                username: i.username,
                password: i.password,
                type: i.type,
                tags: i.tags
            }));

        let jwk = null;
        if (encryptionKey) {
            jwk = await crypto.subtle.exportKey("jwk", encryptionKey);
        }

        window.chrome.runtime.sendMessage(EXTENSION_ID, {
            type: 'ZEROVAULT_SYNC',
            items: syncItems,
            sessionKey: jwk
        }, (response: any) => {
            if (window.chrome.runtime.lastError) {
                console.warn("ZeroVault Extension found but sync failed.");
            }
        });
    } catch (e) {
        console.error("Extension sync error", e);
    }
}

export async function getSessionFromExtension(): Promise<CryptoKey | null> {
    if (typeof window === 'undefined' || !window.chrome || !window.chrome.runtime) return null;
    if (EXTENSION_ID.toString() === 'PLACEHOLDER_ID' || !EXTENSION_ID) return null;

    const sessionPromise = new Promise<CryptoKey | null>((resolve) => {
        try {
            window.chrome.runtime.sendMessage(EXTENSION_ID, { type: 'GET_SESSION' }, async (session: any) => {
                if (window.chrome.runtime.lastError) {
                    resolve(null);
                    return;
                }
                if (session && session.sessionKey) {
                    try {
                        const key = await crypto.subtle.importKey(
                            "jwk",
                            session.sessionKey,
                            { name: "AES-GCM", length: 256 },
                            true,
                            ["encrypt", "decrypt"]
                        );
                        resolve(key);
                    } catch (e) {
                        console.error("Failed to import key from extension", e);
                        resolve(null);
                    }
                } else {
                    resolve(null);
                }
            });
        } catch (e) {
            resolve(null);
        }
    });

    const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 500));
    return Promise.race([sessionPromise, timeoutPromise]);
}

export async function lockExtensionSession() {
    if (typeof window === 'undefined' || !window.chrome || !window.chrome.runtime) return;
    if (EXTENSION_ID.toString() === 'PLACEHOLDER_ID' || !EXTENSION_ID) return;

    const lockPromise = new Promise((resolve) => {
        try {
            window.chrome.runtime.sendMessage(EXTENSION_ID, { type: 'LOCK_VAULT' }, (response: any) => {
                if (window.chrome.runtime.lastError) {
                    resolve(null);
                    return;
                }
                resolve(response);
            });
        } catch (e) {
            resolve(null);
        }
    });

    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 500));
    return Promise.race([lockPromise, timeoutPromise]);
}
