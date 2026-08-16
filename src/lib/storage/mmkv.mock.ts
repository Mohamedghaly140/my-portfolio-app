/** In-memory stand-in for a `react-native-mmkv` instance, for use with `mock.module("react-native-mmkv", ...)` in bun tests. */
export function createMockMmkv() {
  const map = new Map<string, string | number | boolean>();

  return {
    set: (key: string, value: string | number | boolean) => {
      map.set(key, value);
    },
    getString: (key: string) => (typeof map.get(key) === 'string' ? (map.get(key) as string) : undefined),
    getNumber: (key: string) => (typeof map.get(key) === 'number' ? (map.get(key) as number) : undefined),
    getBoolean: (key: string) => (typeof map.get(key) === 'boolean' ? (map.get(key) as boolean) : undefined),
    remove: (key: string) => {
      map.delete(key);
    },
    contains: (key: string) => map.has(key),
    getAllKeys: () => Array.from(map.keys()),
    clearAll: () => {
      map.clear();
    },
  };
}
