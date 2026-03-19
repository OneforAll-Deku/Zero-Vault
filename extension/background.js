// Use chrome.storage.session for session-only persistence (survives service worker restart)
let vaultSession = {
    unlocked: false,
    items: [],
    sessionKey: null
};

// Initialize session from storage if it exists
chrome.storage.session.get(['vaultSession'], (result) => {
    if (result.vaultSession) {
        vaultSession = result.vaultSession;
        if (vaultSession.unlocked) {
            chrome.action.setBadgeText({ text: '🔓' });
            chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
        }
    }
});

function updateSession(newData) {
    vaultSession = { ...vaultSession, ...newData };
    chrome.storage.session.set({ vaultSession });
}

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === 'ZEROVAULT_SYNC') {
        const sessionUpdate = {
            unlocked: true,
            items: message.items,
            sessionKey: message.sessionKey || vaultSession.sessionKey
        };
        updateSession(sessionUpdate);
        chrome.action.setBadgeText({ text: '🔓' });
        chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
        sendResponse({ success: true });
    }

    if (message.type === 'GET_SESSION') {
        sendResponse(vaultSession);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_SESSION') {
        sendResponse(vaultSession);
    }
    if (message.type === 'LOCK_VAULT') {
        const lockSession = {
            unlocked: false,
            items: [],
            sessionKey: null
        };
        updateSession(lockSession);
        chrome.action.setBadgeText({ text: '' });
        sendResponse({ success: true });
    }
});

