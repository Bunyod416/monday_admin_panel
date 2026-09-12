function getStorage(): Storage | null {
    try {
        return typeof window !== "undefined" ? window.localStorage : null;
    } catch {
        return null;
    }
}

export function readStorage(key: string): string | null {
    try {
        return getStorage()?.getItem(key) ?? null;
    } catch {
        return null;
    }
}

export function writeStorage(key: string, value: string): void {
    try {
        getStorage()?.setItem(key, value);
    } catch {
        // Storage can be blocked by privacy settings or sandboxed documents.
    }
}

export function removeStorage(key: string): void {
    try {
        getStorage()?.removeItem(key);
    } catch {
        // Storage can be blocked by privacy settings or sandboxed documents.
    }
}
