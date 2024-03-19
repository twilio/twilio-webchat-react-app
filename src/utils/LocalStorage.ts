export class LocalStorageUtil {

    /**
     * Set value in localStorage
     *
     * @param {string} key
     * @param {string} value
     * @example
     *
     * LocalStorageUtil.set('test','val')
     */
    public static set(key: string, value: unknown): void {
        const stringifiedData = JSON.stringify(value);
        window.localStorage.setItem(key, stringifiedData);
    }

    /**
     * Get the value stored in the local storage for the given key
     *
     * @returns {string} value that was stored
     * @example
     *
     * let val = LocalStorageUtil.get('test')
     */
    public static get(key: string) {
        const data = window.localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Clear all records in the local storage
     *
     * @returns {void} Successfully removes the key from LocalStorage
     * @example
     *
     * LocalStorageUtil.remove('test))
     */
    public static remove(key: string): void {
        return window.localStorage.removeItem(key);
    }
}
