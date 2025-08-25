export function useStorage() {

    function getStorage(key) {
        const storedData = sessionStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : null;
    }

    function updateStorage(key, data) {
       try {
           const jsonData = JSON.stringify(data);
           sessionStorage.setItem(key, jsonData);
       } catch (error) {
           throw new Error('Failed to update storage');
       }
    }

    return {
        getStorage,
        updateStorage,
    }
}