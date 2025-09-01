export function useStorage(type = "session") {
    // Определяем хранилище по выбору
    const storage =
        type === "local" ? window.localStorage : window.sessionStorage;

    function getStorage(key) {
        const storedData = storage.getItem(key);
        return storedData ? JSON.parse(storedData) : null;
    }

    function updateStorage(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            storage.setItem(key, jsonData);
        } catch (error) {
            throw new Error("Failed to update storage");
        }
    }

    function removeStorage(key) {
        storage.removeItem(key);
    }

    function clearStorage() {
        storage.clear();
    }

    function clearAll() {
        window.localStorage.clear();
        window.sessionStorage.clear();
    }

    return {
        getStorage,
        updateStorage,
        removeStorage,
        clearStorage,
        clearAll,
    };
}
