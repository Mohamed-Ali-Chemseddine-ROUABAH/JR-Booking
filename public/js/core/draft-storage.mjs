export function saveDraft(key, value, storage = globalThis.localStorage) {
    try {
        storage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

export function loadDraft(key, storage = globalThis.localStorage) {
    try {
        const value = storage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
}

export function clearDraft(key, storage = globalThis.localStorage) {
    try {
        storage.removeItem(key);
        return true;
    } catch {
        return false;
    }
}